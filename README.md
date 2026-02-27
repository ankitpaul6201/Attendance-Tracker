# 📊 Attendance Tracker

> A futuristic attendance management system built with Next.js and Capacitor — available as a web app and native Android APK.

**Made by [Ankit Paul](https://github.com/ankitpaul6201)**

---

## 📱 Download APK

> **Android APK is included directly in this repo.**

👉 **[Download app-debug.apk](./releases/app-debug.apk)**

Install it on any Android device (enable *Install from unknown sources* in Settings → Security).

> [!NOTE]
> If the app shows **"Fetch Failed"** or **network errors**, try connecting through a VPN. Some ISPs block Supabase API endpoints in certain regions.

---

## ✨ Features

- 🔐 **Supabase Auth** — Secure email/password login & sign up
- 📅 **Attendance Calendar** — Visual day-by-day attendance tracker
- 📈 **Compliance Ring** — Animated circular progress showing attendance %
- 📚 **Subject Management** — Add, edit, delete subjects with target %, edit & delete via three-dot menu
- 💳 **Razorpay Payment** — One-time ₹50 payment to unlock premium dashboard
- 🌙 **Dark Mode First** — App always opens in dark mode by default
- 🎨 **Light/Dark Toggle** — Switch themes from the sidebar
- 📱 **Native Android App** — Runs via Capacitor as a native APK
- 🚀 **First-time Splash Screen** — "Get Started" shown only on first launch; returning users go straight to login/dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + Custom CSS Variables |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| Animations | Framer Motion (LazyMotion optimized) |
| Charts | Recharts (lazy-loaded) |
| Payments | Razorpay |
| Mobile | Capacitor v6 (Android) |
| Language | TypeScript |

---

## 🚀 Getting Started (Web Dev)

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account

### 1. Clone & Install

```bash
git clone https://github.com/ankitpaul6201/Attendance-Tracker.git
cd Attendance-Tracker
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# API base URL (set to your Vercel domain for the Android app)
NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# Email receipt config (Gmail)
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel (Web Version)

1. Push your code to GitHub
2. Link your repo in the [Vercel Dashboard](https://vercel.com/dashboard)
3. Add all environment variables from `.env.local` to Vercel project settings
4. Deploy — Vercel automatically runs `npm run build`

The web version uses Next.js API routes (`/api/create-order`, `/api/send-receipt`) for secure Razorpay processing.

---

## 📱 Building the Android APK

The mobile app exports Next.js as static HTML (no server-side routes). Payment API calls are proxied to the live Vercel URL.

```bash
# 1. Build static export for mobile
npm run build:mobile

# 2. Sync with Capacitor
npx cap sync android

# 3. Build APK via Gradle (no Android Studio needed)
cd android
.\gradlew.bat assembleDebug

# APK Output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🗄️ Supabase Schema

Key tables:
- **`students`** — User profiles (`id`, `full_name`, `email`, `subscription_active`, `subscription_expiry`)
- **`subjects`** — Subject list per user (`id`, `user_id`, `name`, `target_attendance`)
- **`attendance_records`** — Daily attendance per subject (`subject_id`, `date`, `status`)

See [`supabase/schema.sql`](./supabase/schema.sql) for the full schema.

---

## ❓ Troubleshooting

| Issue | Fix |
|-------|-----|
| **"Fetch Failed"** on login/load | Use a VPN — your ISP may be blocking Supabase endpoints |
| **Razorpay not loading** | Check your internet connection; Razorpay SDK needs network access |
| **"Invalid Refresh Token"** | Log out and log back in; your session may have expired |
| **APK installs but shows blank screen** | Ensure `NEXT_PUBLIC_API_URL` points to your live Vercel deployment |
| **Payment page header overlaps status bar** | Fixed in this build via `android/app/src/main/res/values/styles.xml` |

> [!IMPORTANT]
> If the app shows **"Failed to fetch"** errors or refuses to connect, **enable a VPN** on your device. Supabase and Razorpay API servers may be unreachable on some Indian ISPs without a VPN.

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── page.tsx      # Main dashboard
│   │   ├── subjects/     # Subject management
│   │   ├── profile/      # User profile
│   │   └── payment/      # Razorpay payment page
│   ├── login/            # Auth page
│   └── page.tsx          # Landing splash (first-time only)
├── components/
│   ├── dashboard/        # Chart, Calendar, ComplianceRing
│   ├── layout/           # Sidebar, Header
│   ├── ui/               # GlassCard, NeoButton, Modals, Logo
│   └── providers/        # ThemeContext, ThemeProvider, ThemeToggle
└── lib/
    └── supabase/         # Supabase client helpers
```

---

## 📄 License

MIT — free to use and modify.

---

*Built with ❤️ by [Ankit Paul](https://github.com/ankitpaul6201)*
