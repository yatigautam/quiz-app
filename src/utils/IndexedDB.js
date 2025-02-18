const DB_NAME = "QuizDatabase";
const STORE_NAME = "quizHistory";
const DB_VERSION = 1;

// Open (or create) the IndexedDB database
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Save a quiz attempt in IndexedDB
export const saveQuizAttempt = async (score) => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const newAttempt = {
    date: new Date().toLocaleString(),
    score: score,
  };

  store.add(newAttempt);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve("Quiz attempt saved.");
    transaction.onerror = (event) => reject(event.target.error);
  });
};

// Fetch all quiz attempts from IndexedDB
export const getQuizHistory = async () => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};
