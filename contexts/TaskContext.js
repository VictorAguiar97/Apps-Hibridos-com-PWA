'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { addTask, getTasks } from '@/public/utils/indexedDb';
import { addTaskToFirestore, getTasksFromFirestore } from '@/public/utils/firebase';

// Criando o contexto
const TaskContext = createContext();

//Hook ou funcao para acessar o contexto
export const useTaskContext = () => {
    return useContext(TaskContext);
}

// Provedor de contexto
export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);

    const loadTasks = async () => {

        try {

            const tasksFromDB = await getTasks();

            if (navigator.onLine) {

                const tasksFromFirestore = await getTasksFromFirestore();

                const tasksMap = new Map();

                tasksFromDB.forEach(task => tasksMap.set(task.id, task));
                tasksFromFirestore.forEach(task => tasksMap.set(task.id, task));

                const mergedTasks = Array.from(tasksMap.values());

                //setTasks(mergedTasks);

                await Promise.all(mergedTasks.map(task => addTask(task)));
            } else {

                setTasks(tasksFromDB);
            }
        } catch (error) {

            console.log("(ERRO) Nao foi possivel carregar tarefas: " + error);
        }
    };

    useEffect(() => {

        loadTasks();
    }, []);

    const addNewTask = async (task) => {
        try {
            if (navigator.onLine) {

                await addTaskToFirestore(task);
            } else {

                await addTask(task);
            }

            await loadTasks(task);
        } catch (error) {
            console.error("(ERRO) Nao foi possivel adicionar tarefa: ", erro);
        }

        //await addTask(task);
        //await addTaskToFirestore(task);
        //const tasksFromDB = await getTasks();
        //setTasks(tasksFromDB);
    }

    return (
        <TaskContext.Provider value={{ tasks, addNewTask }}>
            {children}
        </TaskContext.Provider>
    )
}