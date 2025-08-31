import React from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "outlined" | "elevated";
    padding?: "none" | "sm" | "md" | "lg";
    children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface CardDescriptionProps
    extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
}

const cardVariants = {
    default: "bg-white border border-gray-200",
    outlined: "bg-white border-2 border-gray-200",
    elevated: "bg-white shadow-lg border border-gray-100",
};

const cardPadding = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
};

export function Card({
    className,
    variant = "default",
    padding = "md",
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-lg",
                cardVariants[variant],
                cardPadding[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
    return (
        <div className={cn("flex flex-col space-y-1.5", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({
    className,
    children,
    as: Component = "h3",
    ...props
}: CardTitleProps) {
    return (
        <Component
            className={cn(
                "text-lg font-semibold leading-none tracking-tight text-text",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}

export function CardDescription({
    className,
    children,
    ...props
}: CardDescriptionProps) {
    return (
        <p className={cn("text-sm text-text-light", className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({
    className,
    children,
    ...props
}: CardContentProps) {
    return (
        <div className={cn("pt-0", className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
    return (
        <div className={cn("flex items-center pt-4", className)} {...props}>
            {children}
        </div>
    );
}

export default Card;
