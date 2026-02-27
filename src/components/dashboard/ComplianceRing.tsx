"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComplianceRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    target?: number;
}

export function ComplianceRing({
    percentage,
    size = 60,
    strokeWidth = 4,
    target = 75
}: ComplianceRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const isDanger = percentage < target;
    const color = isDanger ? "#ef4444" : "var(--color-primary-start)"; // Red or Theme Color
    const hasProgress = percentage > 0;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <LazyMotion features={domAnimation}>
                {/* Background Ring */}
                <svg className="w-full h-full rotate-[-90deg] overflow-visible relative z-10">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#1e293b" // Dark gray/navy
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress Ring */}
                    <m.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{
                            filter: hasProgress ? `drop-shadow(0 0 6px ${color})` : 'none'
                        }}
                    />
                </svg>
            </LazyMotion>
            {/* Inner Text or Icon could go here if needed, but usually overlayed externally */}
        </div>
    );
}
