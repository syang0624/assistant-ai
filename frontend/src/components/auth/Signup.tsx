import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { SignupCredentials } from "../../types/auth";

// 지역구 데이터 구조 수정
const DISTRICT_DATA = {
    군포시: {
        "제1선거구 (군포1동, 산본1동, 금정동)": [
            "군포1동",
            "산본1동",
            "금정동",
        ],
    },
    서대문구: {
        제1선거구: {
            "가선거구 (천연동, 북아현동, 충현동, 신촌동)": [
                "천연동",
                "북아현동",
                "충현동",
                "신촌동",
            ],
        },
    },
};

interface SignupProps {
    onSwitchToLogin: () => void; // 로그인으로 전환하는 함수 추가
}

export default function Signup({ onSwitchToLogin }: SignupProps) {
    const [formData, setFormData] = useState<SignupCredentials>({
        email: "",
        password: "",
        name: "",
        district: "",
        activity_level: "medium",
    });

    // 지역 선택 상태 수정
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [selectedSubDistrict, setSelectedSubDistrict] = useState<string>("");

    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { signup } = useAuth();

    // 지역 선택 핸들러
    const handleCityChange = (city: string) => {
        setSelectedCity(city);
        setSelectedDistrict("");
        setSelectedSubDistrict("");
        setFormData({ ...formData, district: "" });
    };

    const handleDistrictChange = (district: string) => {
        setSelectedDistrict(district);
        setSelectedSubDistrict("");
        if (selectedCity === "군포시") {
            setFormData({
                ...formData,
                district: `${selectedCity} ${district}`,
            });
        }
    };

    const handleSubDistrictChange = (subDistrict: string) => {
        setSelectedSubDistrict(subDistrict);
        setFormData({
            ...formData,
            district: `${selectedCity} ${selectedDistrict} ${subDistrict}`,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        console.log("Signup data:", formData); // 데이터 확인용 로그

        try {
            await signup(formData);
            navigate("/schedule");
        } catch (err: any) {
            setError(err.message || "회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                {/* 기존 헤더 부분 유지 */}
                <div>
                    <h2 className="text-center text-3xl font-bold text-text">
                        회원가입
                    </h2>
                    <p className="mt-2 text-center text-sm text-text-light">
                        Assistant AI와 함께 시작하세요
                    </p>
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-text"
                            >
                                이름
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-secondary placeholder-secondary text-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-text"
                            >
                                이메일
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-secondary placeholder-secondary text-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-text"
                            >
                                비밀번호
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-secondary placeholder-secondary text-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* 지역구 선택 부분 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text">
                                    시/구 선택
                                </label>
                                <select
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                    value={selectedCity}
                                    onChange={(e) =>
                                        handleCityChange(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">시/구를 선택하세요</option>
                                    {Object.keys(DISTRICT_DATA).map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCity && (
                                <div>
                                    <label className="block text-sm font-medium text-text">
                                        선거구 선택
                                    </label>
                                    <select
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                        value={selectedDistrict}
                                        onChange={(e) =>
                                            handleDistrictChange(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            선거구를 선택하세요
                                        </option>
                                        {Object.keys(
                                            DISTRICT_DATA[selectedCity]
                                        ).map((district) => (
                                            <option
                                                key={district}
                                                value={district}
                                            >
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedCity === "서대문구" &&
                                selectedDistrict && (
                                    <div>
                                        <label className="block text-sm font-medium text-text">
                                            선거구 분류
                                        </label>
                                        <select
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                            value={selectedSubDistrict}
                                            onChange={(e) =>
                                                handleSubDistrictChange(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        >
                                            <option value="">
                                                선거구 분류를 선택하세요
                                            </option>
                                            {Object.keys(
                                                DISTRICT_DATA[selectedCity][
                                                    selectedDistrict
                                                ]
                                            ).map((subDistrict) => (
                                                <option
                                                    key={subDistrict}
                                                    value={subDistrict}
                                                >
                                                    {subDistrict}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                        </div>

                        {/* 활동 강도 선택 */}
                        <div>
                            <label
                                htmlFor="activity_level"
                                className="block text-sm font-medium text-text"
                            >
                                활동 강도
                            </label>
                            <select
                                id="activity_level"
                                name="activity_level"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                value={formData.activity_level}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        activity_level: e.target.value,
                                    })
                                }
                            >
                                <option value="easy">
                                    쉬움 - 하루 3-4시간 활동
                                </option>
                                <option value="medium">
                                    보통 - 하루 5-6시간 활동
                                </option>
                                <option value="hard">
                                    어려움 - 하루 7-8시간 활동
                                </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            가입하기
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button
                        onClick={onSwitchToLogin}
                        className="text-sm text-primary hover:text-primary-dark"
                    >
                        이미 계정이 있으신가요? 로그인하기
                    </button>
                </div>
            </div>
        </div>
    );
}
