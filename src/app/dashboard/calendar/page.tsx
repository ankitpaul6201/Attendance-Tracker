"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle } from "lucide-react";
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
    subMonths,
    parseISO
} from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { MobileTopBar } from "@/components/layout/MobileTopBar";

interface AttendanceDetail {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'leave';
    subjects: {
        name: string;
    };
}

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [records, setRecords] = useState<AttendanceDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseClient();

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            const user = session.user;

            const { data, error } = await supabase
                .from('attendance_records')
                .select(`
                    id,
                    date,
                    status,
                    subjects (name)
                `)
                .eq('subjects.student_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;

            const formattedRecords = (data || []).map((record: any) => ({
                ...record,
                subjects: Array.isArray(record.subjects) ? record.subjects[0] : record.subjects
            }));
            setRecords(formattedRecords as AttendanceDetail[]);

        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    // Filter records for the selected date
    const selectedDayRecords = records.filter(r => isSameDay(parseISO(r.date), selectedDate));

    return (
        <div className="h-full overflow-y-auto pt-0 md:pt-0 pb-40 md:pb-0 custom-scrollbar">
            <MobileTopBar />
            <div className="p-8 pt-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-100px)]">
                {/* Calendar Section */}
                <div className="lg:w-2/3 h-full flex flex-col">
                    <GlassCard className="flex-1 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl font-bold text-white">
                                    {format(currentMonth, "MMMM yyyy")}
                                </h2>
                                <div className="flex gap-2">
                                    <NeoButton size="icon" variant="secondary" onClick={prevMonth}>
                                        <ChevronLeft className="w-5 h-5" />
                                    </NeoButton>
                                    <NeoButton size="icon" variant="secondary" onClick={nextMonth}>
                                        <ChevronRight className="w-5 h-5" />
                                    </NeoButton>
                                </div>
                            </div>
                            <NeoButton variant="secondary" onClick={() => setSelectedDate(new Date())}>
                                Today
                            </NeoButton>
                        </div>

                        <div className="grid grid-cols-7 mb-4">
                            {weekDays.map((day) => (
                                <div key={day} className="text-center text-gray-400 font-medium py-2 uppercase tracking-wider text-sm">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-3 flex-1">
                            {calendarDays.map((day, dayIdx) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, monthStart);

                                const dayRecords = records.filter(r => isSameDay(parseISO(r.date), day));
                                const hasPresent = dayRecords.some(r => r.status === 'present');
                                const hasAbsent = dayRecords.some(r => r.status === 'absent');

                                let statusColor = "";
                                if (hasPresent && hasAbsent) statusColor = "bg-yellow-500/20 border-yellow-500/50";
                                else if (hasPresent) statusColor = "bg-green-500/20 border-green-500/50";
                                else if (hasAbsent) statusColor = "bg-red-500/20 border-red-500/50";

                                return (
                                    <motion.div
                                        key={day.toString()}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: dayIdx * 0.005 }}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "relative min-h-[80px] rounded-xl border p-2 cursor-pointer transition-all duration-200 flex flex-col justify-between group",
                                            isSelected
                                                ? "bg-[var(--color-primary-start)] border-[var(--color-primary-start)] shadow-[0_0_15px_rgba(212,255,0,0.3)] z-10"
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20",
                                            !isCurrentMonth && "opacity-30 grayscale",
                                            statusColor && !isSelected && statusColor
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                isSelected ? "text-black" : "text-gray-400 group-hover:text-gray-200"
                                            )}>
                                                {format(day, "d")}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1 content-end">
                                            {dayRecords.map((r, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        r.status === 'present' ? "bg-green-400" : "bg-red-400"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>

                {/* Details Sidebar */}
                <div className="lg:w-1/3 h-full flex flex-col gap-6">
                    {/* Attendance Details */}
                    <GlassCard className="p-6 h-full">
                        <h3 className="text-xl font-bold text-white mb-1">
                            {format(selectedDate, "EEEE")}
                        </h3>
                        <p className="text-gray-400 mb-6">{format(selectedDate, "MMMM d, yyyy")}</p>

                        <div className="space-y-4 pr-2 custom-scrollbar overflow-y-auto h-[calc(100%-80px)]">
                            {loading ? (
                                <LoadingSpinner text="Beaming down records..." />
                            ) : selectedDayRecords.length > 0 ? (
                                selectedDayRecords.map((record) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                                    >
                                        <div>
                                            <h4 className="font-bold text-white">{record.subjects?.name || "Unknown Subject"}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Recorded</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                                            record.status === 'present'
                                                ? "bg-green-500/20 text-green-300 border border-green-500/20"
                                                : "bg-red-500/20 text-red-300 border border-red-500/20"
                                        )}>
                                            {record.status === 'present' ? (
                                                <CheckCircle2 className="w-3 h-3" />
                                            ) : (
                                                <XCircle className="w-3 h-3" />
                                            )}
                                            {record.status === 'present' ? 'Present' : 'Absent'}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 h-full">
                                    <CalendarIcon className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm">No attendance records.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

