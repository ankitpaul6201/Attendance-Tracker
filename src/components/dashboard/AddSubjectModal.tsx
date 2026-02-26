"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
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
    const [name, setName] = useState("");
    const [totalClasses, setTotalClasses] = useState(0);
    const [attendedClasses, setAttendedClasses] = useState(0);
    const [target, setTarget] = useState(defaultTarget);
    const [loading, setLoading] = useState(false);

    // Reset/Sync target when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setTotalClasses(initialData.total_classes);
                setAttendedClasses(initialData.attended_classes);
                setTarget(initialData.target_attendance);
            } else {
                setName("");
                setTotalClasses(0);
                setAttendedClasses(0);
                setTarget(defaultTarget);
            }
        }
    }, [isOpen, defaultTarget, initialData]);

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
            onClose();
        } catch (error) {
            console.error(error);
            alert(initialData ? "Failed to update subject" : "Failed to add subject");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Subject" : "Add New Subject"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-300">Subject Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-md)] py-2 px-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)]/50"
                        placeholder="e.g. Data Structures"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">Total Classes</label>
                        <input
                            type="number"
                            min="0"
                            value={totalClasses}
                            onChange={(e) => setTotalClasses(parseInt(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-md)] py-2 px-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)]/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">Attended</label>
                        <input
                            type="number"
                            min="0"
                            max={totalClasses}
                            value={attendedClasses}
                            onChange={(e) => setAttendedClasses(parseInt(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-md)] py-2 px-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)]/50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-gray-300">Target Attendance (%)</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={target}
                        onChange={(e) => setTarget(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-md)] py-2 px-3 text-white focus:outline-none focus:border-[var(--color-accent-cyan)]/50"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <NeoButton type="button" variant="ghost" size="sm" onClick={onClose}>
                        Cancel
                    </NeoButton>
                    <NeoButton type="submit" size="sm" isLoading={loading}>
                        {initialData ? "Save Changes" : "Add Subject"}
                    </NeoButton>
                </div>
            </form>
        </Modal>
    );
};
