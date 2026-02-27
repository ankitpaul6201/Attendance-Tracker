"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Calendar, Settings, LogOut } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/providers/ThemeToggle";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Settings", href: "/dashboard/profile", icon: Settings },
];

// Reusable Content Component
const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createSupabaseClient();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err: any) {
            console.error("Sign out network error, forcing local logout:", err);
        } finally {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--color-bg-start)] border-r border-[var(--color-border)]">
            <div className="p-8 flex items-center gap-3">
                <Logo />
                <h1 className="text-xl font-bold text-[var(--foreground)] tracking-wide">
                    Attendance Tracker
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-[var(--color-primary-start)] text-[var(--color-bg-start)] neo-shadow"
                                    : "text-[var(--foreground)] opacity-70 hover:opacity-100 hover:bg-[var(--color-border)]"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-[var(--color-bg-start)]" : "text-[var(--foreground)] group-hover:text-[var(--primary-start)]")} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--color-border)] flex flex-col gap-2">
                <ThemeToggle />
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[var(--foreground)] opacity-70 hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 rounded-[var(--radius-sm)] transition-all duration-200 text-sm font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export const Sidebar = () => {
    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-50">
            <SidebarContent />
        </aside>
    );
};




