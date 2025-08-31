from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict

class OptimizationRequest(BaseModel):
    date: datetime
    include_existing: bool = True
    delay_minutes: Optional[int] = None
    current_location: Optional[str] = None

class TimeSlot(BaseModel):
    start: str
    end: str
    day: str

class SuggestionRequest(BaseModel):
    empty_time_slots: List[TimeSlot]
    current_week_start: Optional[str] = None

class ScheduleItem(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    location: str
    address: str
    location_type: str
    priority: int
    travel_time: int
    travel_distance: float
    exposure: int
    description: Optional[str] = None
    score: Optional[float] = None
    day: Optional[str] = None

class OptimizationResponse(BaseModel):
    success: bool
    message: str
    schedule: List[ScheduleItem]
    total_distance: float
    estimated_exposure: int

class SuggestionResponse(BaseModel):
    success: bool
    message: str
    suggestions: List[ScheduleItem]
    total_suggestions: int

class LocationStatistics(BaseModel):
    total_locations: int
    by_type: Dict[str, Dict[str, int]]
    by_zone: Dict[str, Dict[str, int]]
    total_exposure: int
