import { useState } from 'react';
import type { QuizQuestion } from '../types';

export function useQuizSession(questions: QuizQuestion[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});

  const currentQuestion = questions[currentIndex] ?? null;
  const selectedAnswer = currentQuestion ? (answers[currentQuestion.id] ?? null) : null;
  const isAnswered = selectedAnswer !== null;
  const isComplete = currentIndex >= questions.length;

  const score = questions.filter((q) => answers[q.id] === q.correctAnswer).length;

  function selectAnswer(key: 'A' | 'B' | 'C' | 'D') {
    if (!currentQuestion || isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));
  }

  function nextQuestion() {
    setCurrentIndex((i) => i + 1);
  }

  function restart() {
    setCurrentIndex(0);
    setAnswers({});
  }

  return {
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    selectedAnswer,
    isAnswered,
    score,
    isComplete,
    selectAnswer,
    nextQuestion,
    restart,
    answers,
  };
}
