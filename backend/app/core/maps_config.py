from pydantic import BaseSettings

class MapsConfig(BaseSettings):
    # Google Maps API 설정
    GOOGLE_MAPS_API_KEY: str = ""
    
    # Naver Maps API 설정 (대안)
    NAVER_CLIENT_ID: str = ""
    NAVER_CLIENT_SECRET: str = ""
    
    # T Map API 설정 (대안)
    TMAP_API_KEY: str = ""
    
    # 기본 지도 서비스 선택
    DEFAULT_MAPS_SERVICE: str = "google"  # google, naver, tmap
    
    class Config:
        env_file = ".env"

maps_config = MapsConfig()
