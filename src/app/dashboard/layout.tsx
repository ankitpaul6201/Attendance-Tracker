"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import AuthGuard from "@/components/auth/AuthGuard";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { createSupabaseClient } from "@/lib/supabase/client";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [hasPaid, setHasPaid] = useState<boolean | null>(null);
    const router = useRouter();
    const supabase = createSupabaseClient();

    useEffect(() => {
        const checkPaymentStatus = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.warn("Session error in layout:", error.message);
                await supabase.auth.signOut();
                localStorage.removeItem('attendance-tracker-auth');
            }
            if (!session?.user) return;

            const { data: userRecord } = await supabase
                .from('students')
                .select('subscription_active')
                .eq('id', session.user.id)
                .single();

            const paid = !!userRecord?.subscription_active;
            setHasPaid(paid);
            if (!paid) {
                router.replace('/payment');
            }
        };
        checkPaymentStatus();
    }, [supabase, router]);

    if (hasPaid === null || hasPaid === false) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--color-bg-start)]">
                <LoadingSpinner text="Checking access..." />
            </div>
        );
    }
    return (
        <AuthGuard>
            <ThemeProvider>
                <LazyMotion features={domAnimation}>
                <div className="min-h-screen bg-[var(--color-bg-start)] text-[var(--foreground)]">
                    <Sidebar />
                    {/* MobileTopBar removed from here */}
                    <BottomNavBar />
                    <main className="md:ml-64 h-screen relative overflow-hidden pt-0 bg-transparent">
                        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--color-primary-start)]/5 to-transparent pointer-events-none" />

                        <AnimatePresence mode="wait">
                            <m.div
                                key="dashboard-content"
                                className="relative z-10 h-full"
                                initial={{ x: "-100vw", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.6 }}
                            >
                                {children}
                            </m.div>
                        </AnimatePresence>
                    </main>
                </div>
                </LazyMotion>
            </ThemeProvider>
        </AuthGuard>
    );
}
