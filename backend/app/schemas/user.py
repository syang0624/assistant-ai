from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str
    district: Optional[str] = None
    activity_level: str = "medium"

    @validator('activity_level')
    def validate_activity_level(cls, v):
        if v not in ['easy', 'medium', 'hard']:
            raise ValueError('activity_level must be one of: easy, medium, hard')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True
