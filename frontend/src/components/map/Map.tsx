import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Leaflet 기본 아이콘 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/marker-icon-2x.png",
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
});

interface Location {
    id: string;
    name: string;
    lat: number;
    lng: number;
    visitTime?: string;
}

export default function Map() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const [locations] = useState<Location[]>([
        // 예시 데이터 - 나중에 API로 대체
        {
            id: "1",
            name: "군포시청",
            lat: 37.3614,
            lng: 126.937,
            visitTime: "10:00",
        },
        {
            id: "2",
            name: "산본역",
            lat: 37.3579,
            lng: 126.933,
            visitTime: "11:30",
        },
    ]);

    const [center] = useState({ lat: 37.3614, lng: 126.937 }); // 군포시 중심

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">
                                    Assistant AI
                                </h1>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a
                                    href="/schedule"
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    일정
                                </a>
                                <a
                                    href="/map"
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    지도
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-sm text-gray-700 mr-4">
                                    {user?.name}님
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="h-[calc(100vh-64px)]">
                {" "}
                {/* 네비게이션 바 높이 제외 */}
                <MapContainer
                    center={[center.lat, center.lng]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {locations.map((location) => (
                        <Marker
                            key={location.id}
                            position={[location.lat, location.lng]}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold">
                                        {location.name}
                                    </h3>
                                    {location.visitTime && (
                                        <p className="text-sm text-text-light">
                                            방문 예정: {location.visitTime}
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
