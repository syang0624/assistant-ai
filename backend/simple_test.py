#!/usr/bin/env python3
"""
간단한 최적화 서비스 테스트
"""

def test_basic():
    """기본 기능 테스트"""
    print("=== 기본 기능 테스트 시작 ===")
    
    try:
        # 1. 최적화 서비스 임포트 테스트
        print("1. 최적화 서비스 임포트 테스트...")
        from app.services.optimization import ScheduleOptimizer
        print("   ✅ ScheduleOptimizer 임포트 성공")
        
        # 2. 인스턴스 생성 테스트
        print("2. 인스턴스 생성 테스트...")
        optimizer = ScheduleOptimizer()
        print("   ✅ ScheduleOptimizer 인스턴스 생성 성공")
        
        # 3. 장소 데이터 확인 테스트
        print("3. 장소 데이터 확인 테스트...")
        locations = optimizer.locations
        print(f"   ✅ 지역구 수: {len(locations)}")
        
        for district, places in locations.items():
            print(f"   - {district}: {len(places)}개 장소")
        
        # 4. 통계 함수 테스트
        print("4. 통계 함수 테스트...")
        stats = optimizer.get_location_statistics("군포시")
        print(f"   ✅ 군포시 통계: {stats}")
        
        print("\n=== 모든 기본 테스트 통과! ===")
        return True
        
    except Exception as e:
        print(f"   ❌ 테스트 실패: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_basic()
