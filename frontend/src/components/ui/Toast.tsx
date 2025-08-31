import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

interface ToastProps {
    id: string;
    title?: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
    onClose: (id: string) => void;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const toastVariants = {
    success: {
        bg: "bg-success-50 border-success-200",
        text: "text-success-800",
        icon: (
            <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    error: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        icon: (
            <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    warning: {
        bg: "bg-warning-50 border-warning-200",
        text: "text-warning-800",
        icon: (
            <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    info: {
        bg: "bg-info-50 border-info-200",
        text: "text-info-800",
        icon: (
            <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
};

export function Toast({
    id,
    title,
    message,
    type = "info",
    duration = 5000,
    onClose,
    action,
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // 애니메이션을 위해 약간의 지연 후 표시
        const showTimer = setTimeout(() => setIsVisible(true), 100);

        // 자동 닫기
        if (duration > 0) {
            const hideTimer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }

        return () => clearTimeout(showTimer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300); // 애니메이션 시간
    };

    const variant = toastVariants[type];

    return (
        <div
            className={cn(
                "max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
                "transform transition-all duration-300 ease-in-out",
                variant.bg,
                isVisible && !isExiting
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
            )}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className={cn("flex-shrink-0", variant.text)}>
                        {variant.icon}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        {title && (
                            <p
                                className={cn(
                                    "text-sm font-medium",
                                    variant.text
                                )}
                            >
                                {title}
                            </p>
                        )}
                        <p
                            className={cn(
                                "text-sm",
                                variant.text,
                                title && "mt-1"
                            )}
                        >
                            {message}
                        </p>
                        {action && (
                            <div className="mt-3">
                                <button
                                    onClick={() => {
                                        action.onClick();
                                        handleClose();
                                    }}
                                    className={cn(
                                        "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium",
                                        "bg-primary text-white hover:bg-primary-dark",
                                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                                        "transition-colors duration-200"
                                    )}
                                >
                                    {action.label}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className={cn(
                                "rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2",
                                variant.text,
                                "hover:opacity-75"
                            )}
                            onClick={handleClose}
                            aria-label="알림 닫기"
                        >
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Toast Container Component
interface ToastContainerProps {
    toasts: (ToastProps & {
        action?: { label: string; onClick: () => void };
    })[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
}

export default Toast;
