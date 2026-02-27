"use client";

import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export const ThemeToggle = ({ className }: { className?: string }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-all duration-200 text-sm font-medium w-full text-left",
                "text-[var(--foreground)] opacity-70 hover:opacity-100 hover:bg-[var(--color-border)]",
                className
            )}
        >
            {theme === "light" ? (
                <>
                    <Moon className="w-5 h-5" />
                    <span className="md:inline hidden">Dark Mode</span>
                </>
            ) : (
                <>
                    <Sun className="w-5 h-5" />
                    <span className="md:inline hidden">Light Mode</span>
                </>
            )}
        </button>
    );
};
