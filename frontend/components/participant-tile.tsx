'use client';

import { useEffect, useState } from 'react';
import { VideoTrack } from '@livekit/components-react';
import { Participant, Track, RoomEvent } from 'livekit-client';

interface ParticipantTileProps {
  participant: Participant;
  label: string;
}

export function ParticipantTile({ participant, label }: ParticipantTileProps) {
  const videoPublication = participant.videoTrackPublications.values().next().value;
  const hasVideo = videoPublication && videoPublication.track;
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Track speaking state
  useEffect(() => {
    if (!participant) return;

    // Check speaking state periodically
    // LiveKit updates isSpeaking property based on audio level
    const interval = setInterval(() => {
      setIsSpeaking(participant.isSpeaking || false);
    }, 100);

    // Initial check
    setIsSpeaking(participant.isSpeaking || false);

    return () => {
      clearInterval(interval);
    };
  }, [participant]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Speaking indicator border */}
      {isSpeaking && (
        <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse z-10 pointer-events-none" />
      )}
      
      {hasVideo ? (
        <VideoTrack
          trackRef={{
            participant,
            source: Track.Source.Camera,
            publication: videoPublication,
          }}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium transition-all duration-300 ${
            isSpeaking ? 'bg-green-600 scale-110' : 'bg-gray-700'
          }`}>
            {label.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      {/* Label with speaking indicator */}
      <div className={`absolute bottom-3 left-3 px-3 py-1 rounded text-white text-sm flex items-center gap-2 transition-all duration-300 ${
        isSpeaking ? 'bg-green-600/90' : 'bg-black/60'
      }`}>
        {/* Speaking indicator dot */}
        {isSpeaking && (
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
        <span className="font-medium">{label}</span>
        {isSpeaking && (
          <span className="text-xs opacity-75">Speaking...</span>
        )}
      </div>
    </div>
  );
}
