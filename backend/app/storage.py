from typing import Dict
from .models import Task

USERS: Dict[str, str] = {}              # username -> password_hash
USER_LOCATIONS: Dict[str, dict] = {}    # username -> {"선거구": [동, ...]}
USER_TASKS: Dict[str, Dict[str, Task]] = {}  # username -> {task_id: Task}
