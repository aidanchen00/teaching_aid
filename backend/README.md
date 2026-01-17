# Learning App Backend - Step 3: Voice Navigation with LiveKit Agents

This backend implements voice navigation using LiveKit Agents (Python) with ElevenLabs STT, Gemini LLM for natural language understanding, and bidirectional data channel communication with the Next.js frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LiveKit Room                             │
│                   "learning-room"                            │
│                                                              │
│  ┌──────────────┐         ┌─────────────────────────────┐  │
│  │   Frontend   │◄────────┤   Agent (Python)            │  │
│  │  (Next.js)   │  Data   │   identity: "agent-tutor"   │  │
│  │  User Video  │ Channel │                             │  │
│  │              │────────►│   • Subscribe to user audio │  │
│  └──────────────┘ Commands│   • VAD (send on silence)   │  │
│                            │   • ElevenLabs STT          │  │
│                            │   • Query backend for graph │  │
│                            │   • Gemini NLU              │  │
│                            │   • Publish command         │  │
│                            └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTP GET
                                   ▼
                        ┌──────────────────────┐
                        │  FastAPI Backend     │
                        │  Port 8000           │
                        │                      │
                        │  GET /session/       │
                        │    learning-room/    │
                        │    graph             │
                        └──────────────────────┘
```

## Project Structure

```
backend/
├── agent/
│   ├── main.py                  # Agent entry point, LiveKit connection
│   ├── commands.py              # Command schema + validation
│   ├── stt_elevenlabs.py        # ElevenLabs STT integration
│   ├── backend_client.py        # HTTP client for FastAPI backend
│   ├── nlu.py                   # Gemini LLM for NLU
│   └── vad.py                   # Voice activity detection
├── api/
│   ├── main.py                  # FastAPI app entry point
│   └── routes/
│       └── session.py           # GET /session/{session_id}/graph
├── requirements.txt
├── .env
├── .env.example
└── README.md
```

## Installation

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

The `.env` file is already configured with your credentials. If you need to change them:

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

Required environment variables:
- `LIVEKIT_URL` - Your LiveKit Cloud URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- `GOOGLE_API_KEY` - Google Gemini API key
- `BACKEND_URL` - FastAPI backend URL (default: http://localhost:8000)

## Running the Backend

You need to run **two** processes:

### Terminal 1: FastAPI Backend

```bash
cd backend
source venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

### Terminal 2: LiveKit Agent

```bash
cd backend
source venv/bin/activate
python agent/main.py dev
```

The agent will connect to LiveKit Cloud and join the `learning-room`.

## Verification

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}

curl http://localhost:8000/session/learning-room/graph
# Expected: {"centerId": "derivatives", "nodes": [...]}
```

### 2. Check Agent Connection

Look for this in the agent logs:
```
[Agent] Connected to room: learning-room as 'agent-tutor'
[VAD] Initialized: threshold=0.02, silence_duration=1000ms
```

### 3. Test Voice Commands

1. Open the frontend (http://localhost:3000 or 3002)
2. Click "Enter Room"
3. Speak a command like: "Show me derivatives"
4. Check browser console for:
   ```
   [Data Channel] Received command from agent: {
     type: "command",
     payload: { action: "select_node_by_label", label: "Derivatives" }
   }
   ```

## Supported Commands

The agent recognizes these voice commands:

| Command | Example Phrases | Action |
|---------|----------------|--------|
| `select_node_by_label` | "Show me derivatives", "Go to integrals" | Navigate to a specific topic |
| `back_to_graph` | "Go back", "Return to graph" | Return to main graph view |
| `start_lesson` | "Start the lesson", "Let's begin" | Begin lesson on current topic |
| `end_lesson` | "Stop the lesson", "End lesson" | End current lesson |
| `error` | (automatic) | Error message from agent |

## How It Works

### Voice Processing Pipeline

1. **Voice Activity Detection (VAD)**
   - Detects speech using RMS energy threshold
   - "Send on silence" - triggers after 1 second of silence
   - Max utterance length: 12 seconds
   - Adds 200ms pre-roll buffer

2. **Speech-to-Text (STT)**
   - Uses ElevenLabs Scribe V2 Realtime model
   - Converts audio PCM → WAV format
   - Zero retention mode for privacy

3. **Backend Query**
   - Fetches current graph nodes from FastAPI
   - Provides context for natural language understanding

4. **Natural Language Understanding (NLU)**
   - Uses Google Gemini 1.5 Flash
   - Maps transcript → command JSON
   - Validates against available graph nodes

5. **Command Publishing**
   - Publishes command via LiveKit data channel
   - Frontend receives and handles command

## API Endpoints

### FastAPI Backend (Port 8000)

#### `GET /`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "learning-app-backend"
}
```

#### `GET /health`
Detailed health check.

**Response:**
```json
{
  "status": "healthy"
}
```

#### `GET /session/{session_id}/graph`
Get the current knowledge graph for a session.

**Parameters:**
- `session_id` (path) - Session identifier (e.g., "learning-room")

**Response:**
```json
{
  "centerId": "derivatives",
  "nodes": [
    {"id": "derivatives", "label": "Derivatives"},
    {"id": "integrals", "label": "Integrals"},
    ...
  ]
}
```

## Development

### Adding New Commands

1. Add action to `VALID_ACTIONS` in `agent/commands.py`
2. Update NLU prompt in `agent/nlu.py`
3. Handle command in frontend (if needed)

### Adjusting VAD Settings

Edit parameters in `agent/main.py`:

```python
vad = VoiceActivityDetector(
    sample_rate=16000,
    frame_duration_ms=30,
    energy_threshold=0.02,        # Adjust for sensitivity
    silence_duration_ms=1000,     # Time before utterance ends
    max_utterance_sec=12.0        # Max utterance length
)
```

### Switching LLM Provider

Replace Gemini in `agent/nlu.py` with your preferred provider:
- OpenAI GPT-4
- Anthropic Claude
- Local LLM (Ollama, etc.)

## Known Limitations

1. **Mock Graph Data** - Backend returns static graph, not real session state
2. **Single User Support** - Agent only subscribes to first participant
3. **No TTS** - Agent doesn't speak back (Step 3 requirement)
4. **Basic Error Handling** - Needs more robust retry logic

## Troubleshooting

### Agent can't connect to LiveKit
- Check `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` in `.env`
- Verify your LiveKit Cloud project is active

### STT fails
- Check `ELEVENLABS_API_KEY` in `.env`
- Verify your ElevenLabs account has API access
- Check for quota/rate limits

### NLU returns clarify commands
- VAD threshold may be too sensitive (capturing background noise)
- Try adjusting `energy_threshold` in VAD settings
- Check Gemini API quota

### No audio detected
- Check microphone permissions in browser
- Verify user's audio track is being published
- Increase VAD `energy_threshold` if background noise is high

## Next Steps

- [ ] Implement real curriculum/graph management
- [ ] Add TTS for agent responses
- [ ] Build knowledge graph visualization
- [ ] Implement multi-user support
- [ ] Add session persistence
- [ ] Deploy to production
