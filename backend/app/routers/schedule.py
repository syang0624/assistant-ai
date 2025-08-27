# app/routers/schedule.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Optional
from app.auth import get_current_username
from app.db import get_session
from app.models_db import Task as TaskModel, User
from app.services.scheduler import build_schedule, _to_kst_naive

router = APIRouter(prefix="/api/schedule", tags=["schedule"])

KST = ZoneInfo("Asia/Seoul")

class ScheduleBuildIn(BaseModel):
    date: datetime
    day_start: datetime
    day_end: datetime

class ScheduleItemOut(BaseModel):
    task_id: str
    title: str
    start: datetime
    end: datetime

class ScheduleBuildOut(BaseModel):
    items: list[ScheduleItemOut]
    unscheduled: list[str]

@router.post("/build", response_model=ScheduleBuildOut)
def build(body: ScheduleBuildIn, username: str = Depends(get_current_username), db=Depends(get_session)):
    user: User | None = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(401, "no user")

    tasks: list[TaskModel] = db.query(TaskModel).filter(TaskModel.user_id == user.id).all()

    # 🔧 입력도 KST-naive로 통일
    day_start = _to_kst_naive(body.day_start)  # type: ignore
    day_end = _to_kst_naive(body.day_end)      # type: ignore

    result = build_schedule(tasks, day_start, day_end)

    # 응답은 ISO로 내보내되, KST-naive → KST-aware(+09:00)로 포장해서 가독성 좋게
    def kst_aware(dt: datetime) -> datetime:
        return dt.replace(tzinfo=KST)

    return ScheduleBuildOut(
        items=[ScheduleItemOut(task_id=i.task_id, title=i.title, start=kst_aware(i.start), end=kst_aware(i.end)) for i in result.items],
        unscheduled=result.unscheduled,
    )
