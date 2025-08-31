import React from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    children: React.ReactNode;
}

const buttonVariants = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary:
        "bg-secondary text-text hover:bg-secondary-dark focus:ring-secondary",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline:
        "border border-primary text-primary bg-transparent hover:bg-primary hover:text-white focus:ring-primary",
    ghost: "text-primary bg-transparent hover:bg-primary-light hover:bg-opacity-10 focus:ring-primary",
};

const buttonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
};

export function Button({
    className,
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    children,
    ...props
}: ButtonProps) {
    const baseClasses =
        "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    return (
        <button
            className={cn(
                baseClasses,
                buttonVariants[variant],
                buttonSizes[size],
                className
            )}
            disabled={disabled || loading}
            aria-label={loading ? "로딩 중..." : undefined}
            {...props}
        >
            {loading && (
                <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}

export default Button;
