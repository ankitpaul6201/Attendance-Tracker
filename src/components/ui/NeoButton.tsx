"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface NeoButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

export const NeoButton = ({
    children,
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    ...props
}: NeoButtonProps) => {
    const variants = {
        primary: "bg-[var(--color-primary-start)] text-black shadow-[var(--shadow-glow)] hover:shadow-[0_0_25px_var(--shadow-glow-color)] border border-transparent font-bold",
        secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md",
        danger: "bg-red-500/20 text-red-100 border border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
        ghost: "bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-transparent"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm rounded-[var(--radius-md)]",
        md: "px-6 py-3 text-base rounded-[var(--radius-lg)]",
        lg: "px-8 py-4 text-lg rounded-[var(--radius-xl)]",
        icon: "p-3 rounded-full aspect-square flex items-center justify-center"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
                "font-semibold transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                disabled || isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </motion.button>
    );
};
