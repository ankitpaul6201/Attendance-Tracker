"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Calendar, Settings } from "lucide-react";
import { m } from "framer-motion";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Settings", href: "/dashboard/profile", icon: Settings },
];

export function BottomNavBar() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-2 pointer-events-none">
            <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-[var(--foreground)]/10 rounded-full shadow-2xl pointer-events-auto max-w-[90%] mx-auto">
                <nav className="flex justify-between items-center px-4 py-3 relative">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 z-10 no-touch-callout active:scale-95",
                                    isActive ? "text-black" : "text-gray-400"
                                )}
                                style={{
                                    WebkitTouchCallout: "none",
                                    WebkitUserSelect: "none",
                                    userSelect: "none",
                                    touchAction: "none"
                                }}
                            >
                                {isActive && (
                                    <m.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[var(--color-primary-start)] rounded-full -z-10"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30
                                        }}
                                        style={{
                                            boxShadow: "0 0 15px rgba(212, 255, 0, 0.4)"
                                        }}
                                    />
                                )}
                                <Icon className="w-5 h-5" />
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
