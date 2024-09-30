// public/utils/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, query, where, deleteDoc, updateDoc } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
let analytics;

export const analyticsInit = async () => {

    if (await isSupported()) {

        analytics = getAnalytics(app);
        console.log("Analytics Inicializado");
    } else {

        analytics = getAnalytics(app);
        console.warn("Analytics NÃO Inicializado");
    }
}

export const addTaskToFirestore = async (task) => {
    try {
        if (typeof task === 'object' && !Array.isArray(task) && task !== null) {
            if (Object.keys(task).length === 0) {
                throw new Error("firebase.js addTaskToFirestore - Object Tarefa Nula");
            }

            const docRef = await addDoc(collection(db, "tasks"), task);

            if (analytics) {

                logEvent(analytics, 'add_new_task', {
                    task_id: docRef.id,
                    task_title: task.title,
                    createdAt: new Date().toISOString()
                });
            }

            console.log('firebase.js addTaskToFirestore - Sucesso: ', docRef.id);
        } else {
            throw new Error("firebase.js addTaskToFirestore - Erro no firebase, necessario um objeto.");
        }
    } catch (error) {
        console.error("firebase.js addTaskToFirestore - Erro ao adicionar o documento:", error);
    }
};

export const getTasksFromFirestore = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'tasks'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("firebase.js addTaskToFirestore - Erro ao obter tarefas do Firestore:", error);
        return [];
    }
};

export const signUp = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });

        await addDoc(collection(db, 'users'), {
            uid: user.uid,
            email: user.email,
            displayName,
            createdAt: new Date(),
        });

        if (analytics) {

            logEvent(analytics, 'sign_up', {
                uid: user.id,
                email: user.email,
                displayName,
                createdAt: new Date().toISOString()
            });
        }

        return user;
    } catch (error) {
        console.error("firebase.js addTaskToFirestore - Erro ao criar conta:", error);
        throw error;
    }
};

export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (analytics) {

            logEvent(analytics, 'sign_in', {
                uid: user.id,
                email: user.email,
                loggedAt: new Date().toISOString()
            });
        }

        return userCredential.user;
    } catch (error) {
        console.error("firebase.js addTaskToFirestore - Erro ao fazer login:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);

        if (analytics) {

            logEvent(analytics, 'logout', {
                loggedAt: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error("firebase.js addTaskToFirestore - Erro ao sair:", error);
        throw error;
    }
};

export const deleteTaskFromFirestore = async (taskId) => {
    try {

        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('id', '==', taskId));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {

            querySnapshot.forEach(async (documentSnapshot) => {
                console.log(documentSnapshot.id);
                const docRef = doc(db, 'tasks', documentSnapshot.id);
                await deleteDoc(docRef);
                console.log('Tarefa excluída com sucesso do Firestore.');
            });
        } else {
            console.log('Nenhuma tarefa encontrada com o taskId informado.');
        }
    } catch (error) {
        console.error('Erro ao tentar excluir a tarefa:', error);
    }
};

export const updateTaskFromFirestore = async (taskId) => {

    try {

        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('id', '==', taskId));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {

            querySnapshot.forEach(async (documentSnapshot) => {

                const taskDocRef = doc(db, 'tasks', documentSnapshot.id);
                await updateDoc(taskDocRef, {
                    completed: true,
                });
                console.log('Tarefa excluída com sucesso do Firestore.');
            });
        } else {
            console.log('Nenhuma tarefa encontrada com o taskId informado.');
        }

    } catch (error) {
        console.error('Erro ao tentar atualizar a tarefa:', error);
    }
};