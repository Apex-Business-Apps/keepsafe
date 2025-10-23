# Google Play Store Submission Checklist

**App**: KeepSafe - Home Inventory + Recall Guardian  
**Package**: `app.keepsafe`  
**Target**: Google Play Console Production Release

---

## 📋 Pre-Submission Requirements

### ✅ Technical Requirements

- [x] **Android App Built**: WebView wrapper created in `/android/`
- [x] **Package Name**: `app.keepsafe` (unique, verified)
- [x] **Version Code**: 1
- [x] **Version Name**: 1.0.0
- [x] **Target SDK**: 34 (Android 14)
- [x] **Min SDK**: 24 (Android 7.0+)
- [ ] **Signed Release AAB**: Built and signed with production keystore
- [ ] **App Bundle Size**: < 150 MB (verify after build)
- [ ] **Icon Pack Complete**: All density buckets (mdpi-xxxhdpi)
- [x] **Permissions Declared**: INTERNET, ACCESS_NETWORK_STATE only
- [x] **Network Security**: HTTPS-only for keepsafe.icu

### ✅ App Signing

- [ ] **Upload Key Generated**: Production keystore created
- [ ] **Key Alias**: `keepsafe`
- [ ] **Key Validity**: 10,000 days minimum
- [ ] **Keystore Backup**: Securely stored (CRITICAL - cannot be recovered!)
- [ ] **Play App Signing**: Enable Google Play App Signing (recommended)

**Generate upload key command**:
```bash
keytool -genkey -v -keystore keepsafe-release.keystore \
  -alias keepsafe -keyalg RSA -keysize 2048 -validity 10000
```

---

## 🎨 Store Listing Assets

### Required Graphics

- [ ] **App Icon** (512x512 PNG, 32-bit, no transparency)
  - Export from `/public/icons/icon-512.png` with white background
  - Must be square, no rounded corners

- [ ] **Feature Graphic** (1024x500 PNG/JPEG)
  - Hero banner for Play Store listing
  - Include app name, tagline: "Home Inventory + Recall Guardian"
  - No device frames, must be engaging

- [ ] **Screenshots** (JPEG/PNG, 16:9 or 9:16)
  - **Phone**: 2-8 screenshots (at least 2 required)
    - Min: 320px, Max: 3840px
    - Recommended: 1080x1920 (portrait) or 1920x1080 (landscape)
  - **7-inch Tablet** (optional but recommended): 2-8 screenshots
    - Min: 320px, Max: 3840px
    - Recommended: 1920x1200
  - **10-inch Tablet** (optional): 2-8 screenshots
    - Same specs as 7-inch

**Screenshot Content Suggestions**:
1. Home screen showing inventory dashboard
2. Adding an item with photo
3. Recall alert notification example
4. PDF export/insurance binder preview
5. Dark mode variant
6. Item detail with warranty tracking

- [ ] **Promo Video** (optional, YouTube link)
  - 30 seconds to 2 minutes
  - Showcase key features

---

## 📝 Store Listing Content

### Short Description (80 characters max)
```
Track your stuff. Get recall alerts. Export insurance docs.
```
*(Current: 62 characters)*

### Full Description (4000 characters max)

```markdown
📦 Never lose track of your belongings again

KeepSafe is your personal home inventory manager with built-in product recall monitoring. Perfect for insurance claims, warranty tracking, and peace of mind.

✨ KEY FEATURES

🏠 Smart Home Inventory
• Snap photos and catalog items in seconds
• Track purchase dates, prices, and warranties
• Organize by room or category
• Attach receipts and documents

🚨 Automatic Recall Alerts
• Real-time monitoring of CPSC and Health Canada recalls
• Instant alerts if your items are recalled
• Detailed safety information and remedy instructions

📄 Insurance-Ready Reports
• Generate professional PDF inventory binders
• Perfect for homeowners/renters insurance
• Export anytime, keep offline copies

🔒 Privacy-First Design
• Your data stays yours - no selling or sharing
• Secure cloud backup
• Works offline when needed

💡 Why KeepSafe?

Whether you're filing an insurance claim, checking warranty status, or just want to know what you own, KeepSafe makes it simple. Our recall monitoring gives you peace of mind - if there's a safety issue with your toaster, car seat, or medication, you'll know immediately.

Perfect for:
• Homeowners and renters
• Parents tracking children's items
• Anyone who values their possessions
• Insurance documentation

🌟 Apple-Style Simplicity

No complicated forms. No unnecessary features. Just elegant inventory management that works.

---

Built with enterprise-grade security. Used by families who care about safety.

Privacy Policy: https://keepsafe.icu/privacy
Support: security@keepsafe.app
```

### Additional Metadata

- **App Category**: Productivity (primary), Tools (secondary)
- **Tags/Keywords**: `inventory, home, insurance, recalls, safety, catalog, warranty, CPSC, tracking, belongings`
- **Content Rating**: Everyone (no mature content, ads, or in-app purchases)
- **Target Audience**: Adults 18+
- **Countries**: Start with US, Canada, expand to EU if `EU_SAFETY=true`

---

## 🔒 Privacy & Compliance

### Privacy Policy
- [ ] **Privacy Policy URL**: `https://keepsafe.icu/privacy` (create page - Step 4)
- [ ] **Policy Hosted**: Must be accessible, not a PDF
- [ ] **Content Covers**:
  - Data collected (email only)
  - How data is used (inventory management, auth)
  - Third-party services (Supabase for hosting)
  - User rights (export, delete)
  - Contact info (security@keepsafe.app)

