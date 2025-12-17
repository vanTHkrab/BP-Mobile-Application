/**
 * BPCard Component
 * แสดงข้อมูลความดันโลหิตแบบ Card พร้อมสถานะ
 */

import { Colors, DarkTheme, LightTheme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BPRecord } from '@/types';
import { formatBPValue, getBPStatusInfo } from '@/utils/blood-pressure';
import { formatTime, getRelativeTime } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface BPCardProps {
  record: BPRecord;
  onPress?: () => void;
  onLongPress?: () => void;
  showDate?: boolean;
  showTime?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

export function BPCard({
  record,
  onPress,
  onLongPress,
  showDate = true,
  showTime = true,
  compact = false,
  style,
}: BPCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;
  const statusInfo = getBPStatusInfo(record.systolic, record.diastolic);

  const CardContent = () => (
    <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      {/* Status Indicator */}
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: statusInfo.color },
        ]}
      />

      <View style={styles.content}>
        {/* Main BP Value */}
        <View style={styles.mainRow}>
          <View style={styles.bpValueContainer}>
            <Text style={[styles.bpValue, { color: theme.colors.text }]}>
              {formatBPValue(record.systolic, record.diastolic)}
            </Text>
            <Text style={[styles.bpUnit, { color: theme.colors.textSecondary }]}>
              mmHg
            </Text>
          </View>

          {/* Pulse */}
          <View style={styles.pulseContainer}>
            <Ionicons
              name="heart"
              size={compact ? 16 : 20}
              color={Colors.primary}
            />
            <Text style={[styles.pulseValue, { color: theme.colors.text }]}>
              {record.pulse}
            </Text>
            <Text style={[styles.pulseUnit, { color: theme.colors.textSecondary }]}>
              bpm
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.color + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.labelTh}
          </Text>
        </View>

        {/* Date/Time Row */}
        {(showDate || showTime) && (
          <View style={styles.dateRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {showDate && getRelativeTime(record.measured_at)}
              {showDate && showTime && ' • '}
              {showTime && formatTime(record.measured_at)}
            </Text>
          </View>
        )}

        {/* Note (if exists) */}
        {record.note && !compact && (
          <View style={styles.noteRow}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.noteText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {record.note}
            </Text>
          </View>
        )}

        {/* Image Indicator */}
        {record.image_path && !compact && (
          <View style={styles.imageIndicator}>
            <Ionicons
              name="image-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.imageText, { color: theme.colors.textSecondary }]}>
              มีรูปภาพแนบ
            </Text>
          </View>
        )}
      </View>

      {/* Arrow Icon */}
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.arrowIcon}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 60,
  },
  content: {
    flex: 1,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bpValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bpValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  bpUnit: {
    fontSize: 14,
    marginLeft: 4,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pulseValue: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
  },
  pulseUnit: {
    fontSize: 12,
    marginLeft: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  noteText: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  imageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  imageText: {
    fontSize: 12,
    marginLeft: 4,
  },
  arrowIcon: {
    marginLeft: 8,
  },
});
