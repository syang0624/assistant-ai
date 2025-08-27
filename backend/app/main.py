from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, locations, tasks, schedule
from .db import engine
from .models_db import Base

app = FastAPI(title="assistant-ai backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"ok": True, "service": "backend"}

app.include_router(users.router)
app.include_router(locations.router)
app.include_router(tasks.router)
app.include_router(schedule.router)

@app.on_event("startup")
def on_startup():
    # 간단한 개발용: 자동으로 테이블 생성
    Base.metadata.create_all(bind=engine)
