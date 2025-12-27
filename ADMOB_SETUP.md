# AdMob Integration Guide

## ✅ What Has Been Configured

### 1. **AdMob Plugin Installed**
- Installed `@capacitor-community/admob` package
- This plugin provides native AdMob integration for Capacitor apps

### 2. **Android Configuration**

#### AndroidManifest.xml
- Added AdMob App ID: `ca-app-pub-8396981938969998~1298372785`
- Already has AD_ID permission (required for AdMob)

#### build.gradle
- Added Google Play Services Ads SDK: `com.google.android.gms:play-services-ads:23.5.0`

### 3. **React Components**

#### AdMob Component (`components/AdMob.tsx`)
- Created AdMob banner component
- Automatically detects native platform (Android/iOS)
- Only initializes on mobile devices
- Supports top and bottom banner positions

#### App Integration (`App.tsx`)
- AdMob banners show on mobile (Android/iOS)
- AdSense ads show on web/desktop
- Platform detection using `Capacitor.isNativePlatform()`
- Banner placement:
  - **Top banner**: Shows at the top of the screen on mobile
  - **Bottom banner**: Shows at the bottom of the screen on mobile

### 4. **Ad Unit Configuration**

- **App ID**: `ca-app-pub-8396981938969998~1298372785`
- **Banner Ad Unit ID**: `ca-app-pub-8396981938969998/8850377981`
- **Interstitial Ad Unit ID**: `ca-app-pub-8396981938969998/1925236354`

## 📱 How It Works

### Mobile (Android/iOS)
- Shows **AdMob banners** (native ads) - top and bottom
- Shows **AdMob interstitials** (full-screen ads) at strategic moments:
  - After each game ends (1.5 second delay)
  - Every 3 games when starting a new game
- Better performance and revenue than AdSense in mobile apps

### Web/Desktop
- Shows **AdSense ads** (web ads)
- Sidebar placement on desktop
- Optimized for web viewing

## 🚀 Next Steps

### 1. Sync Capacitor
```bash
npm run android:sync
```

This will:
- Build the web assets
- Sync the AdMob plugin to Android
- Update native Android code

### 2. Build and Test
```bash
npm run android:build:debug
```

Or for release:
```bash
npm run android:build
```

### 3. Test AdMob Integration

**Important**: New AdMob ad units may take up to an hour to start showing ads.

For testing, you can use test ad unit IDs:
- Test Banner: `ca-app-pub-3940256099942544/6300978111`

To enable test ads, modify `components/AdMob.tsx`:
```typescript
isTesting: true,  // Change to true for testing
```

### 4. Verify in AdMob Console

1. Go to [AdMob Console](https://apps.admob.com/)
2. Check your app: "McLearn® - Tic Tac Toe Toe"
3. Monitor ad requests and impressions
4. Review revenue reports

## 🔧 Configuration Details

### AdMob Component Props

```typescript
<AdMobBanner 
  adUnitId="ca-app-pub-8396981938969998/8850377981"
  position="top" | "bottom"
  className="optional-css-class"
/>
```

### Banner Sizes
- Default: Standard banner (320x50 on phones)
- Automatically adjusts for tablet sizes
- Position: Top or bottom of screen

## ⚠️ Important Notes

1. **Ad Unit Activation**: New ad units can take up to 1 hour to become active
2. **Testing**: Use test ad units during development to avoid policy violations
3. **Revenue**: AdMob typically performs better than AdSense in mobile apps
4. **Policy Compliance**: Ensure your app complies with [AdMob policies](https://support.google.com/admob/answer/6128543)

## 🐛 Troubleshooting

### Ads Not Showing
1. Check AdMob console for ad unit status
2. Verify App ID is correct in AndroidManifest.xml
3. Check device logs for AdMob errors
4. Ensure AD_ID permission is in manifest (✅ already added)
5. Wait up to 1 hour for new ad units to activate

### Build Errors
1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run android:sync` to sync Capacitor plugins
3. Clean build: `npm run clean:all` then rebuild

### Testing
- Use test ad unit IDs during development
- Test on real devices (not emulators) for best results
- Check AdMob console for request/impression data

## 📊 Ad Placement Strategy

Current setup:
- **Mobile**: 
  - AdMob banners (top + bottom)
  - AdMob interstitials (after games end, every 3 games)
- **Web**: AdSense sidebars (left + right on desktop)

This provides:
- Optimal revenue from mobile users (AdMob banners + interstitials)
- Web monetization via AdSense
- Strategic interstitial placement (not too frequent)
- Good user experience

### Interstitial Ad Timing
- **After game ends**: Shows 1.5 seconds after winner is determined
- **Every 3 games**: Shows when starting a new game (after every 3rd game)
- Ads are preloaded in the background for smooth experience

## ✅ Checklist

- [x] AdMob plugin installed
- [x] Android SDK added to build.gradle
- [x] AdMob App ID configured in AndroidManifest.xml
- [x] AD_ID permission added
- [x] AdMob banner component created
- [x] AdMob interstitial utility created
- [x] Integrated banners into App.tsx with platform detection
- [x] Integrated interstitials (after games end, every 3 games)
- [ ] Run `npm run android:sync`
- [ ] Build and test on device
- [ ] Verify banner ads are showing
- [ ] Verify interstitial ads are showing
- [ ] Monitor AdMob console

