import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kisanprocure.app',
  appName: 'KisanProcure',
  webDir: 'dist',
  server: {
    // androidScheme 'https' means the WebView serves local files over https://
    // This is needed for modern Android security (mixed-content restrictions)
    androidScheme: 'https',
    // allowMixedContent: cleartext http to localhost is needed for LOCAL DEVELOPMENT only
    // For production APK, VITE_API_URL must point to an HTTPS endpoint
    cleartext: false,
  },
  android: {
    // Allow WebView to connect to localhost for dev/demo builds
    // Remove for production release
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    minWebViewVersion: 60,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#1e5c33',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e5c33',
      overlaysWebView: false,
    },
  },
};

export default config;
