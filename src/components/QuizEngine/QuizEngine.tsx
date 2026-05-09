import type { QuizQuestion } from '../../types';
import { useQuizSession } from '../../hooks/useQuizSession';
import QuizQuestionComponent from './QuizQuestion';
import ProgressBar from '../ProgressBar/ProgressBar';
import './QuizEngine.css';

interface Props {
  questions: QuizQuestion[];
}

export default function QuizEngine({ questions }: Props) {
  const session = useQuizSession(questions);

  if (session.isComplete) {
    const pct = Math.round((session.score / questions.length) * 100);
    const passed = session.score >= Math.ceil(questions.length * 0.72);

    // Group results by scenario
    const byScenario = questions.reduce<Record<string, { correct: number; total: number }>>(
      (acc, q) => {
        const s = q.scenario;
        if (!acc[s]) acc[s] = { correct: 0, total: 0 };
        acc[s].total += 1;
        if (session.answers[q.id] === q.correctAnswer) acc[s].correct += 1;
        return acc;
      },
      {}
    );

    return (
      <div className="quiz-results">
        <div className={`results-score ${passed ? 'passing' : 'failing'}`}>
          {session.score}/{questions.length}
        </div>
        <div className="results-pct">{pct}% correct</div>
        <p className={`results-verdict ${passed ? 'passing' : 'failing'}`}>
          {passed ? '✓ Above passing threshold (72%)' : '✗ Below passing threshold (72%)'}
        </p>

        <div className="results-breakdown">
          <h3>By scenario</h3>
          {Object.entries(byScenario).map(([scenario, { correct, total }]) => (
            <div key={scenario} className="scenario-row">
              <span className="scenario-name">{scenario}</span>
              <span className="scenario-score">{correct}/{total}</span>
              <div className="scenario-bar-wrapper">
                <div
                  className="scenario-bar-fill"
                  style={{
                    width: `${(correct / total) * 100}%`,
                    background: correct === total ? 'var(--color-success)' : 'var(--color-accent)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="results-review">
          <h3>Review wrong answers</h3>
          {questions
            .filter((q) => session.answers[q.id] !== q.correctAnswer)
            .map((q) => (
              <div key={q.id} className="review-item">
                <p className="review-question">{q.question}</p>
                <div className="review-answer">
                  <span className="review-label">Correct: {q.correctAnswer}</span>
                  <span className="review-explanation">{q.explanation}</span>
                </div>
              </div>
            ))}
          {questions.every((q) => session.answers[q.id] === q.correctAnswer) && (
            <p className="all-correct">All correct! 🎉</p>
          )}
        </div>

        <button className="btn-primary" onClick={session.restart}>
          Retake quiz
        </button>
      </div>
    );
  }

  if (!session.currentQuestion) return null;

  return (
    <div className="quiz-engine">
      <div className="quiz-header">
        <ProgressBar
          value={session.currentIndex}
          max={session.totalQuestions}
          label="Progress"
        />
        <div className="quiz-dots">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`quiz-dot ${
                i < session.currentIndex
                  ? session.answers[questions[i].id] === questions[i].correctAnswer
                    ? 'dot-correct'
                    : 'dot-wrong'
                  : i === session.currentIndex
                  ? 'dot-current'
                  : ''
              }`}
            />
          ))}
        </div>
      </div>

      <QuizQuestionComponent
        question={session.currentQuestion}
        questionNumber={session.currentIndex + 1}
        totalQuestions={session.totalQuestions}
        selectedAnswer={session.selectedAnswer}
        onAnswer={session.selectAnswer}
        onNext={session.nextQuestion}
        isLast={session.currentIndex === session.totalQuestions - 1}
      />
    </div>
  );
}
