import requests
from typing import Dict, Optional
from app.core.maps_config import maps_config

class MapsService:
    def __init__(self):
        self.google_api_key = maps_config.GOOGLE_MAPS_API_KEY
        self.naver_client_id = maps_config.NAVER_CLIENT_ID
        self.naver_client_secret = maps_config.NAVER_CLIENT_SECRET
        self.tmap_api_key = maps_config.TMAP_API_KEY
        self.default_service = maps_config.DEFAULT_MAPS_SERVICE

    def get_directions(self, origin: str, destination: str, mode: str = "transit") -> Dict:
        """주소 간 경로 정보 조회"""
        if self.default_service == "google" and self.google_api_key:
            return self._get_google_directions(origin, destination, mode)
        elif self.default_service == "naver" and self.naver_client_id:
            return self._get_naver_directions(origin, destination, mode)
        elif self.default_service == "tmap" and self.tmap_api_key:
            return self._get_tmap_directions(origin, destination, mode)
        else:
            return self._get_fallback_directions(origin, destination, mode)

    def _get_google_directions(self, origin: str, destination: str, mode: str) -> Dict:
        """Google Maps Directions API 사용"""
        try:
            url = "https://maps.googleapis.com/maps/api/directions/json"
            params = {
                "origin": origin,
                "destination": destination,
                "mode": mode,
                "key": self.google_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data["status"] == "OK" and data["routes"]:
                route = data["routes"][0]["legs"][0]
                return {
                    "duration": route["duration"]["value"] // 60,  # 초를 분으로 변환
                    "distance": route["distance"]["value"] / 1000,  # 미터를 km로 변환
                    "route": f"{origin} → {destination}",
                    "transport_mode": mode,
                    "service": "google"
                }
        except Exception as e:
            pass
        
        return self._get_fallback_directions(origin, destination, mode)

    def _get_naver_directions(self, origin: str, destination: str, mode: str) -> Dict:
        """Naver Maps API 사용"""
        try:
            url = "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"
            headers = {
                "X-NCP-APIGW-API-KEY-ID": self.naver_client_id,
                "X-NCP-APIGW-API-KEY": self.naver_client_secret
            }
            params = {
                "start": origin,
                "goal": destination,
                "option": "trafast"  # 최단 경로
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            data = response.json()
            
            if data["code"] == 0 and data["route"]["trafast"]:
                route = data["route"]["trafast"][0]["summary"]
                return {
                    "duration": route["duration"] // 60000,  # 밀리초를 분으로 변환
                    "distance": route["distance"] / 1000,    # 미터를 km로 변환
                    "route": f"{origin} → {destination}",
                    "transport_mode": mode,
                    "service": "naver"
                }
        except Exception as e:
            pass
        
        return self._get_fallback_directions(origin, destination, mode)

    def _get_tmap_directions(self, origin: str, destination: str, mode: str) -> Dict:
        """T Map API 사용"""
        try:
            url = "https://apis.openapi.sk.com/tmap/routes"
            headers = {
                "appKey": self.tmap_api_key
            }
            params = {
                "startX": "0",  # 실제 구현에서는 주소를 좌표로 변환
                "startY": "0",
                "endX": "0",
                "endY": "0",
                "reqCoordType": "WGS84GEO",
                "resCoordType": "WGS84GEO",
                "searchOption": "0"
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            data = response.json()
            
            if data["status"] == 0 and data["features"]:
                route = data["features"][0]["properties"]
                return {
                    "duration": int(route["totalTime"]) // 60,  # 초를 분으로 변환
                    "distance": route["totalDistance"] / 1000,  # 미터를 km로 변환
                    "route": f"{origin} → {destination}",
                    "transport_mode": mode,
                    "service": "tmap"
                }
        except Exception as e:
            pass
        
        return self._get_fallback_directions(origin, destination, mode)

    def _get_fallback_directions(self, origin: str, destination: str, mode: str) -> Dict:
        """API 호출 실패 시 기본값 반환"""
        return {
            "duration": 20,
            "distance": 3.0,
            "route": f"{origin} → {destination}",
            "transport_mode": mode,
            "service": "fallback"
        }
