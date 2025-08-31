import React from "react";
import { cn } from "../../utils/cn";

interface SkipLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
    return (
        <a
            href={href}
            className={cn(
                // 기본적으로 화면에서 숨김
                "sr-only",
                // 포커스시 표시
                "focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
                "focus:z-50 focus:px-4 focus:py-2",
                "focus:bg-primary focus:text-white focus:rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                "transition-all duration-200",
                className
            )}
        >
            {children}
        </a>
    );
}

export default SkipLink;
