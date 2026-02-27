import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { useTheme } from '@/hooks/use-theme';
import { getBMICategory, getBMICategoryColor, getHealthyWeightRange } from '@/lib/bmi';

function kgToLbs(kg: number): number {
  return Math.round(kg * 2.2046 * 10) / 10;
}

function metersToFtIn(m: number): string {
  const totalInches = m / 0.0254;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export default function HomeScreen() {
  const { entries, profile, loading, updateProfile } = useUserData();
  const theme = useTheme();
  const [heightInput, setHeightInput] = useState('');
  const [settingHeight, setSettingHeight] = useState(false);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} />
      </ThemedView>
    );
  }

  // No profile: prompt user to set height
  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="title">ScaleShift</ThemedText>
          </View>
          <View style={styles.centeredFill}>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Welcome to ScaleShift
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.cardText}>
              Set your height to start tracking your BMI and weight trends.
            </ThemedText>

            {settingHeight ? (
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  placeholder="Height in cm (e.g. 175)"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={heightInput}
                  onChangeText={setHeightInput}
                  autoFocus
                />
                <Pressable
                  style={[styles.primaryButton, styles.fullWidth]}
                  onPress={() => {
                    const cm = parseFloat(heightInput);
                    if (!isNaN(cm) && cm > 50 && cm < 300) {
                      updateProfile({ heightMeters: cm / 100, unitSystem: 'metric' });
                      setSettingHeight(false);
                    }
                  }}>
                  <ThemedText style={styles.primaryButtonText}>Save Height</ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.primaryButton, styles.fullWidth]}
                onPress={() => setSettingHeight(true)}>
                <ThemedText style={styles.primaryButtonText}>Set Height</ThemedText>
              </Pressable>
            )}
          </ThemedView>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Profile set but no entries
  if (entries.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="title">ScaleShift</ThemedText>
            <Pressable onPress={() => router.push('/settings')} hitSlop={12}>
              <SymbolView
                name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
                tintColor={theme.textSecondary}
                size={22}
              />
            </Pressable>
          </View>
          <View style={styles.centeredFill}>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Log your first weight
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.cardText}>
                Tap below to record your weight and start tracking your progress.
              </ThemedText>
              <Pressable
                style={[styles.primaryButton, styles.fullWidth]}
                onPress={() => router.push('/log')}>
                <ThemedText style={styles.primaryButtonText}>Log Weight</ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Has data
  const latest = entries[0];
  const isMetric = profile.unitSystem === 'metric';
  const displayWeight = isMetric ? `${latest.weightKg} kg` : `${kgToLbs(latest.weightKg)} lbs`;
  const displayHeight = isMetric
    ? `${Math.round(profile.heightMeters * 100)} cm`
    : metersToFtIn(profile.heightMeters);
  const category = getBMICategory(latest.bmi);
  const categoryColor = getBMICategoryColor(category);
  const range = getHealthyWeightRange(profile.heightMeters);
  const rangeDisplay = isMetric
    ? `${range.minKg}–${range.maxKg} kg`
    : `${kgToLbs(range.minKg)}–${kgToLbs(range.maxKg)} lbs`;
  const dateDisplay = new Date(latest.date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">ScaleShift</ThemedText>
          <Pressable onPress={() => router.push('/settings')} hitSlop={12}>
            <SymbolView
              name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
              tintColor={theme.textSecondary}
              size={22}
            />
          </Pressable>
        </View>

        {/* Latest weight card */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Latest Weight
          </ThemedText>
          <ThemedText type="title" style={styles.weightValue}>
            {displayWeight}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.dateText}>
            {dateDisplay}
          </ThemedText>
        </ThemedView>

        {/* BMI card */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            BMI
          </ThemedText>
          <View style={styles.bmiRow}>
            <ThemedText type="subtitle" style={styles.bmiValue}>
              {latest.bmi}
            </ThemedText>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22' }]}>
              <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
                {category}
              </ThemedText>
            </View>
          </View>
          <ThemedText themeColor="textSecondary" style={styles.rangeText}>
            Healthy range for {displayHeight}: {rangeDisplay}
          </ThemedText>
        </ThemedView>

        {/* Log button */}
        <Pressable style={styles.primaryButton} onPress={() => router.push('/log')}>
          <ThemedText style={styles.primaryButtonText}>Log Weight</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
  },
  centeredFill: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: {
    textAlign: 'center',
  },
  cardText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weightValue: {
    marginTop: Spacing.one,
  },
  dateText: {
    fontSize: 14,
  },
  bmiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  bmiValue: {
    fontSize: 32,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rangeText: {
    fontSize: 13,
    marginTop: Spacing.one,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  inputGroup: {
    gap: Spacing.two,
    alignSelf: 'stretch',
    alignItems: 'stretch',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
