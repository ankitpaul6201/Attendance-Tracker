import { NeoButton } from "@/components/ui/NeoButton";
import { AlertCircle, Trash2, Info, X } from "lucide-react";
import { useEffect } from "react";

export type ConfirmModalType = 'danger' | 'info' | 'success';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    type?: ConfirmModalType;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false
}: ConfirmModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onMouseDown={isLoading ? undefined : onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[var(--background)] border border-[var(--foreground)]/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    {/* Header icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-primary-start)]/10 text-[var(--color-primary-start)]'
                        }`}>
                        {isDanger ? <Trash2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                    </div>

                    {/* Title & Desc */}
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        {description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8 justify-end">
                        <NeoButton
                            variant="secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </NeoButton>
                        <NeoButton
                            variant={isDanger ? 'danger' : 'primary'}
                            onClick={onConfirm}
                            isLoading={isLoading}
                        >
                            {confirmText}
                        </NeoButton>
                    </div>
                </div>

                {/* Close Button (top right) */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 rounded-full transition-colors disabled:opacity-50"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
