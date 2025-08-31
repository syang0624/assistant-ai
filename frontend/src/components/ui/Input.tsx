import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            startIcon,
            endIcon,
            type = "text",
            id,
            ...props
        },
        ref
    ) => {
        const inputId =
            id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const hasError = !!error;

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text"
                    >
                        {label}
                        {props.required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {startIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-secondary">{startIcon}</span>
                        </div>
                    )}

                    <input
                        type={type}
                        id={inputId}
                        ref={ref}
                        className={cn(
                            "block w-full px-3 py-2 border rounded-md text-text placeholder-secondary",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                            "disabled:bg-gray-50 disabled:text-gray-500",
                            "transition-colors duration-200",
                            hasError
                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                : "border-secondary",
                            startIcon && "pl-10",
                            endIcon && "pr-10",
                            className
                        )}
                        aria-invalid={hasError}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : helperText
                                ? `${inputId}-helper`
                                : undefined
                        }
                        {...props}
                    />

                    {endIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <span className="text-secondary">{endIcon}</span>
                        </div>
                    )}
                </div>

                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="text-sm text-red-600"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p
                        id={`${inputId}-helper`}
                        className="text-sm text-text-light"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
export default Input;
