/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                // Primary Colors (차분한 블루)
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#4C8BF5", // DEFAULT
                    600: "#3B7DE4",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                    DEFAULT: "#4C8BF5",
                    light: "#7DABF7",
                    dark: "#3B7DE4",
                },
                // Secondary Colors (뮤트 그레이)
                secondary: {
                    50: "#f9fafb",
                    100: "#f3f4f6",
                    200: "#e5e7eb",
                    300: "#d1d5db",
                    400: "#9ca3af",
                    500: "#ADB3BA", // DEFAULT
                    600: "#8E959E",
                    700: "#374151",
                    800: "#1f2937",
                    900: "#111827",
                    DEFAULT: "#ADB3BA",
                    light: "#C4C9CF",
                    dark: "#8E959E",
                },
                // Background Colors
                background: {
                    DEFAULT: "#F6F7F8", // Background Section
                    primary: "#FFFFFF", // Background Primary
                    alt: "#FFFFFF",
                },
                // Text Colors
                text: {
                    DEFAULT: "#2F3437", // Text Primary (잉크 블랙)
                    primary: "#2F3437",
                    secondary: "#6B7280",
                    light: "#9CA3AF",
                    muted: "#ADB3BA",
                },
                // Destructive (빨간색)
                destructive: {
                    DEFAULT: "#E94B4B",
                    light: "#F87171",
                    dark: "#DC2626",
                },
                // Success (녹색)
                success: {
                    DEFAULT: "#10B981",
                    light: "#34D399",
                    dark: "#059669",
                },
                // Warning (황색)
                warning: {
                    DEFAULT: "#F59E0B",
                    light: "#FBBF24",
                    dark: "#D97706",
                },
                // Info (시안색)
                info: {
                    DEFAULT: "#06B6D4",
                    light: "#22D3EE",
                    dark: "#0891B2",
                },
            },
            fontFamily: {
                sans: ["Inter", "Noto Sans KR", "system-ui", "sans-serif"],
            },
            fontSize: {
                // 타이포그래피 시스템
                "heading-1": [
                    "24px",
                    { lineHeight: "1.33", fontWeight: "600" },
                ],
                "heading-2": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
                "heading-3": [
                    "18px",
                    { lineHeight: "1.44", fontWeight: "600" },
                ],
                "body-lg": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
                body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                caption: ["12px", { lineHeight: "1.33", fontWeight: "400" }],
            },
            spacing: {
                // 8-point 그리드 시스템
                18: "4.5rem", // 72px
                22: "5.5rem", // 88px
            },
            borderRadius: {
                // 모서리 반지름
                md: "4px", // 기본 반지름
            },
            boxShadow: {
                // 그림자 레벨
                "level-1": "0px 1px 2px rgba(0, 0, 0, 0.04)",
                "level-2": "0px 4px 8px rgba(0, 0, 0, 0.08)",
                "level-3": "0px 8px 16px rgba(0, 0, 0, 0.12)",
            },
        },
    },
    plugins: [],
};
