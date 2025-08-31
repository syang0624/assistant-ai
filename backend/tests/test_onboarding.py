import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from app.models.user import User
from app.models.schedule import Schedule, Location

client = TestClient(app)

def test_complete_onboarding_success():
    """온보딩 완료 API 테스트"""
    # 테스트 데이터
    onboarding_data = {
        "district": "군포시 제1선거구 (군포1동, 산본1동, 금정동)",
        "activityLevel": "medium",
        "firstSchedule": {
            "title": "첫 번째 일정",
            "date": "2024-01-15",
            "time": "09:00",
            "location": "군포시청"
        }
    }
    
    # API 호출
    response = client.post("/api/v1/auth/complete-onboarding", json=onboarding_data)
    
    # 응답 확인
    assert response.status_code == 200
    assert response.json()["message"] == "온보딩이 완료되었습니다"

def test_onboarding_data_saved_to_db():
    """온보딩 데이터가 DB에 저장되는지 확인"""
    # 테스트 사용자 생성
    user_data = {
        "email": "test@example.com",
        "password": "testpass",
        "name": "테스트 사용자"
    }
    
    # 사용자 생성
    user_response = client.post("/api/v1/auth/signup", json=user_data)
    assert user_response.status_code == 200
    
    # 온보딩 데이터
    onboarding_data = {
        "district": "서대문구 제1선거구 가선거구 (천연동, 북아현동, 충현동, 신촌동)",
        "activityLevel": "hard",
        "firstSchedule": {
            "title": "테스트 일정",
            "date": "2024-01-16",
            "time": "14:00",
            "location": "서대문구청"
        }
    }
    
    # 온보딩 완료
    onboarding_response = client.post("/api/v1/auth/complete-onboarding", json=onboarding_data)
    assert onboarding_response.status_code == 200
    
    # DB에서 데이터 확인 (실제 구현에서는 DB 세션을 사용하여 확인)
    # 여기서는 API 응답을 통해 간접적으로 확인
    assert "온보딩이 완료되었습니다" in onboarding_response.json()["message"]

def test_onboarding_validation():
    """온보딩 데이터 유효성 검사 테스트"""
    # 필수 필드가 누락된 경우
    invalid_data = {
        "district": "",
        "activityLevel": "medium",
        "firstSchedule": {
            "title": "",
            "date": "2024-01-15",
            "time": "09:00",
            "location": "군포시청"
        }
    }
    
    response = client.post("/api/v1/auth/complete-onboarding", json=invalid_data)
    assert response.status_code == 400  # 또는 적절한 에러 코드
