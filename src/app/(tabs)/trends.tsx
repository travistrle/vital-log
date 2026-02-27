import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { useTheme } from '@/hooks/use-theme';
import { getBMICategory, getBMICategoryColor } from '@/lib/bmi';

function kgToLbs(kg: number): number {
  return Math.round(kg * 2.2046 * 10) / 10;
}

export default function TrendsScreen() {
  const { entries, profile, loading } = useUserData();
  const theme = useTheme();

  if (loading) {
    return (
      <ThemedView style={styles.scrollView}>
        <SafeAreaView style={styles.safeArea} />
      </ThemedView>
    );
  }

  const isMetric = profile?.unitSystem === 'metric';

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.screenTitle}>
          Trends
        </ThemedText>

        {entries.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              No entries yet.{'\n'}Log your first weight from the Home tab.
            </ThemedText>
          </ThemedView>
        ) : (
          entries.map((entry) => {
            const category = getBMICategory(entry.bmi);
            const categoryColor = getBMICategoryColor(category);
            const displayWeight = isMetric
              ? `${entry.weightKg} kg`
              : `${kgToLbs(entry.weightKg)} lbs`;
            const dateDisplay = new Date(entry.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <ThemedView key={entry.id} type="backgroundElement" style={styles.entryRow}>
                <ThemedText themeColor="textSecondary" style={styles.entryDate}>
                  {dateDisplay}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.entryWeight}>
                  {displayWeight}
                </ThemedText>
                <ThemedText style={[styles.entryBMI, { color: categoryColor }]}>
                  BMI {entry.bmi} · {category}
                </ThemedText>
              </ThemedView>
            );
          })
        )}
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
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
  screenTitle: {
    marginTop: Spacing.three,
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  entryRow: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  entryDate: {
    fontSize: 13,
  },
  entryWeight: {
    fontSize: 22,
  },
  entryBMI: {
    fontSize: 14,
    fontWeight: '600',
  },
});
