import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-12 rounded-[var(--radius-xl)] text-center max-w-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <h1 className="text-5xl font-bold bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-accent-cyan)] bg-clip-text text-transparent mb-6 drop-shadow-sm">
          Attendance Tracker
        </h1>

        <p className="text-gray-400 text-lg mb-8">
          Futuristic attendance management system initialized.
        </p>

        <Link href="/login">
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white font-semibold shadow-[var(--shadow-glow)] hover:shadow-[0_0_30px_rgba(78,240,255,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0">
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}
