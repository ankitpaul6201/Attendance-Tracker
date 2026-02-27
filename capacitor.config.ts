import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.ankit.attendance',
    appName: 'Attendance Tracker',
    webDir: 'out',
    android: {
        // Ensure WebView content doesn't draw into the system status bar area
        backgroundColor: '#0A0A0A',
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#0A0A0A',
            androidSplashResourceName: 'splash',
            showSpinner: false,
        },
    },
};

export default config;
