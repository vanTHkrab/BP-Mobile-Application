/**
 * Chart Screen
 * หน้าแสดงกราฟประวัติความดันโลหิต
 */

import { Colors, DarkTheme, LightTheme } from '@/constants/colors';
import { useBPRecords } from '@/hooks/use-bp-records';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DateRangePreset } from '@/types';
import { formatShortDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Filter options
const FILTER_OPTIONS = [
  { label: '7 วัน', value: DateRangePreset.LAST_7_DAYS },
  { label: '30 วัน', value: DateRangePreset.LAST_30_DAYS },
  { label: '90 วัน', value: DateRangePreset.LAST_90_DAYS },
];

// Chart types
type ChartViewType = 'combined' | 'systolic' | 'diastolic' | 'pulse';

export default function ChartScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  const [selectedFilter, setSelectedFilter] = useState<DateRangePreset>(
    DateRangePreset.LAST_7_DAYS
  );
  const [chartView, setChartView] = useState<ChartViewType>('combined');

  const {
    records,
    statistics,
    isLoading,
    fetchRecords,
    fetchStatistics,
  } = useBPRecords({ preset: selectedFilter });

  // Fetch data on filter change
  useEffect(() => {
    fetchRecords({ preset: selectedFilter });
    fetchStatistics({ preset: selectedFilter });
  }, [selectedFilter]);

  // Prepare chart data
  const prepareChartData = useCallback(() => {
    if (records.length === 0) {
      return null;
    }

    // Sort by date (oldest first for chart)
    const sortedRecords = [...records].reverse();

    // Limit data points for readability
    const maxPoints = 14;
    const step = Math.max(1, Math.floor(sortedRecords.length / maxPoints));
    const sampledRecords = sortedRecords.filter((_, index) => index % step === 0);

    const labels = sampledRecords.map((r) => formatShortDate(r.measured_at));

    const datasets: {
      data: number[];
      color: (opacity: number) => string;
      strokeWidth: number;
    }[] = [];

    if (chartView === 'combined' || chartView === 'systolic') {
      datasets.push({
        data: sampledRecords.map((r) => r.systolic),
        color: (opacity = 1) => `rgba(229, 57, 53, ${opacity})`, // Red
        strokeWidth: 2,
      });
    }

    if (chartView === 'combined' || chartView === 'diastolic') {
      datasets.push({
        data: sampledRecords.map((r) => r.diastolic),
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`, // Blue
        strokeWidth: 2,
      });
    }

    if (chartView === 'pulse') {
      datasets.push({
        data: sampledRecords.map((r) => r.pulse),
        color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`, // Purple
        strokeWidth: 2,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [records, chartView]);

  const chartData = prepareChartData();

  // Chart config
  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.text,
    labelColor: (opacity = 1) => theme.colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.colors.border,
      strokeWidth: 1,
    },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              selectedFilter === option.value && {
                backgroundColor: Colors.primary,
              },
            ]}
            onPress={() => setSelectedFilter(option.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color:
                    selectedFilter === option.value
                      ? '#FFF'
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart View Selector */}
      <View style={styles.chartViewSelector}>
        <TouchableOpacity
          style={[
            styles.viewButton,
            chartView === 'combined' && styles.viewButtonActive,
          ]}
          onPress={() => setChartView('combined')}
        >
          <Text
            style={[
              styles.viewButtonText,
              { color: chartView === 'combined' ? Colors.primary : theme.colors.textSecondary },
            ]}
          >
            รวม
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton,
            chartView === 'systolic' && styles.viewButtonActive,
          ]}
          onPress={() => setChartView('systolic')}
        >
          <Text
            style={[
              styles.viewButtonText,
              { color: chartView === 'systolic' ? Colors.primary : theme.colors.textSecondary },
            ]}
          >
            ตัวบน
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton,
            chartView === 'diastolic' && styles.viewButtonActive,
          ]}
          onPress={() => setChartView('diastolic')}
        >
          <Text
            style={[
              styles.viewButtonText,
              { color: chartView === 'diastolic' ? Colors.primary : theme.colors.textSecondary },
            ]}
          >
            ตัวล่าง
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton,
            chartView === 'pulse' && styles.viewButtonActive,
          ]}
          onPress={() => setChartView('pulse')}
        >
          <Text
            style={[
              styles.viewButtonText,
              { color: chartView === 'pulse' ? Colors.primary : theme.colors.textSecondary },
            ]}
          >
            ชีพจร
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              กำลังโหลดข้อมูล...
            </Text>
          </View>
        ) : chartData && chartData.labels.length > 0 ? (
          <>
            {/* Legend */}
            <View style={styles.legendContainer}>
              {(chartView === 'combined' || chartView === 'systolic') && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                  <Text style={[styles.legendText, { color: theme.colors.text }]}>
                    ตัวบน (Systolic)
                  </Text>
                </View>
              )}
              {(chartView === 'combined' || chartView === 'diastolic') && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
                  <Text style={[styles.legendText, { color: theme.colors.text }]}>
                    ตัวล่าง (Diastolic)
                  </Text>
                </View>
              )}
              {chartView === 'pulse' && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
                  <Text style={[styles.legendText, { color: theme.colors.text }]}>
                    ชีพจร (Pulse)
                  </Text>
                </View>
              )}
            </View>

            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              withShadow={false}
            />
          </>
        ) : (
          <View style={styles.emptyChart}>
            <Ionicons
              name="stats-chart-outline"
              size={48}
              color={theme.colors.textDisabled}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              ไม่มีข้อมูลสำหรับแสดงกราฟ
            </Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      {statistics && statistics.total_records > 0 && (
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
            สถิติ
          </Text>

          <View style={styles.statsGrid}>
            {/* Systolic */}
            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                ความดันตัวบน
              </Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {Math.round(statistics.avg_systolic)}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    เฉลี่ย
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.error }]}>
                    {statistics.max_systolic}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    สูงสุด
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.success }]}>
                    {statistics.min_systolic}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    ต่ำสุด
                  </Text>
                </View>
              </View>
            </View>

            {/* Diastolic */}
            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                ความดันตัวล่าง
              </Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {Math.round(statistics.avg_diastolic)}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    เฉลี่ย
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.error }]}>
                    {statistics.max_diastolic}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    สูงสุด
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.success }]}>
                    {statistics.min_diastolic}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    ต่ำสุด
                  </Text>
                </View>
              </View>
            </View>

            {/* Pulse */}
            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                ชีพจร
              </Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {Math.round(statistics.avg_pulse)}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    เฉลี่ย
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.error }]}>
                    {statistics.max_pulse}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    สูงสุด
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.success }]}>
                    {statistics.min_pulse}
                  </Text>
                  <Text style={[styles.statUnit, { color: theme.colors.textSecondary }]}>
                    ต่ำสุด
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartViewSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  viewButtonActive: {
    borderBottomColor: Colors.primary,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    minHeight: 280,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 220,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 220,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  statsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 12,
    marginTop: 2,
  },
});
