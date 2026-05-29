# ShiftFlow

> Recovery and energy planning built for shift workers.

ShiftFlow helps nurses, factory workers, drivers, and anyone on rotating or irregular shifts sleep better, manage caffeine smarter, and recover faster — all without sign-up, with data stored entirely on-device.

---

## Current version

| Field | Value |
|---|---|
| Version | 1.0.7 |
| Build (versionCode) | 12 |
| Platform | Android |
| Package | `com.JustSimpleSoft.shiftflow` |
| JS Engine | Hermes |
| Architecture | New Architecture (arm64-v8a) |

---

## Features

### Free tier
- Manual shift schedule entry (morning, afternoon, night, long day, long night, extended, day off, custom)
- Today's energy plan — personalised sleep window, caffeine cutoff, nap suggestion, meal timing, recovery tips
- Basic weekly overview
- Daily check-in (fatigue, sleep quality, stress, alertness)
- Standard notifications
- Check-in streaks

### PRO (via RevenueCat)
- **AI-powered plan explanations** — personalised reasoning behind every recommendation (Claude claude-sonnet-4-6)
- **Adaptive recovery plans** — plans that adjust based on check-in history
- **Schedule import** — photo/screenshot of a roster → Claude Vision OCR → auto-populated schedule
- **Trend insights** — alertness, sleep quality, and fatigue over time
- **Smart reminders** — context-aware alerts based on shift type
- **Check-in history export** — CSV export of all check-ins

---

## Screens & navigation

```
(tabs)
├── Today          — energy score, shift card, sleep window, ad, caffeine, nap, meals, recovery tips
├── Calendar       — 7-day grid view with shift blocks, week navigation, stats strip
├── Schedule       — week-by-week shift management, roster import shortcut
├── Weekly         — weekly plan, insights, streaks (PRO-gated trend data)
└── Settings       — profile, shift time defaults, notifications, language, time format, about

Modals
├── Check-in       — 4-axis daily self-report
├── Paywall        — PRO plans (monthly / yearly), feature list, restore purchase
├── Plan explanation — why each recommendation was made (PRO)
└── Roster import  — camera / library → OCR → shift review → save

Onboarding (first launch)
└── Language → Role → Shift pattern → Sleep profile → Caffeine sensitivity → Notifications → Goals
```

---

## Architecture

### State management
Six Zustand stores, each persisted to AsyncStorage:

| Store | Key | Purpose |
|---|---|---|
| `userStore` | `@shiftflow/user_profile` | Onboarding profile, preferences, shift time defaults |
| `scheduleStore` | `@shiftflow/schedule` | All shift entries |
| `planStore` | *(in-memory + cache)* | Today's and weekly generated plans |
| `checkInStore` | `@shiftflow/check_ins` | 90-day check-in history |
| `premiumStore` | `@shiftflow/premium` | Premium tier state |
| `languageStore` | `shiftflow_language` | UI language (en / pl) |

### Routing
Expo Router v6 with typed routes. Navigation guard in `_layout.tsx` redirects to onboarding on first launch.

### Plan generation
Plans are generated from user profile + current shift + recent check-ins. Cached for 4 hours (`PLAN_CACHE_TTL_HOURS`). AI explanations call Claude claude-sonnet-4-6 via Anthropic API (PRO only).

### Ads
Native Advanced ad from AdMob (`react-native-google-mobile-ads` v16) displayed on the Today screen between the sleep window and caffeine cards. Automatically hidden for PRO users. Uses `NativeAsset` / `NativeAssetType` API. Isolated in its own `AdErrorBoundary` — ad failures never crash the screen.

---

## Tech stack

