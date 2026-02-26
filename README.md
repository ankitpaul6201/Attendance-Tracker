# Attendance Tracker

A robust Next.js application designed for tracking student attendance, managing schedules, and offering a premium dashboard via Razorpay subscription. This project is configured to run both as a standard web application (e.g., hosted on Vercel) and as a native Android app using Capacitor.

## Features
- **Student Dashboard:** View attendance, schedules, and subjects.
- **Razorpay Integration:** Secure payment gateway for unlocking premium features.
- **Supabase Backend:** Uses Supabase for authentication, PostgreSQL database, and Edge Functions.
- **Cross-Platform:** Works seamlessly on the web and on Android devices.

## Requirements
- Node.js (v18+)
- Capacitor CLI
- Supabase account (for database & auth)

## Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration for Receipts
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Running Locally

To start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying to Vercel (Web Version)

The web version relies on Next.js API routes (like `/api/create-order`) to process payments securely. When deploying to Vercel, the app builds as a standard Next.js application (Server-Side + API routes).

1. Push your code to GitHub.
2. Link your repository in the Vercel Dashboard.
3. Add your environment variables in the Vercel project settings.
4. Deploy!

Vercel will run the standard `npm run build` command, which compiles the API routes so Razorpay checkout works perfectly.

## Building for Android (Mobile Version)

Because an Android APK (via Capacitor) cannot run a Node.js server, we must export the Next.js app as static HTML/files. The API routes will be excluded. For the mobile app to process payments, it connects directly to your live Vercel URL (which hosts your API routes).

When building for Android, you **must** use the custom `build:mobile` script:

```bash
# 1. Generate the static export (requires cross-env)
npm run build:mobile

# 2. Sync the static files with the native Android project
npx cap sync android

# 3. Open in Android Studio to build the APK
npx cap open android
```

**Note:** Ensure that in your app's frontend fetch calls (e.g., calling `/api/create-order`), it correctly prefixes the URL with your live Vercel domain if the app is running in the native WebView, otherwise the fetch will fail. 

---

Built with [Next.js](https://nextjs.org/) and [Capacitor](https://capacitorjs.com/).
