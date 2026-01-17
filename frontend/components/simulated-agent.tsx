'use client';

import { useState, useEffect } from 'react';

export function SimulatedAgent() {
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // Simulate the agent "thinking" periodically
    const interval = setInterval(() => {
      setIsThinking(true);
      setTimeout(() => setIsThinking(false), 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30 ring-2 ring-purple-500/20 group">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* AI Avatar */}
        <div className="relative">
          <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-2xl transition-all ${isThinking ? 'scale-110 shadow-purple-500/50' : ''}`}>
            <svg
              className="w-14 h-14"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          
          {/* Thinking indicator */}
          {isThinking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
              Thinking...
            </div>
          )}

          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-400/50 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-400/30" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">AI Tutor</span>
            <span className="text-slate-400 text-xs">• Active</span>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-10 h-10 bg-black/70 backdrop-blur-sm hover:bg-black/80 rounded-lg flex items-center justify-center text-white border border-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-3 py-1 rounded-full">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-xs font-medium">Online</span>
        </div>
      </div>
    </div>
  );
}
