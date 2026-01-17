# Teaching Aid

A voice-controlled interactive learning platform with 3D knowledge graph visualization, real-time video collaboration, and AI-powered tutoring.

## Features

- **3D Knowledge Graph**: Interactive force-directed graph for exploring learning topics
- **Voice Navigation**: Navigate the knowledge graph using voice commands
- **Video Collaboration**: Real-time video rooms powered by LiveKit
- **AI Tutoring**: Voice-powered tutoring with ElevenLabs STT and Google Gemini
- **Micro-Lessons**: Click nodes to view interactive lessons with visualizations
- **Session Management**: Persistent learning sessions with state management

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **shadcn/ui** - UI components
- **TailwindCSS** - Styling
- **react-force-graph-3d** - 3D graph visualization
- **LiveKit Components** - Video/audio integration

### Backend
- **FastAPI** - Python web framework
- **LiveKit Python SDK** - Real-time communication
- **Google Gemini** - Natural language understanding
- **ElevenLabs** - Speech-to-text
- **Uvicorn** - ASGI server

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interaction Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. User speaks voice command OR clicks node in graph        │
│  2. LiveKit Agent processes audio → ElevenLabs STT           │
│  3. Gemini NLU maps transcript → command                     │
│  4. Command sent via LiveKit data channel                    │
│  5. Frontend calls FastAPI to update graph                   │
│  6. New graph rendered with updated center node              │
│  7. Lesson overlay displays for selected topic               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- LiveKit account (free tier available at [cloud.livekit.io](https://cloud.livekit.io))
- ElevenLabs API key (optional, for voice features)
- Google Gemini API key (optional, for NLU)

### Installation

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn api.main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure LiveKit (see frontend/LIVEKIT_SETUP.md)
# Create .env.local with your credentials:
# NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
# LIVEKIT_API_KEY=your-api-key
# LIVEKIT_API_SECRET=your-api-secret
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Start the development server
npm run dev
```

#### 3. Agent Setup (Optional - for voice features)

```bash
cd backend

# Make sure venv is activated
source venv/bin/activate

# Start the LiveKit agent
python agent/main.py dev
```

### Accessing the Application

1. Open your browser to `http://localhost:3000` (or the port shown)
2. Click "Join Room" to enter the learning session
3. The 3D knowledge graph appears on the right panel
4. Click nodes to explore topics or use voice commands if agent is running

## Usage

### Graph Navigation
- **Click nodes** to select and view micro-lessons
- **Drag** to rotate the 3D view
- **Scroll** to zoom in/out
- **Recenter button** to reset the camera view

### Voice Commands (with agent running)
- "Show me [topic name]" - Navigate to a topic
- "Go back to the graph" - Return to graph view
- "Start the lesson" - Begin the current lesson
- "End lesson" - Return to graph

### Supported Topics
- Derivatives
- Integrals
- Limits
- Chain Rule
- Product Rule
- Power Rule
- And more calculus topics...

## Project Structure

```
teaching_aid/
├── backend/
│   ├── agent/          # LiveKit agent for voice processing
│   │   ├── main.py           # Agent entry point
│   │   ├── stt_elevenlabs.py # Speech-to-text
│   │   ├── nlu.py            # Natural language understanding
│   │   ├── commands.py       # Command validation
│   │   └── vad.py            # Voice activity detection
│   ├── api/            # FastAPI backend
│   │   ├── main.py           # API entry point
│   │   ├── session_store.py  # Session management
│   │   └── routes/
│   │       └── session.py    # Session endpoints
│   └── requirements.txt
├── frontend/
│   ├── app/            # Next.js app router
│   │   ├── page.tsx          # Landing page
│   │   ├── room/page.tsx     # Main room page
│   │   └── api/livekit/      # Token generation
│   ├── components/     # React components
│   │   ├── knowledge-graph-panel.tsx  # 3D graph
│   │   ├── lesson-overlay.tsx         # Lesson display
│   │   ├── learning-panel.tsx         # Main panel logic
│   │   └── video-room.tsx             # LiveKit room
│   └── hooks/          # Custom React hooks
└── README.md
```

## API Endpoints

### FastAPI Backend (Port 8000)

- `POST /session/create` - Create new learning session
- `GET /session/{id}/graph` - Get current knowledge graph
- `POST /session/{id}/select_node` - Select node and update graph
- `POST /session/{id}/back_to_graph` - Return to graph view

## Configuration

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Backend (.env):**
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
ELEVENLABS_API_KEY=your-elevenlabs-key
GOOGLE_API_KEY=your-gemini-key
BACKEND_URL=http://localhost:8000
```

## Development

### Adding New Topics

1. Update `backend/api/session_store.py` with new topics in `KNOWLEDGE_GRAPH`
2. Define relationships between topics
3. Graph automatically generates connections

### Customizing the Graph

Edit `frontend/components/knowledge-graph-panel.tsx`:
- Node colors and sizes
- Camera positioning
- Physics parameters
- Interaction behaviors

## Known Limitations

- Mock graph generation (deterministic but limited topics)
- Single session per browser (localStorage-based)
- No visualization generation yet (Step 5 coming soon)
- Agent doesn't speak back (TTS not implemented)

## Future Enhancements

- [ ] Dynamic visualization generation (Step 5)
- [ ] LLM-powered lesson content
- [ ] Interactive practice problems
- [ ] Progress tracking
- [ ] Multi-user sessions
- [ ] Real curriculum/graph management
- [ ] TTS for agent responses
- [ ] Session persistence (database)

## Contributing

This project was built as part of a hackathon. Contributions are welcome!

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- Built with [LiveKit](https://livekit.io) for real-time communication
- Powered by [Google Gemini](https://deepmind.google/technologies/gemini/) for NLU
- Voice processing by [ElevenLabs](https://elevenlabs.io)
- 3D visualization using [react-force-graph](https://github.com/vasturiano/react-force-graph)

---

**Note**: This is a hackathon project demonstrating voice-controlled learning interfaces. For production use, additional features like authentication, database persistence, and error handling would be needed.

