'use client';

import { useState } from 'react';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsData {
  title?: string;
  cards?: Flashcard[];
}

interface FlashcardsViewProps {
  data?: FlashcardsData;
}

export function FlashcardsView({ data }: FlashcardsViewProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

  const cards = data?.cards || [];

  if (!cards.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 p-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>No flashcards available</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentCard(Math.min(cards.length - 1, currentCard + 1));
  };

  const handlePrev = () => {
    setShowAnswer(false);
    setCurrentCard(Math.max(0, currentCard - 1));
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedCards);
    if (newCompleted.has(currentCard)) {
      newCompleted.delete(currentCard);
    } else {
      newCompleted.add(currentCard);
    }
    setCompletedCards(newCompleted);
  };

  const progress = (completedCards.size / cards.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Card {currentCard + 1} of {cards.length}
          </span>
          <span className="text-sm text-gray-400">
            {completedCards.size} / {cards.length} mastered
          </span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className={`w-full max-w-2xl h-72 rounded-xl cursor-pointer transition-all duration-300 transform perspective-1000 ${
          showAnswer ? 'rotate-y-0' : ''
        }`}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <div
          className={`w-full h-full rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
            showAnswer
              ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-2 border-green-700'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 hover:border-indigo-500'
          }`}
        >
          <div className="text-xs text-gray-400 mb-4 uppercase tracking-wider">
            {showAnswer ? 'Answer' : 'Question'} - Click to flip
          </div>
          <p className={`text-xl leading-relaxed ${showAnswer ? 'text-green-100' : 'text-white'}`}>
            {showAnswer ? cards[currentCard]?.answer : cards[currentCard]?.question}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={handlePrev}
          disabled={currentCard === 0}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={handleMarkComplete}
          className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            completedCards.has(currentCard)
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {completedCards.has(currentCard) ? 'Mastered' : 'Mark Mastered'}
        </button>

        <button
          onClick={handleNext}
          disabled={currentCard === cards.length - 1}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
        >
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Card Navigation Dots */}
      <div className="flex gap-2 mt-6 flex-wrap justify-center max-w-2xl">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentCard(idx);
              setShowAnswer(false);
            }}
            className={`w-3 h-3 rounded-full transition-colors ${
              idx === currentCard
                ? 'bg-indigo-500'
                : completedCards.has(idx)
                ? 'bg-green-500'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={`Card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
