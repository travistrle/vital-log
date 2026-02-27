import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { useTheme } from '@/hooks/use-theme';

function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.2046) * 10) / 10;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LogWeightScreen() {
  const { profile, addEntry } = useUserData();
  const theme = useTheme();
  const [weightInput, setWeightInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const isMetric = profile?.unitSystem === 'metric';
  const placeholder = isMetric ? 'Weight in kg (e.g. 70.5)' : 'Weight in lbs (e.g. 155.0)';

  function onDateChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  }

  async function handleSave() {
    const value = parseFloat(weightInput);
    if (isNaN(value) || value <= 0) return;
    setSaving(true);
    const weightKg = isMetric ? value : lbsToKg(value);
    await addEntry(weightKg, date);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Weight input */}
          <ThemedText themeColor="textSecondary" style={styles.label}>
            {isMetric ? 'WEIGHT (KG)' : 'WEIGHT (LBS)'}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={weightInput}
            onChangeText={setWeightInput}
            autoFocus
          />

          {/* Date row */}
          <ThemedText themeColor="textSecondary" style={[styles.label, { marginTop: Spacing.three }]}>
            DATE
          </ThemedText>
          <Pressable
            style={[styles.dateRow, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
            onPress={() => setShowPicker((v) => !v)}>
            <ThemedText style={styles.dateText}>{formatDate(date)}</ThemedText>
            <SymbolView
              name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
              tintColor={theme.textSecondary}
              size={18}
            />
          </Pressable>

          {/* Inline picker (iOS) / dialog (Android) */}
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={onDateChange}
              style={styles.picker}
            />
          )}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText themeColor="textSecondary" style={styles.cancelText}>
              Cancel
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.saveButton, (!weightInput || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!weightInput || saving}>
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
    paddingTop: Spacing.four,
    maxWidth: MaxContentWidth,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  dateText: {
    fontSize: 16,
  },
  picker: {
    marginTop: Spacing.two,
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
