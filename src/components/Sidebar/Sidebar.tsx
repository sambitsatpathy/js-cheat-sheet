import type { AppView, Section, Mode } from '../../types';
import './Sidebar.css';

interface Props {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const SECTIONS: { id: Section; label: string; count: string }[] = [
  { id: 'javascript', label: 'JavaScript', count: '32 questions' },
  { id: 'react', label: 'React', count: '20 questions' },
  { id: 'claude', label: 'Claude Architect', count: 'Cert prep' },
];

const MODES: Record<Section, { id: Mode; label: string }[]> = {
  javascript: [
    { id: 'study', label: 'Study' },
    { id: 'flashcard', label: 'Flashcards' },
  ],
  react: [
    { id: 'study', label: 'Study' },
    { id: 'flashcard', label: 'Flashcards' },
  ],
  claude: [
    { id: 'study', label: 'Study Guide' },
    { id: 'quiz', label: 'Quiz' },
  ],
};

export default function Sidebar({ currentView, onNavigate }: Props) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">📚</span>
        <span className="sidebar-title">Study Hub</span>
      </div>

      <div className="sidebar-sections">
        {SECTIONS.map((section) => (
          <div key={section.id} className="sidebar-section-group">
            <button
              className={`sidebar-section-btn ${currentView.section === section.id ? 'active' : ''}`}
              onClick={() => onNavigate({ section: section.id, mode: MODES[section.id][0].id })}
            >
              <span className="section-label">{section.label}</span>
              <span className="section-count">{section.count}</span>
            </button>

            {currentView.section === section.id && (
              <div className="sidebar-modes">
                {MODES[section.id].map((mode) => (
                  <button
                    key={mode.id}
                    className={`sidebar-mode-btn ${currentView.mode === mode.id ? 'active' : ''}`}
                    onClick={() => onNavigate({ section: section.id, mode: mode.id })}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
