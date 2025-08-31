import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    placeholder?: string;
    options: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            placeholder,
            options,
            id,
            ...props
        },
        ref
    ) => {
        const selectId =
            id || `select-${Math.random().toString(36).substr(2, 9)}`;
        const hasError = !!error;

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-text"
                    >
                        {label}
                        {props.required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                )}

                <select
                    id={selectId}
                    ref={ref}
                    className={cn(
                        "block w-full px-3 py-2 border rounded-md text-text",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                        "disabled:bg-gray-50 disabled:text-gray-500",
                        "transition-colors duration-200",
                        "appearance-none bg-white",
                        "bg-[url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10",
                        hasError
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-secondary",
                        className
                    )}
                    aria-invalid={hasError}
                    aria-describedby={
                        error
                            ? `${selectId}-error`
                            : helperText
                            ? `${selectId}-helper`
                            : undefined
                    }
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {error && (
                    <p
                        id={`${selectId}-error`}
                        className="text-sm text-red-600"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p
                        id={`${selectId}-helper`}
                        className="text-sm text-text-light"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";

export { Select, type SelectOption };
export default Select;