| Category | Library | Version |
|---|---|---|
| Framework | React Native | 0.81.5 |
| UI layer | Expo | ~54.0.0 |
| Routing | expo-router | ~6.0.23 |
| JS engine | Hermes | bundled |
| State | Zustand | ^4.5.5 |
| Validation | Zod | ^3.24.0 |
| Fonts | @expo-google-fonts/inter | ^0.2.3 |
| Icons | @expo/vector-icons | ^15.0.3 |
| Storage | @react-native-async-storage/async-storage | 2.2.0 |
| Purchases | react-native-purchases (RevenueCat) | ^10.1.0 |
| Ads | react-native-google-mobile-ads | ^16.3.3 |
| Notifications | expo-notifications | ~0.32.17 |
| Gestures | react-native-gesture-handler | ~2.28.0 |
| Animations | react-native-reanimated | ~4.1.1 |
| Image picker | expo-image-picker | ~17.0.11 |
| Safe area | react-native-safe-area-context | ~5.6.0 |
| Haptics | expo-haptics | ~15.0.8 |
| Date utils | date-fns | ^3.6.0 |

---

## Environment variables

Create a `.env` file at project root:

```env
# AI (Claude) — required for plan explanations and roster OCR
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...

# RevenueCat — required for PRO purchases
EXPO_PUBLIC_REVENUECAT_API_KEY=...

# Feature flags
EXPO_PUBLIC_AI_PROVIDER=claude          # or 'mock'
EXPO_PUBLIC_ANALYTICS_PROVIDER=posthog  # or 'mock'
EXPO_PUBLIC_ENABLE_AI_EXPLANATIONS=true
EXPO_PUBLIC_ENABLE_SCHEDULE_OCR=true
EXPO_PUBLIC_APP_ENV=production          # or 'development'
```

All keys are optional for local development — the app falls back to mock providers.

---

## Building

### Prerequisites
- Node.js 18+
- Android Studio with Android SDK
- JDK 17

### Install dependencies
```bash
npm install
```

### Run in development (Metro bundler required)
```bash
npx expo start --android
```

### Release build (AAB for Play Store)
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Release APK (direct sideload)
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

> **Note:** Android Studio's green ▶ button builds a *debug* APK — it requires Metro running on `localhost:8081`. Always use Gradle for distributable builds.

---

## Versioning

Version is managed in **three files** — always update all three together:

| File | Field |
|---|---|
| `app.json` | `expo.version` |
| `package.json` | `version` |
| `android/app/build.gradle` | `versionCode` + `versionName` |

The in-app Settings screen reads version from `expo-constants` (`Constants.expoConfig?.version`) and always reflects `app.json` automatically.

---

## Supported languages

| Code | Language |
|---|---|
| `en` | English |
| `pl` | Polish |

Language is selected during onboarding and can be changed in Settings.

---

## Shift types

| Type | Emoji | Default hours |
|---|---|---|
| Morning | 🌅 | 06:00 – 14:00 |
| Afternoon | 🌆 | 14:00 – 22:00 |
| Night | 🌙 | 22:00 – 06:00 |
| Long day | ☀️ | 07:00 – 19:00 |
| Long night | 🌃 | 19:00 – 07:00 |
| Extended | 🔄 | 24 h+ |
| Day off | 🏖️ | — |
| Custom | ⚙️ | User-defined |

Default start/end times for each type are configurable per-user in Settings → Shift defaults.

---

## Premium gating

| Feature | Free | PRO |
|---|---|---|
| Manual schedule | ✓ | ✓ |
| Today's plan | ✓ | ✓ |
| Basic weekly overview | ✓ | ✓ |
| Daily check-in | ✓ | ✓ |
| Standard reminders | ✓ | ✓ |
| AI plan explanations | — | ✓ |
| Adaptive plans | — | ✓ |
| Roster photo import | — | ✓ |
| Trend insights | — | ✓ |
| Smart reminders | — | ✓ |
| Check-in CSV export | — | ✓ |

---

## Privacy

- No account required
- No data leaves the device (except AI/RevenueCat API calls when features are used)
- All user data stored in AsyncStorage on-device
- AdMob may collect device identifiers per Google's privacy policy
