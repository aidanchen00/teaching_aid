'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FakeParticipant } from '@/components/fake-participant';
import { OpenNoteMaterials } from '@/components/opennote-materials';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface OpenNoteData {
  materials: {
    notebook?: any;
    flashcards?: any;
    practice_problems?: any;
  };
  breakoutRoomId?: string;
  metadata?: {
    title?: string;
    school?: string;
  };
}

function BreakoutRoomContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session');

  const [materials, setMaterials] = useState<OpenNoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetch(`${BACKEND_URL}/session/${sessionId}/opennote`)
        .then(res => {
          if (!res.ok) throw new Error('Materials not found');
          return res.json();
        })
        .then(data => {
          setMaterials(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('[Breakout] Failed to load materials:', err);
          setError('Failed to load study materials');
          setLoading(false);
        });
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const handleBackToRoom = () => {
    if (sessionId) {
      window.location.href = `/room?session=${sessionId}`;
    } else {
      window.location.href = '/room';
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading study materials...</p>
        </div>
      </div>
    );
  }

  if (error || !materials) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md p-8 bg-gray-900 rounded-lg">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Materials</h2>
          <p className="text-gray-400 mb-6">{error || 'Something went wrong. Please try again.'}</p>
          <button
            onClick={handleBackToRoom}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Back to Main Room
          </button>
        </div>
      </div>
    );
  }

  const courseTitle = materials.metadata?.title || 'Study Session';

  return (
    <div className="h-screen flex bg-gray-950">
      {/* Left Panel: Participants */}
      <div className="w-1/3 p-4 flex flex-col gap-4 border-r border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-white">Study Room</h1>
          <span className="text-sm text-gray-400">{courseTitle}</span>
        </div>

        {/* User Tile */}
        <div className="flex-1 min-h-0">
          <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              Y
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
              <span className="text-white text-sm font-medium">You</span>
            </div>
          </div>
        </div>

        {/* Classmate Tile */}
        <div className="flex-1 min-h-0">
          <FakeParticipant name="Classmate" status="Studying" />
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackToRoom}
          className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Main Room
        </button>
      </div>

      {/* Right Panel: OpenNote Materials */}
      <div className="flex-1 p-4 overflow-hidden">
        <OpenNoteMaterials materials={materials.materials} />
      </div>
    </div>
  );
}

export default function BreakoutRoomPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BreakoutRoomContent />
    </Suspense>
  );
}
