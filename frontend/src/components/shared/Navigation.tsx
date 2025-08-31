import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navigation() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav
            className="bg-white"
            style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.04)" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="flex items-center space-x-2">
                                {/* Logo Icon */}
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{
                                        color: "#4C8BF5",
                                        strokeWidth: 1.5,
                                    }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
                                    />
                                </svg>
                                <h1
                                    className="text-xl font-semibold"
                                    style={{
                                        color: "#2F3437",
                                        fontFamily: "Noto Sans KR",
                                    }}
                                >
                                    Assistant AI
                                </h1>
                            </div>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <a
                                href="/schedule"
                                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                                style={{
                                    borderColor:
                                        window.location.pathname ===
                                            "/schedule" ||
                                        window.location.pathname === "/"
                                            ? "#4C8BF5"
                                            : "transparent",
                                    color:
                                        window.location.pathname ===
                                            "/schedule" ||
                                        window.location.pathname === "/"
                                            ? "#4C8BF5"
                                            : "#ADB3BA",
                                    fontFamily: "Noto Sans KR",
                                }}
                            >
                                캘린더
                            </a>
                            <a
                                href="/map"
                                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                                style={{
                                    borderColor:
                                        window.location.pathname === "/map"
                                            ? "#4C8BF5"
                                            : "transparent",
                                    color:
                                        window.location.pathname === "/map"
                                            ? "#4C8BF5"
                                            : "#ADB3BA",
                                    fontFamily: "Noto Sans KR",
                                }}
                            >
                                지도
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <span
                                className="text-sm font-medium"
                                style={{
                                    color: "#2F3437",
                                    fontFamily: "Noto Sans KR",
                                }}
                            >
                                {user?.name}님
                            </span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    backgroundColor: "#E94B4B",
                                    fontFamily: "Noto Sans KR",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        "#dc2626")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        "#E94B4B")
                                }
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
