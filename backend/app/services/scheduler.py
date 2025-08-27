# app/services/scheduler.py
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import List, Optional, Dict, Tuple
from ..models_db import Task as TaskModel

KST = ZoneInfo("Asia/Seoul")

def _to_kst_naive(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        # 이미 naive면 KST 기준으로 본다 (입력/DB가 둘 다 로컬 기준이라 가정)
        return dt
    # tz-aware면 KST로 변환 후 tz 제거
    return dt.astimezone(KST).replace(tzinfo=None)

@dataclass
class TaskDTO:
    task_id: str
    title: str
    duration_min: int
    priority: int
    # 제약들 (전부 naive-KST로 변환된 것만 저장)
    window_from: Optional[datetime]
    window_to: Optional[datetime]
    earliest: Optional[datetime]
    latest: Optional[datetime]
    depends_on: List[str]

def to_dto(task: TaskModel) -> TaskDTO:
    return TaskDTO(
        task_id=task.task_id,
        title=task.title,
        duration_min=task.duration_min or 30,
        priority=task.priority or 50,
        window_from=_to_kst_naive(task.window_from),
        window_to=_to_kst_naive(task.window_to),
        earliest=_to_kst_naive(task.earliest),
        latest=_to_kst_naive(task.latest),
        depends_on=[dep.depends_on.task_id for dep in task.depends],
    )

@dataclass
class ScheduledItem:
    task_id: str
    title: str
    start: datetime  # naive KST
    end: datetime    # naive KST

@dataclass
class BuildResult:
    items: List[ScheduledItem]
    unscheduled: List[str]

def build_schedule(tasks: List[TaskModel], day_start: datetime, day_end: datetime) -> BuildResult:
    # 🔧 입력도 KST-naive로 정규화
    day_start = _to_kst_naive(day_start)  # type: ignore
    day_end = _to_kst_naive(day_end)      # type: ignore

    dtos: Dict[str, TaskDTO] = {t.task_id: to_dto(t) for t in tasks}

    # 우선순위 힙 등 기존 로직…
    # 아래는 예시 비교/배치 시 전부 naive(KST)끼리만 비교하므로 TypeError 방지

    timeline: datetime = day_start
    items: List[ScheduledItem] = []
    unscheduled: List[str] = []

    # 간단 greedy 예시 (사용자 구현 그대로 유지하되, 시간 비교는 모두 naive-KST 사용)
    # 정렬: 우선순위 내림차순
    head = sorted(dtos.values(), key=lambda x: x.priority, reverse=True)

    placed: set[str] = set()
    remaining = {d.task_id for d in head}

    def can_place(d: TaskDTO, start_at: datetime) -> Tuple[bool, str]:
        end_at = start_at + timedelta(minutes=d.duration_min)

        # 근무 범위
        if start_at < day_start or end_at > day_end:
            return False, "out_of_working_hours"

        # 의존성
        for dep in d.depends_on:
            if dep not in placed:
                return False, f"dep_not_done:{dep}"

        # 시간창
        if d.window_from and start_at < d.window_from:
            return False, "before_window_from"
        if d.window_to and end_at > d.window_to:
            return False, "after_window_to"

        # earliest/latest
        if d.earliest and start_at < d.earliest:
            return False, "before_earliest"
        if d.latest and end_at > d.latest:
            return False, "after_latest"

        return True, ""

    # 매우 단순한 배치(예시) — 기존 코드에 맞춰 사용하세요
    for d in head:
        # 현재 타임라인에서 가능한 가장 이른 시작을 잡되, window_from/earliest도 고려
        candidate_start = timeline
        if d.window_from and candidate_start < d.window_from:
            candidate_start = d.window_from
        if d.earliest and candidate_start < d.earliest:
            candidate_start = d.earliest

        ok, reason = can_place(d, candidate_start)
        if ok:
            start_at = candidate_start
            end_at = start_at + timedelta(minutes=d.duration_min)
            items.append(ScheduledItem(d.task_id, d.title, start_at, end_at))
            placed.add(d.task_id)
            remaining.remove(d.task_id)
            timeline = end_at
        else:
            unscheduled.append(d.task_id)

    return BuildResult(items=items, unscheduled=unscheduled)
