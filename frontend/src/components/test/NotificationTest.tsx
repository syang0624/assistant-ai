import React from "react";
import { useNotification } from "../../contexts/NotificationContext";

export default function NotificationTest() {
    const { showToast, showReoptimizationAlert } = useNotification();

    const testSuccessToast = () => {
        showToast({
            title: "성공",
            message: "작업이 성공적으로 완료되었습니다.",
            type: "success",
            duration: 3000,
        });
    };

    const testErrorToast = () => {
        showToast({
            title: "오류",
            message: "작업 중 오류가 발생했습니다.",
            type: "error",
            duration: 5000,
        });
    };

    const testReoptimizationAlert = () => {
        showReoptimizationAlert(15, "군포시청");
    };

    const testActionToast = () => {
        showToast({
            title: "확인 필요",
            message: "작업을 진행하시겠습니까?",
            type: "warning",
            duration: 0, // 수동으로 닫기까지 유지
            action: {
                label: "확인",
                onClick: () => {
                    showToast({
                        message: "작업이 실행되었습니다.",
                        type: "info",
                        duration: 3000,
                    });
                },
            },
        });
    };

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold">알림 시스템 테스트</h2>
            <div className="space-y-2">
                <button
                    onClick={testSuccessToast}
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    성공 토스트 테스트
                </button>
                <button
                    onClick={testErrorToast}
                    className="block w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    오류 토스트 테스트
                </button>
                <button
                    onClick={testActionToast}
                    className="block w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                    액션 버튼 토스트 테스트
                </button>
                <button
                    onClick={testReoptimizationAlert}
                    className="block w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                    재최적화 알림 테스트 (15분 지연)
                </button>
            </div>
        </div>
    );
}
