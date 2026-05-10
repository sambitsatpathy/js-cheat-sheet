import { useState } from 'react';
import type { AppView } from './types';
import Sidebar from './components/Sidebar/Sidebar';
import StudyView from './components/StudyView/StudyView';
import FlashcardDeck from './components/FlashcardDeck/FlashcardDeck';
import QuizEngine from './components/QuizEngine/QuizEngine';
import CodeExamplesView from './components/CodeExamples/CodeExamplesView';
import { jsQuestions } from './data/jsQuestions';
import { reactQuestions } from './data/reactQuestions';
import { claudeQuestions } from './data/claudeQuestions';

const DEFAULT_VIEW: AppView = { section: 'javascript', mode: 'study' };

export default function App() {
  const [view, setView] = useState<AppView>(DEFAULT_VIEW);

  function handleNavigate(next: AppView) {
    setView(next);
  }

  function renderContent() {
    const { section, mode } = view;

    if (mode === 'study') {
      const questions =
        section === 'javascript' ? jsQuestions : section === 'react' ? reactQuestions : undefined;
      return <StudyView section={section} questions={questions} />;
    }

    if (mode === 'flashcard') {
      const cards = section === 'javascript' ? jsQuestions : reactQuestions;
      const label = section === 'javascript' ? 'JavaScript' : 'React';
      return <FlashcardDeck key={section} cards={cards} section={label} />;
    }

    if (mode === 'quiz') {
      return <QuizEngine key="claude-quiz" questions={claudeQuestions} />;
    }

    if (mode === 'codeExamples') {
      return <CodeExamplesView />;
    }

    return null;
  }

  return (
    <div className="app-layout">
      <Sidebar currentView={view} onNavigate={handleNavigate} />
      <main className="content-area">{renderContent()}</main>
    </div>
  );
}
