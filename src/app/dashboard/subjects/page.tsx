"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Plus, BookOpen, Trash2, MoreVertical, Edit } from "lucide-react";
import { AddSubjectModal } from "@/components/dashboard/AddSubjectModal";
import { cn } from "@/lib/utils";

import { MobileTopBar } from "@/components/layout/MobileTopBar";

interface Subject {
    id: string;
    name: string;
    total_classes: number;
    attended_classes: number;
    target_attendance: number;
}

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const supabase = createSupabaseClient();

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            const user = session.user;

            const { data, error } = await supabase
                .from('subjects')
                .select('*')
                .eq('student_id', user.id)
                .order('name');

            if (error) throw error;
            setSubjects(data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleDeleteSubject = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This will delete all attendance records for this subject.`)) return;

        try {
            setLoading(true);
            const { error } = await supabase.from('subjects').delete().eq('id', id);
            if (error) throw error;
            fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
            alert("Failed to delete subject");
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubject = (subject: Subject) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    return (
        <div className="h-full overflow-y-auto pt-0 md:pt-0 pb-40 md:pb-10 custom-scrollbar">
            <MobileTopBar />
            <div className="p-8 pt-6 max-w-5xl mx-auto space-y-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Subjects</h2>
                        <p className="text-gray-400">Manage your course list and targets.</p>
                    </div>
                    <NeoButton onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subject
                    </NeoButton>
                </div>

                {loading ? (
                    <LoadingSpinner text="Loading subjects..." />
                ) : subjects.length === 0 ? (
                    <GlassCard className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-accent-cyan)]/10 flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-[var(--color-accent-cyan)]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">No Subjects Yet</h3>
                        <p className="text-gray-400 max-w-md mb-6">
                            Add subjects to start tracking your attendance.
                        </p>
                        <NeoButton variant="secondary" onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Subject
                        </NeoButton>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => {
                            const pct = subject.total_classes > 0 ? (subject.attended_classes / subject.total_classes) * 100 : 0;
                            return (
                                <GlassCard key={subject.id} className="relative group hover:border-white/20 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{subject.name}</h3>
                                            <p className="text-sm text-gray-500">Target: {subject.target_attendance}%</p>
                                        </div>

                                        <div className="relative" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === subject.id ? null : subject.id)}
                                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            {activeMenuId === subject.id && (
                                                <div className="absolute right-0 top-8 z-50 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-[var(--shadow-glow)] overflow-hidden">
                                                    <button
                                                        onClick={() => handleEditSubject(subject)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-left"
                                                    >
                                                        <Edit className="w-3 h-3" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSubject(subject.id, subject.name)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Classes Held</span>
                                            <span className="text-white font-medium">{subject.total_classes}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Attended</span>
                                            <span className="text-white font-medium">{subject.attended_classes}</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-sm text-gray-400">Current Status</span>
                                            <span className={cn(
                                                "text-lg font-bold",
                                                pct >= subject.target_attendance ? "text-[var(--color-accent-cyan)]" : "text-red-400"
                                            )}>
                                                {subject.total_classes > 0 ? pct.toFixed(1) + "%" : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}

                <AddSubjectModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingSubject(null);
                    }}
                    onSuccess={fetchSubjects}
                    initialData={editingSubject}
                />
            </div>
        </div>
    );
}
