# LiveKit Setup Guide

The video/voice features require LiveKit credentials. Follow these steps to configure them:

## Quick Setup

1. **Get LiveKit Credentials** (Free tier available)
   - Go to https://cloud.livekit.io
   - Create an account or sign in
   - Create a new project
   - Copy your credentials:
     - WebSocket URL (e.g., `wss://your-project.livekit.cloud`)
     - API Key
     - API Secret

2. **Create Environment File**
   
   Create a file named `.env.local` in the `frontend/` directory:

   ```bash
   cd frontend
   touch .env.local
   ```

3. **Add Your Credentials**
   
   Open `.env.local` and add:

   ```env
   # LiveKit Configuration
   NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=APIxxxxxxxxxxxxx
   LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Backend API URL (already configured)
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

4. **Restart the Development Server**

   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## Without LiveKit (Knowledge Graph Only)

You can use the **knowledge graph feature without LiveKit**:
- The right panel (3D graph) works independently
- Voice commands won't work without LiveKit
- Video features won't be available

The graph is fully functional for:
- Clicking nodes to view lessons
- Exploring the knowledge graph
- Navigating between topics

## Troubleshooting

### Connection Error
If you see "Failed to join room":
- Check that all three credentials are in `.env.local`
- Verify the WebSocket URL starts with `wss://`
- Restart the dev server after adding credentials

### Graph Positioning
If the 3D graph appears off-center:
- Click the **"⊙ Recenter"** button in the top-right of the graph
- Wait a moment for the graph to stabilize
- Try dragging to rotate the view

### Port Issues
If the frontend is on a different port (e.g., 3001, 3002):
- The backend CORS is configured for ports 3000, 3001, 3002
- No changes needed unless using a custom port

