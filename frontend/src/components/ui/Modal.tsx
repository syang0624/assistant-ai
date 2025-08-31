import React, { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    closeOnOverlay?: boolean;
    closeOnEscape?: boolean;
    children: React.ReactNode;
    className?: string;
}

interface ModalHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

const modalSizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full",
};

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    size = "md",
    closeOnOverlay = true,
    closeOnEscape = true,
    children,
    className,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            // 현재 포커스된 요소 저장
            previousFocusRef.current = document.activeElement as HTMLElement;

            // 모달에 포커스 이동
            if (modalRef.current) {
                modalRef.current.focus();
            }

            // 배경 스크롤 방지
            document.body.style.overflow = "hidden";
        } else {
            // 배경 스크롤 복원
            document.body.style.overflow = "unset";

            // 이전 포커스 복원
            if (previousFocusRef.current) {
                previousFocusRef.current.focus();
            }
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        if (!closeOnEscape) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    if (!isOpen) return null;

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlay && event.target === event.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // 탭 트랩 구현
        if (event.key === "Tab") {
            const modal = modalRef.current;
            if (!modal) return;

            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[
                focusableElements.length - 1
            ] as HTMLElement;

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    event.preventDefault();
                }
            }
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
            role="dialog"
            aria-modal="true"
        >
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

            {/* Modal */}
            <div
                ref={modalRef}
                className={cn(
                    "relative bg-white rounded-lg shadow-xl w-full",
                    modalSizes[size],
                    "max-h-[90vh] overflow-hidden",
                    "focus:outline-none",
                    className
                )}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div>
                            {title && (
                                <h2
                                    id="modal-title"
                                    className="text-lg font-semibold text-text"
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p
                                    id="modal-description"
                                    className="mt-1 text-sm text-text-light"
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="모달 닫기"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
    return (
        <div className={cn("px-6 py-4 border-b border-gray-200", className)}>
            {children}
        </div>
    );
}

export function ModalBody({ children, className }: ModalBodyProps) {
    return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div
            className={cn(
                "px-6 py-4 border-t border-gray-200 bg-gray-50",
                "flex items-center justify-end space-x-3",
                className
            )}
        >
            {children}
        </div>
    );
}

export default Modal;
