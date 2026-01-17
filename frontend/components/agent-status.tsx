'use client';

import { Loader2, AlertCircle, Clock } from 'lucide-react';

export type AgentConnectionState = 'connecting' | 'connected' | 'disconnected' | 'not_joined';

interface AgentStatusProps {
  state: AgentConnectionState;
  onRetry?: () => void;
}

/**
 * Component to display agent connection status with appropriate UI
 */
export function AgentStatus({ state, onRetry }: AgentStatusProps) {
  if (state === 'connected') {
    // Don't render anything when connected - the video tile will show
    return null;
  }

  const stateConfig = {
    connecting: {
      icon: <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />,
      title: 'Connecting to tutor...',
      description: 'Please wait while we establish the connection',
      bgGradient: 'from-indigo-950/50 to-purple-950/50',
    },
    disconnected: {
      icon: <AlertCircle className="w-8 h-8 text-red-400" />,
      title: 'Tutor disconnected',
      description: 'Waiting to reconnect...',
      bgGradient: 'from-red-950/50 to-pink-950/50',
    },
    not_joined: {
      icon: <Clock className="w-8 h-8 text-amber-400" />,
      title: 'Waiting for tutor to join',
      description: 'The tutor will join shortly',
      bgGradient: 'from-amber-950/50 to-orange-950/50',
    },
  };

  const config = stateConfig[state];

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${config.bgGradient} rounded-lg flex flex-col items-center justify-center gap-4 p-6 border border-gray-800`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center">
        {config.icon}
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-100">
          {config.title}
        </h3>
        <p className="text-sm text-gray-400">
          {config.description}
        </p>
      </div>

      {/* Retry button for not_joined state after timeout */}
      {state === 'not_joined' && onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      )}

      {/* Pulsing indicator */}
      {(state === 'connecting' || state === 'not_joined') && (
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}
