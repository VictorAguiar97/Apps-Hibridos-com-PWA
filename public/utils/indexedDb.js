export const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('my-tasks-db', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(`Erro ao abrir o IndexedDB: ${event.target.errorCode}`);
    };
  });
};

export const addTask = async (task) => {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');

    if (!task.id) {
      task.id = Date.now();
    }

    task.synced = navigator.onLine;  // Marcar se a tarefa está sincronizada ou não

    return new Promise((resolve, reject) => {
      const request = store.put(task);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(`Erro ao adicionar tarefa: ${event.target.errorCode}`);
      };
    });
  } catch (error) {
    throw new Error(`Erro ao adicionar tarefa no IndexedDB: ${error}`);
  }
};

export const getTasks = async () => {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['tasks'], 'readonly');
    const store = transaction.objectStore('tasks');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(`Erro ao buscar tarefas do IndexedDB: ${event.target.errorCode}`);
      };
    });
  } catch (error) {
    throw new Error(`Erro ao obter tarefas do IndexedDB: ${error}`);
  }
};

export const deleteTask = async (taskId) => {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    await store.delete(taskId);
    console.log('Tarefa excluída do IndexedDB com sucesso.');
  } catch (error) {
    console.error('Erro ao excluir tarefa do IndexedDB:', error);
  }
};

export const updateTask = async (taskId) => {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');

    // Recupera a tarefa existente pela chave primária (id)
    const taskRequest = store.get(taskId);

    taskRequest.onsuccess = (event) => {
      const taskToUpdate = event.target.result; // Obtenha o resultado do evento

      console.log('Tarefa encontrada:', taskToUpdate); // Log da tarefa encontrada

      // Verifica se a tarefa existe
      if (taskToUpdate) {
        // Atualiza o campo 'completed' da tarefa
        taskToUpdate.completed = true; // Define o status como concluído

        // Verifique se o id está presente
        if (taskToUpdate.id) {
          console.log('ID da tarefa:', taskToUpdate.id); // Log do ID
          
          // Atualiza a tarefa no IndexedDB
          const updateRequest = store.put(taskToUpdate); // Atualiza a tarefa

          updateRequest.onsuccess = () => {
            console.log('Tarefa atualizada com sucesso:', taskToUpdate);
          };

          updateRequest.onerror = (error) => {
            console.error('Erro ao atualizar a tarefa:', error);
          };
        } else {
          throw new Error('O id da tarefa não está definido.');
        }
      } else {
        console.warn('Tarefa não encontrada para ID:', taskId);
      }
    };

    taskRequest.onerror = (error) => {
      console.error('Erro ao recuperar a tarefa:', error);
    };
  } catch (error) {
    console.error('Erro ao atualizar tarefa do IndexedDB:', error);
  }
};