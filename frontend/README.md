# Learning App

A split-screen learning application built with Next.js and LiveKit.

## Features

- Split-screen layout with LiveKit video room (left) and learning panel (right)
- Deterministic tile layout: user always on top, AI tutor always on bottom
- Simulated AI agent participant (frontend-only for development)
- Real-time video and audio communication

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- TailwindCSS
- LiveKit (@livekit/components-react, livekit-client)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your LiveKit credentials:
- Get them from [LiveKit Cloud](https://cloud.livekit.io) or your self-hosted server
- `NEXT_PUBLIC_LIVEKIT_URL`: Your LiveKit WebSocket URL
- `LIVEKIT_API_KEY`: Your API key
- `LIVEKIT_API_SECRET`: Your API secret

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) and click "Enter Room"

## Project Structure

```
app/
├── room/
│   └── page.tsx          # Main split-screen room page
├── api/
│   └── livekit/
│       └── token/
│           └── route.ts  # Token generation endpoint
components/
├── video-room.tsx        # LiveKit room wrapper
├── participant-tile.tsx  # Individual video tile
├── simulated-agent.tsx   # Fake agent placeholder
└── learning-panel.tsx    # Right-side placeholder
```

## Development Notes

- `SIMULATE_AGENT` flag in `components/video-room.tsx` controls whether to show simulated agent
- Set to `false` to wait for a real LiveKit Agent to join
- Simulated agent is purely visual and doesn't publish to LiveKit

## Next Steps

- Replace simulated agent with real LiveKit Agent
- Implement speech-to-text
- Add ElevenLabs TTS
- Build knowledge graph visualization in learning panel
