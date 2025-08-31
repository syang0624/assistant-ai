import { useEffect, useMemo, useState } from "react";
import { locationsAPI, schedulesAPI } from "../../utils/api";
import { optimizationAPI } from "../../utils/optimizationApi";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    initial?: {
        id?: string;
        title?: string;
        start_time: string;
        end_time: string;
        description?: string;
        location_id?: string;
        location_name?: string;
        location_address?: string;
    };
    onSaved: () => void;
};

// 한국 시간 기준으로 기본 시간 설정 (오전 9시 ~ 10시)
function getDefaultKoreanTime(): string {
    const now = new Date();
    // 한국 시간 오프셋 적용 (UTC+9)
    const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    koreanTime.setUTCHours(9, 0, 0, 0);

    // 로컬 시간 형식으로 반환 (YYYY-MM-DDTHH:MM)
    const year = koreanTime.getUTCFullYear();
    const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(koreanTime.getUTCDate()).padStart(2, "0");
    const hours = String(koreanTime.getUTCHours()).padStart(2, "0");
    const minutes = String(koreanTime.getUTCMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultKoreanTimePlusOneHour(): string {
    const now = new Date();
    // 한국 시간 오프셋 적용 (UTC+9)
    const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    koreanTime.setUTCHours(10, 0, 0, 0);

    // 로컬 시간 형식으로 반환 (YYYY-MM-DDTHH:MM)
    const year = koreanTime.getUTCFullYear();
    const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(koreanTime.getUTCDate()).padStart(2, "0");
    const hours = String(koreanTime.getUTCHours()).padStart(2, "0");
    const minutes = String(koreanTime.getUTCMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ScheduleModal({
    isOpen,
    onClose,
    initial,
    onSaved,
}: Props) {
    const { user } = useAuth();
    const [title, setTitle] = useState(initial?.title || "");
    const [start, setStart] = useState(
        initial?.start_time || getDefaultKoreanTime()
    );
    const [end, setEnd] = useState(
        initial?.end_time || getDefaultKoreanTimePlusOneHour()
    );
    const [description, setDescription] = useState(initial?.description || "");
    const [locationId, setLocationId] = useState(initial?.location_id || "");
    const [locationName, setLocationName] = useState(
        initial?.location_name || ""
    );
    const [locationAddress, setLocationAddress] = useState(
        initial?.location_address || ""
    );
    const [locations, setLocations] = useState<
        Array<{
            id: string;
            name: string;
            address: string;
            district: string;
        }>
    >([]);
    const [error, setError] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const list = await locationsAPI.list(
                    user?.district || undefined
                );
                setLocations(list || []);
            } catch {
                setLocations([]);
            }
        })();
    }, [isOpen, user?.district]);

    useEffect(() => {
        if (initial) {
            setTitle(initial.title || "");
            setStart(initial.start_time || getDefaultKoreanTime());
            setEnd(initial.end_time || getDefaultKoreanTimePlusOneHour());
            setDescription(initial.description || "");
            setLocationId(initial.location_id || "");
            setLocationName(initial.location_name || "");
            setLocationAddress(initial.location_address || "");
        } else {
            // 새 일정 생성 시 기본값 설정
            setTitle("");
            setStart(getDefaultKoreanTime());
            setEnd(getDefaultKoreanTimePlusOneHour());
            setDescription("");
            setLocationId("");
            setLocationName("");
            setLocationAddress("");
        }
        setError("");
        setAiError("");
    }, [initial, isOpen]);

    const isEdit = useMemo(() => Boolean(initial?.id), [initial?.id]);

    const validate = () => {
        if (!title.trim()) return "제목을 입력하세요.";
        if (!start || !end) return "시간을 입력하세요.";
        if (new Date(start) >= new Date(end))
            return "끝 시간은 시작 시간보다 이후여야 합니다.";
        if (!locationId && (!locationName.trim() || !locationAddress.trim()))
            return "장소를 선택하거나 새 장소 정보를 입력하세요.";
        return "";
    };

    const handleSave = async () => {
        const v = validate();
        if (v) return setError(v);

        try {
            let finalLocationId = locationId;

            if (!finalLocationId) {
                const created = await locationsAPI.create({
                    name: locationName.trim(),
                    address: locationAddress.trim(),
                    district: user?.district || "",
                });
                finalLocationId = created.id;
            }

            // 시간 형식을 ISO 형식으로 변환 (초를 추가)
            const startISO = start + ":00";
            const endISO = end + ":00";

            if (isEdit && initial?.id) {
                await schedulesAPI.update(initial.id, {
                    title: title.trim(),
                    start_time: startISO,
                    end_time: endISO,
                    description: description.trim() || undefined,
                    location_id: finalLocationId,
                });
            } else {
                await schedulesAPI.create({
                    title: title.trim(),
                    start_time: startISO,
                    end_time: endISO,
                    description: description.trim() || undefined,
                    location_id: finalLocationId,
                });
            }
            onSaved();
            onClose();
        } catch (e: unknown) {
            const errorMessage =
                e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.";
            setError(errorMessage);
        }
    };

    const handleAIOptimization = async () => {
        if (!user?.district) {
            setAiError("지역구 정보가 필요합니다.");
            return;
        }

        setAiLoading(true);
        setAiError("");

        try {
            // AI 최적화 요청
            const request = {
                date: new Date(start).toISOString(),
                include_existing: false,
            };

            const result = await optimizationAPI.optimizeSchedule(request);

            if (
                result.success &&
                result.schedule &&
                result.schedule.length > 0
            ) {
                // 첫 번째 최적화된 일정을 현재 폼에 반영
                const optimizedSchedule = result.schedule[0];

                setTitle(optimizedSchedule.title || "AI 최적화 일정");
                setStart(
                    new Date(optimizedSchedule.start_time)
                        .toISOString()
                        .slice(0, 16)
                );
                setEnd(
                    new Date(optimizedSchedule.end_time)
                        .toISOString()
                        .slice(0, 16)
                );
                setDescription(optimizedSchedule.description || "");

                // 장소 정보 설정
                if (optimizedSchedule.location) {
                    setLocationName(optimizedSchedule.location);
                    setLocationAddress(optimizedSchedule.address || "");
                    setLocationId(""); // 새 장소로 설정
                }

                // 성공 메시지 표시
                setError(""); // 기존 오류 메시지 제거
            } else {
                setAiError("AI 최적화에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (e: unknown) {
            const errorMessage =
                e instanceof Error
                    ? e.message
                    : "AI 최적화 중 오류가 발생했습니다.";
            setAiError(errorMessage);
        } finally {
            setAiLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                    {isEdit ? "일정 편집" : "새 일정"}
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        제목 *
                    </label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 주민 간담회"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            시작 시간 *
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            종료 시간 *
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        기존 장소 선택
                    </label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                    >
                        <option value="">선택 안 함</option>
                        {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.name} ({l.address})
                            </option>
                        ))}
                    </select>
                </div>

                {!locationId && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                새 장소명 *
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={locationName}
                                onChange={(e) =>
                                    setLocationName(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                새 장소 주소 *
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={locationAddress}
                                onChange={(e) =>
                                    setLocationAddress(e.target.value)
                                }
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        설명
                    </label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="일정에 대한 추가 설명을 입력하세요"
                    />
                </div>

                {/* AI 최적화 버튼 - 새 일정 생성 시에만 표시 */}
                {!isEdit && (
                    <div className="pt-2">
                        <button
                            onClick={handleAIOptimization}
                            disabled={aiLoading}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-medium"
                        >
                            {aiLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    AI가 일정을 최적화하고 있습니다...
                                </div>
                            ) : (
                                "🤖 AI로 일정 완성"
                            )}
                        </button>

                        {aiError && (
                            <div className="mt-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                {aiError}
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                >
                    취소
                </button>
                <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    onClick={handleSave}
                >
                    {isEdit ? "수정" : "추가"}
                </button>
            </div>
        </div>
    );
}
