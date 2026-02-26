"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { CreditCard } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import AuthGuard from "@/components/auth/AuthGuard";

export default function PaymentPage() {
    const [isPaying, setIsPaying] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const router = useRouter();
    const supabase = createSupabaseClient();

    useEffect(() => {
        const checkStatusAndInitPayment = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: userRecord } = await supabase
                    .from('students')
                    .select('full_name, email, subscription_active')
                    .eq('id', session.user.id)
                    .single();

                if (userRecord) {
                    setUserName(userRecord.full_name);
                    setUserEmail(userRecord.email);
                    if (userRecord.subscription_active) {
                        router.replace("/dashboard");
                        return; // user is already active, don't create order
                    }
                }

                // Pre-load Razorpay script
                const loadScript = () => new Promise((resolve) => {
                    if ((window as any).Razorpay) return resolve(true);
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
                await loadScript();

                // Get API base URL (Vercel uses absolute URLs for mobile builds)
                const getApiUrl = (path: string) => {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
                    return `${baseUrl}${path}`;
                };

                // Pre-fetch order so we can open Razorpay synchronously on click
                try {
                    const res = await fetch(getApiUrl('/api/create-order'), { method: 'POST' });
                    const data = await res.json();
                    if (!data.error) {
                        setOrderData(data.order);
                    }
                } catch (error) {
                    console.error("Error creating order fetching:", error);
                }
            } else {
                router.replace("/login");
            }
        };
        checkStatusAndInitPayment();
    }, [supabase, router]);

    const handlePayment = () => {
        if (!orderData) {
            alert('Payment initializing. Please wait a moment and try again.');
            return;
        }

        if (!(window as any).Razorpay) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        setIsPaying(true);

        try {
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: "5000",
                currency: "INR",
                name: "Attendance Tracker",
                description: "Pro Access",
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        // 1. Mark subscription as active in DB and calculate expiry
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session?.user) {
                            const now = new Date();
                            const expiry = new Date(now.setMonth(now.getMonth() + 6));

                            await supabase
                                .from('students')
                                .update({
                                    subscription_active: true,
                                    subscription_expiry: expiry.toISOString()
                                })
                                .eq('id', session.user.id);
                        }

                        // 2. Send email receipt
                        if (userEmail) {
                            const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
                            await fetch(`${baseUrl}/api/send-receipt`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: userEmail,
                                    name: userName || "Student",
                                    paymentId: response.razorpay_payment_id,
                                    amount: "₹50.00" // Updated to match actual payment
                                })
                            }).catch(e => console.error("Receipt error:", e));
                        }

                        alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id);
                        router.push('/dashboard');
                    } catch (err) {
                        console.error("Error finalizing payment:", err);
                        alert("Payment succeeded but failed to update status. Please contact support.");
                    } finally {
                        setIsPaying(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsPaying(false);
                    },
                    escape: false
                },
                prefill: {
                    name: userName || "Student",
                    email: userEmail || "student@example.com",
                    contact: "9999999999"
                },
                theme: { color: "#00E0FF" }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                alert("Payment Failed: " + response.error.description);
                setIsPaying(false);
            });
            rzp1.open();
        } catch (error) {
            console.error("Payment error:", error);
            setIsPaying(false);
        }
    };

    return (
        <AuthGuard>
            <ThemeProvider>
                <div className="flex h-screen items-center justify-center bg-[#09090b] p-4 text-white relative overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--color-primary-start)]/20 rounded-full blur-[120px] -z-10 animate-float pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--color-accent-blue)]/10 rounded-full blur-[100px] -z-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

                    <div className="max-w-md w-full p-8 text-center space-y-8 relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[var(--color-primary-start)] to-[var(--color-accent-blue)] rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
                            <CreditCard className="w-10 h-10 text-black" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Unlock Dashboard</h2>
                            <p className="text-gray-400 text-sm leading-relaxed px-4">
                                Complete the one-time payment of <span className="text-white font-bold">₹50</span> to access your attendance tracking dashboard.
                            </p>
                        </div>

                        <NeoButton
                            onClick={handlePayment}
                            isLoading={isPaying || !orderData}
                            className="w-full py-4 text-lg font-bold shadow-[0_0_20px_rgba(0,224,255,0.3)] hover:shadow-[0_0_30px_rgba(0,224,255,0.5)]"
                        >
                            {isPaying ? "Processing..." : !orderData ? "Initializing Secure Gateway..." : "Pay ₹50 Now"}
                        </NeoButton>
                        <p className="text-xs text-gray-600 font-medium pb-2">Secured by Razorpay • Instant Activation</p>

                        {/* Sign Out Link */}
                        <div className="pt-4 border-t border-white/10">
                            <button
                                onClick={async () => {
                                    try {
                                        await supabase.auth.signOut();
                                    } catch (err: any) {
                                        console.error("Sign out network error, forcing local logout:", err);
                                    } finally {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                        window.location.href = '/login';
                                    }
                                }}
                                className="text-sm text-gray-500 hover:text-white transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </AuthGuard>
    );
}
