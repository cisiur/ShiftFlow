# ShiftFlow

**Recovery and energy planning for shift workers.**

ShiftFlow generates a personalised daily plan — sleep windows, caffeine cutoffs, nap suggestions, meal timing, and recovery tips — based on your shift schedule and how you're feeling. Built for nurses, factory workers, drivers, security staff, and everyone else who works irregular hours.

> 🇵🇱 Full Polish localisation included.

---

## Feature status

| Feature | Status |
|---|---|
| Onboarding (6 steps — role, pattern, sleep, caffeine, difficulty, goals) | ✅ |
| Shift schedule input (weekly calendar, per-day assignment) | ✅ |
| Daily plan generation (deterministic rules engine) | ✅ |
| Sleep window, caffeine cutoff, nap suggestions, meal timing | ✅ |
| Context-aware recovery tips (40+ tips pool) | ✅ |
| Energy score from weighted check-in history | ✅ |
| Weekly plan overview | ✅ |
| Daily check-in (mood, energy, sleep quality) | ✅ |
| Shift time defaults editor (per shift type) | ✅ |
| Dark mode (system-aware) | ✅ |
| English + Polish localisation | ✅ |
| Local persistence (AsyncStorage, no backend) | ✅ |
| **AI plan explanations** (Claude Haiku via Anthropic API) | ✅ Live |
| **Roster photo import** (OCR via Claude Sonnet Vision) | ✅ Live |
| **In-app purchases** (RevenueCat — monthly / yearly / lifetime) | ✅ Wired (mock in Expo Go, live in EAS build) |
| Premium paywall (3-tier plan selector) | ✅ |
| Manage subscription (RevenueCat Customer Center) | ✅ Wired |
| Error boundary (crash → friendly restart screen) | ✅ |
| Notification permissions scaffolding | ✅ |
| Notification scheduling (sleep / caffeine reminders) | 🔲 Pending |
| In-app review prompt | 🔲 Pending |
| Analytics (PostHog / Amplitude) | 🔲 Console mock only |

---

## Stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 54 · React Native 0.81 |
| Navigation | Expo Router v6 (file-based) |
| Language | TypeScript |
| State | Zustand v5 + `persist` (AsyncStorage) |
| Purchases | `react-native-purchases` v10 (RevenueCat) |
| AI / Vision | Anthropic API (`claude-haiku-4-5-20251001` / `claude-sonnet-4-6`) |
| Fonts | `@expo-google-fonts/inter` |
| Dates | `date-fns` |
| Haptics | `expo-haptics` |
| Notifications | `expo-notifications` |
| Image picker | `expo-image-picker` |
| Tests | `jest-expo` |

No backend. No Firebase. No Supabase. Everything runs locally on the device.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Required for AI plan explanations and roster OCR
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...

# Required for live in-app purchases (omit to use mock prices in dev)
EXPO_PUBLIC_REVENUECAT_API_KEY=...
```

Both keys fall back gracefully — the app runs fully without them (AI shows mock explanation, purchases use mock prices).

For production builds, set these as EAS secrets instead of committing to `.env.local`:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_ANTHROPIC_API_KEY --value sk-ant-...
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_API_KEY --value ...
```

---

## Running locally

```bash
npm install
npx expo start --clear
```

- **Physical device (Expo Go):** scan the QR code — purchases and native RC will use mock mode
- **Android emulator:** press `a`
- **Production-like build:** `eas build --profile preview --platform android`

---

## Project structure

