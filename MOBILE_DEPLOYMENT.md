# Mobile App Deployment Guide (Capacitor JS)

This guide details how to convert, build, and deploy the **Attendance Tracker** web application as a native mobile app for Android and iOS using Capacitor JS.

## 1. Prerequisites

Ensure you have the following installed:
- **Node.js** (v18+)
- **Android Studio** (for Android build)
- **Xcode** (for iOS build - macOS only)
- **CocoaPods** (for iOS dependencies - macOS only)

## 2. Project Setup

The project is already pre-configured with Capacitor.

### **Initialization & Dependencies**
If you haven't already, install the core dependencies and the iOS platform (Android is already added):

```bash
npm install
npm install @capacitor/ios
npx cap add ios
npx cap add android
```

### **Configuration**
- **`next.config.ts`**: Configured with `output: 'export'` to generate a static site.
- **`capacitor.config.ts`**: Configured to look for the `out` directory which Next.js generates.

## 3. Building the Web Assets

Before syncing with the native projects, you must build the web application.

```bash
npm run build
```
*This command generates the static files in the `out/` directory.*

## 4. Syncing to Native

Copy the web assets and native plugins to the Android and iOS projects:

```bash
npx cap sync
```

## 5. App Icons & Splash Screen

To generate the app icon and splash screen automatically, use `@capacitor/assets`.

1.  **Prepare Assets:**
    *   Place your icon file at `assets/icon.png` (1024x1024 px).
    *   Place your splash screen file at `assets/splash.png` (2732x2732 px).
    *   *Note: If you don't have an `assets` folder, create one in the root directory.*

2.  **Install & Generate:**
    ```bash
    npm install --save-dev @capacitor/assets
    npx capacitor-assets generate --iconBackgroundColor '#0A0A0A' --splashBackgroundColor '#0A0A0A'
    ```

## 6. Building for Android (APK/AAB)

1.  **Open Android Studio:**
    ```bash
    npx cap open android
    ```
2.  **Wait for Gradle Sync:** Let Android Studio sync the project dependencies.
3.  **Build APK:**
    *   Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    *   Locate the APK in `android/app/build/outputs/apk/debug/app-debug.apk`.
4.  **Build Release Bundle (for Play Store):**
    *   Go to **Build > Generate Signed Bundle / APK**.
    *   Choose **Android App Bundle**.
    *   Create a new key store (keep it safe!).
    *   Select `release` build variant.
    *   The `.aab` file will be generated for upload to the Play Console.

## 7. Building for iOS (IPA) - *macOS Only*

1.  **Open Xcode:**
    ```bash
    npx cap open ios
    ```
2.  **Configure Signing:**
    *   Click on **App** in the left project navigator.
    *   Go to the **Signing & Capabilities** tab.
    *   Select your **Team** (requires an Apple Developer Account).
3.  **Build & Archive:**
    *   Select **Any iOS Device (arm64)** as the target.
    *   Go to **Product > Archive**.
    *   Once archived, the Organizer window will open.
    *   Click **Distribute App** to upload to App Store Connect or export an `.ipa` file for Ad Hoc distribution.

## 8. Mobile-Specific Tweaks (Already Applied)

*   **Safe Area Insets:** CSS `env(safe-area-inset-*)` has been added to `globals.css` to prevent content from being hidden behind notches or home indicators.
*   **Viewport Meta:** `viewport-fit=cover` and `user-scalable=0` have been added to `layout.tsx` for a native app feel.
*   **Touch Interactions:** Hover states in UI components are designed to work as tap states on mobile.

## 9. Troubleshooting

*   **"Web Not Found":** Ensure you ran `npm run build` *before* `npx cap sync`.
*   **Update App Code:** If you make changes to the React code:
    1.  `npm run build`
    2.  `npx cap sync`
    3.  Run from Android Studio / Xcode again.
