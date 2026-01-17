'use client';

import { useEffect, useRef, useState } from 'react';
import { SimulatedAgent } from './simulated-agent';

export function DemoVideoRoom() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasVideo(true);
        }
      } catch (err) {
        console.error('Failed to access camera:', err);
        setError('Could not access camera');
      }
    }

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* User Tile - Always on top */}
      <div className="flex-1 relative group">
        <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 ring-2 ring-indigo-500/20">
          {hasVideo ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {error ? (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
                    Y
                  </div>
                  <p className="text-slate-400 text-sm">{error}</p>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-pulse">
                  Y
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Labels and controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">You</span>
              <span className="text-slate-400 text-xs">• Demo Mode</span>
            </div>
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-10 h-10 bg-black/70 backdrop-blur-sm hover:bg-black/80 rounded-lg flex items-center justify-center text-white border border-white/10 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            <button className="w-10 h-10 bg-black/70 backdrop-blur-sm hover:bg-black/80 rounded-lg flex items-center justify-center text-white border border-white/10 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Agent Tile - Always on bottom */}
      <div className="flex-1">
        <SimulatedAgent />
      </div>
    </div>
  );
}
