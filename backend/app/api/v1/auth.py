from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import create_access_token, verify_password, verify_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.core.security import get_password_hash
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 현재 사용자 가져오기 함수
async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        email = verify_token(token)
        if email is None:
            raise credentials_exception
    except:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# /me 엔드포인트 추가
@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

# 로그인 엔드포인트
@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    try:
        # 디버깅을 위한 로그
        print(f"Login attempt for email: {form_data.username}")
        
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="이메일 또는 비밀번호가 올바르지 않습니다.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="이메일 또는 비밀번호가 올바르지 않습니다.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.email})
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        print(f"Login error: {str(e)}")  # 디버깅을 위한 로그
        raise

@router.post("/signup", response_model=Token)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    try:
        # 이메일 중복 체크
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="이미 등록된 이메일입니다.",
            )
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=user_in.email,
            name=user_in.name,
            hashed_password=get_password_hash(user_in.password),
            district=user_in.district,
            activity_level=user_in.activity_level
        )
        
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            db.rollback()
            print(f"Database error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="데이터베이스 오류가 발생했습니다."
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="서버 오류가 발생했습니다."
        )

@router.post("/complete-onboarding")
def complete_onboarding(
    onboarding_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 사용자 정보 업데이트
        current_user.district = onboarding_data.get("district")
        current_user.activity_level = onboarding_data.get("activityLevel")
        
        # 첫 일정 생성
        if onboarding_data.get("firstSchedule"):
            schedule_data = onboarding_data["firstSchedule"]
            from app.models.schedule import Schedule
            from app.models.location import Location
            
            # 장소 생성 또는 조회
            location = db.query(Location).filter(
                Location.name == schedule_data["location"]
            ).first()
            
            if not location:
                location = Location(
                    name=schedule_data["location"],
                    address=schedule_data["location"],
                    district=current_user.district
                )
                db.add(location)
                db.commit()
                db.refresh(location)
            
            # 일정 생성
            schedule = Schedule(
                title=schedule_data["title"],
                start_time=datetime.fromisoformat(f"{schedule_data['date']}T{schedule_data['time']}"),
                end_time=datetime.fromisoformat(f"{schedule_data['date']}T{schedule_data['time']}"),
                location_id=location.id,
                user_id=current_user.id
            )
            db.add(schedule)
            db.commit()
        
        return {"message": "온보딩이 완료되었습니다"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
