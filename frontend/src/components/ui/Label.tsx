import React from "react";
import { cn } from "../../utils/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
    children: React.ReactNode;
}

export function Label({ className, required, children, ...props }: LabelProps) {
    return (
        <label
            className={cn("block text-sm font-medium text-text", className)}
            {...props}
        >
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
}

export default Label;
