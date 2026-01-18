'use client';

import { useEffect, useState } from 'react';
import { LiveKitRoom, useParticipants, useRoomContext, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { ParticipantTile } from './participant-tile';
import { SimulatedAgent } from './simulated-agent';
import { AgentStatus, AgentConnectionState } from './agent-status';
import { useAgentDataChannel } from '@/hooks/useAgentDataChannel';
import { Participant, RoomEvent } from 'livekit-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const SIMULATE_AGENT = false;

interface VideoRoomContentProps {
  token: string;
  wsUrl: string;
  sessionId?: string;
  onCommandReceived?: (command: any) => void;
  onSendCommandReady?: (sendCommand: (action: string, payload?: any) => void) => void;
}

function RoomContent({ onCommandReceived, onSendCommandReady, sessionId }: {
  onCommandReceived?: (command: any) => void;
  onSendCommandReady?: (sendCommand: (action: string, payload?: any) => void) => void;
  sessionId?: string;
}) {
  const room = useRoomContext();
  const participants = useParticipants();
  const { sendCommand, lastCommand } = useAgentDataChannel();

  // Expose sendCommand to parent when ready
  useEffect(() => {
    if (onSendCommandReady && room) {
      onSendCommandReady(sendCommand);
    }
  }, [onSendCommandReady, sendCommand, room]);

  const [agentConnectionState, setAgentConnectionState] = useState<AgentConnectionState>('not_joined');
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [hasOpenNoteMaterials, setHasOpenNoteMaterials] = useState(false);

  // Check if session has OpenNote materials
  useEffect(() => {
    if (sessionId) {
      fetch(`${BACKEND_URL}/session/${sessionId}/opennote`)
        .then(res => {
          if (res.ok) {
            setHasOpenNoteMaterials(true);
            console.log('[VideoRoom] OpenNote materials available');
          }
        })
        .catch(() => {});
    }
  }, [sessionId]);

  // Sort participants: local user first, then others
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isLocal) return -1;
    if (b.isLocal) return 1;
    return 0;
  });

  const localParticipant = sortedParticipants.find((p) => p.isLocal);
  const agentParticipant = sortedParticipants.find(
    (p) => !p.isLocal && p.identity.toLowerCase().includes('agent')
  );

  // Track agent connection state
  useEffect(() => {
    if (agentParticipant) {
      setAgentConnectionState('connected');
      setShowRetryButton(false);
    } else {
      setAgentConnectionState('not_joined');

      // Set timeout to show retry button after 30 seconds
      const timeout = setTimeout(() => {
        setShowRetryButton(true);
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [agentParticipant]);

  // Listen for participant disconnection
  useEffect(() => {
    if (!room) return;

    const handleParticipantDisconnected = (participant: Participant) => {
      if (participant.identity.toLowerCase().includes('agent')) {
        console.log('[Room] Agent disconnected');
        setAgentConnectionState('disconnected');
      }
    };

    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room]);

  // Forward commands to parent
  useEffect(() => {
    if (lastCommand) {
      console.log('[Room] Received command from agent:', lastCommand);
      onCommandReceived?.(lastCommand);
    }
  }, [lastCommand, onCommandReceived]);

  const handleRetry = () => {
    console.log('[Room] Retry button clicked - refreshing connection state');
    setShowRetryButton(false);
    setAgentConnectionState('connecting');

    // Reset to not_joined after a brief moment
    setTimeout(() => {
      if (!agentParticipant) {
        setAgentConnectionState('not_joined');
      }
    }, 2000);
  };

  const handleJoinBreakout = () => {
    if (sessionId) {
      window.location.href = `/breakout?session=${sessionId}`;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-950 relative">
      {/* Join Study Room Button */}
      {hasOpenNoteMaterials && (
        <button
          onClick={handleJoinBreakout}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Study Room
        </button>
      )}
      {/* User Tile - Always on top */}
      <div className="flex-1">
        {localParticipant ? (
          <ParticipantTile
            participant={localParticipant}
            label="You"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
            Connecting...
          </div>
        )}
      </div>

      {/* Agent Tile - Always on bottom */}
      <div className="flex-1">
        {SIMULATE_AGENT ? (
          <SimulatedAgent />
        ) : agentParticipant ? (
          <ParticipantTile
            participant={agentParticipant}
            label="AI Tutor"
          />
        ) : (
          <AgentStatus
            state={agentConnectionState}
            onRetry={showRetryButton ? handleRetry : undefined}
          />
        )}
      </div>
    </div>
  );
}

export function VideoRoom({ token, wsUrl, sessionId, onCommandReceived, onSendCommandReady }: VideoRoomContentProps) {
  const [permissionError, setPermissionError] = useState(false);

  return (
    <>
      {permissionError && (
        <div className="absolute inset-0 z-50 bg-gray-950/95 flex items-center justify-center p-6">
          <div className="max-w-md bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-3">Camera/Microphone Access Needed</h3>
            <p className="text-gray-300 mb-4">
              Please allow access to your camera and microphone to join the room.
              Click the camera icon in your browser's address bar to grant permissions.
            </p>
            <button
              onClick={() => {
                setPermissionError(false);
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <LiveKitRoom
        token={token}
        serverUrl={wsUrl}
        connect={true}
        video={true}
        audio={true}
        className="w-full h-full"
        onError={(error) => {
          console.error('[LiveKit] Error:', error);
          if (error.message.includes('Permission denied') || error.message.includes('NotAllowed')) {
            setPermissionError(true);
          }
        }}
      >
        {/* This component automatically plays all remote audio tracks */}
        <RoomAudioRenderer />
        <RoomContent
          onCommandReceived={onCommandReceived}
          onSendCommandReady={onSendCommandReady}
          sessionId={sessionId}
        />
      </LiveKitRoom>
    </>
  );
}
