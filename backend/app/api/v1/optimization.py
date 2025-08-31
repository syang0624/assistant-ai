from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime
from app.db.session import get_db
from app.models.user import User
from app.services.optimization import ScheduleOptimizer
from app.api.v1.auth import get_current_user
from app.schemas.optimization import OptimizationRequest, OptimizationResponse

router = APIRouter()
optimizer = ScheduleOptimizer()

@router.post("/optimize-schedule", response_model=OptimizationResponse)
async def optimize_schedule(
    request: OptimizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """AI 기반 일정 최적화"""
    try:
        # 기존 일정 조회
        existing_schedules = []
        if request.include_existing:
            from app.models.schedule import Schedule
            existing_schedules = db.query(Schedule).filter(
                Schedule.user_id == current_user.id,
                Schedule.start_time >= request.date
            ).all()
        
        # AI 최적화 실행
        optimized_schedule = optimizer.optimize_schedule(
            user=current_user,
            date=request.date,
            existing_schedules=existing_schedules
        )
        
        # 총 거리와 예상 노출 수 계산
        total_distance = sum(s.get("travel_distance", 0) for s in optimized_schedule)
        total_exposure = sum(s.get("exposure", 0) for s in optimized_schedule)
        
        return OptimizationResponse(
            success=True,
            message="일정이 최적화되었습니다",
            schedule=optimized_schedule,
            total_distance=total_distance,
            estimated_exposure=total_exposure
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"일정 최적화 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/reoptimize-schedule", response_model=OptimizationResponse)
async def reoptimize_schedule(
    request: OptimizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """실시간 일정 재최적화"""
    try:
        # 현재 진행 중인 일정 조회
        from app.models.schedule import Schedule
        current_schedules = db.query(Schedule).filter(
            Schedule.user_id == current_user.id,
            Schedule.start_time <= datetime.now(),
            Schedule.end_time >= datetime.now()
        ).all()
        
        if not current_schedules:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="현재 진행 중인 일정이 없습니다"
            )
        
        # 재최적화 실행
        reoptimized_schedule = optimizer.reoptimize_schedule(
            user=current_user,
            current_schedule=current_schedules,
            delay_minutes=request.delay_minutes or 0,
            current_location=request.current_location
        )
        
        # 총 거리와 예상 노출 수 계산
        total_distance = sum(s.get("travel_distance", 0) for s in reoptimized_schedule)
        total_exposure = sum(s.get("exposure", 0) for s in reoptimized_schedule)
        
        return OptimizationResponse(
            success=True,
            message="일정이 재최적화되었습니다",
            schedule=reoptimized_schedule,
            total_distance=total_distance,
            estimated_exposure=total_exposure
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"일정 재최적화 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/location-statistics/{district}")
async def get_location_statistics(district: str):
    """지역구별 장소 통계"""
    try:
        stats = optimizer.get_location_statistics(district)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 지역구를 찾을 수 없습니다"
            )
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"통계 조회 중 오류가 발생했습니다: {str(e)}"
        )
