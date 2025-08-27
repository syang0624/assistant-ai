from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from ..schemas import TaskIn, TaskOut
from ..db import get_session
from ..models_db import User, Task, TaskDependency
from ..auth import get_current_username

router = APIRouter(prefix="/api", tags=["tasks"])

def _next_task_id(db: Session, user_id: int) -> str:
    # 유저별로 'T0001' 증가
    last = db.query(Task).filter(Task.user_id == user_id).order_by(Task.id.desc()).first()
    n = (int(last.task_id[1:]) + 1) if last else 1
    return f"T{n:04d}"

@router.post("/tasks", response_model=TaskOut)
def create_task(task: TaskIn, username: str = Depends(get_current_username), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.username == username).first()
    tid = _next_task_id(db, user.id)
    t = Task(
        user_id=user.id, task_id=tid, title=task.title, priority=task.priority, duration_min=task.duration_min,
        earliest=task.earliest, latest=task.latest, window_from=task.window_from, window_to=task.window_to,
        place_id=task.place_id, constituency=task.constituency, ward=task.ward
    )
    db.add(t)
    db.flush()  # t.id 확보

    # depends_on: 문자열 task_id들을 실제 PK로 매핑
    if task.depends_on:
        dep_tasks = db.query(Task).filter(Task.user_id == user.id, Task.task_id.in_(task.depends_on)).all()
        map_by_tid = {d.task_id: d for d in dep_tasks}
        for dep_tid in task.depends_on:
            if dep_tid in map_by_tid:
                db.add(TaskDependency(task_id_fk=t.id, depends_on_task_id_fk=map_by_tid[dep_tid].id))
            # 없는 task_id는 조용히 무시(MVP)

    db.commit()

    return TaskOut(task_id=tid, **task.model_dump())

@router.get("/tasks", response_model=List[TaskOut])
def list_tasks(username: str = Depends(get_current_username), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.username == username).first()
    tasks = db.query(Task).filter(Task.user_id == user.id).order_by(Task.id.asc()).all()

    # 의존성 역매핑: Task.id -> [dep.task_id]
    deps = (
        db.query(TaskDependency)
        .join(Task, TaskDependency.depends_on_task_id_fk == Task.id)
        .filter(TaskDependency.task_id_fk.in_([t.id for t in tasks]))
        .all()
    )
    dep_map = {}
    # depends_on_task_id_fk -> task_id 매핑 필요
    id_to_tid = {t.id: t.task_id for t in tasks}
    for d in deps:
        dep_map.setdefault(d.task_id_fk, []).append(id_to_tid.get(d.depends_on_task_id_fk, ""))

    res: List[TaskOut] = []
    for t in tasks:
        res.append(TaskOut(
            task_id=t.task_id, title=t.title, place_id=t.place_id,
            constituency=t.constituency, ward=t.ward,
            priority=t.priority, duration_min=t.duration_min,
            earliest=t.earliest, latest=t.latest, window_from=t.window_from, window_to=t.window_to,
            depends_on=dep_map.get(t.id, [])
        ))
    return res

@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, username: str = Depends(get_current_username), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.username == username).first()
    t = db.query(Task).filter(Task.user_id == user.id, Task.task_id == task_id).first()
    if not t:
        raise HTTPException(404, "Task not found")
    db.delete(t)
    db.commit()
    return {"ok": True}
