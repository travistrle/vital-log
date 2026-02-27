# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose
Offline-first mobile weight logging app (iOS + Android + web via Expo). Users log weight entries, track BMI, view trends. No backend, no auth — all data via AsyncStorage.

Target features:
- Set height + unit system (metric ↔ imperial); store age & gender for BMR
- Log weight entries with automatic BMI calculation
- Weight trend chart + history list
- BMR (Mifflin-St Jeor) and optional TDEE display

## Commands
```bash
npm start              # Start Expo dev server (opens QR / simulator menu)
npm run ios            # Start on iOS simulator
npm run android        # Start on Android emulator
npm run web            # Start web version
npm run lint           # Run ESLint via expo lint
npm run reset-project  # Wipe src/app/ back to blank starter
```

Clear cache if AsyncStorage behaves strangely: `expo start --clear`

## Actual Stack (Expo SDK 55, React 19, RN 0.83.2)
- **Routing**: `expo-router` v55 with file-based routing (`src/app/` directory). Tab UI uses `NativeTabs` from `expo-router/unstable-native-tabs`.
- **Navigation**: `@react-navigation/native` + `@react-navigation/bottom-tabs` (installed but NativeTabs is the current implementation)
- **Storage**: `@react-native-async-storage/async-storage` — **not yet installed**; add it when building data layer
- **Charts**: `react-native-chart-kit` — **not yet installed**
- **Date handling**: `date-fns` — **not yet installed**; preferred over moment
- **Animation**: `react-native-reanimated` 4.x + `react-native-worklets` (already installed)
- **State**: React hooks + context; Zustand optional if state grows complex
- **TypeScript**: strict mode; `tsconfig.json` paths alias `@/` → `src/`
- **Experiments enabled**: `typedRoutes: true`, `reactCompiler: true`

## Architecture

### File-based routing (`src/app/`)
`src/app/_layout.tsx` is the root layout — wraps everything in `ThemeProvider` (light/dark) and renders `<AppTabs />`. New screens go here as files; expo-router auto-generates routes.

### Theme system (`src/constants/theme.ts`)
Central source of truth for visual tokens:
- `Colors.light` / `Colors.dark` — semantic color keys: `text`, `background`, `backgroundElement`, `backgroundSelected`, `textSecondary`
- `Spacing` — named scale: `half=2, one=4, two=8, three=16, four=24, five=32, six=64`
- `Fonts` — platform-aware font families (system-ui on iOS, CSS vars on web)
- `BottomTabInset`, `MaxContentWidth` — layout constants

Always use these tokens; avoid hardcoded pixel values or color literals (except action colors: `#4CAF50` save, `#F44336` delete).

### Themed components
- `ThemedText` — accepts `type` prop (`default|title|small|smallBold|subtitle|link|linkPrimary|code`) and optional `themeColor` key
- `ThemedView` — accepts `type` prop (`background|backgroundElement`) for semantic background color
- `useTheme()` hook — returns the current `Colors[scheme]` object

### Platform-specific files
`.web.ts` / `.web.tsx` variants override native files for web (e.g., `app-tabs.web.tsx`, `use-color-scheme.web.ts`). Keep this pattern when behavior must differ on web.

## Data Model (to implement)
```ts
interface WeightEntry {
  id: string;        // uuid
  date: string;      // ISO 8601
  weightKg: number;
  bmi: number;
}
// AsyncStorage keys: 'weightEntries', 'userProfile'
// userProfile: { heightMeters, unitSystem, age?, gender? }
```
Store weight in kg and height in meters internally — convert only for display.

## Key Rules
- BMI = `weightKg / (heightM ** 2)`, rounded to 1 decimal. Categories: <18.5 Underweight, 18.5–24.9 Normal, 25–29.9 Overweight, ≥30 Obese
- ISO dates internally; use `date-fns` for display formatting
- Screens: functional components + hooks, keep under ~300 lines, extract components as needed
- No class components, no global variables, no `// @ts-ignore` (except temporary), no inline styles beyond tiny overrides
- Do not add Firebase, Realm, or SQLite without explicit request
