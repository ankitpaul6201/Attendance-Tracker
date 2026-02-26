"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface AttendanceChartProps {
    className?: string;
    attendanceData: { date: Date; status: 'present' | 'absent' | 'leave' }[];
}

export function AttendanceChart({ className, attendanceData }: AttendanceChartProps) {
    const chartData = useMemo(() => {
        const today = new Date();
        const startDate = subDays(today, 6); // Last 7 days
        const days = eachDayOfInterval({ start: startDate, end: today });

        return days.map(day => {
            const recordsForDay = attendanceData.filter(r => isSameDay(r.date, day));
            // Calculate a score: Present = 1, Absent = 0 (or -1?), Leave = 0.5?
            // Or just count "Classes Attended" vs "Classes Missed"
            // Let's toggle: For a student dashboard, maybe just "Classes Attended" count per day
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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0F1B2D]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
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

    return (
        <GlassCard className={cn("p-6 h-[300px]", className)}>
            <h3 className="text-lg font-bold text-white mb-4">Weekly Trend</h3>
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
