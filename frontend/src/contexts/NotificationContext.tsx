import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { ToastContainer } from "../components/ui/Toast";
import { useAuth } from "./AuthContext";
import { schedulesAPI } from "../utils/api";
import { optimizationAPI } from "../utils/optimizationApi";

interface Toast {
    id: string;
    title?: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationContextType {
    showToast: (toast: Omit<Toast, "id">) => void;
    showReoptimizationAlert: (
        delayMinutes: number,
        currentLocation?: string
    ) => void;
    startScheduleMonitoring: () => void;
    stopScheduleMonitoring: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [monitoringInterval, setMonitoringInterval] =
        useState<NodeJS.Timeout | null>(null);
    const [isReoptimizing, setIsReoptimizing] = useState(false);
    const { user } = useAuth();

    const showToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const executeReoptimization = useCallback(
        async (delayMinutes: number, currentLocation?: string) => {
            if (isReoptimizing) return;

            setIsReoptimizing(true);
            showToast({
                title: "재최적화 진행 중",
                message: "AI가 남은 일정을 재조정하고 있습니다...",
                type: "info",
                duration: 0, // 수동으로 닫기까지 유지
            });

            try {
                await optimizationAPI.reoptimize({
                    delay_minutes: delayMinutes,
                    current_location: currentLocation || "현재 위치",
                });

                // 성공 알림
                showToast({
                    title: "재최적화 완료",
                    message:
                        "남은 일정이 성공적으로 조정되었습니다. 캘린더를 확인해보세요.",
                    type: "success",
                    duration: 5000,
                });

                // 캘린더 새로고침을 위한 이벤트 발생
                window.dispatchEvent(new CustomEvent("scheduleReoptimized"));
            } catch (error) {
                console.error("재최적화 실패:", error);
                showToast({
                    title: "재최적화 실패",
                    message:
                        "일정 재조정 중 오류가 발생했습니다. 다시 시도해주세요.",
                    type: "error",
                    duration: 5000,
                });
            } finally {
                setIsReoptimizing(false);
                // 로딩 토스트 제거
                setToasts((prev) =>
                    prev.filter(
                        (toast) =>
                            !(
                                toast.title === "재최적화 진행 중" &&
                                toast.type === "info"
                            )
                    )
                );
            }
        },
        [isReoptimizing, showToast]
    );

    const showReoptimizationAlert = useCallback(
        (delayMinutes: number, currentLocation?: string) => {
            if (isReoptimizing) return; // 이미 재최적화 중이면 중복 알림 방지

            showToast({
                title: `⏰ ${delayMinutes}분 지연 감지`,
                message: "일정이 지연되고 있습니다. 남은 일정을 재조정할까요?",
                type: "warning",
                duration: 10000, // 10초 동안 표시
                action: {
                    label: "재최적화 실행",
                    onClick: () =>
                        executeReoptimization(delayMinutes, currentLocation),
                },
            });
        },
        [executeReoptimization, isReoptimizing]
    );

    const checkScheduleDelay = useCallback(async () => {
        if (!user) return;

        try {
            const schedules = await schedulesAPI.list();
            const now = new Date();

            // 현재 진행 중이어야 할 일정 찾기
            const currentSchedule = schedules.find((schedule: any) => {
                const startTime = new Date(schedule.start_time);
                const endTime = new Date(schedule.end_time);
                return startTime <= now && now <= endTime;
            });

            if (currentSchedule) {
                const startTime = new Date(currentSchedule.start_time);
                const delayMinutes = Math.floor(
                    (now.getTime() - startTime.getTime()) / (1000 * 60)
                );

                // 5분 이상 지연 시 알림
                if (delayMinutes >= 5) {
                    showReoptimizationAlert(
                        delayMinutes,
                        currentSchedule.location?.name
                    );
                }
            }
        } catch (error) {
            console.error("일정 지연 체크 실패:", error);
        }
    }, [user, showReoptimizationAlert]);

    const startScheduleMonitoring = useCallback(() => {
        if (monitoringInterval) return; // 이미 모니터링 중

        // 1분마다 일정 지연 체크
        const interval = setInterval(checkScheduleDelay, 60000); // 60초
        setMonitoringInterval(interval);

        // 즉시 한 번 체크
        checkScheduleDelay();
    }, [checkScheduleDelay, monitoringInterval]);

    const stopScheduleMonitoring = useCallback(() => {
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            setMonitoringInterval(null);
        }
    }, [monitoringInterval]);

    // 컴포넌트 언마운트 시 인터벌 정리
    useEffect(() => {
        return () => {
            if (monitoringInterval) {
                clearInterval(monitoringInterval);
            }
        };
    }, [monitoringInterval]);

    // 사용자 로그인 상태에 따른 모니터링 시작/중지
    useEffect(() => {
        if (user) {
            startScheduleMonitoring();
        } else {
            stopScheduleMonitoring();
        }

        return () => stopScheduleMonitoring();
    }, [user, startScheduleMonitoring, stopScheduleMonitoring]);

    const value: NotificationContextType = {
        showToast,
        showReoptimizationAlert,
        startScheduleMonitoring,
        stopScheduleMonitoring,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
}
