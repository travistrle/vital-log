import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { UserDataProvider } from '@/context/UserDataContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <UserDataProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="log"
            options={{ presentation: 'modal', title: 'Log Weight', headerShown: true }}
          />
          <Stack.Screen
            name="settings"
            options={{ presentation: 'modal', title: 'Settings', headerShown: true }}
          />
        </Stack>
      </ThemeProvider>
    </UserDataProvider>
    </GestureHandlerRootView>
  );
}
