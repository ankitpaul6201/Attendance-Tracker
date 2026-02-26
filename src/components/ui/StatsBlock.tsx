import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatsBlockProps {
    label: string;
    value: string | number;
    subtext?: string;
    highlight?: boolean;
    className?: string;
}

export const StatsBlock = ({ label, value, subtext, highlight = false, className }: StatsBlockProps) => {
    return (
        <GlassCard
            hoverEffect
            className={cn(
                "flex flex-col items-start justify-center min-h-[140px] relative overflow-hidden",
                highlight && "border-[var(--color-accent-cyan)] shadow-[var(--shadow-glow)] bg-[var(--color-accent-cyan)]/10",
                className
            )}
        >
            {highlight && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-accent-cyan)]/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            )}
            <span className="text-gray-400 text-sm font-medium tracking-wide uppercase mb-2 z-10">{label}</span>
            <span className={cn(
                "text-4xl font-bold mb-1 z-10",
                highlight ? "text-[var(--color-accent-cyan)] glow-text" : "text-white"
            )}>
                {value}
            </span>
            {subtext && <span className="text-xs text-gray-500 z-10">{subtext}</span>}
        </GlassCard>
    );
};
