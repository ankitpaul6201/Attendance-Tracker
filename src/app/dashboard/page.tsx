"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsBlock } from "@/components/ui/StatsBlock";
import { NeoButton } from "@/components/ui/NeoButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AddSubjectModal } from "@/components/dashboard/AddSubjectModal";
import dynamic from "next/dynamic";
const AttendanceChart = dynamic(() => import("@/components/dashboard/AttendanceChart").then(mod => mod.AttendanceChart), { ssr: false });
import { ComplianceRing } from "@/components/dashboard/ComplianceRing";
import { AlertModal } from "@/components/ui/AlertModal";
import { Plus, RefreshCcw, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { subDays, format } from "date-fns";
import { MobileTopBar } from "@/components/layout/MobileTopBar";

interface Subject {
    id: string;
    name: string;
    total_classes: number;
    attended_classes: number;
    target_attendance: number;
}

interface DashboardData {
    userName: string | null;
    subjects: Subject[];
    attendanceData: { date: Date; status: 'present' | 'absent' | 'leave' }[];
    todayRecords: Record<string, string>;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData>({
        userName: null,
        subjects: [],
        attendanceData: [],
        todayRecords: {},
    });
    const [loading, setLoading] = useState(true);
    const [markingId, setMarkingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ title: string, description: string, type: 'error' | 'success' | 'info' } | null>(null);
    const stats = useMemo(() => {
        const total = data.subjects.reduce((a: number, s: Subject) => a + s.total_classes, 0);
        const attended = data.subjects.reduce((a: number, s: Subject) => a + s.attended_classes, 0);
        return { total, attended, percentage: total > 0 ? Math.round((attended / total) * 100) : 0 };
    }, [data.subjects]);

    const supabase = createSupabaseClient();

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.warn("Session error in dashboard:", sessionError.message);
                await supabase.auth.signOut();
                localStorage.removeItem('attendance-tracker-auth');
                return;
            }
            if (!session?.user) return;

            const { data: userRecord, error: userError } = await supabase
                .from('students')
                .select('full_name')
                .eq('id', session.user.id)
                .single();

            if (userError) {
                console.error("Error fetching user:", userError);
            }

            const fetchedUserName = userRecord?.full_name || null;

            const { data: subjectsData, error } = await supabase
                .from('subjects')
                .select('*')
                .eq('student_id', session.user.id);
            if (error) throw error;

            const { data: history } = await supabase
                .from('attendance_records')
                .select('date, status, subject_id')
                .gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
                .order('date', { ascending: true });

            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const { data: todayData } = await supabase
                .from('attendance_records')
                .select('subject_id, status')
                .eq('date', todayStr);

            setData({
                userName: fetchedUserName,
                subjects: subjectsData || [],
                attendanceData: history ? history.map((r: any) => ({ ...r, date: new Date(r.date) })) : [],
                todayRecords: todayData ? Object.fromEntries(todayData.map((r: any) => [r.subject_id, r.status])) : {},
            });

        } catch (err: any) {
            console.error("Error fetching dashboard data:", err.message || err, err.stack);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async (subjectId: string, status: 'present' | 'absent') => {
        try {
            setMarkingId(subjectId);
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const { error } = await supabase.rpc('mark_attendance', {
                subj_id: subjectId,
                status_type: status,
                p_date: todayStr,
            });

            if (error) {
                console.error('Error marking attendance:', error.message);

                let displayError = error.message;
                if (displayError.includes('already marked for today')) {
                    displayError = "You have already marked attendance for this subject today.";
                }

                setAlertMessage({
                    title: "Failed to Mark Attendance",
                    description: displayError,
                    type: "error"
                });
                return;
            }

            setData(prev => ({ ...prev, todayRecords: { ...prev.todayRecords, [subjectId]: status } }));
            await fetchData();
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setMarkingId(null);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto pt-0 md:pt-8 no-scrollbar pb-40 md:pb-8">
                <MobileTopBar />
                <div className="p-6 pt-4 space-y-6 max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                                Hi, <span style={{ color: 'var(--color-primary-start)' }}>{data.userName || 'Student'}</span>
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Track your academic progress</p>
                        </div>
                        <div className="flex gap-3">
                            <NeoButton variant="secondary" size="sm" onClick={fetchData} isLoading={loading}>
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Refresh
                            </NeoButton>
                            <NeoButton size="sm" onClick={() => setIsModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Subject
                            </NeoButton>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <StatsBlock label="Total Classes" value={stats.total} />
                        <StatsBlock label="Attended" value={stats.attended} />
                        <StatsBlock label="Overall" value={`${stats.percentage}%`} />
                    </div>

                    {/* Chart */}
                    <AttendanceChart attendanceData={data.attendanceData} />

                    {/* Subject Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <LoadingSpinner text="Loading subjects..." />
                            </div>
                        ) : data.subjects.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No subjects yet. Tap &quot;Add Subject&quot; to get started.
                            </div>
                        ) : (
                            data.subjects.map(subject => {
                                const pct = subject.total_classes > 0
                                    ? Math.round((subject.attended_classes / subject.total_classes) * 100)
                                    : 0;
                                const todayStatus = data.todayRecords[subject.id];
                                const isMarking = markingId === subject.id;

                                return (
                                    <GlassCard key={subject.id} className="p-5 space-y-4 hover:border-[var(--foreground)]/20 transition-colors">
                                        {/* Subject Header */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 mr-3">
                                                <h3 className="font-bold text-base text-[var(--foreground)] truncate">{subject.name}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Target: {subject.target_attendance}%</p>
                                            </div>
                                            <ComplianceRing
                                                percentage={pct}
                                                size={44}
                                                target={subject.target_attendance}
                                            />
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Classes</span>
                                                <span className="text-[var(--foreground)] font-medium">
                                                    {subject.attended_classes}/{subject.total_classes}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--color-primary-start)] rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Attendance Buttons or Status Badge */}
                                        {todayStatus ? (
                                            <div className={`flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl ${todayStatus === 'present'
                                                ? 'bg-[var(--color-primary-start)]/15 text-[var(--color-primary-start)]'
                                                : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {todayStatus === 'present'
                                                    ? <><CheckCircle2 className="w-4 h-4" /> Present Today</>
                                                    : <><XCircle className="w-4 h-4" /> Absent Today</>
                                                }
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => markAttendance(subject.id, 'present')}
                                                    disabled={isMarking}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold
                                                        text-[var(--color-bg-start)] bg-[var(--color-primary-start)]
                                                        active:brightness-90 hover:brightness-110
                                                        disabled:opacity-40 disabled:cursor-not-allowed
                                                        transition-all duration-150"
                                                >
                                                    {isMarking ? (
                                                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    )}
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => markAttendance(subject.id, 'absent')}
                                                    disabled={isMarking}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold
                                                        text-red-400 bg-red-500/10 border border-red-500/25
                                                        active:bg-red-500/20 hover:bg-red-500/20
                                                        disabled:opacity-40 disabled:cursor-not-allowed
                                                        transition-all duration-150"
                                                >
                                                    {isMarking ? (
                                                        <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    Absent
                                                </button>
                                            </div>
                                        )}
                                    </GlassCard>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <AddSubjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />

            <AlertModal
                isOpen={!!alertMessage}
                onClose={() => setAlertMessage(null)}
                title={alertMessage?.title || ""}
                description={alertMessage?.description || ""}
                type={alertMessage?.type}
            />
        </div>
    );
}
