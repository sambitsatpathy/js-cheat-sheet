import { useState } from 'react';
import type { AppView } from './types';
import Sidebar from './components/Sidebar/Sidebar';
import StudyView from './components/StudyView/StudyView';
import QuizEngine from './components/QuizEngine/QuizEngine';
import { claudeQuestions } from './data/claudeQuestions';

const DEFAULT_VIEW: AppView = { section: 'claude', mode: 'study' };

export default function App() {
  const [view, setView] = useState<AppView>(DEFAULT_VIEW);

  function handleNavigate(next: AppView) {
    setView(next);
  }

  function renderContent() {
    const { mode } = view;

    if (mode === 'study') {
      return <StudyView />;
    }

    if (mode === 'quiz') {
      return <QuizEngine key="claude-quiz" questions={claudeQuestions} />;
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
