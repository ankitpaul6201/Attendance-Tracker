"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Settings, User, Save, RotateCcw, AlertTriangle, LogOut, Palette, CreditCard, CalendarDays } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { MobileTopBar } from "@/components/layout/MobileTopBar";

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    mode: 'school' | 'college';
    overall_target_attendance: number;
    subscription_active?: boolean;
    subscription_expiry?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createSupabaseClient();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return;

            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('students')
                .update({
                    full_name: profile.full_name,
                    overall_target_attendance: profile.overall_target_attendance
                })
                .eq('id', profile.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handleResetData = async () => {
        if (!confirm("CRITICAL WARNING: This will permanently delete ALL your subjects, attendance records, and academic data. This action cannot be undone. Are you absolutely sure?")) return;

        setSaving(true);
        try {
            // Delete dependent data first due to foreign keys (though cascade handles it, explicit is safer sometimes)
            // Actually CASCADE is set on schema, so deleting parent records might be enough, 
            // but we want to keep the USER, just delete their data.
            // We need to delete from subjects, semesters, academic_years using RLS.

            // Delete all subjects (cascades to attendance_records)
            const { error: subjectError } = await supabase
                .from('subjects')
                .delete()
                .eq('student_id', profile?.id);

            if (subjectError) throw subjectError;

            // Delete semesters
            await supabase.from('semesters').delete().eq('student_id', profile?.id);

            // Delete academic years
            await supabase.from('academic_years').delete().eq('student_id', profile?.id);

            setMessage({ type: 'success', text: 'All application data has been reset.' });
            // Ideally refresh or redirect
        } catch (error) {
            console.error('Error resetting data:', error);
            setMessage({ type: 'error', text: 'Failed to reset data.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
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


    if (loading) return <LoadingSpinner text="Loading profile..." />;


    return (
        <div className="h-full overflow-y-auto pt-0 md:pt-0 pb-40 md:pb-0 custom-scrollbar">
            <MobileTopBar />
            <div className="p-8 pt-6 max-w-4xl mx-auto space-y-8 pb-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-[var(--color-primary-start)]/20 text-[var(--color-primary-start)]">
                        <Settings className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Settings & Profile</h2>
                        <p className="text-gray-400">Manage your account preferences and data.</p>
                    </div>
                </div>

                {message && (
                    <div className={cn(
                        "p-4 rounded-lg border text-sm font-medium",
                        message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                        {message.text}
                    </div>
                )}

                <div className="grid gap-8">
                    {/* Profile Section */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <User className="w-5 h-5 text-[var(--color-primary-start)]" />
                            <h3 className="text-xl font-bold text-white">Profile Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Full Name</label>
                                <input
                                    type="text"
                                    value={profile?.full_name || ''}
                                    onChange={(e) => setProfile(prev => prev ? ({ ...prev, full_name: e.target.value }) : null)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary-start)] transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Email Address</label>
                                <input
                                    type="text"
                                    value={profile?.email || ''}
                                    disabled
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>



                        <div className="pt-4 flex justify-end">
                            <NeoButton onClick={handleSave} disabled={saving}>
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </NeoButton>
                        </div>
                    </GlassCard>

                    {/* My Subscription Section */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <CreditCard className="w-5 h-5 text-[var(--color-primary-start)]" />
                            <h3 className="text-xl font-bold text-white">My Subscription</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-400">Current Plan</p>
                                <p className="text-lg font-bold text-white flex items-center gap-2">
                                    Pro Access
                                    {profile?.subscription_active ? (
                                        <span className="bg-[var(--color-primary-start)]/20 text-[var(--color-primary-start)] text-xs px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                                    ) : (
                                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider">Inactive</span>
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1 md:text-right">
                                <p className="text-sm text-gray-400">Price Paid</p>
                                <p className="text-lg font-bold text-white">₹1.00</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 border-t border-white/10 pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                        Activated On
                                    </p>
                                    <p className="text-white font-medium pl-6">
                                        {profile?.subscription_expiry
                                            ? new Date(new Date(profile.subscription_expiry).setMonth(new Date(profile.subscription_expiry).getMonth() - 6)).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                                            : "N/A"
                                        }
                                    </p>
                                </div>
                                <div className="space-y-1 md:text-right">
                                    <p className="text-sm text-gray-400 flex items-center gap-2 md:justify-end">
                                        <RotateCcw className="w-4 h-4" />
                                        Expires On
                                    </p>
                                    <p className="text-white font-medium pr-6 md:pr-0">
                                        {profile?.subscription_expiry
                                            ? new Date(profile.subscription_expiry).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                                            : "N/A"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* App Theme Section */}
                    <ThemeSelector />

                    {/* Preferences Section */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <Settings className="w-5 h-5 text-[var(--color-primary-start)]" />
                            <h3 className="text-xl font-bold text-white">Attendance Goals</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-gray-400">
                                <label>Overall Target Attendance</label>
                                <span className="text-white font-bold">{profile?.overall_target_attendance || 75}%</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={profile?.overall_target_attendance || 75}
                                onChange={(e) => setProfile(prev => prev ? ({ ...prev, overall_target_attendance: parseInt(e.target.value) }) : null)}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary-start)]"
                            />
                            <p className="text-xs text-gray-500">
                                This sets your global attendance goal. Individual subjects can override this.
                            </p>
                        </div>
                    </GlassCard>

                    {/* Support Section */}
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white">Support & Feedback</h3>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h4 className="text-white font-medium mb-1">Found a bug or have a suggestion?</h4>
                                <p className="text-sm text-gray-400">
                                    Your feedback helps us improve the Attendance Tracker. Let us know what you think!
                                </p>
                            </div>
                            <NeoButton
                                onClick={() => window.location.href = "mailto:ankitpaul6201@gmail.com?subject=Issue Report - Attendance Tracker"}
                                variant="secondary"
                            >
                                Report an Issue
                            </NeoButton>
                        </div>
                    </GlassCard>

                    {/* Danger Zone */}
                    <GlassCard className="p-8 space-y-6 border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h3 className="text-xl font-bold text-red-100">Danger Zone</h3>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h4 className="text-white font-medium mb-1">Reset All Data</h4>
                                <p className="text-sm text-gray-400">
                                    Permanently delete all subjects, attendance records, and academic settings.
                                    <br />
                                    <span className="text-red-400">This action cannot be undone.</span>
                                </p>
                            </div>
                            <NeoButton variant="danger" onClick={handleResetData} disabled={saving}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Data
                            </NeoButton>
                        </div>
                    </GlassCard>

                    <div className="flex justify-center pt-8">
                        <NeoButton variant="secondary" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </NeoButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'lime', color: '#D4FF00', name: 'Neon Lime' },
        { id: 'cyan', color: '#00F0FF', name: 'Neon Cyan' },
        { id: 'pink', color: '#FF0099', name: 'Neon Pink' },
        { id: 'orange', color: '#FF5500', name: 'Neon Orange' },
        { id: 'purple', color: '#BD00FF', name: 'Neon Purple' },
    ] as const;

    return (
        <GlassCard className="p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <Palette className="w-5 h-5 text-[var(--color-primary-start)]" />
                <h3 className="text-xl font-bold text-white">App Theme</h3>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-gray-400">Choose your preferred glowing accent color.</p>
                <div className="flex flex-wrap gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                                theme === t.id ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-black" : "hover:scale-105 opacity-70 hover:opacity-100"
                            )}
                            style={{
                                background: t.color,
                                boxShadow: theme === t.id ? `0 0 20px ${t.color}` : 'none'
                            }}
                            title={t.name}
                        >
                            {theme === t.id && (
                                <div className="w-4 h-4 rounded-full bg-black/50" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}
