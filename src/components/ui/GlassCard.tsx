"use client";

import { cn } from "@/lib/utils";
import { LazyMotion, domAnimation, m, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: "default" | "panel";
    hoverEffect?: boolean;
}

export const GlassCard = ({
    children,
    className,
    variant = "default",
    hoverEffect = false,
    ...props
}: GlassCardProps) => {
    return (
        <LazyMotion features={domAnimation}>
            <m.div
                initial={hoverEffect ? { y: 0 } : undefined}
                whileHover={hoverEffect ? { y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.2)" } : undefined}
                transition={{ duration: 0.3 }}
                className={cn(
                    "rounded-[var(--radius-lg)] p-6 transition-all duration-300",
                    variant === "default"
                        ? "glass-card hover:border-[var(--color-border)] hover:bg-[var(--color-card-bg)]"
                        : "glass-panel bg-[var(--color-card-bg)]",
                    className
                )}
                {...props}
            >
                {children}
            </m.div>
        </LazyMotion>
    );
};
