import { useState, useEffect, useCallback } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { schedulesAPI } from "../../utils/api";
import { Button, Card, CardContent, Select } from "../ui";
import Navigation from "../shared/Navigation";

// Leaflet 기본 아이콘 설정
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })
    ._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/marker-icon-2x.png",
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
});

interface Schedule {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    description?: string;
    location?: {
        id: string;
        name: string;
        address: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
}

interface RoutePoint {
    lat: number;
    lng: number;
    schedule: Schedule;
}

export default function Map() {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    // 기본 중심점 (군포시청)
    const [center] = useState({ lat: 37.3614, lng: 126.937 });

    // 좌표가 없는 위치에 대한 더미 좌표 생성 (실제로는 Geocoding API 사용)
    const getDummyCoordinates = useCallback(
        (locationName: string) => {
            const dummyCoords: { [key: string]: { lat: number; lng: number } } =
                {
                    군포시청: { lat: 37.3614, lng: 126.937 },
                    산본역: { lat: 37.3579, lng: 126.933 },
                    당정역: { lat: 37.3543, lng: 126.9273 },
                    금정역: { lat: 37.3433, lng: 126.9455 },
                    대야미역: { lat: 37.3211, lng: 126.9261 },
                    반월역: { lat: 37.3194, lng: 126.9361 },
                    상록수역: { lat: 37.3194, lng: 126.9361 },
                    한대앞역: { lat: 37.3085, lng: 126.9563 },
                };

            return (
                dummyCoords[locationName] || {
                    lat: center.lat + (Math.random() - 0.5) * 0.02,
                    lng: center.lng + (Math.random() - 0.5) * 0.02,
                }
            );
        },
        [center.lat, center.lng]
    );

    // 일정 데이터 로드
    useEffect(() => {
        const loadSchedules = async () => {
            try {
                setLoading(true);
                const data = await schedulesAPI.list();

                if (data && data.length > 0) {
                    setSchedules(data);

                    // 일정이 있는 날짜들 추출
                    const dates = [
                        ...new Set(
                            data.map((schedule: Schedule) =>
                                new Date(schedule.start_time).toDateString()
                            )
                        ),
                    ].sort() as string[];
                    setAvailableDates(dates);

                    // 첫 번째 날짜를 기본 선택
                    if (dates.length > 0) {
                        setSelectedDate(dates[0] as string);
                    }
                }
            } catch (error) {
                console.error("일정 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSchedules();
    }, []);

    // 현재 위치 가져오기
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.warn(
                        "위치 권한이 거부되었거나 가져올 수 없습니다:",
                        error
                    );
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        }
    }, []);

    // 선택된 날짜의 일정들로 루트 포인트 생성
    useEffect(() => {
        if (selectedDate && schedules.length > 0) {
            const daySchedules = schedules
                .filter(
                    (schedule: Schedule) =>
                        new Date(schedule.start_time).toDateString() ===
                        selectedDate
                )
                .sort(
                    (a, b) =>
                        new Date(a.start_time).getTime() -
                        new Date(b.start_time).getTime()
                );

            const points = daySchedules
                .filter((schedule) => schedule.location)
                .map((schedule) => {
                    const coords =
                        schedule.location?.coordinates ||
                        getDummyCoordinates(schedule.location?.name || "");
                    return {
                        lat: coords.lat,
                        lng: coords.lng,
                        schedule,
                    };
                });

            setRoutePoints(points);
        } else {
            setRoutePoints([]);
        }
    }, [selectedDate, schedules, getDummyCoordinates]);

    // 거리 계산 함수 (Haversine formula)
    const calculateDistance = (
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ) => {
        const R = 6371; // 지구 반지름 (km)
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // 거리 (km)
    };

    // 날짜 형식 변환
    const formatDateOption = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "short",
        });
    };

    const dateOptions = availableDates.map((date) => ({
        value: date,
        label: formatDateOption(date),
    }));

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: "#F6F7F8" }}
            >
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                        style={{ borderColor: "#4C8BF5" }}
                    ></div>
                    <p
                        className="font-medium"
                        style={{ color: "#ADB3BA", fontFamily: "Noto Sans KR" }}
                    >
                        지도를 불러오는 중...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F6F7F8" }}>
            <Navigation />

            {/* 날짜 필터 및 정보 패널 */}
            <div
                className="bg-white"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.04)" }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <h2
                                className="text-2xl font-semibold"
                                style={{
                                    color: "#2F3437",
                                    fontFamily: "Noto Sans KR",
                                }}
                            >
                                동선 지도
                            </h2>
                            {routePoints.length > 0 && (
                                <div className="text-sm text-text-light">
                                    총 {routePoints.length}개 일정
                                </div>
                            )}
                        </div>

                        {availableDates.length > 0 && (
                            <div className="flex items-center space-x-3">
                                <label className="text-sm font-medium text-text">
                                    날짜 선택:
                                </label>
                                <Select
                                    options={dateOptions}
                                    value={selectedDate}
                                    onChange={(e) =>
                                        setSelectedDate(e.target.value)
                                    }
                                    placeholder="날짜를 선택하세요"
                                    className="min-w-[200px]"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 지도 영역 */}
            <div className="relative h-[calc(100vh-128px)]">
                <MapContainer
                    center={[center.lat, center.lng]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* 현재 위치 마커 */}
                    {userLocation && (
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={L.divIcon({
                                className: "current-location-marker",
                                html: '<div style="background: #4C8BF5; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(76, 139, 245, 0.5);"></div>',
                                iconSize: [18, 18],
                                iconAnchor: [9, 9],
                            })}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-medium text-sm">
                                        현재 위치
                                    </h3>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* 일정 마커들 */}
                    {routePoints.map((point, index) => (
                        <Marker
                            key={point.schedule.id}
                            position={[point.lat, point.lng]}
                            icon={L.divIcon({
                                className: "schedule-marker",
                                html: `<div style="background: #E94B4B; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${
                                    index + 1
                                }</div>`,
                                iconSize: [28, 28],
                                iconAnchor: [14, 14],
                            })}
                        >
                            <Popup>
                                <div className="p-3 min-w-[200px]">
                                    <h3 className="font-semibold text-text mb-2">
                                        {point.schedule.title}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-text-light">
                                            📍 {point.schedule.location?.name}
                                        </p>
                                        <p className="text-text-light">
                                            🕐{" "}
                                            {new Date(
                                                point.schedule.start_time
                                            ).toLocaleTimeString("ko-KR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}{" "}
                                            -{" "}
                                            {new Date(
                                                point.schedule.end_time
                                            ).toLocaleTimeString("ko-KR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        {point.schedule.description && (
                                            <p className="text-text-light mt-2">
                                                {point.schedule.description}
                                            </p>
                                        )}
                                        {userLocation && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-text-light">
                                                    현재 위치에서 약{" "}
                                                    {calculateDistance(
                                                        userLocation.lat,
                                                        userLocation.lng,
                                                        point.lat,
                                                        point.lng
                                                    ).toFixed(1)}
                                                    km
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* 동선 폴리라인 */}
                    {routePoints.length > 1 && (
                        <Polyline
                            positions={routePoints.map((point) => [
                                point.lat,
                                point.lng,
                            ])}
                            color="#4C8BF5"
                            weight={4}
                            opacity={0.7}
                            dashArray="10, 10"
                        />
                    )}
                </MapContainer>

                {/* 하단 일정 정보 카드 (모바일용) */}
                {routePoints.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-10">
                        <Card variant="elevated">
                            <CardContent className="p-4">
                                <h3 className="font-medium text-text mb-3">
                                    {formatDateOption(selectedDate)} 일정
                                </h3>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {routePoints.map((point, index) => (
                                        <div
                                            key={point.schedule.id}
                                            className="flex items-center space-x-3"
                                        >
                                            <div className="w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-text truncate">
                                                    {point.schedule.title}
                                                </p>
                                                <p className="text-xs text-text-light">
                                                    {new Date(
                                                        point.schedule.start_time
                                                    ).toLocaleTimeString(
                                                        "ko-KR",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 일정이 없을 때 */}
                {!loading && routePoints.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🗺️</div>
                            <h3 className="text-lg font-medium text-text mb-2">
                                표시할 일정이 없습니다
                            </h3>
                            <p className="text-text-light mb-4">
                                캘린더에서 일정을 추가하거나 다른 날짜를
                                선택해보세요
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => navigate("/schedule")}
                            >
                                캘린더로 이동
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
