from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.core.config import settings
from app.api.v1 import auth, schedule, optimization  # optimization 추가
from app.db.session import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# CORS 설정
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(schedule.router, prefix="/api/v1", tags=["schedule"])
app.include_router(optimization.router, prefix="/api/v1", tags=["optimization"])  # 추가

@app.get("/")
async def root():
    return {
        "app": "Assistant AI",
        "version": "0.1.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
