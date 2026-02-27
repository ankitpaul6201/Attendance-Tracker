"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { AlertModal } from "@/components/ui/AlertModal";
import { NeoButton } from "@/components/ui/NeoButton";
import { Modal } from "@/components/ui/Modal";

interface Subject {
    id: string;
    name: string;
    total_classes: number;
    attended_classes: number;
    target_attendance: number;
}

interface AddSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultTarget?: number;
    initialData?: Subject | null;
}

export const AddSubjectModal = ({ isOpen, onClose, onSuccess, defaultTarget = 75, initialData }: AddSubjectModalProps) => {
    const [name, setName] = useState(initialData?.name ?? "");
    const [totalClasses, setTotalClasses] = useState(initialData?.total_classes ?? 0);
    const [attendedClasses, setAttendedClasses] = useState(initialData?.attended_classes ?? 0);
    const [target, setTarget] = useState(initialData?.target_attendance ?? defaultTarget);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ title: string, description: string, type: 'error' | 'success' | 'info' } | null>(null);

    const handleClose = () => {
        setName("");
        setTotalClasses(0);
        setAttendedClasses(0);
        setTarget(defaultTarget);
        onClose();
    };

    const supabase = createSupabaseClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            if (initialData) {
                // Update existing subject
                const { error } = await supabase
                    .from('subjects')
                    .update({
                        name,
                        total_classes: totalClasses,
                        attended_classes: attendedClasses,
                        target_attendance: target
                    })
                    .eq('id', initialData.id);

                if (error) throw error;
            } else {
                // Create new subject
                const { error } = await supabase.from('subjects').insert({
                    student_id: user.id,
                    name,
                    total_classes: totalClasses,
                    attended_classes: attendedClasses,
                    target_attendance: target
                });

                if (error) throw error;
            }

            onSuccess();
            handleClose();
        } catch (error) {
            // Fallback for errors
            console.error('Error saving subject:', error);
            setAlertMessage({
                title: initialData ? "Update Failed" : "Save Failed",
                description: "There was an error saving your subject. Please try again.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} title={initialData ? "Edit Subject" : "Add New Subject"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="subject-name" className="text-sm text-gray-300">Subject Name</label>
                        <input
                            id="subject-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[var(--radius-md)] py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--color-accent-cyan)]/50"
                            placeholder="e.g. Data Structures"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="total-classes" className="text-sm text-gray-300">Total Classes</label>
                            <input
                                id="total-classes"
                                type="number"
                                min="0"
                                value={totalClasses}
                                onChange={(e) => setTotalClasses(parseInt(e.target.value) || 0)}
                                className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[var(--radius-md)] py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--color-accent-cyan)]/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="attended-classes" className="text-sm text-gray-300">Attended</label>
                            <input
                                id="attended-classes"
                                type="number"
                                min="0"
                                max={totalClasses}
                                value={attendedClasses}
                                onChange={(e) => setAttendedClasses(parseInt(e.target.value) || 0)}
                                className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[var(--radius-md)] py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--color-accent-cyan)]/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="target-attendance" className="text-sm text-gray-300">Target Attendance (%)</label>
                        <input
                            id="target-attendance"
                            type="number"
                            min="1"
                            max="100"
                            value={target}
                            onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                            className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[var(--radius-md)] py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--color-accent-cyan)]/50"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <NeoButton type="button" variant="ghost" size="sm" onClick={handleClose}>
                            Cancel
                        </NeoButton>
                        <NeoButton type="submit" size="sm" isLoading={loading}>
                            {initialData ? "Save Changes" : "Add Subject"}
                        </NeoButton>
                    </div>
                </form>
            </Modal>

            <AlertModal
                isOpen={!!alertMessage}
                onClose={() => setAlertMessage(null)}
                title={alertMessage?.title || ""}
                description={alertMessage?.description || ""}
                type={alertMessage?.type}
            />
        </>
    );
};
