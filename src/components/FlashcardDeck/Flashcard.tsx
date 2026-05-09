import { useState } from 'react';
import type { FlashcardItem } from '../../types';
import './FlashcardDeck.css';

interface Props {
  card: FlashcardItem;
  cardNumber: number;
  totalCards: number;
  onKnown: () => void;
  onUnknown: () => void;
}

export default function Flashcard({ card, cardNumber, totalCards, onKnown, onUnknown }: Props) {
  const [revealed, setRevealed] = useState(false);

  const showActions = revealed || !card.code;

  return (
    <div className="flashcard">
      <div className="flashcard-counter">
        Card {cardNumber} of {totalCards}
      </div>

      {card.parentId && (
        <div className="flashcard-parent-tag">↳ follow-up question</div>
      )}

      <p className="flashcard-question">{card.question}</p>

      {card.code && !revealed && (
        <button className="reveal-btn" onClick={() => setRevealed(true)}>
          Show code snippet
        </button>
      )}

      {card.code && revealed && (
        <pre className="flashcard-code">
          <code>{card.code}</code>
        </pre>
      )}

      {showActions && (
        <div className="flashcard-actions">
          <p className="flashcard-prompt">How well did you know this?</p>
          <div className="flashcard-btns">
            <button className="btn-unknown" onClick={onUnknown}>
              Still learning
            </button>
            <button className="btn-known" onClick={onKnown}>
              Got it ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
