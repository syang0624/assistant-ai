import heapq
import requests
import json
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from app.models.schedule import Schedule, Location
from app.models.user import User
from functools import lru_cache

class ScheduleOptimizer:
    def __init__(self):
        # 하드코딩된 장소 데이터 (각 지역구별 40개씩) - 도로명 주소 사용
        self.locations = {
            "군포시": [
                {"name": "군포시청", "address": "경기도 군포시 청백리길 6", "type": "government", "priority": 5, "exposure": 80},
                {"name": "군포1동 행정복지센터", "address": "경기도 군포시 군포로 520", "type": "government", "priority": 4, "exposure": 60},
                {"name": "산본1동 행정복지센터", "address": "경기도 군포시 고산로 724번길 13", "type": "government", "priority": 4, "exposure": 60},
                {"name": "금정동 행정복지센터", "address": "경기도 군포시 금정로 81", "type": "government", "priority": 4, "exposure": 60},
                {"name": "군포시의회", "address": "경기도 군포시 청백리길 6", "type": "government", "priority": 4, "exposure": 50},
                {"name": "군포경찰서", "address": "경기도 군포시 번영로 504", "type": "government", "priority": 3, "exposure": 40},
                {"name": "군포소방서", "address": "경기도 군포시 부곡로 163", "type": "government", "priority": 3, "exposure": 40},
                {"name": "군포시보건소", "address": "경기도 군포시 공단로 201", "type": "government", "priority": 4, "exposure": 70},
                {"name": "군포시노인복지관", "address": "경기도 군포시 당동 981", "type": "government", "priority": 3, "exposure": 65},
                {"name": "군포시청소년수련관", "address": "경기도 군포시 고산로 243", "type": "government", "priority": 3, "exposure": 45},

                {"name": "군포역", "address": "경기도 군포시 공단로 137", "type": "transport", "priority": 3, "exposure": 120},
                {"name": "산본역", "address": "경기도 군포시 번영로 485", "type": "transport", "priority": 3, "exposure": 110},
                {"name": "금정역", "address": "경기도 군포시 군포로 474", "type": "transport", "priority": 3, "exposure": 100},
                {"name": "군포시외버스터미널", "address": "경기도 군포시 산본로 7", "type": "transport", "priority": 3, "exposure": 90},
                {"name": "산본버스정류장", "address": "경기도 군포시 산본로 324", "type": "transport", "priority": 2, "exposure": 80},
                {"name": "금정버스정류장", "address": "경기도 군포시 금정로 81", "type": "transport", "priority": 2, "exposure": 75},
                {"name": "군포택시정류장", "address": "경기도 군포시 군포로", "type": "transport", "priority": 2, "exposure": 60},
                {"name": "산본택시정류장", "address": "경기도 군포시 산본로 324", "type": "transport", "priority": 2, "exposure": 55},

                {"name": "군포시민운동장", "address": "경기도 군포시 산본로 265", "type": "public", "priority": 4, "exposure": 150},
                {"name": "군포시 중앙도서관", "address": "경기도 군포시 수리산로 79", "type": "public", "priority": 3, "exposure": 80},
                {"name": "산본도서관", "address": "경기도 군포시 산본로 307", "type": "public", "priority": 3, "exposure": 75},
                {"name": "군포문화예술회관", "address": "경기도 군포시 고산로 599", "type": "public", "priority": 4, "exposure": 90},
                {"name": "군포시민공원", "address": "경기도 군포시 고산로 599", "type": "public", "priority": 3, "exposure": 100},
                {"name": "군포시청소년수련관", "address": "경기도 군포시 고산로 243", "type": "public", "priority": 3, "exposure": 85},

                {"name": "군포시장", "address": "경기도 군포시 군포로 730", "type": "commercial", "priority": 4, "exposure": 200},
                {"name": "산본시장", "address": "경기도 군포시 고산로 712번길 28", "type": "commercial", "priority": 4, "exposure": 180},
                {"name": "금정시장", "address": "경기도 군포시 금정로 35", "type": "commercial", "priority": 4, "exposure": 160},
                {"name": "롯데마트 군포점", "address": "경기도 군포시 엘에스로 34", "type": "commercial", "priority": 3, "exposure": 150},
                {"name": "이마트 산본점", "address": "경기도 군포시 산본로 323", "type": "commercial", "priority": 3, "exposure": 140},
                {"name": "홈플러스 군포점", "address": "경기도 군포시 엘에스로 43", "type": "commercial", "priority": 3, "exposure": 130},
                {"name": "군포상가", "address": "군포시 산본동 일대", "type": "commercial", "priority": 3, "exposure": 120},
                {"name": "산본상가", "address": "군포시 산본동 일대", "type": "commercial", "priority": 3, "exposure": 110},

                {"name": "군포초등학교", "address": "경기도 군포시 군포로 453", "type": "education", "priority": 3, "exposure": 60},
                {"name": "산본초등학교", "address": "경기도 군포시 산본로 307", "type": "education", "priority": 3, "exposure": 55},
                {"name": "금정초등학교", "address": "경기도 군포시 금정로 21", "type": "education", "priority": 3, "exposure": 50},
                {"name": "군포중학교", "address": "경기도 군포시 군포로 520", "type": "education", "priority": 3, "exposure": 65},
                {"name": "산본중학교", "address": "경기도 군포시 산본로 309", "type": "education", "priority": 3, "exposure": 60},
                {"name": "군포고등학교", "address": "경기도 군포시 산본로 348", "type": "education", "priority": 3, "exposure": 70}
            ],

            "서대문구": [
                {"name": "서대문구청", "address": "서울특별시 서대문구 연희로 248", "type": "government", "priority": 5, "exposure": 80},
                {"name": "천연동 주민센터", "address": "서울특별시 서대문구 성산로 694", "type": "government", "priority": 4, "exposure": 60},
                {"name": "북아현동 주민센터", "address": "서울특별시 서대문구 북아현로 11길 36", "type": "government", "priority": 4, "exposure": 60},
                {"name": "충현동 주민센터", "address": "서울특별시 서대문구 충정로3가 18-57", "type": "government", "priority": 4, "exposure": 60},
                {"name": "신촌동 주민센터", "address": "서울특별시 서대문구 신촌로 217", "type": "government", "priority": 4, "exposure": 60},
                {"name": "서대문구의회", "address": "서울특별시 서대문구 연희로 248", "type": "government", "priority": 4, "exposure": 50},
                {"name": "서대문경찰서", "address": "서울특별시 서대문구 통일로 113", "type": "government", "priority": 3, "exposure": 40},
                {"name": "서대문소방서", "address": "서울특별시 서대문구 통일로 247", "type": "government", "priority": 3, "exposure": 40},
                {"name": "서대문구보건소", "address": "서울특별시 서대문구 연희로 248 1층", "type": "government", "priority": 4, "exposure": 70},
                {"name": "서대문노인종합복지관", "address": "서울특별시 서대문구 통일로 367", "type": "government", "priority": 3, "exposure": 65},

                {"name": "신촌역", "address": "서울특별시 마포구 신촌로 74", "type": "transport", "priority": 3, "exposure": 150},
                {"name": "이대역", "address": "서울특별시 서대문구 이화여대길 2", "type": "transport", "priority": 3, "exposure": 140},
                {"name": "아현역", "address": "서울특별시 마포구 마포대로 135", "type": "transport", "priority": 3, "exposure": 130},
                {"name": "충정로역", "address": "서울특별시 서대문구 충정로 21", "type": "transport", "priority": 3, "exposure": 120},
                {"name": "서대문역", "address": "서울특별시 서대문구 통일로 8", "type": "transport", "priority": 3, "exposure": 110},
                {"name": "신촌버스정류장", "address": "서울특별시 서대문구 신촌로 73", "type": "transport", "priority": 2, "exposure": 100},
                {"name": "이대버스정류장", "address": "서울특별시 서대문구 이화여대길 2", "type": "transport", "priority": 2, "exposure": 90},
                {"name": "아현버스정류장", "address": "서울특별시 마포구 마포대로 135", "type": "transport", "priority": 2, "exposure": 85},

                {"name": "서대문구립도서관", "address": "서울특별시 서대문구 연희로 234", "type": "public", "priority": 3, "exposure": 80},
                {"name": "신촌도서관", "address": "서울특별시 서대문구 신촌로 221", "type": "public", "priority": 3, "exposure": 75},
                {"name": "이대도서관", "address": "서울특별시 서대문구 이화여대길 52", "type": "public", "priority": 3, "exposure": 70},
                {"name": "서대문문화체육회관", "address": "서울특별시 서대문구 수색로 43", "type": "public", "priority": 4, "exposure": 90},
                {"name": "서대문구민체육센터", "address": "서울특별시 서대문구 연희동", "type": "public", "priority": 4, "exposure": 85},
                {"name": "서대문구민공원", "address": "서울특별시 서대문구 연희동 산1-4", "type": "public", "priority": 3, "exposure": 100},
                {"name": "신촌공원", "address": "서울특별시 서대문구 신촌동", "type": "public", "priority": 3, "exposure": 95},
                {"name": "이대공원", "address": "서울특별시 서대문구 대현동", "type": "public", "priority": 3, "exposure": 90},

                {"name": "신촌상가", "address": "서울특별시 서대문구 신촌로 119 일대", "type": "commercial", "priority": 4, "exposure": 250},
                {"name": "이대상가", "address": "서울특별시 서대문구 이화여대길 39", "type": "commercial", "priority": 4, "exposure": 220},
                {"name": "아현상가", "address": "서울특별시 마포구 마포대로 140", "type": "commercial", "priority": 4, "exposure": 200},
                {"name": "이마트 신촌점", "address": "서울특별시 서대문구 신촌로 94", "type": "commercial", "priority": 3, "exposure": 180},
                {"name": "홈플러스 이대점", "address": "서울특별시 마포구 신촌로 94", "type": "commercial", "priority": 3, "exposure": 170},
                {"name": "롯데마트 아현점", "address": "서울특별시 마포구 마포대로 195", "type": "commercial", "priority": 3, "exposure": 160},
                {"name": "신촌시장", "address": "서울특별시 서대문구 신촌로 119 일대", "type": "commercial", "priority": 4, "exposure": 200},
                {"name": "이대시장", "address": "서울특별시 서대문구 이화여대길 39", "type": "commercial", "priority": 4, "exposure": 180},

                {"name": "연세대학교", "address": "서울특별시 서대문구 연세로 50", "type": "education", "priority": 4, "exposure": 120},
                {"name": "이화여자대학교", "address": "서울특별시 서대문구 이화여대길 52", "type": "education", "priority": 4, "exposure": 110},
                {"name": "신촌초등학교", "address": "서울특별시 서대문구 신촌로 163", "type": "education", "priority": 3, "exposure": 60},
                {"name": "이대초등학교", "address": "서울특별시 서대문구 이화여대길 20", "type": "education", "priority": 3, "exposure": 55},
                {"name": "신촌중학교", "address": "서울특별시 서대문구 신촌로 153", "type": "education", "priority": 3, "exposure": 65},
                {"name": "이대중학교", "address": "서울특별시 서대문구 이화여대길 37", "type": "education", "priority": 3, "exposure": 60}
            ]
            }

        
        # 활동 강도별 일정 규칙
        self.activity_rules = {
            "easy": {"max_schedules": 3, "max_distance": 5, "break_time": 60},
            "medium": {"max_schedules": 6, "max_distance": 8, "break_time": 45},
            "hard": {"max_schedules": 8, "max_distance": 12, "break_time": 30}
        }

    @lru_cache(maxsize=1000)
    def get_travel_info(self, origin_address: str, destination_address: str, transport_mode: str = "transit") -> Dict:
        """지도 API를 사용하여 두 주소 간의 이동 정보 조회 (캐싱 적용)"""
        try:
            # 실제 구현에서는 Google Maps API, Naver Maps API, 또는 T Map API 사용
            # 여기서는 예시 응답 구조만 제공
            
            # Google Maps Directions API 예시 (실제 구현 시)
            # api_key = "YOUR_GOOGLE_MAPS_API_KEY"
            # url = f"https://maps.googleapis.com/maps/api/directions/json"
            # params = {
            #     "origin": origin_address,
            #     "destination": destination_address,
            #     "mode": transport_mode,
            #     "key": api_key
            # }
            # response = requests.get(url, params=params)
            # data = response.json()
            
            # 임시 응답 (실제 구현 시 제거)
            mock_response = {
                "duration": 15,  # 분 단위
                "distance": 2.5,  # km 단위
                "route": f"{origin_address} → {destination_address}",
                "transport_mode": transport_mode
            }
            
            return mock_response
            
        except Exception as e:
            # API 호출 실패 시 기본값 반환
            return {
                "duration": 20,
                "distance": 3.0,
                "route": f"{origin_address} → {destination_address}",
                "transport_mode": transport_mode,
                "error": str(e)
            }

    def calculate_travel_time(self, origin_address: str, destination_address: str, transport_mode: str = "transit") -> int:
        """주소 기반 이동 시간 계산 (분)"""
        travel_info = self.get_travel_info(origin_address, destination_address, transport_mode)
        return travel_info.get("duration", 20)

    def calculate_distance(self, origin_address: str, destination_address: str) -> float:
        """주소 기반 거리 계산 (km)"""
        travel_info = self.get_travel_info(origin_address, destination_address)
        return travel_info.get("distance", 3.0)

    def optimize_schedule(self, user: User, date: datetime, existing_schedules: List[Schedule] = None) -> List[Dict]:
        """AI 기반 일정 최적화"""
        start_time = datetime.combine(date.date(), datetime.min.time().replace(hour=9))  # 오전 9시 시작
        
        # 사용자 지역구의 장소들 가져오기
        district_locations = self.locations.get(user.district, [])
        if not district_locations:
            return []
        
        # 활동 강도 규칙 적용
        rules = self.activity_rules.get(user.activity_level, self.activity_rules["medium"])
        
        # 우선순위 큐로 최적화
        optimized_schedule = []
        current_time = start_time
        current_address = None
        remaining_schedules = rules["max_schedules"]
        total_distance = 0.0
        
        # 장소를 우선순위와 노출도로 정렬
        location_queue = []
        for loc in district_locations:
            # 우선순위 점수 계산 (우선순위 + 노출도 + 시간대별 가중치)
            priority_score = loc["priority"] * 10
            exposure_score = loc["exposure"] * 0.1
            time_weight = self._calculate_time_weight(current_time)
            total_score = priority_score + exposure_score + time_weight
            
            heapq.heappush(location_queue, (-total_score, loc))
        
        while location_queue and remaining_schedules > 0:
            score, location = heapq.heappop(location_queue)
            
            # 이동 시간 계산
            travel_time = 0
            travel_distance = 0
            if current_address:
                travel_time = self.calculate_travel_time(current_address, location["address"])
                travel_distance = self.calculate_distance(current_address, location["address"])
                
                # 거리 제한 확인
                if total_distance + travel_distance > rules["max_distance"]:
                    continue
            
            # 일정 시간 계산
            schedule_duration = self._calculate_schedule_duration(location["type"])
            
            # 시간 제약 확인
            if current_time + timedelta(minutes=travel_time + schedule_duration) > start_time.replace(hour=18):  # 오후 6시까지
                continue
            
            # 일정 추가
            schedule = {
                "title": f"{location['name']} 방문",
                "start_time": current_time + timedelta(minutes=travel_time),
                "end_time": current_time + timedelta(minutes=travel_time + schedule_duration),
                "location": location["name"],
                "address": location["address"],
                "location_type": location["type"],
                "priority": location["priority"],
                "exposure": location["exposure"],
                "travel_time": travel_time,
                "travel_distance": travel_distance
            }
            
            optimized_schedule.append(schedule)
            
            # 다음 일정을 위한 시간 업데이트
            current_time = schedule["end_time"] + timedelta(minutes=rules["break_time"])
            current_address = location["address"]
            total_distance += travel_distance
            remaining_schedules -= 1
        
        return optimized_schedule

    def _calculate_time_weight(self, time: datetime) -> float:
        """시간대별 가중치 계산"""
        hour = time.hour
        
        if 9 <= hour <= 11:  # 오전 활동 시간
            return 2.0
        elif 14 <= hour <= 16:  # 오후 활동 시간
            return 1.5
        elif 17 <= hour <= 18:  # 저녁 활동 시간
            return 1.0
        else:
            return 0.5

    def _calculate_schedule_duration(self, location_type: str) -> int:
        """장소 유형별 일정 시간 계산 (분)"""
        duration_map = {
            "government": 45,    # 공공기관
            "transport": 15,     # 교통시설
            "public": 30,        # 공공시설
            "commercial": 60,    # 상업시설
            "education": 90      # 교육시설
        }
        return duration_map.get(location_type, 30)

    def reoptimize_schedule(self, user: User, current_schedule: List[Dict], 
                           delay_minutes: int, current_location: str) -> List[Dict]:
        """실시간 일정 재최적화"""
        # 현재 시간과 위치를 기준으로 남은 일정 재계산
        current_time = datetime.now() + timedelta(minutes=delay_minutes)
        
        # 현재 위치 이후의 일정만 재최적화
        remaining_schedules = [s for s in current_schedule if s["start_time"] > current_time]
        
        if not remaining_schedules:
            return current_schedule
        
        # 재최적화된 일정 생성
        reoptimized = self.optimize_schedule(user, current_time.date(), remaining_schedules)
        
        # 기존 완료된 일정과 새로운 최적화된 일정 결합
        completed_schedules = [s for s in current_schedule if s["start_time"] <= current_time]
        return completed_schedules + reoptimized

    def get_location_statistics(self, district: str) -> Dict:
        """지역구별 장소 통계"""
        locations = self.locations.get(district, [])
        if not locations:
            return {}
        
        stats = {
            "total_locations": len(locations),
            "by_type": {},
            "total_exposure": sum(loc["exposure"] for loc in locations)
        }
        
        for loc in locations:
            # 타입별 통계
            loc_type = loc["type"]
            if loc_type not in stats["by_type"]:
                stats["by_type"][loc_type] = {"count": 0, "total_exposure": 0}
            stats["by_type"][loc_type]["count"] += 1
            stats["by_type"][loc_type]["total_exposure"] += loc["exposure"]
        
        return stats

    def _calculate_time_weight_extended(self, time: datetime) -> float:
        """시간대별 가중치 계산 (05:00-22:00 범위)"""
        hour = time.hour
        
        if 5 <= hour < 9:  # 오전 5시 ~ 9시 전
            return 1.0
        elif 9 <= hour < 12:  # 오전 9시 ~ 12시 전
            return 1.5
        elif 12 <= hour < 14:  # 오전 12시 ~ 오후 2시 전
            return 2.0
        elif 14 <= hour < 17:  # 오후 2시 ~ 오후 5시 전
            return 1.5
        elif 17 <= hour < 22:  # 오후 5시 ~ 오후 10시 전
            return 1.0
        else:  # 오후 10시 이후
            return 0.5

    def suggest_schedules_for_empty_slots(self, user: User, empty_time_slots: List, current_week_start: str = None) -> List[Dict]:
        """빈 시간대를 기반으로 AI 일정 제안 생성"""
        if not empty_time_slots:
            return []
        
        # 사용자 지역구의 장소들 가져오기
        user_district = user.district
        
        # 지역구 매핑 로직
        if "군포시" in user_district:
            location_district = "군포시"
        elif "서대문구" in user_district:
            location_district = "서대문구"
        else:
            location_district = user_district
            
        district_locations = self.locations.get(location_district, [])
        print(f"지역구 '{user_district}' -> 매핑된 지역구 '{location_district}'의 총 장소 수: {len(district_locations)}")
        
        if not district_locations:
            print(f"❌ 지역구 '{location_district}'에 장소 데이터가 없습니다")
            return []
        
        # 활동 강도 규칙 적용
        rules = self.activity_rules.get(user.activity_level, self.activity_rules["medium"])
        
        # 현재 시간 기준으로 과거 시간대 완전 차단
        now = datetime.now()
        current_time_plus_buffer = now + timedelta(hours=2)  # 2시간 여유 (준비 시간 확보)
        print(f"현재 시간: {now}, 최소 허용 시간: {current_time_plus_buffer}")
        
        # 과거가 아닌 시간대만 필터링 (엄격한 검증)
        valid_time_slots = []
        for time_slot in empty_time_slots:
            if hasattr(time_slot, 'start'):
                slot_start_str = time_slot.start
            else:
                slot_start_str = time_slot["start"]
            
            # 프론트엔드에서 보낸 한국 시간을 파싱
            slot_start = datetime.fromisoformat(slot_start_str)
            
            # 현재 시간 + 2시간 이후의 시간대만 포함 (엄격한 검증)
            if slot_start >= current_time_plus_buffer:
                valid_time_slots.append(time_slot)
                print(f"✅ 유효한 시간대: {slot_start}")
            else:
                print(f"❌ 과거/너무 가까운 시간대 제외: {slot_start}")
        
        print(f"유효한 시간대 수 (과거 완전 차단): {len(valid_time_slots)}")
        
        if not valid_time_slots:
            print("❌ 유효한 시간대가 없습니다 (모든 시간대가 과거)")
            return []
        
        # 시간대별로 장소를 분산 배치하기 위한 그룹화
        time_groups = {}
        for time_slot in valid_time_slots:
            if hasattr(time_slot, 'start'):
                slot_start_str = time_slot.start
            else:
                slot_start_str = time_slot["start"]
            
            # 시간을 파싱해서 날짜별로 그룹화
            slot_start = datetime.fromisoformat(slot_start_str)
            day_key = slot_start.strftime("%Y-%m-%d")  # 날짜를 키로 사용
            
            if day_key not in time_groups:
                time_groups[day_key] = []
            time_groups[day_key].append(time_slot)
        
        print(f"날짜별 그룹: {list(time_groups.keys())}")
        
        # 3-5일에 걸쳐 균등 분산 (하루 최대 1개)
        max_per_day = 1  # 하루 최대 1개로 제한하여 균등 분산
        target_days = min(5, len(time_groups))  # 최대 5일까지
        total_suggestions = 0
        suggestions = []
        used_locations = set()  # 중복 방지를 위한 사용된 장소 추적
        
        # 날짜순으로 정렬하여 순서대로 처리
        sorted_days = sorted(time_groups.keys())
        
        for day_key in sorted_days:
            if total_suggestions >= rules["max_schedules"] or total_suggestions >= target_days:
                break
                
            day_slots = time_groups[day_key]
            print(f"📅 {day_key} 처리 중...")
            day_suggestions = []
            day_used_locations = set()
            
            # 해당 날짜의 시간대를 시간순으로 정렬
            sorted_slots = sorted(day_slots, key=lambda x: x.start if hasattr(x, 'start') else x["start"])
            
            # 하루에 최대 1개까지만 제안 (균등 분산)
            for time_slot in sorted_slots:
                if len(day_suggestions) >= max_per_day:
                    break
                    
                # Pydantic 모델 또는 딕셔너리 모두 처리
                if hasattr(time_slot, 'start'):
                    slot_start_str = time_slot.start
                    slot_end_str = time_slot.end
                else:
                    slot_start_str = time_slot["start"]
                    slot_end_str = time_slot["end"]
                
                # 프론트엔드에서 보낸 한국 시간을 파싱
                slot_start = datetime.fromisoformat(slot_start_str)
                slot_end = datetime.fromisoformat(slot_end_str)
                slot_duration = (slot_end - slot_start).total_seconds() / 60  # 분 단위
                
                print(f"  시간대: {slot_start.strftime('%H:%M')} - {slot_end.strftime('%H:%M')} (지속: {slot_duration}분)")
                
                # 시간대별 가중치 계산 (05:00-22:00 범위)
                time_weight = self._calculate_time_weight_extended(slot_start)
                
                # 장소별 점수 계산 및 우선순위 큐 생성
                location_scores = []
                for idx, loc in enumerate(district_locations):
                    # 이미 사용된 장소는 제외 (다양성 확보)
                    if loc["name"] in used_locations or loc["name"] in day_used_locations:
                        continue
                        
                    # 우선순위 점수 계산 (우선순위 + 노출도 + 시간대별 가중치)
                    priority_score = loc["priority"] * 10
                    exposure_score = loc["exposure"] * 0.1
                    total_score = priority_score + exposure_score + time_weight
                    
                    # 음수 점수로 heapq 최대 힙 구현 (가장 높은 점수가 먼저 나오도록)
                    # idx를 추가하여 동일한 점수일 때도 비교 가능하도록 함
                    heapq.heappush(location_scores, (-total_score, idx, loc))
                
                # 상위 1개 장소만 선택 (균등 분산)
                selected_locations = []
                for _ in range(min(1, len(location_scores))):
                    if not location_scores:
                        break
                        
                    score, idx, location = heapq.heappop(location_scores)
                    score = -score  # 음수에서 양수로 변환
                    
                    # 일정 시간 계산
                    schedule_duration = self._calculate_schedule_duration(location["type"])
                    
                    # 시간 제약 확인 (빈 시간대에 맞는지)
                    if schedule_duration <= slot_duration:
                        # 이동 시간 고려하여 실제 일정 시간 계산
                        travel_time = 0
                        travel_distance = 0
                        
                        # 일정 제안 생성
                        suggestion = {
                            "title": f"{location['name']} 방문",
                            "start_time": slot_start.strftime("%Y-%m-%dT%H:%M:%S"),  # 한국 시간 형식
                            "end_time": (slot_start + timedelta(minutes=schedule_duration)).strftime("%Y-%m-%dT%H:%M:%S"),
                            "location": location["name"],
                            "address": location["address"],
                            "location_type": location["type"],
                            "priority": location["priority"],
                            "exposure": location["exposure"],
                            "travel_time": travel_time,
                            "travel_distance": travel_distance,
                            "description": f"{location['type']} 시설 방문으로 유권자 접촉 기회 확대",
                            "score": score,
                            "day": slot_start.strftime("%m월 %d일 (%A)")  # 날짜+요일 표시
                        }
                        
                        selected_locations.append(suggestion)
                        print(f"    ✅ 제안 생성: {location['name']} ({slot_start.strftime('%H:%M')})")
                        break  # 한 시간대당 1개만 제안
                
                # 해당 시간대의 제안 추가
                if selected_locations:
                    best_suggestion = selected_locations[0]
                    day_suggestions.append(best_suggestion)
                    day_used_locations.add(best_suggestion["location"])  # 해당 날짜에서 사용된 장소 기록
                    used_locations.add(best_suggestion["location"])  # 전체에서 사용된 장소 기록
            
            # 해당 날짜의 제안들을 suggestions에 추가
            suggestions.extend(day_suggestions)
            total_suggestions += len(day_suggestions)
            print(f"  📊 {day_key}: {len(day_suggestions)}개 제안")
        
        print(f"🎯 총 생성된 제안 수: {len(suggestions)}")
        if suggestions:
            print(f"📋 첫 번째 제안: {suggestions[0]}")
        
        # 전체 제안 수를 활동 강도에 맞게 조정
        max_suggestions = min(rules["max_schedules"], len(suggestions))
        return suggestions[:max_suggestions]
