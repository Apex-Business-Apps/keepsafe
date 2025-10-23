# KeepSafe Android App

WebView wrapper for KeepSafe (https://keepsafe.icu) for Google Play Store submission.

## Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK with API 34 (Android 14)

## Setup

1. **Open in Android Studio**
   - Open Android Studio
   - Select "Open an Existing Project"
   - Navigate to this `android/` folder

2. **Sync Gradle**
   - Wait for Gradle sync to complete
   - Resolve any dependency issues

3. **Configure Signing**
   
   For release builds, create a keystore:
   ```bash
   keytool -genkey -v -keystore keepsafe-release.keystore \
     -alias keepsafe -keyalg RSA -keysize 2048 -validity 10000
   ```

   Then add to `app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file("../keepsafe-release.keystore")
               storePassword "YOUR_STORE_PASSWORD"
               keyAlias "keepsafe"
               keyPassword "YOUR_KEY_PASSWORD"
           }
       }
   }
   ```

4. **Build Release APK/AAB**
   ```bash
   ./gradlew assembleRelease    # For APK
   ./gradlew bundleRelease      # For AAB (recommended for Play Store)
   ```

   Output: `app/build/outputs/bundle/release/app-release.aab`

## App Icons

Icons are generated from `/public/icons/src/keepsafe_appicon.svg` and placed in:
- `app/src/main/res/mipmap-mdpi/` (48x48)
- `app/src/main/res/mipmap-hdpi/` (72x72)
- `app/src/main/res/mipmap-xhdpi/` (96x96)
- `app/src/main/res/mipmap-xxhdpi/` (144x144)
- `app/src/main/res/mipmap-xxxhdpi/` (192x192)

Use Android Studio's Image Asset tool or copy from `/public/icons/` with proper density mapping.

## Testing

1. **Run on emulator/device**:
   ```bash
   ./gradlew installDebug
   ```

2. **Test checklist**:
   - [ ] App launches to keepsafe.icu
   - [ ] Navigation works (back button)
   - [ ] External links open in Custom Tabs
   - [ ] Offline mode shows appropriate message
   - [ ] Deep links work (https://keepsafe.icu/*)

## Play Console Submission

See `/docs/store/android.md` for complete submission checklist including:
- Privacy policy URL
- Content rating questionnaire
- Store listing assets
- App signing by Google Play

## Troubleshooting

**Blank screen on load:**
- Check network permissions in AndroidManifest.xml
- Verify JavaScript is enabled in WebView settings
- Check device/emulator internet connection

**External links not opening:**
- Verify androidx.browser dependency
- Check WebViewClient shouldOverrideUrlLoading logic

**Back button doesn't work:**
- Ensure onBackPressed override is implemented correctly
