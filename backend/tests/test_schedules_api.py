from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from app.main import app
from app.api.v1.auth import get_current_user

class _DummyUser:
    def __init__(self):
        self.id = "dummy"
        self.email = "dummy@example.com"
        self.name = "더미"
        self.district = "군포시"
        self.activity_level = "medium"
        self.is_active = True

def _override_current_user():
    return _DummyUser()

app.dependency_overrides[get_current_user] = _override_current_user
client = TestClient(app)

def _ensure_location():
    r = client.get("/api/v1/locations", params={"district": "군포시"})
    if r.status_code == 200 and len(r.json()) > 0:
        return r.json()[0]["id"]
    # 없으면 생성
    r2 = client.post("/api/v1/locations", json={
        "name": "테스트장소",
        "address": "경기도 군포시 산본로 1",
        "district": "군포시"
    })
    assert r2.status_code == 200
    return r2.json()["id"]

def test_crud_schedules():
    loc_id = _ensure_location()

    start = datetime.now().replace(microsecond=0).isoformat()
    end = (datetime.now().replace(microsecond=0) + timedelta(hours=1)).isoformat()

    # Create
    r = client.post("/api/v1/schedules", json={
        "title": "테스트 일정",
        "start_time": start,
        "end_time": end,
        "location_id": loc_id
    })
    assert r.status_code == 200
    created = r.json()
    sid = created["id"]

    # Read list
    rl = client.get("/api/v1/schedules")
    assert rl.status_code == 200
    assert any(s["id"] == sid for s in rl.json())

    # Update
    r2 = client.put(f"/api/v1/schedules/{sid}", json={ "title": "수정된 일정" })
    assert r2.status_code == 200
    assert r2.json()["title"] == "수정된 일정"

    # Delete
    r3 = client.delete(f"/api/v1/schedules/{sid}")
    assert r3.status_code == 200
