"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
    text?: string;
}

export const LoadingSpinner = ({ className, size = 40, text = "Loading..." }: LoadingSpinnerProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 h-full min-h-[200px] w-full", className)}>
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 blur-xl bg-[var(--color-primary-start)]/20 rounded-full" />
                <Loader2
                    className="animate-spin text-[var(--color-primary-start)] relative z-10"
                    size={size}
                    strokeWidth={2.5}
                />
            </div>
            {text && (
                <p className="mt-4 text-gray-400 font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};
