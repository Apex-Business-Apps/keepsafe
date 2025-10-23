# Add project specific ProGuard rules here.
# Keep WebView JavaScript Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView related classes
-keep public class android.webkit.WebView
-keep public class android.webkit.WebViewClient
-keep public class android.webkit.WebChromeClient

# Keep KeepSafe MainActivity
-keep public class app.keepsafe.MainActivity
