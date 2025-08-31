from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LocationBase(BaseModel):
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: str

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: str

    class Config:
        from_attributes = True

class ScheduleBase(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    location_id: str

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    location_id: Optional[str] = None

class ScheduleResponse(ScheduleBase):
    id: str
    user_id: str
    location: LocationResponse

    class Config:
        from_attributes = True
