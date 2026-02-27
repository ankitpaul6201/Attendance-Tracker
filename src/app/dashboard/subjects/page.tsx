"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Plus, BookOpen, Trash2, MoreVertical, Edit } from "lucide-react";
import { AddSubjectModal } from "@/components/dashboard/AddSubjectModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { cn } from "@/lib/utils";

import { MobileTopBar } from "@/components/layout/MobileTopBar";

interface Subject {
    id: string;
    name: string;
    total_classes: number;
    attended_classes: number;
    target_attendance: number;
}

interface ModalState {
    isModalOpen: boolean;
    editingSubject: Subject | null;
    subjectToDelete: { id: string; name: string } | null;
    isDeleting: boolean;
    alertMessage: { title: string; description: string; type: 'error' | 'success' | 'info' } | null;
}

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState>({
        isModalOpen: false,
        editingSubject: null,
        subjectToDelete: null,
        isDeleting: false,
        alertMessage: null,
    });

    const supabase = createSupabaseClient();

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.warn("Session error in subjects:", sessionError.message);
                await supabase.auth.signOut();
                localStorage.removeItem('attendance-tracker-auth');
                return;
            }
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

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const promptDeleteSubject = (id: string, name: string) => {
        setModal(prev => ({ ...prev, subjectToDelete: { id, name } }));
        setActiveMenuId(null);
    };

    const handleDeleteConfirm = async () => {
        if (!modal.subjectToDelete) return;
        try {
            setModal(prev => ({ ...prev, isDeleting: true }));
            const { error } = await supabase.from('subjects').delete().eq('id', modal.subjectToDelete.id);
            if (error) throw error;
            setModal(prev => ({ ...prev, subjectToDelete: null }));
            fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
            setModal(prev => ({ ...prev, subjectToDelete: null, alertMessage: { title: "Error", description: "Failed to delete subject", type: "error" } }));
        } finally {
            setModal(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const handleEditSubject = (subject: Subject) => {
        setModal(prev => ({ ...prev, editingSubject: subject, isModalOpen: true }));
        setActiveMenuId(null);
    };

    return (
        <div className="h-full overflow-y-auto pt-0 md:pt-0 pb-40 md:pb-10 custom-scrollbar">
            <MobileTopBar />
            <div className="p-8 pt-6 max-w-5xl mx-auto space-y-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--foreground)]">Subjects</h2>
                        <p className="text-gray-400">Manage your course list and targets.</p>
                    </div>
                    <NeoButton onClick={() => setModal(prev => ({ ...prev, isModalOpen: true }))}>
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
                        <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">No Subjects Yet</h3>
                        <p className="text-gray-400 max-w-md mb-6">
                            Add subjects to start tracking your attendance.
                        </p>
                        <NeoButton variant="secondary" onClick={() => setModal(prev => ({ ...prev, isModalOpen: true }))}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Subject
                        </NeoButton>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => {
                            const pct = subject.total_classes > 0 ? (subject.attended_classes / subject.total_classes) * 100 : 0;
                            return (
                                <GlassCard key={subject.id} className="relative group hover:border-[var(--foreground)]/20 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--foreground)]">{subject.name}</h3>
                                            <p className="text-sm text-gray-500">Target: {subject.target_attendance}%</p>
                                        </div>

                                        <div className="relative" onPointerDown={e => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === subject.id ? null : subject.id);
                                                }}
                                                className="p-1 hover:bg-[var(--foreground)]/10 rounded-full transition-colors text-gray-400 hover:text-[var(--foreground)]"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            {activeMenuId === subject.id && (
                                                <div className="absolute right-0 top-8 z-50 w-40 bg-[var(--color-bg-start)] border border-[var(--color-border)] rounded-lg shadow-[var(--shadow-glow)] overflow-hidden">
                                                    <div className="p-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditSubject(subject);
                                                            }}
                                                            className="w-full flex items-center px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-lg transition-colors font-medium border-b border-[var(--foreground)]/5"
                                                        >
                                                            <Edit className="w-4 h-4 mr-3 text-[var(--color-primary-start)]" />
                                                            Edit Subject
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                promptDeleteSubject(subject.id, subject.name);
                                                            }}
                                                            className="w-full flex items-center px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-semibold"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-3" />
                                                            Delete Subject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Classes Held</span>
                                            <span className="text-[var(--foreground)] font-medium">{subject.total_classes}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Attended</span>
                                            <span className="text-[var(--foreground)] font-medium">{subject.attended_classes}</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-[var(--foreground)]/5 flex justify-between items-center">
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
                    key={modal.editingSubject?.id || 'new'}
                    isOpen={modal.isModalOpen}
                    onClose={() => {
                        setModal(prev => ({ ...prev, isModalOpen: false, editingSubject: null }));
                    }}
                    onSuccess={fetchSubjects}
                    initialData={modal.editingSubject}
                />
            </div>

            <ConfirmModal
                isOpen={!!modal.subjectToDelete}
                onClose={() => setModal(prev => ({ ...prev, subjectToDelete: null }))}
                onConfirm={handleDeleteConfirm}
                title="Delete Subject"
                description={`Are you sure you want to delete "${modal.subjectToDelete?.name}"? This will delete all attendance records for this subject.`}
                type="danger"
                confirmText="Delete"
                isLoading={modal.isDeleting}
            />

            <AlertModal
                isOpen={!!modal.alertMessage}
                onClose={() => setModal(prev => ({ ...prev, alertMessage: null }))}
                title={modal.alertMessage?.title || ""}
                description={modal.alertMessage?.description || ""}
                type={modal.alertMessage?.type}
            />
        </div>
    );
}
