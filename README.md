# ShiftFlow

**Recovery and energy planning for shift workers.**

ShiftFlow generates a personalised daily plan — sleep windows, caffeine cutoffs, nap suggestions, meal timing, and recovery tips — based on your shift schedule and how you're feeling. Built for nurses, factory workers, drivers, security staff, and everyone else who works irregular hours.

---

## What it does

| Feature | Status |
|---|---|
| Onboarding flow (6 steps) | ✅ Real |
| Shift schedule input (weekly, per day) | ✅ Real |
| Daily plan generation (deterministic engine) | ✅ Real |
| Sleep window calculation | ✅ Real |
| Caffeine cutoff & guidance | ✅ Real |
| Nap suggestions | ✅ Real |
| Meal timing | ✅ Real |
| Recovery tips (context-aware) | ✅ Real |
| Energy score from check-ins | ✅ Real |
| Weekly plan overview | ✅ Real |
| Daily check-in | ✅ Real |
| Local persistence (AsyncStorage) | ✅ Real |
| Dark mode | ✅ Real |
| Notification scaffolding | ✅ Scaffolded (permissions + scheduling) |
| AI plan explanations | 🟡 Mocked (interface ready for Claude API) |
| Premium gating | 🟡 Mocked (IAP not wired) |
| Schedule image/OCR import | ❌ Not built (interface defined) |
| Analytics | 🟡 Console-only mock |

---

## Stack

- **Expo SDK 52** with **Expo Router v4** (file-based navigation)
- **React Native 0.76** + **TypeScript**
- **Zustand v4** with `persist` middleware for state + local storage
- **React Hook Form** + **Zod** (forms, validation — in onboarding)
- **AsyncStorage** for local persistence
- **Expo Notifications** for reminder scaffolding
- **@expo-google-fonts/inter** for typography
- **date-fns** for date utilities
- **jest-expo** for testing

No backend. No Firebase. No Supabase. Everything runs locally on the device — by design for MVP.

---

## Prerequisites

