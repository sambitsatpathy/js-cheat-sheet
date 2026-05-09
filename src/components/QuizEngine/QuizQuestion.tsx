import type { QuizQuestion as QuizQuestionType } from '../../types';
import './QuizEngine.css';

interface Props {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  onAnswer: (key: 'A' | 'B' | 'C' | 'D') => void;
  onNext: () => void;
  isLast: boolean;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onNext,
  isLast,
}: Props) {
  const isAnswered = selectedAnswer !== null;

  function getOptionClass(key: 'A' | 'B' | 'C' | 'D') {
    if (!isAnswered) return 'option-btn';
    if (key === question.correctAnswer) return 'option-btn correct';
    if (key === selectedAnswer) return 'option-btn wrong';
    return 'option-btn dimmed';
  }

  return (
    <div className="quiz-question-card">
      <div className="quiz-question-meta">
        <span className="quiz-scenario">{question.scenario}</span>
        <span className="quiz-counter">Q{questionNumber} / {totalQuestions}</span>
      </div>

      <p className="quiz-question-text">{question.question}</p>

      <div className="quiz-options">
        {question.options.map((opt) => (
          <button
            key={opt.key}
            className={getOptionClass(opt.key)}
            onClick={() => onAnswer(opt.key)}
            disabled={isAnswered}
          >
            <span className="option-key">{opt.key}</span>
            <span className="option-text">{opt.text}</span>
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="quiz-explanation">
          <div className={`explanation-header ${selectedAnswer === question.correctAnswer ? 'correct-header' : 'wrong-header'}`}>
            {selectedAnswer === question.correctAnswer ? '✓ Correct' : `✗ Incorrect — correct answer: ${question.correctAnswer}`}
          </div>
          <p className="explanation-text">{question.explanation}</p>
          <button className="btn-next" onClick={onNext}>
            {isLast ? 'See results →' : 'Next question →'}
          </button>
        </div>
      )}
    </div>
  );
}
