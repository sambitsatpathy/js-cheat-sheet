import type { FlashcardItem } from '../../types';
import { useFlashcardSession } from '../../hooks/useFlashcardSession';
import Flashcard from './Flashcard';
import ProgressBar from '../ProgressBar/ProgressBar';
import './FlashcardDeck.css';

interface Props {
  cards: FlashcardItem[];
  section: string;
}

export default function FlashcardDeck({ cards, section }: Props) {
  const session = useFlashcardSession(cards);

  if (session.isComplete) {
    const hasUnknown = session.progress.unknown > 0;
    return (
      <div className="flashcard-complete">
        <div className="complete-icon">🎉</div>
        <h2>Session complete!</h2>
        <p className="complete-subtitle">{section} flashcards</p>
        <div className="complete-stats">
          <div className="stat stat-known">
            <span className="stat-number">{session.progress.known}</span>
            <span className="stat-label">Got it</span>
          </div>
          <div className="stat stat-unknown">
            <span className="stat-number">{session.progress.unknown}</span>
            <span className="stat-label">Still learning</span>
          </div>
          <div className="stat">
            <span className="stat-number">{session.progress.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="complete-btns">
          <button className="btn-secondary" onClick={session.restart}>
            Restart all
          </button>
          {hasUnknown && (
            <button className="btn-primary" onClick={session.reviewUnknownOnly}>
              Review {session.progress.unknown} unknowns
            </button>
          )}
        </div>
      </div>
    );
  }

  const { currentCard, currentIndex, deck, progress } = session;

  if (!currentCard) return null;

  return (
    <div className="flashcard-deck">
      <div className="deck-header">
        <ProgressBar
          value={currentIndex}
          max={deck.length}
          label={`${progress.known} known · ${progress.unknown} learning`}
        />
      </div>

      <Flashcard
        key={currentCard.id}
        card={currentCard}
        cardNumber={currentIndex + 1}
        totalCards={deck.length}
        onKnown={session.markKnown}
        onUnknown={session.markUnknown}
      />
    </div>
  );
}
