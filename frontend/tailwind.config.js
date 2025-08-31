/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#4C8BF5",
                    light: "#7DABF7",
                    dark: "#3B7DE4",
                },
                secondary: {
                    DEFAULT: "#ADB3BA",
                    light: "#C4C9CF",
                    dark: "#8E959E",
                },
                background: {
                    DEFAULT: "#F6F7F8",
                    alt: "#FFFFFF",
                },
                text: {
                    DEFAULT: "#2F3437",
                    light: "#6B7280",
                },
            },
            fontFamily: {
                sans: ["Inter", "Noto Sans KR", "sans-serif"],
            },
        },
    },
    plugins: [],
};