1. **Node.js ≥ 18** — download from [nodejs.org](https://nodejs.org)
2. **Expo CLI** — installed automatically via `npx`
3. **Expo Go** app on your phone OR an Android/iOS simulator

---

## Setup

```bash
# 1. Install dependencies
cd D:\Apka\ShiftFlow
npm install

# 2. Copy environment file (optional — app works without real values)
copy .env.example .env

# 3. Start Expo dev server
npx expo start
```

Then:
- **iOS Simulator**: press `i`
- **Android Emulator**: press `a`
- **Physical device**: scan QR code with Expo Go

---

## Run tests

```bash
npm test
```

Covers:
- `src/__tests__/recommendations.test.ts` — sleep window, caffeine cutoff, nap suggestion, energy score
- `src/__tests__/timeUtils.test.ts` — all time utility functions

---

## Architecture

```
ShiftFlow/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout + navigation guard (onboarding redirect)
│   ├── (tabs)/                 # Tab navigation (Home, Schedule, Weekly, Settings)
│   └── onboarding/             # Onboarding stack (6 screens)
│
├── src/
│   ├── types/index.ts          # All TypeScript types
│   ├── constants/
│   │   ├── theme.ts            # Design tokens (colors, spacing, typography)
│   │   ├── config.ts           # Feature flags, storage keys
│   │   └── shifts.ts           # Shift/role/goal select options
│   │
│   ├── domain/
│   │   ├── recommendations/
│   │   │   ├── rules.ts        # Pure deterministic recommendation logic
│   │   │   └── engine.ts       # Orchestrates rules → DailyPlan
│   │   └── schedule/
│   │       └── helpers.ts      # Shift entry utilities
│   │
│   ├── services/
│   │   ├── ai/index.ts         # AI provider abstraction (mock + Anthropic stub)
│   │   ├── storage/index.ts    # AsyncStorage typed wrapper
│   │   ├── notifications/index.ts # Expo Notifications wrapper
│   │   └── analytics/index.ts  # Analytics abstraction (mock)
│   │
│   ├── store/
│   │   ├── userStore.ts        # User profile (Zustand + persist)
│   │   ├── scheduleStore.ts    # Shift entries (Zustand + persist)
│   │   ├── checkInStore.ts     # Daily check-ins (Zustand + persist)
│   │   ├── planStore.ts        # Generated plans (in-memory, re-derived)
│   │   └── premiumStore.ts     # Premium state (Zustand + persist)
│   │
│   ├── components/
│   │   ├── ui/                 # Design system primitives
│   │   │   ├── Text.tsx        # Typography
│   │   │   ├── Button.tsx      # Button variants
│   │   │   ├── Card.tsx        # Surface cards
│   │   │   ├── Input.tsx       # Text inputs
│   │   │   ├── Badge.tsx       # Status badges
│   │   │   ├── SelectOption.tsx# Radio-style option rows
│   │   │   └── ...
│   │   └── features/           # Domain-specific components
│   │       ├── ShiftCard.tsx
│   │       ├── SleepWindowCard.tsx
│   │       ├── CaffeineCard.tsx
│   │       ├── NapCard.tsx
│   │       ├── EnergyScore.tsx
│   │       ├── WeekDayCard.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useColorScheme.ts   # Dark/light mode
│   │   ├── useAppReady.ts      # Font loading + store hydration
│   │   └── usePlan.ts          # Today/weekly plan hooks
│   │
│   └── utils/
│       ├── time.ts             # Pure time utilities (tested)
│       ├── format.ts           # Label formatters
│       └── seed.ts             # Demo data generator
│
└── assets/                     # Icons, splash (add your own)
```

### Key architectural decisions

| Decision | Rationale |
|---|---|
| Expo Router (vs React Navigation) | File-based routing = simpler deep linking, fewer boilerplate files |
| Zustand (vs Redux/Context) | Minimal API, no providers, excellent TypeScript support |
| Deterministic rules engine | Works offline, no latency, fully testable, AI is additive not foundational |
| Local-only storage for MVP | Removes backend complexity; swap in Supabase later via `services/storage` |
| AI behind abstraction | `AIService` has mock + real providers; swap `EXPO_PUBLIC_AI_PROVIDER=anthropic` |
| `domain/` separated from `store/` | Business logic is pure functions — easy to test and reuse |

---

## Recommendation engine

The core logic lives in `src/domain/recommendations/rules.ts`.

Given today's shift, tomorrow's shift, user profile, and recent check-ins, it calculates:

1. **Sleep window** — shift end + commute buffer + wind-down → target hours based on profile
2. **Caffeine cutoff** — `sleepStart - cutoffHours[sensitivity]`
3. **Nap suggestion** — triggered by night shift recovery, pre-night-shift prep, or low energy score
4. **Meal timing** — per shift type (5 unique meal templates)
5. **Recovery tips** — contextual pool of 40+ tips, daily-seeded random selection
6. **Energy score** — weighted average of last 7 check-ins (recent = higher weight)

All functions are pure, side-effect-free, and fully covered by tests.

---

## Environment variables

See `.env.example`. Most are optional for MVP:

```bash
EXPO_PUBLIC_AI_PROVIDER=mock          # or "anthropic"
EXPO_PUBLIC_ANALYTICS_PROVIDER=mock   # or your analytics SDK
EXPO_PUBLIC_ENABLE_AI_EXPLANATIONS=false
EXPO_PUBLIC_APP_ENV=development
```

To wire real AI explanations:
1. Set `EXPO_PUBLIC_AI_PROVIDER=anthropic`
2. Set `EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...`
3. Implement the stub in `src/services/ai/index.ts` → `anthropicProvider`

---

## App Store / Play Store readiness

Before submitting:

- [ ] Replace placeholder `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`
- [ ] Replace `assets/notification-icon.png`
- [ ] Set real `bundleIdentifier` (iOS) and `package` (Android) in `app.json`
- [ ] Create EAS project: `eas build:configure`
- [ ] Implement real IAP (RevenueCat recommended) to replace mocked `activatePremium()`
- [ ] Implement real analytics (PostHog, Amplitude, or Mixpanel)
- [ ] Add privacy policy URL and terms of service
- [ ] Write App Store description and screenshots
- [ ] Test with real Expo Go on both platforms
- [ ] Add `expo-updates` for OTA updates
- [ ] Set up EAS Build for production builds

---

## What to build next

### MVP polish (1–2 weeks)
- [ ] Custom shift time editor (when type = 'custom')
- [ ] Edit/update profile after onboarding
- [ ] Streak counter for consecutive check-ins
- [ ] Weekly summary notification

### Growth features (2–4 weeks)
- [ ] Real Anthropic AI plan explanations
- [ ] RevenueCat IAP integration
- [ ] Roster photo import (OCR via Claude vision)
- [ ] Trend charts (sleep quality over time, energy score history)
- [ ] Shift reminder notifications (1h before shift)

### Scale features (1–3 months)
- [ ] Supabase backend sync (optional, keep local-first)
- [ ] Shift pattern auto-detection from history
- [ ] Apple Watch / Wear OS companion
- [ ] Export data as PDF for occupational health appointments

---

## Demo data

Call `createDemoProfile()` and `createDemoSchedule()` from `src/utils/seed.ts` to populate realistic data in development. These are used to test the plan engine without going through onboarding.

---

## Medical disclaimer

ShiftFlow provides general wellness guidance based on circadian rhythm research and sleep hygiene best practices. It is **not medical advice**. Users with serious health conditions, sleep disorders, or medications affecting sleep should consult a healthcare professional.
