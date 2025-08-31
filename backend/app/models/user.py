from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    district = Column(String)
    activity_level = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    schedules = relationship("Schedule", back_populates="user")
