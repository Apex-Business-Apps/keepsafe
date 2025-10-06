# iOS WKWebView Wrapper - KeepSafe

**Bundle ID**: `icu.keepsafe.app`  
**Target**: App Store Connect submission  
**Architecture**: WKWebView wrapper pointing to `https://keepsafe.icu`

---

## Prerequisites

- macOS with Xcode 15+ installed
- Apple Developer Program membership ($99/year)
- Valid signing certificate & provisioning profile

---

## Step 1: Create Xcode Project

```bash
# Open Xcode:
# File → New → Project → iOS → App
# Product Name: KeepSafe
# Organization Identifier: icu.keepsafe
# Bundle Identifier: icu.keepsafe.app
# Interface: SwiftUI
# Language: Swift
```

---

## Step 2: Configure `Info.plist`

Add the following keys to your `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>keepsafe.icu</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <true/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
    </dict>
</dict>
```

**Note**: Since `keepsafe.icu` uses HTTPS with valid TLS, this configuration enforces secure connections only.

---

## Step 3: Create `WebView.swift`

```swift
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL
    @Binding var canGoBack: Bool
    @Binding var canGoForward: Bool
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        if webView.url == nil {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }
    
    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: WebView
        
        init(_ parent: WebView) {
            self.parent = parent
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.canGoBack = webView.canGoBack
            parent.canGoForward = webView.canGoForward
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }
            
            // Allow keepsafe.icu domain
            if url.host?.contains("keepsafe.icu") == true {
                decisionHandler(.allow)
                return
            }
            
            // Open external links in Safari
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            }
            decisionHandler(.cancel)
        }
    }
}
```

---

## Step 4: Create `ContentView.swift`

```swift
import SwiftUI

struct ContentView: View {
    @State private var canGoBack = false
    @State private var canGoForward = false
    
    var body: some View {
        ZStack {
            if let url = URL(string: "https://keepsafe.icu") {
                WebView(url: url, canGoBack: $canGoBack, canGoForward: $canGoForward)
                    .edgesIgnoringSafeArea(.all)
            } else {
                VStack {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 48))
                        .foregroundColor(.red)
                    Text("Unable to load KeepSafe")
                        .font(.title2)
                        .padding()
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
```

---

## Step 5: Update `KeepSafeApp.swift`

```swift
import SwiftUI

@main
struct KeepSafeApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

---

## Step 6: App Icons (Asset Catalog)

Configure icons in `Assets.xcassets/AppIcon.appiconset`:

### Required Sizes (iOS)

| Device | Size (px) | Scale | Usage |
|--------|-----------|-------|-------|
| iPhone | 180x180 | 3x | App Icon |
| iPhone | 120x120 | 2x | App Icon |
| iPad Pro | 167x167 | 2x | App Icon |
| iPad | 152x152 | 2x | App Icon |
| App Store | 1024x1024 | 1x | Marketing |

### How to Add Icons

1. Open `Assets.xcassets`
2. Select `AppIcon`
3. Drag PNG files into appropriate slots
4. Ensure all sizes are provided (no alpha channel)

**Tip**: Use a tool like [AppIconMaker](https://appiconmaker.co/) to generate all sizes from a single 1024x1024px icon.

---

## Step 7: Configure Capabilities

In Xcode project settings → Signing & Capabilities:

- [ ] Automatic signing enabled (or manual with provisioning profile)
- [ ] Team selected
- [ ] Bundle ID: `icu.keepsafe.app`
- [ ] Deployment target: iOS 14.0+

**No additional capabilities required** for basic WebView wrapper.

---

## Step 8: Build & Archive

```bash
# Select target device: Any iOS Device (arm64)
# Product → Archive
# Wait for build to complete
# Organizer opens with archive

# Distribute App → App Store Connect
# Upload with automatic signing
```

---

## App Store Connect Submission Checklist

### Pre-Submission

- [ ] App archived and uploaded via Xcode
- [ ] Privacy policy URL: `https://keepsafe.icu/privacy`
- [ ] App category: Productivity
- [ ] Age rating: 4+ (no objectionable content)
- [ ] Pricing: Free (or set tier)

