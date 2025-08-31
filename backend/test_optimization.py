#!/usr/bin/env python3
"""
최적화 서비스 테스트 스크립트
실행: python3 test_optimization.py
"""

import asyncio
from app.services.optimization import ScheduleOptimizer
from app.services.maps_service import MapsService
from datetime import datetime

def test_optimization_service():
    """최적화 서비스 테스트"""
    print("=== AI 일정 최적화 서비스 테스트 ===\n")
    
    optimizer = ScheduleOptimizer()
    
    # 1. 지역구별 장소 데이터 확인
    print("1. 지역구별 장소 데이터 확인:")
    for district in ["군포시", "서대문구"]:
        stats = optimizer.get_location_statistics(district)
        print(f"   {district}: {stats['total_locations']}개 장소")
        print(f"   - 타입별: {stats['by_type']}")
        print(f"   - 총 노출도: {stats['total_exposure']}")
        print()
    
    # 2. 가상 사용자로 일정 최적화 테스트
    print("2. 일정 최적화 테스트:")
    
    class MockUser:
        def __init__(self, district, activity_level):
            self.district = district
            self.activity_level = activity_level
    
    # 군포시 사용자 (보통 활동 강도)
    user1 = MockUser("군포시", "medium")
    date = datetime.now()
    
    print(f"   사용자: {user1.district}, 활동강도: {user1.activity_level}")
    optimized_schedule = optimizer.optimize_schedule(user1, date)
    
    print(f"   생성된 일정 수: {len(optimized_schedule)}")
    print("   일정 상세:")
    for i, schedule in enumerate(optimized_schedule, 1):
        print(f"   {i}. {schedule['title']}")
        print(f"      시간: {schedule['start_time'].strftime('%H:%M')} - {schedule['end_time'].strftime('%H:%M')}")
        print(f"      장소: {schedule['location']} ({schedule['address']})")
        print(f"      이동시간: {schedule['travel_time']}분, 거리: {schedule['travel_distance']:.1f}km")
        print(f"      노출도: {schedule['exposure']}")
        print()
    
    # 3. 거리 계산 테스트
    print("3. 주소 기반 거리 계산 테스트:")
    maps_service = MapsService()
    
    test_addresses = [
        ("경기도 군포시 청백리길 6", "경기도 군포시 산본로 265"),  # 시청 → 시민운동장
        ("경기도 군포시 산본로 265", "경기도 군포시 산본로 323"),  # 시민운동장 → 이마트
        ("서울특별시 서대문구 연희로 248", "서울특별시 서대문구 연세로 50"),  # 구청 → 연세대
    ]
    
    for origin, dest in test_addresses:
        travel_info = maps_service.get_directions(origin, dest)
        print(f"   {origin}")
        print(f"   → {dest}")
        print(f"   이동시간: {travel_info['duration']}분, 거리: {travel_info['distance']:.1f}km")
        print()

def test_api_endpoints():
    """API 엔드포인트 테스트"""
    print("=== API 엔드포인트 테스트 ===\n")
    
    import requests
    import json
    
    base_url = "http://localhost:8000"
    
    # 1. 헬스 체크
    try:
        response = requests.get(f"{base_url}/")
        print(f"1. 헬스 체크: {response.status_code}")
        print(f"   응답: {response.json()}")
        print()
    except Exception as e:
        print(f"1. 헬스 체크 실패: {e}")
        print()
    
    # 2. 최적화 API 테스트 (인증 필요하므로 기본 구조만 확인)
    print("2. 최적화 API 엔드포인트 확인:")
    print("   - POST /api/v1/optimize-schedule")
    print("   - POST /api/v1/reoptimize-schedule")
    print("   - GET /api/v1/location-statistics/{district}")
    print()
    
    # 3. 지역구별 통계 API 테스트
    try:
        response = requests.get(f"{base_url}/api/v1/location-statistics/군포시")
        print(f"3. 지역구 통계 API: {response.status_code}")
        if response.status_code == 200:
            stats = response.json()
            print(f"   군포시 장소 수: {stats.get('total_locations', 'N/A')}")
        print()
    except Exception as e:
        print(f"3. 지역구 통계 API 실패: {e}")
        print()

if __name__ == "__main__":
    print("AI 일정 최적화 시스템 테스트 시작\n")
    
    try:
        test_optimization_service()
        test_api_endpoints()
        print("=== 테스트 완료 ===")
    except Exception as e:
        print(f"테스트 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
