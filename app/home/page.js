'use client';

import PrivateRoute from '@/components/PrivateRoute';
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { addTaskToFirestore, getTasksFromFirestore, analyticsInit, deleteTaskFromFirestore, updateTaskFromFirestore } from '../../public/utils/firebase';
import { addTask, getTasks, deleteTask, updateTask } from '../../public/utils/indexedDb';

const requestNotificationPermission = () => {
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        sendNotification('Notificações ativadas', 'Agora você receberá notificações.');
      }
    });
  }
};

const sendNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
};

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const today = format(new Date(), 'yyyy-MM-dd');

  const loadTasks = async () => {
    try {
      const tasksFromDB = await getTasks();

      if (navigator.onLine) {
        const tasksFromFirestore = await getTasksFromFirestore();

        const tasksMap = new Map();
        tasksFromDB.forEach(task => tasksMap.set(task.id, task));
        tasksFromFirestore.forEach(task => {
          const exists = tasksMap.has(task.id) || tasksMap.has(Date.now());
          if (!exists) {
            tasksMap.set(task.id, task);
          }
        });

        const mergedTasks = Array.from(tasksMap.values());
        await Promise.all(
          mergedTasks.map(async (task) => {
            try {
              if (!task.synced) {
                await addTaskToFirestore(task);
                task.synced = true;
              }
              await addTask(task);
            } catch (error) {
              console.error('Erro ao adicionar tarefa durante a sincronização:', error);
            }
          })
        );

        setTasks(mergedTasks);
      } else {
        setTasks(tasksFromDB);
      }
    } catch (error) {
      console.error('Erro ao carregar e mesclar tarefas:', error);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    loadTasks();

    const handleOfflineStatus = () => {
      if (!navigator.onLine) {
        setIsOffline(true);
        sendNotification('Você está offline', 'As tarefas adicionadas serão sincronizadas quando a conexão for restaurada.');
      } else {
        setIsOffline(false);
        sendNotification('Você está online', 'A conexão foi restabelecida.');
        loadTasks();
      }
    };

    window.addEventListener('online', handleOfflineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    const loadAnalytics = async () => {
      await analyticsInit();
    }
    if (typeof window !== 'undefined') {
      loadAnalytics();
    }

    return () => {
      window.removeEventListener('online', handleOfflineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  const handleEditTask = async (taskId) => {
    try {
      if (navigator.onLine) {
        updateTaskFromFirestore(taskId);
      }

      updateTask(taskId);

      loadTasks();

      sendNotification('Tarefa Concluída', 'A tarefa foi atualizada com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {

      if (navigator.onLine) {

        await deleteTaskFromFirestore(taskId);
      }

      await deleteTask(taskId);

      loadTasks();

      sendNotification('Tarefa excluída', 'A tarefa foi removida com sucesso.');
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    const newTask = {
      id: Date.now(),
      title,
      date: new Date(dateTime).toISOString(),
      completed,
      synced: navigator.onLine,
    };

    try {
      if (navigator.onLine) {
        const tasksFromFirestore = await getTasksFromFirestore();
        const exists = tasksFromFirestore.some(task => task.title === newTask.title && task.date === newTask.date && task.completed === newTask.completed);

        if (!exists) {
          await addTaskToFirestore(newTask);
        }
      }
      await addTask(newTask);
      loadTasks();
    } catch (error) {
      console.error('Erro ao adicionar nova tarefa:', error);
    }

    setTitle('');
    setDateTime('');
    setCompleted(false);
  };

  const groupByDate = (tasks) => {
    const grouped = tasks.reduce((groups, task) => {
      const taskDate = task.date ? parseISO(task.date) : null;
      const formattedDate = format(taskDate, 'yyyy-MM-dd');

      const displayDate = formattedDate >= today ? formattedDate : 'passadas';

      if (!groups[displayDate]) {
        groups[displayDate] = [];
      }
      groups[displayDate].push(task);
      return groups;
    }, {});

    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
    });

    return grouped;
  };

  const groupedTasks = groupByDate(tasks);

  return (
    <PrivateRoute>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 sm:p-6">
        <div className="bg-white shadow-2xl rounded-lg p-6 sm:p-10 w-full max-w-xl sm:max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 sm:mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            Tarefas
          </h1>

          {isOffline && (
            <div className="bg-red-500 text-white p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 shadow-md">
              Você está offline! As tarefas serão sincronizadas quando a conexão for restaurada.
            </div>
          )}

          <form onSubmit={handleAddTask} className="mb-6 sm:mb-10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full flex-1">
              <input
                type="text"
                placeholder="Título"
                className="w-full p-3 sm:p-4 pr-12 bg-gray-100 border-0 rounded-lg focus:ring-2 sm:focus:ring-4 focus:ring-blue-300 shadow-md transition-transform transform hover:scale-105 focus:outline-none text-gray-800" // Adicione esta classe
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="absolute right-4 top-3 sm:top-4 text-gray-500 text-sm pointer-events-none">
                📝
              </span>
            </div>
            <div className="relative w-full flex-1">
              <input
                type="datetime-local"
                className="w-full p-3 sm:p-4 pr-12 bg-gray-100 border-0 rounded-lg focus:ring-2 sm:focus:ring-4 focus:ring-blue-300 shadow-md transition-transform transform hover:scale-105 focus:outline-none text-gray-800" // Adicione esta classe
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
              <span className="absolute right-4 top-3 sm:top-4 text-gray-500 text-sm pointer-events-none">
                🕒
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md focus:ring-2 sm:focus:ring-4 focus:ring-blue-300"
              />
              <span className="text-sm sm:text-base">Completo</span>
            </div>
            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 sm:p-4 rounded-lg font-semibold shadow-lg hover:bg-gradient-to-l hover:scale-105 transition duration-300">
              Adicionar Tarefa
            </button>
          </form>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-blue-500">Tarefas</h2>
          {Object.keys(groupedTasks)
            .filter(date => date !== 'passadas')
            .map(date => (
              <div key={date} className="mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-purple-600">
                  {date === today ? 'Hoje' : format(parseISO(date), 'dd/MM/yyyy')}
                </h3>
                <ul className="space-y-3 sm:space-y-4">
                  {groupedTasks[date].map(task => {
                    // Validação da data
                    const taskDate = task.date ? new Date(task.date) : null;
                    const taskFormattedTime = taskDate ? format(taskDate, 'HH:mm') : 'Data inválida';
                    const taskFormattedFullDate = taskDate ? format(parseISO(task.date), 'dd/MM/yyyy') : 'Data inválida';

                    return (
                      <li
                        key={task.id}
                        className={`p-3 sm:p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 ${!task.synced ? 'border-l-4 border-red-500' : ''
                          }`}
                      >
                        <div className="flex-1">
                          <span className="block sm:inline text-base sm:text-lg font-medium text-gray-800">
                            {task.title} - {taskFormattedFullDate} - {taskFormattedTime}
                          </span>
                          <span className={`block sm:inline ml-0 sm:ml-4 font-semibold ${task.completed ? 'text-green-500' : 'text-red-500'}`}>
                            {task.completed ? 'Concluída' : 'Não Concluída'}
                          </span>
                        </div>
                        <div className="flex mt-3 sm:mt-0 space-x-4">
                          {!task.completed && (
                            <button
                              onClick={() => handleEditTask(task.id)}
                              className="text-blue-500 hover:text-blue-600 font-semibold transition duration-300 flex items-center"
                            >
                              ✅ Concluir
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-500 hover:text-red-600 font-semibold transition duration-300 flex items-center"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-blue-500">Tarefas Passadas</h2>
          <ul className="space-y-3 sm:space-y-4">
            {groupedTasks['passadas']?.map(task => {
              // Validação da data
              const taskDate = task.date ? new Date(task.date) : null;
              const taskFormattedTime = taskDate ? format(taskDate, 'HH:mm') : 'Data inválida';
              const taskFormattedFullDate = taskDate ? format(parseISO(task.date), 'dd/MM/yyyy') : 'Data inválida';

              return (
                <li
                  key={task.id}
                  className={`p-3 sm:p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 text-gray-500 ${!task.synced ? 'border-l-4 border-red-500' : ''
                    }`}
                >
                  <div className="flex-1">
                    <span className="block sm:inline text-base sm:text-lg font-medium text-gray-800">
                      {task.title} - {taskFormattedFullDate} - {taskFormattedTime}
                    </span>
                    <span className={`block sm:inline ml-0 sm:ml-4 font-semibold ${task.completed ? 'text-green-500' : 'text-red-500'}`}>
                      {task.completed ? 'Concluída' : 'Não Concluída'}
                    </span>
                  </div>
                  <div className="flex mt-3 sm:mt-0 space-x-4">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-600 font-semibold transition duration-300 flex items-center"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </PrivateRoute>
  );
}