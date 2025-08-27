from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, locations, tasks, schedule
from .db import get_session
from .models_db import Base, User
from .db import engine

app = FastAPI(title="assistant-ai backend", version="0.1.0")

# Fix CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"ok": True, "service": "backend"}

# Temporary endpoint to see existing users (remove this in production)
@app.get("/api/users")
def list_users():
    from sqlalchemy.orm import Session
    db = Session(engine)
    users = db.query(User).all()
    return [{"username": user.username} for user in users]

app.include_router(users.router)
app.include_router(locations.router)
app.include_router(tasks.router)
app.include_router(schedule.router)

@app.on_event("startup")
def on_startup():
    # 간단한 개발용: 자동으로 테이블 생성
    Base.metadata.create_all(bind=engine)
