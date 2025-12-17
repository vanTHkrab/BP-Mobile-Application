/**
 * BPGauge Component
 * แสดงค่าความดันโลหิตแบบ Gauge/Meter พร้อมสถานะ
 */

import { Colors, DarkTheme, LightTheme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatBPValue, getBPStatusInfo } from '@/utils/blood-pressure';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BPGaugeProps {
  systolic: number;
  diastolic: number;
  pulse?: number;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

export function BPGauge({
  systolic,
  diastolic,
  pulse,
  size = 'medium',
  showLabels = true,
}: BPGaugeProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;
  const statusInfo = getBPStatusInfo(systolic, diastolic);

  // ขนาดตาม size prop
  const dimensions = {
    small: { container: 120, value: 24, unit: 12, status: 10 },
    medium: { container: 180, value: 36, unit: 16, status: 14 },
    large: { container: 240, value: 48, unit: 20, status: 18 },
  }[size];

  return (
    <View style={[styles.container, { width: dimensions.container }]}>
      {/* Circular Gauge */}
      <View
        style={[
          styles.gauge,
          {
            width: dimensions.container,
            height: dimensions.container,
            borderColor: statusInfo.color,
            backgroundColor: statusInfo.color + '15',
          },
        ]}
      >
        {/* BP Value */}
        <Text
          style={[
            styles.bpValue,
            { fontSize: dimensions.value, color: theme.colors.text },
          ]}
        >
          {formatBPValue(systolic, diastolic)}
        </Text>

        {/* Unit */}
        <Text
          style={[
            styles.unit,
            { fontSize: dimensions.unit, color: theme.colors.textSecondary },
          ]}
        >
          mmHg
        </Text>

        {/* Status */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.color + '30' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { fontSize: dimensions.status, color: statusInfo.color },
            ]}
          >
            {statusInfo.labelTh}
          </Text>
        </View>
      </View>

      {/* Pulse (if provided) */}
      {pulse !== undefined && (
        <View style={styles.pulseContainer}>
          <Ionicons name="heart" size={16} color={Colors.primary} />
          <Text style={[styles.pulseValue, { color: theme.colors.text }]}>
            {pulse}
          </Text>
          <Text style={[styles.pulseUnit, { color: theme.colors.textSecondary }]}>
            bpm
          </Text>
        </View>
      )}

      {/* Labels */}
      {showLabels && (
        <View style={styles.labelsContainer}>
          <View style={styles.labelItem}>
            <Text style={[styles.labelValue, { color: theme.colors.text }]}>
              {systolic}
            </Text>
            <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>
              ตัวบน
            </Text>
          </View>
          <View style={[styles.labelDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.labelItem}>
            <Text style={[styles.labelValue, { color: theme.colors.text }]}>
              {diastolic}
            </Text>
            <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>
              ตัวล่าง
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  gauge: {
    borderRadius: 999,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpValue: {
    fontWeight: 'bold',
  },
  unit: {
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '600',
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pulseValue: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 6,
  },
  pulseUnit: {
    fontSize: 12,
    marginLeft: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  labelItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  labelValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  labelText: {
    fontSize: 12,
    marginTop: 2,
  },
  labelDivider: {
    width: 1,
    height: 30,
  },
});
