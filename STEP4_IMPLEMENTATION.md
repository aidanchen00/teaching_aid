# Step 4 Implementation: Interactive Knowledge Graph

This document describes the Step 4 implementation of the interactive 3D knowledge graph with voice navigation.

## What Was Implemented

### Backend (FastAPI)

1. **Session Store** (`backend/api/session_store.py`)
   - In-memory session storage keyed by UUID
   - Deterministic graph generation based on center node
   - Knowledge domain with calculus topics (derivatives, integrals, limits, etc.)
   - Helper functions for session management and node lookup

2. **API Routes** (`backend/api/routes/session.py`)
   - `POST /session/create` - Creates new session, returns sessionId
   - `GET /session/{id}/graph` - Returns current graph (centerId, nodes, links)
   - `POST /session/{id}/select_node` - Updates center node, returns new graph
   - `POST /session/{id}/back_to_graph` - Returns current graph (no state change)

### Frontend (Next.js + React)

1. **Dependencies Installed**
   - shadcn/ui (Card, Button components)
   - react-force-graph-3d
   - three + @types/three

2. **New Components**

   **KnowledgeGraphPanel** (`components/knowledge-graph-panel.tsx`)
   - 3D force-directed graph using react-force-graph-3d
   - Center node visually distinct (larger, indigo color)
   - Node click handling
   - Camera auto-focus on center node
   - Blur effect when in VIZ mode
   - Interactive controls (drag to rotate, scroll to zoom)

   **LessonOverlay** (`components/lesson-overlay.tsx`)
   - Overlay card with lesson information
   - Displays node title and summary
   - Placeholder sections for:
     - Lesson Overview
     - Key Concepts
     - Interactive Visualization (Step 5)
     - Practice Problems
   - "Back to Graph" button

3. **Refactored Components**

   **LearningPanel** (`components/learning-panel.tsx`)
   - State machine: `GRAPH` | `VIZ` modes
   - Session management (localStorage persistence)
   - Graph state management
   - Node click handler (calls backend API)
   - Agent command integration:
     - `select_node_by_label` - Find and select node by label
     - `back_to_graph` - Return to graph view
     - `start_lesson` - Enter VIZ mode
     - `end_lesson` - Return to graph view
   - Error handling and loading states

   **VideoRoom** (`components/video-room.tsx`)
   - Added `onCommandReceived` callback prop
   - Forwards agent commands to parent component

   **RoomPage** (`app/room/page.tsx`)
   - Removed DEMO_MODE flag (now requires LiveKit)
   - Lifted command state to room level
   - Wires commands from VideoRoom to LearningPanel

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interaction Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. User clicks node OR Agent sends voice command            │
│  2. LearningPanel calls POST /session/{id}/select_node       │
│  3. Backend updates center, regenerates graph                │
│  4. Frontend receives new graph, enters VIZ mode             │
│  5. LessonOverlay displays with graph blurred behind         │
│  6. User clicks "Back to Graph" → returns to GRAPH mode      │
│  7. Camera refocuses on new center node                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## State Machine

```
[GRAPH Mode]
  ↓ (node click or select_node_by_label command)
[VIZ Mode] - Lesson overlay visible, graph blurred
  ↓ (back button or back_to_graph/end_lesson command)
[GRAPH Mode] - Camera refocuses on center
```

## Running the Application

### 1. Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

### 2. Start Agent (Optional - for voice commands)

```bash
cd backend
source venv/bin/activate
python agent/main.py dev
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Configure Environment

Create `frontend/.env.local`:
```
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 5. Access Application

Open http://localhost:3000 and click "Join Room"

## Testing

### Manual Testing

1. **Graph Interaction**
   - Click any node in the 3D graph
   - Verify lesson overlay appears
   - Verify graph is blurred behind overlay
   - Click "Back to Graph"
   - Verify camera refocuses on the new center node

2. **Voice Commands** (requires agent running)
   - Say "Show me derivatives"
   - Verify node is selected and lesson appears
   - Say "Go back to the graph"
   - Verify return to graph view

3. **Session Persistence**
   - Refresh the page
   - Verify session is restored from localStorage
   - Verify graph state is maintained

### API Testing

```bash
# Create session
curl -X POST http://localhost:8000/session/create

# Get graph
curl http://localhost:8000/session/{sessionId}/graph

# Select node
curl -X POST http://localhost:8000/session/{sessionId}/select_node \
  -H "Content-Type: application/json" \
  -d '{"nodeId": "integrals"}'
```

## Visual Design

- **Clean, minimal aesthetic** - No gradients, monochrome with indigo accent
- **Center node** - 2x larger, indigo color (#6366f1)
- **Other nodes** - Standard size, slate gray (#64748b)
- **Links** - Slate color with opacity
- **Background** - Dark slate (#020617)
- **Overlay** - White card with shadow, centered on screen
- **Blur effect** - Graph dims and blurs when overlay is active

## Known Limitations

1. **Mock graph generation** - Deterministic but limited knowledge domain
2. **No visualization generation** - Placeholder in overlay (Step 5)
3. **Single session per browser** - localStorage-based
4. **No error recovery** - Network failures require page refresh
5. **No TTS feedback** - Agent doesn't speak back (Step 3 limitation)

## Next Steps (Step 5)

- Implement dynamic visualization generation
- Add LLM-powered lesson content generation
- Create interactive practice problems
- Add progress tracking
- Implement multi-user sessions

