import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { UserDataProvider } from '@/context/UserDataContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <UserDataProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="log"
            options={{ presentation: 'modal', title: 'Log Weight', headerShown: true }}
          />
        </Stack>
      </ThemeProvider>
    </UserDataProvider>
  );
}
