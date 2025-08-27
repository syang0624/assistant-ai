from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Set

@dataclass
class Task:
    task_id: str
    title: str
    priority: int = 50
    duration_min: int = 40
    earliest: Optional[datetime] = None
    latest: Optional[datetime] = None
    window_from: Optional[datetime] = None
    window_to: Optional[datetime] = None
    depends_on: Set[str] = field(default_factory=set)
    place_id: Optional[str] = None
    constituency: Optional[str] = None
    ward: Optional[str] = None
