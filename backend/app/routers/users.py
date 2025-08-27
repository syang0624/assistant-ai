# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.db import get_session
from app.models_db import User
from app.schemas import SignUp, OkOut, LoginIn

router = APIRouter(prefix="/api", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

@router.post("/signup", response_model=OkOut)
def signup(body: SignUp, db: Session = Depends(get_session)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(
        username=body.username,
        password_hash=hash_password(body.password),  # ✅ 해시 저장
    )
    db.add(user)
    db.commit()
    return {"ok": True}

@router.post("/login", response_model=OkOut)
def login(body: LoginIn, db: Session = Depends(get_session)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"ok": True}