```
ShiftFlow/
├── app/                            # Expo Router screens
│   ├── _layout.tsx                 # Root layout · ErrorBoundary · NavigationGuard · initialisePurchases
│   ├── (tabs)/
│   │   ├── index.tsx               # Today tab — daily plan
│   │   ├── calendar.tsx            # Calendar tab
│   │   ├── schedule.tsx            # Schedule tab (shift entry + roster import)
│   │   ├── weekly.tsx              # Weekly overview
│   │   └── settings.tsx            # Settings (profile, notifications, language, premium)
│   ├── onboarding/                 # 6-screen onboarding stack
│   ├── checkin.tsx                 # Daily check-in modal
│   ├── plan-explanation.tsx        # AI plan explanation modal
│   ├── paywall.tsx                 # Premium paywall (3 plans)
│   └── roster-import.tsx           # Roster photo OCR import modal
│
├── src/
│   ├── constants/
│   │   ├── theme.ts                # Design tokens (Palette, Spacing, Radius, Typography)
│   │   ├── config.ts               # Env var access (Metro-safe literal access)
│   │   └── shifts.ts               # Shift/role/goal definitions
│   │
│   ├── domain/
│   │   └── recommendations/
│   │       ├── rules.ts            # Pure deterministic logic (tested)
│   │       └── engine.ts           # Orchestrates rules → DailyPlan
│   │
│   ├── services/
│   │   ├── ai/index.ts             # Anthropic API (real + mock fallback)
│   │   ├── ocr/index.ts            # Claude Vision roster OCR (real + mock fallback)
│   │   ├── purchases/index.ts      # RevenueCat IAP (real + mock fallback)
│   │   ├── notifications/index.ts  # Expo Notifications wrapper
│   │   ├── analytics/index.ts      # Analytics abstraction (console mock)
│   │   └── storage/index.ts        # AsyncStorage typed wrapper
│   │
│   ├── store/
│   │   ├── userStore.ts            # User profile
│   │   ├── scheduleStore.ts        # Shift entries
│   │   ├── checkInStore.ts         # Daily check-ins
│   │   ├── planStore.ts            # Generated plans (in-memory)
│   │   ├── premiumStore.ts         # Premium entitlement (persisted)
│   │   └── languageStore.ts        # Language preference
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx       # Root error boundary (crash → restart screen)
│   │   ├── ui/                     # Design system primitives
│   │   └── features/               # Domain-specific components
│   │
│   ├── hooks/
│   │   ├── useColorScheme.ts
│   │   ├── useAppReady.ts
│   │   └── usePlan.ts
│   │
│   ├── i18n/
│   │   ├── index.ts                # useTranslation hook
│   │   ├── en.ts                   # English strings
│   │   └── pl.ts                   # Polish strings
│   │
│   └── utils/
│       ├── time.ts                 # Pure time utilities (tested)
│       ├── format.ts               # Label formatters
│       └── seed.ts                 # Dev demo data generator
│
├── docs/
│   ├── privacy-policy.html         # Hosted privacy policy (GitHub Pages / Netlify)
│   └── index.html                  # Redirect to privacy policy
│
├── app.json                        # Expo config (bundle ID, permissions, plugins)
├── eas.json                        # EAS Build profiles (development / preview / production)
└── .env.local                      # Local env vars (never commit — use EAS secrets for production)
```

---

## AI services

### Plan explanations (`src/services/ai/index.ts`)
- Model: `claude-haiku-4-5-20251001`
- Triggered by user tapping "Explain my plan" on the Today screen
- Sends: shift type, energy level, sleep window, fatigue context — no PII
- Falls back to a hardcoded mock explanation if `EXPO_PUBLIC_ANTHROPIC_API_KEY` is absent

### Roster OCR (`src/services/ocr/index.ts`)
- Model: `claude-sonnet-4-6` (better accuracy on dense tables)
- User picks a photo of their printed/digital work schedule
- Claude extracts dates + shift times → imports directly into the schedule store
- Handles European date format (DD/MM), Excel-style time ranges (e.g. `7-19`), multiple shifts per day
- Image transmitted over HTTPS; not stored beyond the API call

---

## Purchases (`src/services/purchases/index.ts`)

RevenueCat entitlement: **`ShiftFlow Pro`**

| Product ID | Type | Period |
|---|---|---|
| `monthly` | Subscription | Monthly |
| `yearly` | Subscription | Yearly |
| `lifetime` | One-time | Lifetime |

- In Expo Go / no RC key: mock prices shown, purchase simulates success after 1.2s
- In EAS build with key: real RevenueCat + Google Play flow
- `presentCustomerCenter()` opens RC's built-in subscription management UI (cancel, refund)

---

## Building for production

```bash
# Configure EAS (first time only)
eas build:configure

# Preview APK (internal testing)
eas build --profile preview --platform android

# Production AAB (Google Play)
eas build --profile production --platform android
```

`versionCode` auto-increments on every production build via `autoIncrement: true` in `eas.json`.

---

## Tests

```bash
npm test
```

- `src/__tests__/recommendations.test.ts` — sleep window, caffeine cutoff, nap suggestion, energy score
- `src/__tests__/timeUtils.test.ts` — all time utility functions

---

## Play Store checklist

- [x] Bundle ID set (`com.shiftflow.app`)
- [x] `versionCode` starting point set in `app.json`
- [x] EAS build profiles configured (`eas.json`)
- [x] Privacy policy written and hosted (`docs/privacy-policy.html`)
- [x] Error boundary (crash recovery)
- [x] RevenueCat IAP wired
- [x] AI features live
- [ ] EAS secrets set (`eas secret:create …`)
- [ ] Google Play Console account active
- [ ] Products created in Play Console (`monthly`, `yearly`, `lifetime`)
- [ ] Products linked in RevenueCat dashboard
- [ ] Store listing assets (icon, feature graphic 1024×500, ≥2 screenshots)
- [ ] Short description (≤80 chars) + full description
- [ ] Privacy policy URL added to Play Console listing
- [ ] `react-native-purchases` native build tested on real device via EAS

---

## Medical disclaimer

ShiftFlow provides general wellness guidance based on circadian rhythm research and sleep hygiene best practices. It is **not medical advice**. Users with serious health conditions, sleep disorders, or medications affecting sleep should consult a healthcare professional.
