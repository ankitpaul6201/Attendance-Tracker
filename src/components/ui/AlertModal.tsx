import { NeoButton } from "@/components/ui/NeoButton";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect } from "react";

export type AlertModalType = 'error' | 'success' | 'info';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    type?: AlertModalType;
    actionText?: string;
}

export function AlertModal({
    isOpen,
    onClose,
    title,
    description,
    type = 'error',
    actionText = 'OK'
}: AlertModalProps) {
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

    const isError = type === 'error';
    const isSuccess = type === 'success';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onMouseDown={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-[var(--background)] border border-[var(--foreground)]/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    {/* Header icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isError ? 'bg-red-500/10 text-red-500' :
                        isSuccess ? 'bg-green-500/10 text-green-500' :
                            'bg-[var(--color-primary-start)]/10 text-[var(--color-primary-start)]'
                        }`}>
                        {isError ? <AlertCircle className="w-6 h-6" /> :
                            isSuccess ? <CheckCircle2 className="w-6 h-6" /> :
                                <Info className="w-6 h-6" />}
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
                            variant={isError ? 'danger' : isSuccess ? 'primary' : 'primary'}
                            className="w-full justify-center"
                            onClick={onClose}
                        >
                            {actionText}
                        </NeoButton>
                    </div>
                </div>

                {/* Close Button (top right) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
