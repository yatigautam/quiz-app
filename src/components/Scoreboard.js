import React, { useEffect, useState } from "react";

const Scoreboard = () => {
  const [attempts, setAttempts] = useState([]);

  // Fetch quiz history from IndexedDB when component mounts
  useEffect(() => {
    const fetchQuizHistory = () => {
      const request = indexedDB.open("QuizDatabase", 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("quizHistory", "readonly");
        const store = transaction.objectStore("quizHistory");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = (event) => {
          const history = event.target.result;
          // Sort by most recent attempt
          setAttempts(history.sort((a, b) => new Date(b.date) - new Date(a.date)));
        };

        getAllRequest.onerror = (event) => {
          console.error("Failed to fetch quiz history:", event.target.error);
        };
      };

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
      };
    };

    fetchQuizHistory();
  }, []);

  return (
    <div className="scoreboard-container">
      <h3>Scoreboard</h3>
      {attempts.length === 0 ? (
        <p>No attempts recorded yet.</p>
      ) : (
        <ul className="score-list">
          {attempts.map((attempt, index) => (
            <li key={index} className="score-item">
              <strong>Attempt {index + 1}</strong>: {attempt.date} - Score: {attempt.score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Scoreboard;
