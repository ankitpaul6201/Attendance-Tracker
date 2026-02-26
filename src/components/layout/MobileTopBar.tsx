"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Menu } from "lucide-react";

export const MobileTopBar = () => {
    return (
        <div className="md:hidden flex items-center justify-between px-6 pt-14 pb-4 border-b border-white/10 bg-[var(--color-bg-start)]/90 backdrop-blur-xl w-full h-28 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3">
                <Logo size={28} />
                <h1 className="text-lg font-bold bg-white bg-clip-text text-transparent">
                    Attendance Tracker
                </h1>
            </Link>
            {/* Placeholder for menu if needed, or just keep it clean */}
        </div>
    );
};