### Data Safety Section (Play Console)
Fill out the Data Safety form:

**Data Collection**:
- ✅ Email address (required for account creation)
- ✅ User-uploaded photos (inventory receipts)
- ❌ No location data
- ❌ No contacts access
- ❌ No device identifiers
- ❌ No payment info (display-only pricing)

**Data Usage**:
- App functionality only (not shared or sold)
- Encrypted in transit and at rest
- User can request deletion

**Security Practices**:
- Data encrypted in transit (HTTPS)
- Data encrypted at rest (Supabase)
- Users can request data deletion

---

## 🧪 Testing Requirements

### Internal Testing Track
- [ ] Create Internal Testing release
- [ ] Add testers (at least 5 people, 14-day minimum testing)
- [ ] Verify app installs on multiple devices:
  - [ ] Android 7.0 (API 24)
  - [ ] Android 10 (API 29)
  - [ ] Android 13 (API 33)
  - [ ] Android 14 (API 34)

### Test Checklist
- [ ] App launches to keepsafe.icu successfully
- [ ] No blank screens or loading failures
- [ ] Back button navigates correctly
- [ ] External links open in browser (not WebView)
- [ ] Offline mode shows appropriate message
- [ ] Deep links work (https://keepsafe.icu/* open in app)
- [ ] PWA features work (add to home screen, offline cache)
- [ ] No crashes or ANRs (Application Not Responding)
- [ ] Permissions requested appropriately (none beyond INTERNET)
- [ ] Dark mode compatibility

---

## 📱 Content Rating

Complete the Content Rating Questionnaire in Play Console:

**Category**: Productivity  
**Target Age**: Everyone  
**Violence**: None  
**Sexual Content**: None  
**Language**: None  
**Controlled Substances**: None  
**Gambling**: None  
**User Interaction**: No chat, no user-generated content sharing  
**Personal Info**: Collects email (disclosed in privacy policy)  
**Location**: No location tracking

Expected Rating: **Everyone** (ESRB), **PEGI 3** (Europe), **USK 0** (Germany)

---

## 🚀 Pre-Launch Checklist

### Before Creating Production Release

- [ ] All internal testing complete (min 14 days, 20+ installs)
- [ ] No critical bugs or crashes
- [ ] Privacy policy live and linked
- [ ] All store assets uploaded (icon, screenshots, feature graphic)
- [ ] Short/full descriptions finalized
- [ ] Content rating certificate obtained
- [ ] Signed AAB uploaded (release build)
- [ ] Target countries selected
- [ ] Pricing set (Free - display-only pricing in-app)

### Release Configuration

- [ ] **Release Name**: "1.0.0 - Initial Release"
- [ ] **Release Notes** (500 chars max):
  ```
  🎉 Welcome to KeepSafe!
  
  • Smart home inventory with photo capture
  • Automatic CPSC & Health Canada recall monitoring
  • Generate insurance-ready PDF reports
  • Privacy-first, offline-capable design
  
  Start cataloging your belongings in seconds!
  ```

- [ ] **Rollout Percentage**: Start with 20%, increase after 48 hours of monitoring
- [ ] **Release Timeline**: Submit for review, expect 3-7 days approval time

---

## 📊 Post-Launch Monitoring

### First 48 Hours
- [ ] Monitor crash reports (Play Console → Quality → Android vitals)
- [ ] Check user reviews (respond within 24 hours)
- [ ] Watch install/uninstall rates
- [ ] Verify no ANR (Application Not Responding) reports

### First Week
- [ ] Increase rollout to 50%
- [ ] Monitor Core Web Vitals (LCP, FID, CLS)
- [ ] Track user retention (Day 1, Day 7)
- [ ] Review Play Store search ranking

### First Month
- [ ] Full 100% rollout
- [ ] Collect user feedback for v1.1 features
- [ ] Plan update cycle (monthly security patches minimum)

---

## 🛠️ Build Commands Reference

### Generate Release AAB
```bash
cd android
./gradlew bundleRelease
```
Output: `app/build/outputs/bundle/release/app-release.aab`

### Sign AAB Manually (if not using Play App Signing)
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore keepsafe-release.keystore \
  app-release.aab keepsafe
```

### Verify Signing
```bash
jarsigner -verify -verbose -certs app-release.aab
```

---

## 📞 Support & Escalation

**Google Play Support**: [g.co/play/console-support](https://g.co/play/console-support)  
**Policy Violations**: Appeal within 7 days via Play Console  
**Technical Issues**: Android Developer community, Stack Overflow  
**KeepSafe Contact**: security@keepsafe.app

---

## ✅ Final Acceptance Criteria

Before submitting to Production:

1. ✅ App installs and launches on Android 7.0+
2. ✅ No white screens or loading errors
3. ✅ Privacy policy accessible at https://keepsafe.icu/privacy
4. ✅ All Play Store assets uploaded and approved
5. ✅ Content rating: Everyone
6. ✅ Signed with production keystore
7. ✅ Internal testing complete (14+ days, no critical bugs)
8. ✅ App size < 150 MB
9. ✅ Target SDK 34, Min SDK 24
10. ✅ HTTPS-only network security enforced

---

**Status**: 🟡 Ready for Build & Testing  
**Blocker**: Need production keystore + Play Console account setup  
**ETA to Submit**: ~7 days after testing begins

**Last Updated**: 2025-10-23  
**Maintained By**: DevOps SRE Team
