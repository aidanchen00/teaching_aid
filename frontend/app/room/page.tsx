'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { VideoRoom } from '@/components/video-room';
import { LearningPanel } from '@/components/learning-panel';
import { AgentCommand } from '@/hooks/useAgentDataChannel';

export default function RoomPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session');

  const [joined, setJoined] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<AgentCommand | null>(null);
  const [curriculumContext, setCurriculumContext] = useState<any>(null);
  const [sendCommand, setSendCommand] = useState<((action: string, payload?: any) => void) | null>(null);

  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

  // Auto-join if session ID is present (coming from nexhacksv0)
  useEffect(() => {
    if (sessionId && !joined && !isConnecting) {
      console.log('[RoomPage] Auto-joining from nexhacksv0 session:', sessionId);
      // Fetch session context from backend
      fetchSessionContext(sessionId);
      // Auto-join room
      handleJoinRoom(sessionId);
    }
  }, [sessionId]);

  const fetchSessionContext = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/session/${sessionId}/graph`);
      if (response.ok) {
        const data = await response.json();
        // In future, backend could return curriculum_context
        console.log('[RoomPage] Session context:', data);
      }
    } catch (err) {
      console.error('[RoomPage] Failed to fetch session context:', err);
    }
  };

  // Wrap in useCallback to prevent unnecessary re-renders and effect re-runs
  const handleCommandReceived = useCallback((command: AgentCommand) => {
    console.log('[RoomPage] Command received:', command);
    setLastCommand(command);
  }, []);

  // Callback when sendCommand is ready from VideoRoom
  const handleSendCommandReady = useCallback((sendFn: (action: string, payload?: any) => void) => {
    console.log('[RoomPage] sendCommand is ready');
    setSendCommand(() => sendFn);
  }, []);

  const handleJoinRoom = async (session?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const roomName = session ? `learning-room-${session}` : 'learning-room';
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: roomName,
          participantName: 'Student',
          sessionId: session || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch token');
      }

      const data = await response.json();
      setToken(data.token);
      setJoined(true);
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room. Please check your configuration.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - LiveKit Room */}
      <div className="w-1/2 h-full">
        {!token ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="text-center relative z-10 px-8">
              {/* Icon */}
              <div className="mb-8 inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform hover:scale-105 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                {sessionId ? 'Starting Your Session...' : 'Ready to Learn?'}
              </h2>
              <p className="text-slate-300 mb-8 max-w-md mx-auto">
                {sessionId
                  ? 'Connecting you to your personalized learning session'
                  : 'Join the video room to start your interactive learning session with AI-powered tutoring'
                }
              </p>

              <button
                onClick={handleJoinRoom}
                disabled={isConnecting}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform inline-flex items-center gap-3"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    Join Room
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm max-w-md mx-auto">
                  <p className="font-medium mb-2">Connection Error</p>
                  <p className="mb-3">{error}</p>
                  {error.includes('LiveKit') && (
                    <div className="mt-3 pt-3 border-t border-red-500/20 text-xs text-red-300">
                      <p className="font-medium mb-1">To enable video/voice features:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Get credentials from <a href="https://cloud.livekit.io" target="_blank" className="underline">cloud.livekit.io</a></li>
                        <li>Create <code className="bg-red-900/30 px-1 rounded">frontend/.env.local</code></li>
                        <li>Add your LiveKit credentials</li>
                        <li>Restart the dev server</li>
                      </ol>
                      <p className="mt-2 text-yellow-300">Note: The knowledge graph on the right works without LiveKit</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <VideoRoom
            token={token}
            wsUrl={wsUrl}
            sessionId={sessionId || undefined}
            onCommandReceived={handleCommandReceived}
            onSendCommandReady={handleSendCommandReady}
          />
        )}
      </div>

      {/* Right Panel - Learning Panel */}
      <div className="w-1/2 h-full">
        <LearningPanel lastCommand={lastCommand} sendCommand={sendCommand} />
      </div>
    </div>
  );
}
