# CLAUDE.md ─ Weight Tracker App (React Native + Expo)

This file is automatically read by Claude at the start of every session.  
It defines the project's purpose, architecture, conventions, stack, and rules.

## Project Purpose
Build and maintain a simple, offline-first mobile weight logging app.  
Users can:
- Set height (once) and choose units (metric ↔ imperial)
- Log weight entries (with automatic date + BMI calculation)
- View history list + weight trend line chart
- See current/latest BMI + category
- Always offer:
  - BMI + category (already implemented)
  - Healthy weight range (BMI 18.5–24.9)
- If user provides age & gender (add to profile):
  - BMR (Mifflin-St Jeor formula) — show on Home & Trends
  - Optional: Rough TDEE (BMR × activity factor; let user pick sedentary/light/moderate)
- Store age & gender in AsyncStorage alongside height & unitSystem
- Formulas (in bmi.ts or new metrics.ts):
  export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number { ... }

No backend, no auth, no cloud sync — everything is local via AsyncStorage.

Target: iOS + Android via Expo (managed workflow, no custom native code yet).

## Core Tech Stack (do NOT suggest alternatives unless asked)
- React Native 0.75+ (Expo SDK 52+)
- Expo (latest stable) — use `expo` CLI commands
- Navigation: @react-navigation/native + @react-navigation/bottom-tabs (preferred) or stack
- Storage: @react-native-async-storage/async-storage (NEVER suggest MMKV, Realm, SQLite unless user explicitly asks to switch)
- Charts: react-native-chart-kit (simple line chart for weight trend)
- Date handling: date-fns (preferred over moment — migrate if moment is present)
- Styling: StyleSheet + minimal use of tailwind-rn / nativewind if added later
- State: React hooks (useState, useContext) + optional Zustand if state grows complex
- TypeScript: Yes — strict mode, no // @ts-ignore unless temporary

## Project Structure (keep it flat & simple for now)
.
├── App.tsx                     # Entry + providers + navigation
├── app.json / expo config
├── src/
│   ├── components/             # reusable UI (Button, Card, Input, etc.)
│   ├── screens/                # main screens
│   │   ├── HomeScreen.tsx      # dashboard: latest stats + quick log button
│   │   ├── LogWeightScreen.tsx # form to add weight
│   │   ├── TrendsScreen.tsx    # list + chart
│   │   ├── SettingsScreen.tsx  # units, height, reset data
│   │   └── WelcomeScreen.tsx   # first-time height setup
│   ├── context/                # e.g. UserDataContext.tsx (height + entries)
│   ├── hooks/                  # e.g. useWeightData.ts
│   ├── lib/                    # utilities
│   │   ├── storage.ts          # AsyncStorage wrappers (save/load height + entries)
│   │   ├── bmi.ts              # calculateBMI(weightKg, heightM) + getBMICategory
│   │   └── units.ts            # kg↔lbs, cm↔ft+in conversions
│   └── types/                  # WeightEntry { date: string, weightKg: number, bmi: number }
└── CLAUDE.md                   # ← you are here

## Data Model
interface WeightEntry {
  id: string;                   // iso date string or uuid
  date: string;                 // ISO 8601 "2026-02-26T..."
  weightKg: number;
  bmi: number;
}

Global state (via context):
- heightMeters: number | null
- weightEntries: WeightEntry[]
- unitSystem: 'metric' | 'imperial'

Always store weight in kg and height in meters internally — convert only for display/input.

## Important Rules & Conventions
1. Always calculate BMI = weightKg / (heightM ** 2)
   Round to 1 decimal place.
   Categories:
   - Underweight: < 18.5
   - Normal:     18.5–24.9
   - Overweight: 25–29.9
   - Obese:      ≥ 30

2. Use ISO dates everywhere internally. Display localized friendly format (date-fns format).

3. When suggesting/editing code:
   - Prefer functional components + hooks
   - Use TypeScript — type all props, state, context
   - Keep screens < 300 lines if possible — extract helpers/components
   - Add basic input validation (positive numbers, required fields)
   - Never suggest global variables or force-unwrap optionals (!)
   - After changes: remind to run `expo start --clear` if AsyncStorage issues appear

4. UI/UX style:
   - Clean, minimal, white/dark mode aware (use Appearance / useColorScheme if needed)
   - SafeAreaView + ScrollView where appropriate
   - Use consistent padding (16–24), rounded corners (8–12)
   - Green (#4CAF50) for save/positive actions, red (#F44336) for delete/reset

5. Testing / Verification:
   - After edits, suggest running the app and manually testing the changed flow
   - If chart is involved → verify data points match stored entries

6. Never:
   - Introduce new heavy libraries without asking (no Firebase, no Realm, no Reanimated unless needed for chart animation)
   - Remove AsyncStorage — it's the single source of truth
   - Suggest class components
   - Write inline styles except tiny overrides

## Common Commands / Workflows
- "Initialize user data context" → create/update context + storage hooks
- "Add unit toggle" → update settings + conversions
- "Fix chart not updating" → usually stale state — force re-fetch from storage

Keep this file concise but precise — update it when we discover better patterns.

Last major update: February 2026