import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { useTheme } from '@/hooks/use-theme';
import { UserProfile } from '@/types';

function cmToFtIn(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export default function SettingsScreen() {
  const { profile, updateProfile } = useUserData();
  const theme = useTheme();

  const initialUnit = profile?.unitSystem ?? 'metric';
  const initialHeightCm = profile ? Math.round(profile.heightMeters * 100).toString() : '';

  const [unit, setUnit] = useState<UserProfile['unitSystem']>(initialUnit);
  const [heightCm, setHeightCm] = useState(initialHeightCm);
  const [saving, setSaving] = useState(false);
  const [heightError, setHeightError] = useState('');

  async function handleSave() {
    const cm = parseFloat(heightCm);
    if (isNaN(cm) || cm <= 50 || cm >= 300) {
      setHeightError('Enter a valid height between 51–299 cm');
      return;
    }
    setHeightError('');
    setSaving(true);
    await updateProfile({ ...(profile ?? {}), heightMeters: cm / 100, unitSystem: unit });
    router.back();
  }

  const heightPreview =
    heightCm && !isNaN(parseFloat(heightCm))
      ? unit === 'imperial'
        ? ` (${cmToFtIn(parseFloat(heightCm))})`
        : ''
      : '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Unit system */}
          <ThemedText themeColor="textSecondary" style={styles.sectionLabel}>
            UNIT SYSTEM
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.segmentedControl}>
            {(['metric', 'imperial'] as const).map((option) => (
              <Pressable
                key={option}
                style={[styles.segment, unit === option && styles.segmentActive]}
                onPress={() => setUnit(option)}>
                <ThemedText
                  style={[
                    styles.segmentText,
                    unit === option ? styles.segmentTextActive : { color: theme.textSecondary },
                  ]}>
                  {option === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft)'}
                </ThemedText>
                {unit === option && (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    tintColor="#4CAF50"
                    size={14}
                  />
                )}
              </Pressable>
            ))}
          </ThemedView>

          {/* Height */}
          <ThemedText themeColor="textSecondary" style={[styles.sectionLabel, { marginTop: Spacing.three }]}>
            HEIGHT (CM){heightPreview}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: heightError ? '#F44336' : theme.backgroundSelected,
                backgroundColor: theme.backgroundElement,
              },
            ]}
            placeholder="Height in cm (e.g. 175)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={heightCm}
            onChangeText={(v) => {
              setHeightCm(v);
              setHeightError('');
            }}
          />
          {heightError ? (
            <ThemedText style={styles.errorText}>{heightError}</ThemedText>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText themeColor="textSecondary" style={styles.cancelText}>
              Cancel
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </Pressable>
        </View>
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
    paddingTop: Spacing.three,
    maxWidth: MaxContentWidth,
  },
  content: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  segmentedControl: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  segmentActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
  },
  segmentText: {
    fontSize: 15,
  },
  segmentTextActive: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 13,
    marginTop: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderRadius: Spacing.two,
  },
  cancelText: {
    fontSize: 16,
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
