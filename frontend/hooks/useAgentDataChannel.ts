'use client';

import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind } from 'livekit-client';

/**
 * Message format for agent commands
 */
export interface AgentCommand {
  type: 'command';
  payload: {
    action: string;
    label?: string;
    message?: string;
    data?: unknown;
    sessionId?: string;  // Session ID from agent for syncing
    graph?: {
      centerId: string;
      nodes: Array<{ id: string; label: string; vizType?: string }>;
      links: Array<{ source: string; target: string }>;
    };
  };
}

/**
 * Custom hook for bidirectional data channel communication with the LiveKit Agent
 *
 * @returns {Object} - Contains sendCommand function and lastCommand state
 * @returns {Function} sendCommand - Send a command to the agent
 * @returns {AgentCommand | null} lastCommand - Most recent command received from agent
 */
export function useAgentDataChannel() {
  const room = useRoomContext();
  const [lastCommand, setLastCommand] = useState<AgentCommand | null>(null);

  useEffect(() => {
    if (!room) return;

    /**
     * Handler for incoming data packets
     */
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: any,
      kind?: DataPacket_Kind,
      topic?: string
    ) => {
      try {
        // Decode the message
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);

        // Parse JSON
        const message = JSON.parse(text) as AgentCommand;

        // Validate message structure
        if (message.type === 'command' && message.payload?.action) {
          console.log('[Data Channel] Received command from agent:', message);

          // Handle error commands
          if (message.payload.action === 'error') {
            console.error('[Data Channel] Agent error:', message.payload.message);
            // TODO: Show error toast/notification to user
          }

          setLastCommand(message);
        } else {
          console.warn('[Data Channel] Invalid message format:', message);
        }
      } catch (error) {
        console.error('[Data Channel] Failed to parse message:', error);
      }
    };

    // Subscribe to data received events
    room.on(RoomEvent.DataReceived, handleDataReceived);

    // Cleanup on unmount
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  /**
   * Send a command to the agent
   *
   * @param action - The action type (e.g., "user_clicked", "navigate")
   * @param payload - Additional payload data
   */
  const sendCommand = (action: string, payload?: { label?: string; data?: unknown }) => {
    if (!room) {
      console.error('[Data Channel] Cannot send - room not connected');
      return;
    }

    // Create clean payload - only include serializable data
    const cleanPayload: any = { action };
    if (payload?.label) cleanPayload.label = payload.label;
    if (payload?.data && typeof payload.data !== 'object') {
      // Only include primitive data types
      cleanPayload.data = payload.data;
    }

    const message: AgentCommand = {
      type: 'command',
      payload: cleanPayload,
    };

    try {
      // Try to stringify to check for circular references
      let jsonString: string;
      try {
        jsonString = JSON.stringify(message);
      } catch (stringifyError) {
        console.error('[Data Channel] Cannot serialize message - circular reference detected:', stringifyError);
        console.error('[Data Channel] Problematic message:', message);
        throw new Error('Cannot send message with circular references');
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(jsonString);

      // Send using reliable data channel
      room.localParticipant.publishData(data, {
        reliable: true,
      });

      console.log('[Data Channel] Sent command to agent:', message);
    } catch (error) {
      console.error('[Data Channel] Failed to send message:', error);
      throw error; // Re-throw to surface the error
    }
  };

  return {
    sendCommand,
    lastCommand,
  };
}
