import type { Section, FlashcardItem } from '../../types';
import './StudyView.css';

interface Props {
  section: Section;
  questions?: FlashcardItem[];
}

export default function StudyView({ section, questions }: Props) {
  return (
    <div className="study-view">
      <h1 className="study-heading">
        {section === 'javascript' ? 'JavaScript' : 'React'} Interview Questions
      </h1>
      <p className="study-subheading">
        {questions?.length} questions — use Flashcards mode to test yourself.
      </p>
      <ol className="question-list">
        {questions?.map((item) => (
          <li key={item.id} className="question-item" id={item.id}>
            {item.parentId && (
              <span className="parent-tag">↳ follow-up</span>
            )}
            <p className="question-text">{item.question}</p>
            {item.code && (
              <pre className="question-code">
                <code className={`language-${item.codeLanguage ?? 'javascript'}`}>
                  {item.code}
                </code>
              </pre>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
