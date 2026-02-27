# Vital Log

An offline-first weight tracking app for iOS, Android, and web built with [Expo](https://expo.dev). Log your weight, track BMI, and view trends — no account or internet connection required.

## Features

- Log weight entries with automatic BMI calculation
- View your latest weight, BMI category, and healthy weight range
- Browse your full entry history in the Trends tab
- Switch between metric (kg/cm) and imperial (lbs/ft) units
- Works fully offline — all data stored locally on device

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   Then open on:
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/) — press `i`
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/) — press `a`
   - [Web](https://docs.expo.dev/workflow/web/) — press `w`

## Stack

- [Expo SDK 55](https://expo.dev) + [React Native 0.83](https://reactnative.dev)
- [expo-router](https://docs.expo.dev/router/introduction/) — file-based routing
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) — local persistence
- TypeScript (strict mode)
