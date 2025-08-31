import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import Navigation from "../shared/Navigation";
import ScheduleModal from "./ScheduleModal";
import AIScheduleSuggestions from "./AIScheduleSuggestions";
import { schedulesAPI } from "../../utils/api";
import { useNotification } from "../../contexts/NotificationContext";

type FCEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: {
        description?: string;
        location_id: string;
        location_name?: string;
        location_address?: string;
    };
};

export default function Schedule() {
    const calendarRef = useRef<FullCalendar | null>(null);
    const [events, setEvents] = useState<FCEvent[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<{
        id?: string;
        title?: string;
        start_time: string;
        end_time: string;
        description?: string;
        location_id?: string;
        location_name?: string;
        location_address?: string;
    } | null>(null);
    const [currentView, setCurrentView] = useState<"month" | "week">("week");
    const { showReoptimizationAlert } = useNotification();

    const load = async () => {
        const list = await schedulesAPI.list();
        const mapped: FCEvent[] = (list || []).map(
            (s: {
                id: string;
                title: string;
                start_time: string;
                end_time: string;
                description?: string;
                location?: {
                    id: string;
                    name: string;
                    address: string;
                };
            }) => ({
                id: s.id,
                title: s.title,
                start: s.start_time,
                end: s.end_time,
                extendedProps: {
                    description: s.description,
                    location_id: s.location?.id,
                    location_name: s.location?.name,
                    location_address: s.location?.address,
                },
            })
        );
        setEvents(mapped);
    };

    useEffect(() => {
        load();
    }, []);

    // 재최적화 완료 시 캘린더 새로고침
    useEffect(() => {
        const handleReoptimization = () => {
            load(); // 일정 목록 다시 로드
        };

        window.addEventListener("scheduleReoptimized", handleReoptimization);

        return () => {
            window.removeEventListener(
                "scheduleReoptimized",
                handleReoptimization
            );
        };
    }, []);

    const handleDateClick = (arg: { date: Date }) => {
        // 클릭한 날짜를 한국 시간 기준으로 처리
        const clickedDate = arg.date;

        // 시작 시간은 클릭한 날짜의 오전 9시, 종료 시간은 오전 10시
        const startDate = new Date(clickedDate);
        startDate.setHours(9, 0, 0, 0);

        const endDate = new Date(clickedDate);
        endDate.setHours(10, 0, 0, 0);

        // 로컬 시간 형식으로 변환
        const formatDateTime = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setEditing({
            start_time: formatDateTime(startDate),
            end_time: formatDateTime(endDate),
        });
        setModalOpen(true);
    };

    const handleSelect = (arg: { start: Date; end: Date }) => {
        // 시간대 선택 시 해당 시간으로 일정 생성
        const startDate = new Date(arg.start);
        const endDate = new Date(arg.end);

        // 로컬 시간 형식으로 변환
        const formatDateTime = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setEditing({
            start_time: formatDateTime(startDate),
            end_time: formatDateTime(endDate),
        });
        setModalOpen(true);
    };

    const handleEventClick = (arg: {
        event: {
            id: string;
            title: string;
            start: Date | null;
            end: Date | null;
            extendedProps: {
                description?: string;
                location_id?: string;
                location_name?: string;
                location_address?: string;
            };
        };
    }) => {
        const e = arg.event;

        // 시간을 로컬 시간 형식으로 변환 (한국 시간 기준)
        const formatDateTime = (date: Date | null) => {
            if (!date) return "";

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setEditing({
            id: e.id,
            title: e.title,
            start_time: formatDateTime(e.start),
            end_time: formatDateTime(e.end),
            description: e.extendedProps?.description || "",
            location_id: e.extendedProps?.location_id || "",
            location_name: e.extendedProps?.location_name || "",
            location_address: e.extendedProps?.location_address || "",
        });
        setModalOpen(true);
    };

    const handleEventDropOrResize = async (arg: {
        event: { id: string; start: Date | null; end: Date | null };
    }) => {
        const e = arg.event;

        // 시간을 로컬 시간으로 저장 (UTC가 아닌 한국 시간 기준)
        const formatForAPI = (date: Date | null) => {
            if (!date) return undefined;

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const seconds = String(date.getSeconds()).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        await schedulesAPI.update(e.id, {
            start_time: formatForAPI(e.start),
            end_time: formatForAPI(e.end),
        });
        await load();
    };

    const handleDelete = async () => {
        if (!editing?.id) return;
        await schedulesAPI.delete(editing.id);
        setModalOpen(false);
        setEditing(null);
        await load();
    };

    const handleViewChange = (view: "month" | "week") => {
        setCurrentView(view);
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.changeView(
                view === "month" ? "dayGridMonth" : "timeGridWeek"
            );
        }
    };

    const handleCreateNew = () => {
        // 현재 날짜의 오전 9시로 새 일정 시작
        const now = new Date();
        const startDate = new Date(now);
        startDate.setHours(9, 0, 0, 0);

        const endDate = new Date(now);
        endDate.setHours(10, 0, 0, 0);

        // 로컬 시간 형식으로 변환
        const formatDateTime = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setEditing({
            start_time: formatDateTime(startDate),
            end_time: formatDateTime(endDate),
        });
        setModalOpen(true);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F6F7F8" }}>
            <Navigation />
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* 캘린더 영역 */}
                    <div
                        className="flex-1 bg-white rounded-md p-6"
                        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.04)" }}
                    >
                        {/* 헤더 영역 - 반응형 */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <h1
                                    className="text-2xl font-semibold"
                                    style={{
                                        color: "#2F3437",
                                        fontFamily: "Noto Sans KR",
                                    }}
                                >
                                    캘린더
                                </h1>

                                {/* 뷰 토글 버튼 */}
                                <div
                                    className="flex rounded-md p-1"
                                    style={{ backgroundColor: "#F6F7F8" }}
                                >
                                    <button
                                        onClick={() =>
                                            handleViewChange("month")
                                        }
                                        className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                                            currentView === "month"
                                                ? "text-white"
                                                : "hover:bg-white"
                                        }`}
                                        style={{
                                            backgroundColor:
                                                currentView === "month"
                                                    ? "#4C8BF5"
                                                    : "transparent",
                                            color:
                                                currentView === "month"
                                                    ? "#FFFFFF"
                                                    : "#ADB3BA",
                                            boxShadow:
                                                currentView === "month"
                                                    ? "0px 1px 2px rgba(0,0,0,0.04)"
                                                    : "none",
                                        }}
                                    >
                                        월간
                                    </button>
                                    <button
                                        onClick={() => handleViewChange("week")}
                                        className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                                            currentView === "week"
                                                ? "text-white"
                                                : "hover:bg-white"
                                        }`}
                                        style={{
                                            backgroundColor:
                                                currentView === "week"
                                                    ? "#4C8BF5"
                                                    : "transparent",
                                            color:
                                                currentView === "week"
                                                    ? "#FFFFFF"
                                                    : "#ADB3BA",
                                            boxShadow:
                                                currentView === "week"
                                                    ? "0px 1px 2px rgba(0,0,0,0.04)"
                                                    : "none",
                                        }}
                                    >
                                        주간
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
                                <AIScheduleSuggestions
                                    events={events}
                                    onScheduleAdded={load}
                                />
                                <button
                                    onClick={() =>
                                        showReoptimizationAlert(0, "수동 요청")
                                    }
                                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
                                    title="현재 일정을 재최적화합니다"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                    재최적화
                                </button>
                                <div
                                    className="text-sm hidden xl:block"
                                    style={{
                                        color: "#ADB3BA",
                                        fontFamily: "Noto Sans KR",
                                    }}
                                >
                                    일정을 클릭해 수정/삭제, 빈 칸 클릭해 추가,
                                    시간대 드래그로 해당 시간에 일정 생성
                                </div>
                            </div>
                        </div>
                        <div className="fc-custom-theme">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[
                                    dayGridPlugin,
                                    timeGridPlugin,
                                    interactionPlugin,
                                ]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "",
                                }}
                                locale={koLocale}
                                events={events}
                                selectable
                                editable
                                eventResizableFromStart
                                dateClick={handleDateClick}
                                select={handleSelect}
                                eventClick={handleEventClick}
                                eventDrop={handleEventDropOrResize}
                                eventResize={handleEventDropOrResize}
                                timeZone="local"
                                slotMinTime="00:00:00"
                                slotMaxTime="24:00:00"
                                slotDuration="00:30:00"
                                slotLabelInterval="01:00:00"
                                allDaySlot={false}
                                height="auto"
                                snapDuration="00:30:00"
                                unselectAuto={true}
                                selectMirror={true}
                                eventClassNames="custom-event"
                                eventContent={(eventInfo) => {
                                    const start = eventInfo.event.start;
                                    const end = eventInfo.event.end;

                                    // 현재 뷰가 월간인지 확인
                                    const isMonthView = currentView === "month";

                                    // 한국 시간으로 올바르게 표시
                                    const formatTime = (date: Date) => {
                                        // 단순히 로컬 시간으로 표시 (FullCalendar가 이미 올바른 시간을 제공)
                                        return date.toLocaleTimeString(
                                            "ko-KR",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: false,
                                            }
                                        );
                                    };

                                    const timeDisplay =
                                        start && end
                                            ? `${formatTime(
                                                  start
                                              )}~${formatTime(end)}`
                                            : "";

                                    return (
                                        <div className="p-1">
                                            <div className="font-medium text-sm truncate">
                                                {eventInfo.event.title}
                                            </div>
                                            {timeDisplay && (
                                                <div className="text-xs opacity-80 truncate">
                                                    🕐 {timeDisplay}
                                                </div>
                                            )}
                                            {/* 주간 뷰에서만 위치 정보 표시 (공간 절약) */}
                                            {!isMonthView &&
                                                eventInfo.event.extendedProps
                                                    .location_name && (
                                                    <div className="text-xs opacity-90 truncate">
                                                        📍{" "}
                                                        {
                                                            eventInfo.event
                                                                .extendedProps
                                                                .location_name
                                                        }
                                                    </div>
                                                )}
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>

                    {/* 모달 영역 - 반응형 */}
                    {modalOpen && (
                        <div className="w-full lg:w-96 h-fit lg:sticky lg:top-6">
                            <ScheduleModal
                                isOpen={modalOpen}
                                onClose={() => {
                                    setModalOpen(false);
                                    setEditing(null);
                                }}
                                initial={editing || undefined}
                                onSaved={load}
                            />
                        </div>
                    )}
                </div>

                {/* FAB (Floating Action Button) - 새 일정 생성 - 반응형 */}
                {!modalOpen && (
                    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                        <button
                            onClick={handleCreateNew}
                            className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                            title="새 일정 추가"
                        >
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* 삭제 버튼은 모달이 열려있을 때만 표시 - 반응형 */}
                {editing?.id && modalOpen && (
                    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                        <button
                            className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg text-sm sm:text-base"
                            onClick={handleDelete}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
