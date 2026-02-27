"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

// Lazy-load recharts to reduce initial bundle size
const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });

interface AttendanceChartProps {
    className?: string;
    attendanceData: { date: Date; status: 'present' | 'absent' | 'leave' }[];
}

// Moved to module scope to prevent recreation on every render
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0F1B2D]/90 backdrop-blur-md border border-[var(--foreground)]/10 p-3 rounded-lg shadow-xl">
                <p className="text-gray-300 text-xs mb-1">{label}</p>
                <p className="text-[var(--color-accent-cyan)] font-bold">
                    {payload[0].value}% Attendance
                </p>
                <p className="text-gray-400 text-xs">
                    {payload[0].payload.attended} / {payload[0].payload.total} classes
                </p>
            </div>
        );
    }
    return null;
};

export function AttendanceChart({ className, attendanceData }: AttendanceChartProps) {
    const chartData = useMemo(() => {
        const today = new Date();
        const startDate = subDays(today, 6); // Last 7 days
        const days = eachDayOfInterval({ start: startDate, end: today });

        return days.map(day => {
            const recordsForDay = attendanceData.filter(r => isSameDay(r.date, day));
            const attended = recordsForDay.filter(r => r.status === 'present').length;
            const total = recordsForDay.length;

            return {
                date: format(day, "MMM dd"),
                attended: attended,
                total: total,
                percentage: total > 0 ? (attended / total) * 100 : 0
            };
        });
    }, [attendanceData]);

    return (
        <GlassCard className={cn("p-6 h-[300px]", className)}>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Weekly Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary-start)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-primary-start)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        hide
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }} />
                    <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="var(--color-accent-cyan)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAttended)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </GlassCard>
    );
}