### Assets Required

- [ ] App icon: 1024x1024px (no alpha, no rounded corners)
- [ ] iPhone screenshots: 6.7" (1290x2796) + 5.5" (1242x2208)
- [ ] iPad screenshots (if iPad supported): 12.9" (2048x2732)
- [ ] App preview video (optional): 15-30s MP4

### Metadata

**App Name**:
```
KeepSafe - Home Inventory
```

**Subtitle** (30 chars max):
```
Track Items & Recalls
```

**Description**:
```
KeepSafe helps you catalog what you own, track warranties, and get official alerts on product recalls.

FEATURES:
• Catalog items with photos and receipts
• Barcode scanning for quick entry
• Warranty expiration reminders
• Official recall alerts (CPSC, Health Canada, EU)
• Export insurance binder PDF
• Secure cloud storage

PRIVACY-FIRST:
Your data is encrypted and never shared. We comply with PIPEDA and GDPR principles.

RECALLS:
Automatic matching against US CPSC, Health Canada, and EU Safety Gate databases.

Perfect for homeowners, renters, and families who want to protect what matters most.
```

**Keywords** (100 chars max):
```
inventory,recall,insurance,warranty,home,barcode,tracking,protection,guardian
```

**Promotional Text** (170 chars):
```
New: Export your full home inventory as an insurance binder PDF. Perfect for claims and peace of mind. Track what matters, stay protected.
```

### App Privacy

App Store requires privacy details form:

- [ ] **Data Collected**: None directly by wrapper
- [ ] **Third-Party SDKs**: None in wrapper
- [ ] **Tracking**: No tracking enabled
- [ ] **Privacy Policy**: Link to `https://keepsafe.icu/privacy`

**Important**: If the web app collects data, disclose it in the form even if the wrapper doesn't.

### Testing

- [ ] Test on physical iPhone (iOS 14 - 17)
- [ ] Test on iPad (if universal app)
- [ ] Verify HTTPS connection works
- [ ] Test Safari opening for external links
- [ ] Verify back swipe gesture navigation
- [ ] Test airplane mode (graceful error)

### Review Notes

Provide Apple with:
```
Test Account (if auth required):
Username: [test user email]
Password: [test password]

Notes:
This is a WebView wrapper for https://keepsafe.icu. The web app helps users track home inventory and product recalls. No native functionality beyond the web container.
```

---

## Common Issues

### Issue: Blank screen on launch
**Solution**: Verify `Info.plist` has correct App Transport Security settings

### Issue: External links don't open
**Solution**: Check `decidePolicyFor` implementation in `WKNavigationDelegate`

### Issue: Back navigation doesn't work
**Solution**: Ensure `allowsBackForwardNavigationGestures = true` on WKWebView

### Issue: Rejection for "minimal functionality"
**Solution**: Emphasize web app features in review notes; ensure rich content on first load

---

## Icon Asset Checklist

### iOS App Icons (all required)

- [ ] 1024x1024 (App Store)
- [ ] 180x180 (iPhone 3x)
- [ ] 120x120 (iPhone 2x)
- [ ] 167x167 (iPad Pro)
- [ ] 152x152 (iPad)
- [ ] 76x76 (iPad 1x)
- [ ] 40x40, 58x58, 60x60, 80x80, 87x87, 120x120 (Spotlight, Settings)

**Format**: PNG, no transparency, no rounded corners

### Launch Screen

Create `LaunchScreen.storyboard` with:
- Centered app icon or logo
- Brand color background
- Keep minimal (appears <1 second)

---

## Resources

- [WKWebView Documentation](https://developer.apple.com/documentation/webkit/wkwebview)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## App Store Review Tips

1. **Be Transparent**: Clearly state it's a web wrapper in review notes
2. **Show Value**: Ensure rich content loads immediately (no splash screen delay)
3. **Offline Handling**: Show friendly error message when offline
4. **Performance**: Optimize web app for mobile (LCP <2.5s)
5. **Privacy**: Disclose all data collection in web app

---

**Last Updated**: 2025-10-06  
**Maintainer**: KeepSafe Team
