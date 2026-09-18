# 📱 KisanProcure Android APK

Official pre-built Android installation package (.apk) for the **KisanProcure (किसानप्रोक्योर)** platform (Smart India Hackathon 2026 — SIH26032).

---

## 📥 Direct Download Links

| Link Type | URL |
|-----------|-----|
| 🔗 **Direct Binary Download** | [Download KisanProcure.apk](https://raw.githubusercontent.com/PiyushSingh20/KisanProcure/main/apk/KisanProcure.apk) |
| 🌐 **GitHub File Page** | [View KisanProcure.apk on GitHub](https://github.com/PiyushSingh20/KisanProcure/blob/main/apk/KisanProcure.apk) |
| 📦 **Root Binary Download** | [Download KisanProcure.apk (Root)](https://raw.githubusercontent.com/PiyushSingh20/KisanProcure/main/KisanProcure.apk) |

---

## 📋 File Details & Integrity Checksums

- **File Name:** `KisanProcure.apk`
- **File Size:** `4.91 MB (4,908,409 bytes)`
- **Package Name:** `com.kisanprocure.app`
- **Application Version:** `1.0.0`
- **Version Code:** `1`
- **Minimum Android Version:** Android 7.0 Nougat (API Level 24) — compatible with >95% active Android phones
- **Target Android Version:** Android 16 (API Level 36) — compliant with latest Android security policies
- **SHA-256 Checksum:** `05CCC29FCF32A3EEB24DC2020958B5BB61EFC0B925B144F9094DB000B0C1BC96`
- **MD5 Checksum:** `BEFC0BBC70D4F8436E07BE3F9856E8E5`

### Verify Checksum in Terminal
```powershell
Get-FileHash -Path "apk/KisanProcure.apk" -Algorithm SHA256
```
or in Linux/macOS:
```bash
sha256sum apk/KisanProcure.apk
```

---

## 📲 How to Install on Your Android Device

### Method 1: Direct Download on Phone (Simplest)
1. Open this repository on your mobile phone browser:
   `https://raw.githubusercontent.com/PiyushSingh20/KisanProcure/main/apk/KisanProcure.apk`
2. Tap **Download anyway** if Android warns you about downloading an APK.
3. Once downloaded, open the notification or find `KisanProcure.apk` in your **Downloads** folder.
4. Tap **Install**. If prompted, toggle on **"Allow from this source"** in settings.
5. Launch **KisanProcure** and test all features!

### Method 2: Transfer from PC
1. Download `KisanProcure.apk` to your PC.
2. Connect your Android phone to your PC using a USB cable.
3. Copy `KisanProcure.apk` into your phone's **Download** or **Internal Storage** folder.
4. Open the **Files** app on your phone, locate `KisanProcure.apk`, and tap **Install**.

### Method 3: Using ADB (Developer Mode)
If your phone is connected with USB Debugging enabled:
```powershell
adb install -r apk/KisanProcure.apk
```

---

## 🔐 Permissions Requested
- `android.permission.INTERNET`: Connect to KisanProcure procurement APIs and WebSocket queue updates.
- `android.permission.ACCESS_NETWORK_STATE`: Detect offline mode for cached offline-first operations.
- `android.permission.POST_NOTIFICATIONS`: Real-time queue call reminders and slot booking updates.
