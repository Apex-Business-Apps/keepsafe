# Android WebView Wrapper - KeepSafe

**Package**: `icu.keepsafe.app`  
**Target**: Play Console submission  
**Architecture**: WebView wrapper pointing to `https://keepsafe.icu`

---

## Prerequisites

- Android Studio (latest stable)
- JDK 11 or higher
- Android SDK 24+ (Nougat) minimum, target SDK 34+

---

## Step 1: Create Android Project

```bash
# In Android Studio:
# File → New → New Project → Empty Activity
# Package name: icu.keepsafe.app
# Language: Kotlin
# Minimum SDK: API 24 (Android 7.0)
```

---

## Step 2: Configure `build.gradle` (Module: app)

```gradle
android {
    namespace 'icu.keepsafe.app'
    compileSdk 34

    defaultConfig {
        applicationId "icu.keepsafe.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.browser:browser:1.7.0'
}
```

---

## Step 3: Create `MainActivity.kt`

```kotlin
package icu.keepsafe.app

import android.annotation.SuppressLint
import android.net.Uri
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                return when {
                    url.startsWith("https://keepsafe.icu") -> {
                        view.loadUrl(url)
                        false
                    }
                    else -> {
                        // Open external links in Custom Tabs
                        openCustomTab(url)
                        true
                    }
                }
            }
        }

        webView.loadUrl("https://keepsafe.icu")
    }

    private fun openCustomTab(url: String) {
        val builder = CustomTabsIntent.Builder()
        val customTabsIntent = builder.build()
        customTabsIntent.launchUrl(this, Uri.parse(url))
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
```

---

## Step 4: Create `res/layout/activity_main.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

---

## Step 5: Configure `AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="icu.keepsafe.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

---

## Step 6: Create `res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">keepsafe.icu</domain>
    </domain-config>
</network-security-config>
```

---

## Step 7: App Icons

Place the following icon sizes in `res/mipmap-*` directories:

- `mipmap-mdpi`: 48x48px
- `mipmap-hdpi`: 72x72px
- `mipmap-xhdpi`: 96x96px
- `mipmap-xxhdpi`: 144x144px
- `mipmap-xxxhdpi`: 192x192px

**Adaptive Icons** (Android 8.0+):
- Foreground layer: 108x108dp with 72x72dp safe zone
- Background layer: 108x108dp solid color or drawable

Use Android Studio's Image Asset tool:
```
Right-click res → New → Image Asset → Launcher Icons (Adaptive and Legacy)
```

---

## Step 8: Build Release APK/AAB

```bash
# Generate release bundle
./gradlew bundleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
```

Sign with your keystore:
```bash
# Generate keystore (first time only)
keytool -genkey -v -keystore keepsafe-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias keepsafe

# In build.gradle, add signingConfigs:
signingConfigs {
    release {
        storeFile file("path/to/keepsafe-release.jks")
        storePassword "YOUR_STORE_PASSWORD"
        keyAlias "keepsafe"
        keyPassword "YOUR_KEY_PASSWORD"
    }
}
```

---

## Play Console Submission Checklist

### Pre-Submission

- [ ] App signed with production keystore
- [ ] Version code incremented
- [ ] Privacy policy URL: `https://keepsafe.icu/privacy`
- [ ] App category: Productivity / Lifestyle
- [ ] Content rating questionnaire completed
- [ ] Target audience: 13+ (COPPA compliant)

### Assets Required

- [ ] Feature graphic: 1024x500px
- [ ] Screenshots: 2-8 images (phone + tablet)
- [ ] App icon: 512x512px high-res
- [ ] Short description: ≤80 characters
- [ ] Full description: ≤4000 characters

### Store Listing

**Short Description**:
```
Track items, monitor recalls, export for insurance. Your home guardian.
```

**Full Description**:
```
KeepSafe helps you catalog what you own, track warranties, and get alerts on product recalls.

KEY FEATURES:
• Catalog items with photos and receipts
• Barcode scanning for quick entry
• Warranty expiration tracking
• Official recall alerts (CPSC, Health Canada)
• Export insurance binder PDF
• Secure cloud storage

PRIVACY:
Your data is encrypted and never shared. We comply with PIPEDA and GDPR principles.

RECALLS:
Automatic matching against US CPSC, Health Canada, and EU Safety Gate databases.

Perfect for homeowners, renters, and families who want peace of mind.
```

### Testing

- [ ] Test on physical devices (Android 7.0 - 14)
- [ ] Verify HTTPS connection
- [ ] Test Custom Tabs for external links
- [ ] Verify back button navigation
- [ ] Test offline behavior (graceful degradation)

### Compliance

- [ ] Data safety form completed (no data collected by wrapper)
- [ ] No third-party analytics in wrapper
- [ ] HTTPS enforced (network security config)
- [ ] No cleartext traffic

---

## Common Issues

### Issue: WebView blank screen
**Solution**: Ensure `javaScriptEnabled = true` and `domStorageEnabled = true`

### Issue: External links open in WebView
**Solution**: Implement `shouldOverrideUrlLoading` with Custom Tabs

### Issue: Back button exits app
**Solution**: Override `onBackPressed()` to call `webView.canGoBack()`

---

## Resources

- [Android WebView Docs](https://developer.android.com/reference/android/webkit/WebView)
- [Custom Tabs](https://developer.chrome.com/docs/android/custom-tabs/)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

---

**Last Updated**: 2025-10-06  
**Maintainer**: KeepSafe Team
