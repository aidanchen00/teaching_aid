# nexhacksv0 ↔ teaching_aid Integration Guide

## Overview

The two systems are now fully integrated! When you click "START" on any curriculum in nexhacksv0, it automatically launches a personalized learning session in teaching_aid with the curriculum context.

## Architecture Flow

```
nexhacksv0 (Port 5173)
     │
     │ User clicks "START" on "Intro to Calculus"
     │
     ├─> POST /api/session/create (Port 8000)
     │   {
     │     curriculum: {
     │       title: "Intro to Calculus",
     │       school: "MIT",
     │       topics: ["Derivatives", "Integrals"],
     │       ...
     │     }
     │   }
     │
     ├─< { sessionId: "abc-123" }
     │
     ├─> Navigate to: http://localhost:3000/room?session=abc-123
     │
     ↓
teaching_aid Frontend (Port 3000)
     │
     ├─ Detects session=abc-123 in URL
     ├─ Auto-joins LiveKit room: "learning-room-abc-123"
     │
     ↓
teaching_aid Backend (Port 8000)
     │
     ├─ LiveKit Agent connects to room
     ├─ Extracts session ID from room name
     ├─ Fetches session → Gets curriculum context
     ├─ Loads curriculum into agent instructions
     │
     ↓
AI Tutor greets:
"Hi! I see you're studying Intro to Calculus from MIT!
I can see we have some topics ready: Three.js, Manim, Nano Banana Pro.
What would you like to learn about today?"
```

## Startup Instructions

### **Option 1: Full Integration (Recommended)**

Run all 4 services:

```bash
# Terminal 1 - nexhacksv0 Backend (Port 3001)
cd nexhacksv0
npm run server

# Terminal 2 - nexhacksv0 Frontend (Port 5173)
cd nexhacksv0
npm run dev

# Terminal 3 - teaching_aid Backend (Port 8000)
cd backend
python3 main.py

# Terminal 4 - teaching_aid Frontend (Port 3000)
cd frontend
npm run dev
```

### **Option 2: Quick Start (Concurrent)**

```bash
# Terminal 1 - nexhacksv0 (both backend + frontend)
cd nexhacksv0
npm run dev:all

# Terminal 2 - teaching_aid backend
cd backend
python3 main.py

# Terminal 3 - teaching_aid frontend
cd frontend
npm run dev
```

## Usage Flow

1. **Browse Curriculums**: Open http://localhost:5173
2. **Search**: Use voice "Show me machine learning courses" or click on globe
3. **Compare**: Click "Compare" to add up to 4 curriculums
4. **Analyze**: View Woodwide AI research insights for each course
5. **START**: Click the green "START" button
6. **Learn**: Automatically redirected to teaching_aid with context!
7. **Voice Tutor**: AI tutor knows your curriculum and helps you learn

## Environment Variables

### nexhacksv0/.env
```env
VITE_MAPBOX_TOKEN=your_mapbox_token
WOODWIDE_API_KEY=your_woodwide_key
VITE_GOOGLE_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Integration (already configured)
VITE_TEACHING_AID_URL=http://localhost:3000
VITE_TEACHING_AID_API=http://localhost:8000
```

### teaching_aid/backend/.env
```env
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
ELEVEN_API_KEY=your_elevenlabs_key
GOOGLE_API_KEY=your_gemini_key
```

### teaching_aid/frontend/.env.local
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url
```

## Features

### nexhacksv0 Features:
- 🌍 **3D Globe** - 60+ curriculums worldwide
- 🎤 **Voice Search** - "Show me AI courses in Europe"
- 📊 **Comparison** - Side-by-side up to 4 courses
- 📈 **Research** - Woodwide AI analytics (quality scores, trajectories, outcomes)
- 🌐 **Talent Migration** - 10-year forecast of tech talent flow
- ▶️ **START Button** - Launch teaching_aid session

### teaching_aid Features:
- 🎥 **Video Rooms** - LiveKit real-time collaboration
- 🤖 **AI Tutor** - Voice-controlled agent with Gemini 2.0 Flash
- 🕸️ **Knowledge Graph** - 3D force-directed graph
- 🎨 **Visualizations** - Three.js scenes, Manim videos
- 📚 **Curriculum Context** - AI knows what you're studying

## Integration Details

### 1. Session Creation Flow

When you click START:
1. `CurriculumPopup.jsx` calls `POST /api/session/create` with curriculum data
2. `teaching_aid backend` creates session with `curriculum_context`
3. Returns `sessionId`
4. Browser redirects to `http://localhost:3000/room?session={sessionId}`

### 2. Auto-Join Flow

When teaching_aid frontend loads with `?session=abc-123`:
1. Detects session parameter
2. Fetches session context from backend
3. Auto-joins LiveKit room with name `learning-room-abc-123`

### 3. Agent Context Loading

