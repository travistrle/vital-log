import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { useTheme } from '@/hooks/use-theme';
import { getBMICategory, getBMICategoryColor } from '@/lib/bmi';

const CHART_POINTS = 10;

function kgToLbs(kg: number): number {
  return Math.round(kg * 2.2046 * 10) / 10;
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function TrendsScreen() {
  const { entries, profile, loading, deleteEntry } = useUserData();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  if (loading) {
    return (
      <ThemedView style={styles.fill}>
        <SafeAreaView style={styles.safeArea} />
      </ThemedView>
    );
  }

  const isMetric = profile?.unitSystem === 'metric';
  const unit = isMetric ? 'kg' : 'lbs';

  // Chart uses the most recent CHART_POINTS entries, displayed oldest → newest
  const chartEntries = [...entries].reverse().slice(-CHART_POINTS);

  const chartWidth = Math.min(screenWidth - Spacing.four * 2, MaxContentWidth) - Spacing.four * 2;

  const labels = chartEntries.map((e) => {
    const d = new Date(e.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const weightChartData = {
    labels,
    datasets: [
      {
        data: chartEntries.map((e) => (isMetric ? e.weightKg : kgToLbs(e.weightKg))),
        strokeWidth: 2,
      },
    ],
  };

  const bmiChartData = {
    labels,
    datasets: [
      {
        data: chartEntries.map((e) => e.bmi),
        strokeWidth: 2,
      },
    ],
  };

  const bgRgb = hexToRgb(theme.backgroundElement);
  const baseChartConfig = {
    backgroundGradientFrom: theme.backgroundElement,
    backgroundGradientTo: theme.backgroundElement,
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    labelColor: () => theme.textSecondary,
    strokeWidth: 2,
    decimalPlaces: 1,
    propsForDots: { r: '4', strokeWidth: '2' },
    propsForBackgroundLines: {
      stroke: `rgba(${bgRgb}, 0.6)`,
      strokeDasharray: '',
    },
  };

  const weightChartConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    propsForDots: { ...baseChartConfig.propsForDots, stroke: '#4CAF50' },
  };

  const bmiChartConfig = {
    ...baseChartConfig,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    propsForDots: { ...baseChartConfig.propsForDots, stroke: '#2196F3' },
  };

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: theme.background }]}
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
          <>
            {/* Charts */}
            <ThemedView type="backgroundElement" style={styles.chartCard}>
              <ThemedText themeColor="textSecondary" style={styles.sectionLabel}>
                WEIGHT ({unit.toUpperCase()}) — LAST {Math.min(entries.length, CHART_POINTS)} ENTRIES
              </ThemedText>
              <LineChart
                data={weightChartData}
                width={chartWidth}
                height={180}
                chartConfig={weightChartConfig}
                bezier
                withInnerLines={false}
                yAxisSuffix={` ${unit}`}
                style={styles.chart}
                fromZero={false}
              />
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.chartCard}>
              <ThemedText themeColor="textSecondary" style={styles.sectionLabel}>
                BMI — LAST {Math.min(entries.length, CHART_POINTS)} ENTRIES
              </ThemedText>
              <LineChart
                data={bmiChartData}
                width={chartWidth}
                height={180}
                chartConfig={bmiChartConfig}
                bezier
                withInnerLines={false}
                style={styles.chart}
                fromZero={false}
                decorator={() => null}
              />
            </ThemedView>

            {/* History list */}
            <ThemedText themeColor="textSecondary" style={styles.sectionLabel}>
              HISTORY
            </ThemedText>
            {entries.map((entry) => {
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
                <Swipeable
                  key={entry.id}
                  ref={(ref) => {
                    if (ref) swipeableRefs.current.set(entry.id, ref);
                    else swipeableRefs.current.delete(entry.id);
                  }}
                  renderRightActions={() => (
                    <Pressable
                      style={styles.deleteAction}
                      onPress={() => {
                        swipeableRefs.current.get(entry.id)?.close();
                        deleteEntry(entry.id);
                      }}>
                      <Text style={styles.deleteActionText}>Delete</Text>
                    </Pressable>
                  )}
                  rightThreshold={40}>
                  <ThemedView type="backgroundElement" style={styles.entryRow}>
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
                </Swipeable>
              );
            })}
          </>
        )}
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: {
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
  chartCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: Spacing.two,
    marginHorizontal: -Spacing.two,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
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
  deleteAction: {
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    marginLeft: Spacing.two,
  },
  deleteActionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
