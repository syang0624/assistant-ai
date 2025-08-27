from __future__ import annotations
from sqlalchemy import String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, List
from .db import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))

    locations: Mapped[List["UserLocation"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class UserLocation(Base):
    __tablename__ = "user_locations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    constituency: Mapped[str] = mapped_column(String(100), index=True)
    ward: Mapped[str] = mapped_column(String(100))

    user: Mapped["User"] = relationship(back_populates="locations")
    __table_args__ = (UniqueConstraint("user_id", "constituency", "ward", name="uq_user_const_ward"),)

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    task_id: Mapped[str] = mapped_column(String(16), index=True)  # 'T0001'
    title: Mapped[str] = mapped_column(String(200))
    priority: Mapped[int] = mapped_column(Integer, default=50)
    duration_min: Mapped[int] = mapped_column(Integer, default=40)

    earliest: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    latest: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    window_from: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    window_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    place_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    constituency: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ward: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    user: Mapped["User"] = relationship(back_populates="tasks")

    # 🔧 여기가 핵심: 어떤 FK로 이어질지 명시해 모호성 제거
    depends: Mapped[List["TaskDependency"]] = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.task_id_fk",
        primaryjoin="Task.id == TaskDependency.task_id_fk",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    __table_args__ = (UniqueConstraint("user_id", "task_id", name="uq_user_taskid"),)

class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id_fk: Mapped[int] = mapped_column(ForeignKey("tasks.id", ondelete="CASCADE"), index=True)
    depends_on_task_id_fk: Mapped[int] = mapped_column(ForeignKey("tasks.id", ondelete="CASCADE"), index=True)

    # 🔧 두 FK 각각 어떤 관계에 쓰이는지 명시
    task: Mapped["Task"] = relationship(
        "Task",
        foreign_keys=[task_id_fk],
        back_populates="depends",
        primaryjoin="Task.id == TaskDependency.task_id_fk",
    )
    depends_on: Mapped["Task"] = relationship(
        "Task",
        foreign_keys=[depends_on_task_id_fk],
        primaryjoin="Task.id == TaskDependency.depends_on_task_id_fk",
    )
