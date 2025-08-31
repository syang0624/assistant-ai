import { useState } from "react";
import { optimizationAPI } from "../../utils/optimizationApi";
import { schedulesAPI, locationsAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import type { TimeSlot, ScheduleItem } from "../../types/optimization";

interface Props {
    events: Array<{
        start: string;
        end: string;
    }>;
    onScheduleAdded: () => void;
}

export default function AIScheduleSuggestions({
    events,
    onScheduleAdded,
}: Props) {
    const { user } = useAuth();
    const [aiSuggestions, setAiSuggestions] = useState<ScheduleItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 현재 주의 빈 시간대 수집 (오전 9시 ~ 오후 6시)
    const getEmptyTimeSlots = (): TimeSlot[] => {
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // 일요일

        const emptySlots: TimeSlot[] = [];

        // 3주일 동안 각 날짜의 빈 시간대 분석 (더 넓은 분산을 위해)
        for (let i = 0; i < 21; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);

            // 해당 날짜의 일정들 필터링
            const dayEvents = events.filter((event) => {
                const eventDate = new Date(event.start);
                return eventDate.toDateString() === currentDay.toDateString();
            });

            // 오전 5시 ~ 오후 10시를 2시간 단위로 분석 (여유 시간 확보)
            const startHour = 5;
            const endHour = 22;
            const hourInterval = 2; // 2시간 간격으로 여유 확보

            for (let hour = startHour; hour < endHour; hour += hourInterval) {
                const slotStart = new Date(currentDay);
                slotStart.setHours(hour, 0, 0, 0);
                const slotEnd = new Date(currentDay);
                slotEnd.setHours(hour + hourInterval, 0, 0, 0);

                // 현재 시간보다 이전인 경우 완전 제외 (엄격한 검증)
                // 현재 시간에서 2시간 여유를 두고 필터링 (준비 시간 확보)
                const minimumTime = new Date(
                    currentDate.getTime() + 2 * 60 * 60 * 1000
                ); // 2시간 후
                if (slotStart.getTime() <= minimumTime.getTime()) {
                    console.log(
                        `❌ 과거/너무 가까운 시간 제외: ${slotStart.toLocaleString(
                            "ko-KR"
                        )} (최소 요구 시간: ${minimumTime.toLocaleString(
                            "ko-KR"
                        )})`
                    );
                    continue;
                }

                console.log(
                    `✅ 유효한 시간대: ${slotStart.toLocaleString(
                        "ko-KR"
                    )} - ${slotEnd.toLocaleString("ko-KR")}`
                );

                // 해당 시간대에 겹치는 일정이 있는지 확인 (여유 시간 포함)
                const hasConflict = dayEvents.some((event) => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);

                    // 일정 전후로 30분 여유 시간 확보
                    const bufferTime = 30; // 30분
                    const bufferedSlotStart = new Date(
                        slotStart.getTime() - bufferTime * 60 * 1000
                    );
                    const bufferedSlotEnd = new Date(
                        slotEnd.getTime() + bufferTime * 60 * 1000
                    );

                    return !(
                        bufferedSlotEnd <= eventStart ||
                        bufferedSlotStart >= eventEnd
                    );
                });

                // 겹치는 일정이 없으면 빈 시간대로 추가
                if (!hasConflict) {
                    // 날짜와 요일을 함께 표시
                    const month = currentDay.getMonth() + 1;
                    const date = currentDay.getDate();
                    const dayName = currentDay.toLocaleDateString("ko-KR", {
                        weekday: "long",
                    });
                    const dateWithDay = `${month}월 ${date}일 (${dayName})`;

                    emptySlots.push({
                        start: slotStart.toISOString().slice(0, -1), // "2025-09-01T07:00:00" 형식
                        end: slotEnd.toISOString().slice(0, -1),
                        day: dateWithDay,
                    });
                }
            }
        }

        return emptySlots;
    };

    // AI 일정 제안 요청
    const requestAISuggestions = async () => {
        if (!user?.district) {
            alert("지역구 정보가 필요합니다. 프로필을 먼저 설정해주세요.");
            return;
        }

        const emptySlots = getEmptyTimeSlots();
        if (emptySlots.length === 0) {
            alert("현재 주에 빈 시간대가 없습니다.");
            return;
        }

        setIsLoading(true);

        try {
            // AI 제안 요청을 위한 데이터 준비
            const requestData = {
                empty_time_slots: emptySlots,
                current_week_start: new Date().toISOString(),
            };

            // AI API 호출하여 제안 받기
            const result = await optimizationAPI.suggestSchedules(requestData);

            if (
                result.success &&
                result.suggestions &&
                result.suggestions.length > 0
            ) {
                setAiSuggestions(result.suggestions);
                setShowSuggestions(true);

                // AI 제안을 받은 후 즉시 캘린더 새로고침
                onScheduleAdded();

                // 성공 메시지 표시
                alert(
                    `AI가 ${result.suggestions.length}개의 일정을 제안했습니다!`
                );
            } else {
                alert("AI가 제안할 수 있는 일정이 없습니다.");
            }
        } catch (error: unknown) {
            console.error("AI 제안 요청 실패:", error);
            alert("AI 일정 제안을 받는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // AI 제안 수락
    const acceptSuggestion = async (suggestion: ScheduleItem) => {
        if (!user?.district) {
            alert("지역구 정보가 필요합니다.");
            return;
        }

        try {
            // 먼저 장소 생성
            const locationResponse = await locationsAPI.create({
                name: suggestion.location,
                address: suggestion.address,
                district: user.district,
            });

            // 일정 생성 (생성된 장소 ID 사용)
            await schedulesAPI.create({
                title: suggestion.title,
                start_time: suggestion.start_time,
                end_time: suggestion.end_time,
                description: suggestion.description || "",
                location_id: locationResponse.id,
            });

            // 제안 목록에서 제거
            setAiSuggestions((prev) => prev.filter((s) => s !== suggestion));

            // 일정 목록 새로고침
            onScheduleAdded();

            // 모든 제안이 처리되면 제안 모달 닫기
            if (aiSuggestions.length === 1) {
                setShowSuggestions(false);
            }
        } catch (error: unknown) {
            console.error("일정 생성 실패:", error);
            alert("일정 생성에 실패했습니다.");
        }
    };

    // AI 제안 거절
    const rejectSuggestion = (suggestion: ScheduleItem) => {
        setAiSuggestions((prev) => prev.filter((s) => s !== suggestion));

        // 모든 제안이 처리되면 제안 모달 닫기
        if (aiSuggestions.length === 1) {
            setShowSuggestions(false);
        }
    };

    return (
        <>
            {/* AI 일정 제안 버튼 */}
            <button
                onClick={requestAISuggestions}
                disabled={isLoading || !user?.district}
                className="px-4 py-2 text-white rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    backgroundColor:
                        isLoading || !user?.district ? "#ADB3BA" : "#4C8BF5",
                    fontFamily: "Noto Sans KR",
                }}
                onMouseEnter={(e) => {
                    if (!isLoading && user?.district) {
                        e.currentTarget.style.backgroundColor = "#3B82F6";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isLoading && user?.district) {
                        e.currentTarget.style.backgroundColor = "#4C8BF5";
                    }
                }}
            >
                {isLoading ? (
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
                        AI 분석 중...
                    </div>
                ) : !user?.district ? (
                    "지역구 설정 필요"
                ) : (
                    "🤖 AI 일정 제안 받기"
                )}
            </button>

            {/* AI 제안 모달 */}
            {showSuggestions && aiSuggestions.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className="bg-white rounded-md p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                        style={{ boxShadow: "0px 4px 8px rgba(0,0,0,0.08)" }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3
                                className="text-xl font-semibold"
                                style={{
                                    color: "#2F3437",
                                    fontFamily: "Noto Sans KR",
                                }}
                            >
                                🤖 AI 일정 제안
                            </h3>
                            <button
                                onClick={() => setShowSuggestions(false)}
                                className="p-1 rounded-md transition-colors duration-200"
                                style={{ color: "#ADB3BA" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "#2F3437")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "#ADB3BA")
                                }
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {aiSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="rounded-md p-4"
                                    style={{
                                        border: "1px solid #ADB3BA",
                                        backgroundColor: "#F6F7F8",
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4
                                            className="font-medium"
                                            style={{
                                                color: "#2F3437",
                                                fontFamily: "Noto Sans KR",
                                            }}
                                        >
                                            {suggestion.title}
                                        </h4>
                                        <span
                                            className="text-xs px-2 py-1 rounded text-white font-medium"
                                            style={{
                                                backgroundColor: "#4C8BF5",
                                                fontFamily: "Noto Sans KR",
                                            }}
                                        >
                                            우선순위 {suggestion.priority}
                                        </span>
                                    </div>
                                    <p
                                        className="text-sm mb-3"
                                        style={{
                                            color: "#ADB3BA",
                                            fontFamily: "Noto Sans KR",
                                        }}
                                    >
                                        {suggestion.description}
                                    </p>
                                    <div
                                        className="text-sm mb-4 font-medium"
                                        style={{
                                            color: "#2F3437",
                                            fontFamily: "Noto Sans KR",
                                        }}
                                    >
                                        🗓️ {suggestion.day} 🕐{" "}
                                        {new Date(
                                            suggestion.start_time
                                        ).toLocaleTimeString("ko-KR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(
                                            suggestion.end_time
                                        ).toLocaleTimeString("ko-KR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() =>
                                                acceptSuggestion(suggestion)
                                            }
                                            className="flex-1 px-4 py-2 text-white text-sm font-medium rounded-md transition-colors duration-200"
                                            style={{
                                                backgroundColor: "#4C8BF5",
                                                fontFamily: "Noto Sans KR",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    "#3B82F6")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    "#4C8BF5")
                                            }
                                        >
                                            ✅ 수락
                                        </button>
                                        <button
                                            onClick={() =>
                                                rejectSuggestion(suggestion)
                                            }
                                            className="flex-1 px-4 py-2 text-white text-sm font-medium rounded-md transition-colors duration-200"
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
                                            ❌ 거절
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
