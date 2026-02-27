"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAndRedirect = async () => {
      // If user has visited before, skip the landing page entirely
      const hasVisited = localStorage.getItem("att-has-visited");
      if (hasVisited) {
        // Check if already logged in → go straight to dashboard
        try {
          const supabase = createSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            router.replace("/dashboard");
          } else {
            router.replace("/login");
          }
        } catch {
          router.replace("/login");
        }
        return;
      }
      // First-time visitor — show the landing page
      setReady(true);
    };
    checkAndRedirect();
  }, [router]);

  const handleGetStarted = () => {
    localStorage.setItem("att-has-visited", "true");
    router.push("/login");
  };

  if (!ready) {
    // Invisible while checking (no flash)
    return <div className="min-h-screen bg-[var(--color-bg-start)]" />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--color-primary-start)]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--color-primary-start)]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Main card */}
      <div className="glass-card p-12 rounded-[var(--radius-xl)] text-center max-w-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--foreground)]/5 to-transparent pointer-events-none" />

        <h1 className="text-5xl font-bold bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-accent-cyan)] bg-clip-text text-transparent mb-6 drop-shadow-sm">
          Attendance Tracker
        </h1>

        <p className="text-gray-400 text-lg mb-8">
          Futuristic attendance management system initialized.
        </p>

        <button
          onClick={handleGetStarted}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-black font-semibold shadow-[var(--shadow-glow)] hover:shadow-[0_0_30px_rgba(212,255,0,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
        >
          Get Started
        </button>
      </div>

      {/* "from Ankit" branding at bottom */}
      <p className="absolute bottom-6 text-xs text-gray-500 tracking-widest uppercase">
        from <span className="text-[var(--color-primary-start)] font-semibold">Ankit</span>
      </p>
    </main>
  );
}
