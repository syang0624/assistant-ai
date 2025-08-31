from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.schedule import Schedule, Location
from app.schemas.schedule import ScheduleCreate, ScheduleResponse, ScheduleUpdate, LocationCreate, LocationResponse
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/schedules", response_model=ScheduleResponse)
def create_schedule(
    schedule: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_schedule = Schedule(
        **schedule.dict(),
        user_id=current_user.id
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.get("/schedules", response_model=List[ScheduleResponse])
def get_schedules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schedules = db.query(Schedule).filter(Schedule.user_id == current_user.id).all()
    return schedules

@router.get("/schedules/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(
    schedule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다")
    return schedule

@router.put("/schedules/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(
    schedule_id: str,
    schedule_update: ScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.user_id == current_user.id
    ).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다")
    
    for field, value in schedule_update.dict(exclude_unset=True).items():
        setattr(db_schedule, field, value)
    
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.delete("/schedules/{schedule_id}")
def delete_schedule(
    schedule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.user_id == current_user.id
    ).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다")
    
    db.delete(db_schedule)
    db.commit()
    return {"message": "일정이 삭제되었습니다"}

# Location API
@router.post("/locations", response_model=LocationResponse)
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db)
):
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.get("/locations", response_model=List[LocationResponse])
def get_locations(
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Location)
    if district:
        query = query.filter(Location.district == district)
    return query.all()
