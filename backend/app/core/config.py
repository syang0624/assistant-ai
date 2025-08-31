from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Assistant AI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "your-secret-key-here"  # 실제로는 환경변수에서 가져와야 함
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    SQLITE_URL: str = "sqlite:///./app.db"
    
    class Config:
        env_file = ".env"

settings = Settings()
