import { useState, useMemo } from 'react';
import type { FlashcardItem } from '../types';

export function useFlashcardSession(allCards: FlashcardItem[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [unknownIds, setUnknownIds] = useState<Set<string>>(new Set());
  const [reviewingUnknownOnly, setReviewingUnknownOnly] = useState(false);

  const deck = useMemo(
    () => (reviewingUnknownOnly ? allCards.filter((c) => unknownIds.has(c.id)) : allCards),
    [allCards, reviewingUnknownOnly, unknownIds]
  );

  const isComplete = deck.length > 0 && currentIndex >= deck.length;
  const currentCard = deck[currentIndex] ?? null;

  const progress = {
    known: knownIds.size,
    unknown: unknownIds.size,
    remaining: deck.length - Math.min(currentIndex, deck.length),
    total: allCards.length,
  };

  function markKnown() {
    if (!currentCard) return;
    setKnownIds((prev) => new Set([...prev, currentCard.id]));
    setUnknownIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    setCurrentIndex((i) => i + 1);
  }

  function markUnknown() {
    if (!currentCard) return;
    setUnknownIds((prev) => new Set([...prev, currentCard.id]));
    setKnownIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    setCurrentIndex((i) => i + 1);
  }

  function restart() {
    setCurrentIndex(0);
    setKnownIds(new Set());
    setUnknownIds(new Set());
    setReviewingUnknownOnly(false);
  }

  function reviewUnknownOnly() {
    setReviewingUnknownOnly(true);
    setCurrentIndex(0);
  }

  function goTo(index: number) {
    setCurrentIndex(Math.max(0, Math.min(index, deck.length - 1)));
  }

  return {
    currentCard,
    currentIndex,
    deck,
    progress,
    isComplete,
    reviewingUnknownOnly,
    markKnown,
    markUnknown,
    restart,
    reviewUnknownOnly,
    goTo,
  };
}
