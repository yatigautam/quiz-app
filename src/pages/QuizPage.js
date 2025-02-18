import React, { useState, useEffect } from "react";
import Timer from "../components/Timer";
import Scoreboard from "../components/Scoreboard";
import questions from "../components/Question";
import "./QuizPage.css";
import { saveQuizAttempt, getQuizHistory } from "../utils/IndexedDB"; // ✅ Import getQuizHistory

const QuizPage = () => {
    const [showInstructions, setShowInstructions] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [attempts, setAttempts] = useState([]);
    const [showScore, setShowScore] = useState(false);

    // ✅ Fetch quiz history on component mount
    useEffect(() => {
        const fetchAttempts = async () => {
            const history = await getQuizHistory(); // ✅ Fetch from IndexedDB
            setAttempts(history);
        };
        fetchAttempts();
    }, []);

    useEffect(() => {
        if (showInstructions || quizCompleted) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime === 1) {
                    clearInterval(timer);
                    nextQuestion();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showInstructions, quizCompleted, currentQuestionIndex]);

    const handleStartQuiz = () => {
        setShowInstructions(false);
        setCurrentQuestionIndex(0);
        setTimeLeft(30);
    };

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) return;

        const currentQuestion = questions[currentQuestionIndex];

        if (currentQuestion.type === "multiple-choice") {
            setUserAnswers((prevAnswers) => ({
                ...prevAnswers,
                [currentQuestionIndex]: selectedAnswer
            }));

            if (selectedAnswer === currentQuestion.correct) {
                setScore((prevScore) => prevScore + 1);
            }
        } else if (currentQuestion.type === "integer") {
            if (parseInt(selectedAnswer) === currentQuestion.correct) {
                setScore((prevScore) => prevScore + 1);
            }
            setUserAnswers((prevAnswers) => ({
                ...prevAnswers,
                [currentQuestionIndex]: parseInt(selectedAnswer)
            }));
        }

        nextQuestion();
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            setTimeLeft(30);
            setSelectedAnswer("");
        } else {
            handleFinishQuiz();
        }
    };

    const handleFinishQuiz = async () => {  
        const finalScore = score; // ✅ Keeps latest score

        try {
            await saveQuizAttempt(finalScore); // ✅ Saves to IndexedDB
            setAttempts((prevAttempts) => [
                { date: new Date().toLocaleString(), score: finalScore },
                ...prevAttempts
            ]);
            setQuizCompleted(true);
            setShowScore(true);
        } catch (error) {
            console.error("Failed to save quiz attempt:", error);
        }
    };

    return (
        <div className="quiz-container">
            {showInstructions ? (
                <div className="instructions">
                    <h2>Instructions</h2>
                    <ul>
                        <li>Select the best answer for each question.</li>
                        <li>For integer-type questions, enter a numerical answer.</li>
                        <li>You have 30 seconds per question.</li>
                    </ul>
                    <button onClick={handleStartQuiz}>Start Quiz</button>
                </div>
            ) : showScore ? (
                <Scoreboard attempts={attempts} />
            ) : (
                <div className="question-section">
                    <h3>Question {currentQuestionIndex + 1}</h3>
                    <p>{questions[currentQuestionIndex].question}</p>

                    {questions[currentQuestionIndex].type === "multiple-choice" ? (
                        <ul className="options-list">
                            {questions[currentQuestionIndex].options.map((option, index) => (
                                <li key={index} className="option-item">
                                    <label>
                                        <input
                                            type="radio"
                                            name="answer"
                                            value={option}
                                            checked={selectedAnswer === option}
                                            onChange={() => handleAnswerSelect(option)}
                                        />
                                        {option}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <input
                            type="number"
                            className="integer-input"
                            value={selectedAnswer}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                        />
                    )}

                    <Timer timeLeft={timeLeft} />
                    <button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="next-button">
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
