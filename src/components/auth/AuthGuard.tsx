"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();
    const supabase = createSupabaseClient();

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            if (error) {
                console.warn("Session error detected, clearing local auth state:", error.message);
                await supabase.auth.signOut();
                localStorage.removeItem('attendance-tracker-auth');
            }
            if (session) {
                setAuthenticated(true);
            } else {
                router.replace("/login");
            }
            setLoading(false);
        });

        // Also listen to auth state changes (handles token refresh, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setAuthenticated(true);
            } else {
                setAuthenticated(false);
                router.replace("/login");
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--color-bg-start)]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!authenticated) return null;

    return <>{children}</>;
}
