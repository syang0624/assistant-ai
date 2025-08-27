from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas import LocationModel
from ..db import get_session
from ..models_db import User, UserLocation
from ..auth import get_current_username

router = APIRouter(prefix="/api", tags=["locations"])

@router.put("/locations")
def set_locations(loc: LocationModel, username: str = Depends(get_current_username), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.username == username).first()
    # 기존 것 삭제
    db.query(UserLocation).filter(UserLocation.user_id == user.id).delete()
    # 새로 입력
    rows = []
    for constituency, wards in loc.constituencies.items():
        for ward in wards:
            rows.append(UserLocation(user_id=user.id, constituency=constituency, ward=ward))
    db.add_all(rows)
    db.commit()
    return {"ok": True, "count": len(rows)}

@router.get("/locations")
def get_locations(username: str = Depends(get_current_username), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.username == username).first()
    locs = db.query(UserLocation).filter(UserLocation.user_id == user.id).all()
    result = {}
    for r in locs:
        result.setdefault(r.constituency, []).append(r.ward)
    return result
