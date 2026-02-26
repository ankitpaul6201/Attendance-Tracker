"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { motion } from "framer-motion";

interface AttendanceCalendarProps {
    className?: string;
    attendanceData?: { date: Date; status: 'present' | 'absent' | 'leave' }[];
}

export function AttendanceCalendar({ className, attendanceData = [] }: AttendanceCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <GlassCard className={cn("p-6 min-h-[400px]", className)}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <div className="flex gap-2">
                    <NeoButton size="icon" variant="ghost" onClick={prevMonth}>
                        <ChevronLeft className="w-5 h-5" />
                    </NeoButton>
                    <NeoButton size="icon" variant="ghost" onClick={nextMonth}>
                        <ChevronRight className="w-5 h-5" />
                    </NeoButton>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, dayIdx) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    // Check for attendance on this day
                    // For now, simple logic: if any record exists for this day, show a dot.
                    // In a real app, we might show multiple dots or a summary color.
                    const dayRecords = attendanceData.filter(d => isSameDay(d.date, day));
                    const hasPresent = dayRecords.some(r => r.status === 'present');
                    const hasAbsent = dayRecords.some(r => r.status === 'absent');

                    let statusIndicator = null;
                    if (hasPresent && hasAbsent) {
                        statusIndicator = "bg-yellow-400"; // Mixed
                    } else if (hasPresent) {
                        statusIndicator = "bg-green-400";
                    } else if (hasAbsent) {
                        statusIndicator = "bg-red-400";
                    }

                    return (
                        <motion.div
                            key={day.toString()}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: dayIdx * 0.01 }}
                        >
                            <div
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "aspect-square flex flex-col items-center justify-center rounded-[18px] cursor-pointer transition-all duration-200 relative group",
                                    !isCurrentMonth && "text-gray-700",
                                    isSelected
                                        ? "bg-[var(--color-primary-start)] text-black shadow-[0_0_15px_rgba(212,255,0,0.4)] scale-105 z-10 font-bold"
                                        : "hover:bg-white/5 text-gray-400",
                                    !isSelected && !isCurrentMonth && "opacity-30"
                                )}
                            >
                                <span className="text-sm">{format(day, "d")}</span>

                                {statusIndicator && (
                                    <div className={cn("absolute bottom-2 w-1.5 h-1.5 rounded-full", statusIndicator)} />
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Selected: <span className="text-white ml-2">{format(selectedDate, "MMM d, yyyy")}</span></span>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Present</div>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Absent</div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
