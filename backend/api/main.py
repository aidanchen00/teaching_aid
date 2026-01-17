from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import session

app = FastAPI(
    title="Learning App Backend",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(session.router, prefix="/session", tags=["Session"])

@app.get("/")
async def root():
    return {"status": "ok", "service": "learning-app-backend"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
