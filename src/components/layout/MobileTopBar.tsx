"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/providers/ThemeToggle";

export const MobileTopBar = () => {
    return (
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-start)]/90 backdrop-blur-xl w-full h-[72px] shrink-0 sticky top-0 z-50">
            <Link href="/dashboard" className="flex items-center gap-3">
                <Logo size={24} />
                <h1 className="text-base font-bold text-[var(--foreground)] tracking-wide">
                    Attendance Tracker
                </h1>
            </Link>
            <div className="flex items-center justify-end">
                <ThemeToggle className="w-auto p-2" />
            </div>
        </div>
    );
};
