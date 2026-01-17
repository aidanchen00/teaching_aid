'use client';

import { VideoTrack } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';

interface ParticipantTileProps {
  participant: Participant;
  label: string;
}

export function ParticipantTile({ participant, label }: ParticipantTileProps) {
  const videoPublication = participant.videoTrackPublications.values().next().value;
  const hasVideo = videoPublication && videoPublication.track;

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
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
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl font-medium">
            {label.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded text-white text-sm">
        {label}
      </div>
    </div>
  );
}
