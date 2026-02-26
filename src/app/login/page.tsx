"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createSupabaseClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.replace("/dashboard");
            }
        };
        checkSession();
    }, [router, supabase]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });

                if (error) throw error;

                // Supabase returns a user with identities=[] if an account with that email already exists
                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    setError("Account already exists. Please sign in instead.");
                    return;
                }

                // If email confirmation is off in Supabase (default for new projects),
                // the user is signed in immediately.
                if (data.session) {
                    router.push("/dashboard");
                } else {
                    alert("Account created! Check your email for the confirmation link.");
                }

            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary-start)]/20 rounded-full blur-[100px] -z-10 animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent-cyan)]/10 rounded-full blur-[100px] -z-10" />

            <GlassCard className="max-w-md w-full p-8 relative z-10">
                <div className="flex justify-center mb-8">
                    <motion.div
                        animate={{ rotateY: 360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="relative w-20 h-20 flex items-center justify-center transform-gpu"
                        style={{ perspective: "1000px" }}
                    >
                        {/* Inner strong bright glow using theme primary color */}
                        <div className="absolute inset-0 bg-[var(--color-primary-start)]/60 blur-xl rounded-full" />
                        {/* Outer colored glow also using theme primary color */}
                        <div className="absolute -inset-4 bg-[var(--color-primary-start)]/30 blur-2xl opacity-80 rounded-full" />

                        {/* The actual App Logo floating with shadow */}
                        <div className="relative z-10 drop-shadow-[0_0_15px_var(--color-primary-start)]">
                            <Logo size={48} />
                        </div>
                    </motion.div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {isSignUp ? "Join the future of attendance tracking" : "Enter your credentials to access the dashboard"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-md)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-accent-cyan)]/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="email"
                                placeholder="student@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-md)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-accent-cyan)]/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-md)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-accent-cyan)]/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/20 text-red-200 text-sm animate-pulse">
                            {error}
                        </div>
                    )}

                    <NeoButton
                        type="submit"
                        className="w-full mt-6"
                        isLoading={loading}
                    >
                        {isSignUp ? "Create Account" : "Sign In"}
                    </NeoButton>
                </form>



                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-gray-400 hover:text-[var(--color-accent-cyan)] text-sm transition-colors"
                    >
                        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
