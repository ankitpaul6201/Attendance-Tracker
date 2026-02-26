"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = 'lime' | 'cyan' | 'pink' | 'orange' | 'purple';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

const themeColors: Record<Theme, { primaryStart: string; primaryEnd: string; shadowGlow: string }> = {
    lime: {
        primaryStart: "#D4FF00",
        primaryEnd: "#B8E600",
        shadowGlow: "rgba(212, 255, 0, 0.4)",
    },
    cyan: {
        primaryStart: "#00F0FF",
        primaryEnd: "#00C2D1",
        shadowGlow: "rgba(0, 240, 255, 0.4)",
    },
    pink: {
        primaryStart: "#FF0099",
        primaryEnd: "#CC007A",
        shadowGlow: "rgba(255, 0, 153, 0.4)",
    },
    orange: {
        primaryStart: "#FF5500",
        primaryEnd: "#CC4400",
        shadowGlow: "rgba(255, 85, 0, 0.4)",
    },
    purple: {
        primaryStart: "#BD00FF",
        primaryEnd: "#9D00D6",
        shadowGlow: "rgba(189, 0, 255, 0.4)",
    },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('lime');

    useEffect(() => {
        const savedTheme = localStorage.getItem("app-theme") as Theme;
        if (savedTheme && themeColors[savedTheme]) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const colors = themeColors[theme];

        root.style.setProperty("--primary-start", colors.primaryStart);
        root.style.setProperty("--primary-end", colors.primaryEnd);
        root.style.setProperty("--shadow-glow-color", colors.shadowGlow);

        localStorage.setItem("app-theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
