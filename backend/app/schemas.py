from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class SignUp(BaseModel):
    username: str
    password: str

class LoginIn(BaseModel):
    username: str
    password: str

class OkOut(BaseModel):
    ok: bool

class LocationModel(BaseModel):
    constituencies: Dict[str, List[str]] = Field(default_factory=dict)

class TaskIn(BaseModel):
    title: str
    place_id: Optional[str] = None
    constituency: Optional[str] = None
    ward: Optional[str] = None
    priority: int = 50
    duration_min: int = 40
    earliest: Optional[datetime] = None
    latest: Optional[datetime] = None
    window_from: Optional[datetime] = None
    window_to: Optional[datetime] = None
    depends_on: List[str] = Field(default_factory=list)

class TaskOut(TaskIn):
    task_id: str

class BuildRequest(BaseModel):
    date: datetime
    day_start: datetime
    day_end: datetime

class ScheduledItem(BaseModel):
    task_id: str
    title: str
    start: datetime
    end: datetime

class BuildResponse(BaseModel):
    items: List[ScheduledItem]
    unscheduled: List[str]
