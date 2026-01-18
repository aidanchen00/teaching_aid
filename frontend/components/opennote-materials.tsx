'use client';

import { useState } from 'react';
import { NotebookView } from './notebook-view';
import { FlashcardsView } from './flashcards-view';
import { ProblemsView } from './problems-view';

interface OpenNoteMaterialsProps {
  materials: {
    notebook?: any;
    flashcards?: any;
    practice_problems?: any;
  };
}

type TabType = 'notebook' | 'flashcards' | 'problems';

export function OpenNoteMaterials({ materials }: OpenNoteMaterialsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('notebook');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'notebook', label: 'Notebook', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'flashcards', label: 'Flashcards', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'problems', label: 'Practice', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-800 bg-gray-900/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'notebook' && <NotebookView data={materials.notebook} />}
        {activeTab === 'flashcards' && <FlashcardsView data={materials.flashcards} />}
        {activeTab === 'problems' && <ProblemsView data={materials.practice_problems} />}
      </div>
    </div>
  );
}