When LiveKit agent connects:
1. Parses room name to extract session ID
2. Fetches session from in-memory store
3. Loads `curriculum_context` into agent state
4. Customizes instructions with curriculum info
5. Greets student with personalized message

### 4. Agent Instructions Enhancement

```python
instructions=f"""You are a friendly AI tutor helping students learn through an interactive knowledge graph.

CURRICULUM CONTEXT:
The student is learning: Intro to Calculus
From: MIT
Topics covered: Derivatives, Integrals, Limits
This context can help you tailor your tutoring to their course content.

You can control the knowledge graph that the student sees using your tools:
- explore_topic: Generate a new knowledge graph about any topic the student asks about
- select_topic: Navigate to a specific topic already in the current graph
- back_to_graph: Return to the main graph view
...
"""
```

## API Endpoints

### nexhacksv0 Backend (Port 3001)
- `POST /api/curriculum-research` - Analyze curriculum with Woodwide AI
- `GET /api/talent-migration-forecast` - Generate migration forecast

### teaching_aid Backend (Port 8000)
- `POST /api/session/create` - Create session (accepts `curriculum` in body)
- `GET /api/session/{id}/graph` - Get knowledge graph
- `POST /api/session/{id}/select_node` - Navigate to node
- `POST /api/chat` - Generate knowledge graph from topic
- `POST /api/session/{id}/lesson/select` - Select lesson for visualization
- `GET /api/viz/job/{id}` - Poll visualization job status

### teaching_aid Frontend (Port 3000)
- `POST /api/livekit/token` - Generate LiveKit token (accepts `sessionId` in body)

## Database Schema

### Session Object (In-Memory)
```python
@dataclass
class Session:
    session_id: str
    center_id: str
    nodes: List[GraphNode]
    links: List[GraphLink]
    curriculum_context: Optional[Dict] = None  # NEW!
```

### Curriculum Context Structure
```json
{
  "id": 1,
  "title": "Intro to Calculus",
  "school": "MIT",
  "topics": ["Derivatives", "Integrals", "Limits"],
  "description": "Build strong calculus foundations...",
  "format": "visual-heavy",
  "instructor": "Dr. Priya Sharma",
  "location": {
    "city": "Mumbai",
    "country": "India",
    "region": "Asia"
  }
}
```

## Troubleshooting

### Issue: "Failed to create session"
**Solution:** Make sure teaching_aid backend is running on port 8000
```bash
cd backend
python3 main.py
```

### Issue: "Failed to join room"
**Solution:** Check LiveKit credentials in `.env` files

### Issue: Agent doesn't know curriculum
**Solution:** Check that:
1. Room name format is `learning-room-{session_id}`
2. Session was created with `curriculum_context`
3. Agent logs show "Loaded curriculum context: ..."

### Issue: nexhacksv0 research not loading
**Solution:** Start nexhacksv0 backend on port 3001
```bash
cd nexhacksv0
npm run server
```

## Future Enhancements

- [ ] **Persistent Storage** - Replace in-memory with PostgreSQL/Redis
- [ ] **Session Sharing** - Share session URL with multiple students
- [ ] **Curriculum Sync** - Update graph based on curriculum topics
- [ ] **Progress Tracking** - Track what student has learned
- [ ] **Recommendations** - AI suggests next topics based on curriculum
- [ ] **Quiz Generation** - Create quizzes from curriculum topics
- [ ] **Video Recording** - Record learning sessions
- [ ] **Mobile Support** - Responsive design for tablets/phones

## Testing

### Test the Integration:

1. Start all services
2. Open nexhacksv0: http://localhost:5173
3. Click on "Indian Institute of Technology Bombay"
4. Click "Intro to Calculus"
5. Click green "START" button
6. Should redirect to teaching_aid
7. Join the room
8. AI should greet with: "I see you're studying Intro to Calculus from Indian Institute of Technology Bombay!"
9. Ask "teach me derivatives"
10. Agent should create knowledge graph
11. Click on graph nodes to explore

## Success Criteria

✅ Single startup command per service
✅ Automatic navigation from nexhacksv0 to teaching_aid
✅ Curriculum context passed to AI agent
✅ Agent mentions curriculum in greeting
✅ No manual session ID entry required
✅ Seamless user experience

## Notes

- Session IDs are UUIDs (e.g., `abc-123-def-456`)
- Sessions are ephemeral (in-memory, lost on restart)
- Room names must match pattern: `learning-room-{session_id}`
- Frontend auto-joins if `?session=` parameter is present
- Agent checks room name for session ID on connect

## Support

If you encounter issues:
1. Check all services are running on correct ports
2. Check browser console for errors
3. Check backend logs for agent connection
4. Verify environment variables are set
5. Ensure LiveKit credentials are valid (for teaching_aid)

---

**Built with:** React, Next.js, FastAPI, LiveKit, Gemini 2.0 Flash, ElevenLabs, Mapbox, Woodwide AI
