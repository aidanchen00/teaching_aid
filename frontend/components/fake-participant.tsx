'use client';

interface FakeParticipantProps {
  name: string;
  status?: string;
}

export function FakeParticipant({ name, status = "Online" }: FakeParticipantProps) {
  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
      {/* Avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {name[0]}
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
        <span className="text-white text-sm font-medium">{name}</span>
      </div>

      {/* Status Badge */}
      <div className="absolute top-3 right-3 px-3 py-1 bg-purple-600/80 backdrop-blur-sm rounded-lg">
        <span className="text-white text-xs font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          {status}
        </span>
      </div>
    </div>
  );
}
