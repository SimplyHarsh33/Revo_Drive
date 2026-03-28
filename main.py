from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from routers import events, sessions, websocket

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DriveSafe AI Backend")

# Configure CORS
origins = [
    "*", # Allow all origins for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router)
app.include_router(sessions.router)
app.include_router(websocket.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to DriveSafe AI API"}
