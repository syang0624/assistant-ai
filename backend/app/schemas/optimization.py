from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict

class OptimizationRequest(BaseModel):
    date: datetime
    include_existing: bool = True
    delay_minutes: Optional[int] = None
    current_location: Optional[str] = None

class ScheduleItem(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    location: str
    location_type: str
    zone: str
    priority: int
    exposure: int
    travel_time: int
    travel_distance: float

class OptimizationResponse(BaseModel):
    success: bool
    message: str
    schedule: List[ScheduleItem]
    total_distance: float
    estimated_exposure: int

class LocationStatistics(BaseModel):
    total_locations: int
    by_type: Dict[str, Dict[str, int]]
    by_zone: Dict[str, Dict[str, int]]
    total_exposure: int
