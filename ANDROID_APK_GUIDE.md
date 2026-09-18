# KisanProcure Android APK Guide (SIH26032)

The **KisanProcure** web platform has been successfully packaged into an installable Android APK using Capacitor and the Android Native SDK toolchain.

---

## 📱 Generated APK Files

| File | Size | Path |
|------|------|------|
| **KisanProcure.apk** (Root) | ~4.68 MB | [`d:/New folder/KisanProcure.apk`](file:///d:/New%20folder/KisanProcure.apk) |
| **KisanProcure.apk** (Folder) | ~4.68 MB | [`d:/New folder/apk/KisanProcure.apk`](file:///d:/New%20folder/apk/KisanProcure.apk) |
| **app-debug.apk** (Gradle output) | ~4.68 MB | [`d:/New folder/android/app/build/outputs/apk/debug/app-debug.apk`](file:///d:/New%20folder/android/app/build/outputs/apk/debug/app-debug.apk) |

---

## ⚙️ APK Specifications

- **App Name**: KisanProcure
- **Package ID**: `com.kisanprocure.app`
- **Version**: `1.0.0` (versionCode: `1`)
- **Minimum Android Version**: Android 7.0 (API 24) — covers >95% of active Android devices
- **Target Android Version**: Android 16 (API 36) — complies with Google Play & modern Android security standards
- **JDK Toolchain**: Eclipse Temurin OpenJDK 21 LTS (`C:\Users\ASUS\.jdks\jdk-21.0.6+7`)
- **Permissions**:
  - `android.permission.INTERNET` (API connectivity)
  - `android.permission.ACCESS_NETWORK_STATE` (offline detection & sync)
  - `android.permission.POST_NOTIFICATIONS` (procurement alerts & slot reminders)

---

## 🚀 How to Install on an Android Phone

### Option A: Direct Transfer via USB / WhatsApp / Google Drive
1. Transfer `KisanProcure.apk` to your Android device via USB cable, WhatsApp Web, Google Drive, or email.
2. On your phone, tap the APK file to install.
3. If prompted by Android, allow **"Install from unknown sources"** for your file manager or browser.
4. Tap **Install** and launch **KisanProcure**!

### Option B: Using ADB (USB Debugging)
If your phone is connected to your PC with USB debugging enabled:
```powershell
$env:ANDROID_HOME = "C:\Users\ASUS\AppData\Local\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" install -r "d:\New folder\apk\KisanProcure.apk"
```

---

## 🛠️ Rebuilding the APK

All commands have been configured in [`package.json`](file:///d:/New%20folder/package.json):

### Build Debug APK:
```powershell
$env:JAVA_HOME = "C:\Users\ASUS\.jdks\jdk-21.0.6+7"
$env:ANDROID_HOME = "C:\Users\ASUS\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

pnpm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

### Build Production Release APK:
1. Update `.env.production` with your deployed backend HTTPS endpoint:
   ```env
   VITE_API_URL=https://api.kisanprocure.yourdomain.in/api/v1
   ```
2. Run:
   ```powershell
   pnpm run build:prod
   npx cap sync android
   cd android
   .\gradlew.bat assembleRelease
   ```
