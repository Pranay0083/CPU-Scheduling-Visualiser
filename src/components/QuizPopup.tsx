import { useState, useEffect, useRef } from 'react';
import { useScheduler } from '../context/SchedulerContext';

export function QuizPopup() {
    const { state, answerQuiz, dismissQuiz } = useScheduler();
    const { quizState, interactionMode } = state;
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(10);
    const startTimeRef = useRef<number>(Date.now());

    // Reset state when question changes
    useEffect(() => {
        if (quizState.currentQuestion) {
            setSelectedAnswer(null);
            setShowFeedback(false);
            setTimeRemaining(10);
            startTimeRef.current = Date.now();
        }
    }, [quizState.currentQuestion?.id]);

    // Timer countdown
    useEffect(() => {
        if (!quizState.active || showFeedback) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Time's up - auto-submit wrong answer
                    handleAnswer('');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizState.active, showFeedback]);

    if (interactionMode !== 'QUIZ' || !quizState.active || !quizState.currentQuestion) {
        return null;
    }

    const question = quizState.currentQuestion;
    const isCorrect = selectedAnswer === question.correctAnswer;

    const handleAnswer = (answer: string) => {
        if (showFeedback) return;

        const timeTaken = Date.now() - startTimeRef.current;
        setSelectedAnswer(answer);
        setShowFeedback(true);
        answerQuiz(answer, timeTaken);
    };

    const handleContinue = () => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        dismissQuiz();
    };

    const getQuestionIcon = () => {
        switch (question.type) {
            case 'PREEMPTION': return '⚡';
            case 'NEXT_PROCESS': return '➡️';
            case 'QUEUE_ORDER': return '📋';
            default: return '❓';
        }
    };

    const timerClass = timeRemaining <= 3 ? 'timer-critical' :
        timeRemaining <= 5 ? 'timer-warning' : 'timer-normal';

    return (
        <div className="quiz-overlay">
            <div className="quiz-popup">
                <div className="quiz-header">
                    <span className="quiz-icon">{getQuestionIcon()}</span>
                    <span className="quiz-type">
                        {question.type === 'PREEMPTION' ? 'Preemption Decision' :
                            question.type === 'NEXT_PROCESS' ? 'Next Process' : 'Queue Order'}
                    </span>
                    {!showFeedback && (
                        <span className={`quiz-timer ${timerClass}`}>
                            ⏱️ {timeRemaining}s
                        </span>
                    )}
                </div>

                <div className="quiz-context">
                    <span className="quiz-time">Time: {question.timestamp}</span>
                    <span className="quiz-algo">{question.context.algorithm}</span>
                </div>

                <p className="quiz-question">{question.question}</p>

                <div className="quiz-options">
                    {question.options.map((option, index) => {
                        let optionClass = 'quiz-option';
                        if (showFeedback) {
                            if (option === question.correctAnswer) {
                                optionClass += ' option-correct';
                            } else if (option === selectedAnswer) {
                                optionClass += ' option-wrong';
                            } else {
                                optionClass += ' option-disabled';
                            }
                        } else if (selectedAnswer === option) {
                            optionClass += ' option-selected';
                        }

                        return (
                            <button
                                key={index}
                                className={optionClass}
                                onClick={() => handleAnswer(option)}
                                disabled={showFeedback}
                            >
                                <span className="option-letter">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                            </button>
                        );
                    })}
                </div>

                {showFeedback && (
                    <div className={`quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
                        <div className="feedback-result">
                            {isCorrect ? (
                                <>
                                    <span className="feedback-icon">✅</span>
                                    <span className="feedback-text">Correct! +10 points</span>
                                </>
                            ) : (
                                <>
                                    <span className="feedback-icon">❌</span>
                                    <span className="feedback-text">Incorrect</span>
                                </>
                            )}
                        </div>
                        <p className="feedback-explanation">{question.explanation}</p>
                        <button className="quiz-continue" onClick={handleContinue}>
                            ▶ Continue Simulation
                        </button>
                    </div>
                )}

                <div className="quiz-score">
                    <span>Score: {quizState.totalPoints}</span>
                    <span>•</span>
                    <span>{quizState.correctAnswers}/{quizState.questionsAnswered} correct</span>
                </div>
            </div>
        </div>
    );
}
