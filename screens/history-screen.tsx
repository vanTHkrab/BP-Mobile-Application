/**
 * History Screen
 * หน้าดูประวัติบันทึกความดันโลหิตย้อนหลัง พร้อม filter
 */

import { BPCard } from '@/components/bp/bp-card';
import { Colors, DarkTheme, LightTheme } from '@/constants/colors';
import { useBPRecords } from '@/hooks/use-bp-records';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BPRecord, DateRangePreset } from '@/types';
import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Filter options
const FILTER_OPTIONS = [
  { label: '7 วัน', value: DateRangePreset.LAST_7_DAYS },
  { label: '30 วัน', value: DateRangePreset.LAST_30_DAYS },
  { label: '90 วัน', value: DateRangePreset.LAST_90_DAYS },
  { label: 'ทั้งหมด', value: DateRangePreset.ALL },
];

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState<DateRangePreset>(
    DateRangePreset.LAST_30_DAYS
  );

  const {
    records,
    isLoading,
    error,
    fetchRecords,
    removeRecord,
  } = useBPRecords({ preset: selectedFilter });

  // Handle filter change
  const handleFilterChange = useCallback(
    (filter: DateRangePreset) => {
      setSelectedFilter(filter);
      fetchRecords({ preset: filter });
    },
    [fetchRecords]
  );

  // Handle record press
  const handleRecordPress = useCallback(
    (record: BPRecord) => {
      router.push(`/record/${record.id}` as any);
    },
    [router]
  );

  // Handle delete
  const handleDeleteRecord = useCallback(
    (record: BPRecord) => {
      Alert.alert(
        'ลบบันทึก',
        `ต้องการลบบันทึกความดัน ${record.systolic}/${record.diastolic} mmHg หรือไม่?`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ลบ',
            style: 'destructive',
            onPress: async () => {
              const success = await removeRecord(record.id);
              if (success) {
                Alert.alert('สำเร็จ', 'ลบบันทึกเรียบร้อยแล้ว');
              }
            },
          },
        ]
      );
    },
    [removeRecord]
  );

  // Group records by date
  const groupedRecords = useMemo(() => {
    const groups: { [key: string]: BPRecord[] } = {};
    records.forEach((record) => {
      const dateKey = record.measured_at.split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(record);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      records: items,
    }));
  }, [records]);

  // Render section header
  const renderSectionHeader = (date: string) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {formatDate(date, { showTime: false })}
      </Text>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={theme.colors.textDisabled}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        ไม่มีข้อมูล
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {selectedFilter === DateRangePreset.ALL
          ? 'ยังไม่มีการบันทึกความดันโลหิต'
          : `ไม่มีบันทึกในช่วง ${FILTER_OPTIONS.find((f) => f.value === selectedFilter)?.label}`}
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: Colors.primary }]}
        onPress={() => router.push('/(tabs)/add' as any)}
      >
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>เพิ่มบันทึก</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filter Bar */}
      <View style={[styles.filterBar, { borderBottomColor: theme.colors.border }]}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              selectedFilter === option.value && {
                backgroundColor: Colors.primary,
              },
            ]}
            onPress={() => handleFilterChange(option.value)}
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

      {/* Summary */}
      <View style={[styles.summaryBar, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
          ทั้งหมด {records.length} รายการ
        </Text>
      </View>

      {/* Records List */}
      {groupedRecords.length > 0 ? (
        <FlatList
          data={groupedRecords}
          keyExtractor={(item) => item.date}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchRecords({ preset: selectedFilter })}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <View>
              {renderSectionHeader(item.date)}
              {item.records.map((record) => (
                <BPCard
                  key={record.id}
                  record={record}
                  onPress={() => handleRecordPress(record)}
                  onLongPress={() => handleDeleteRecord(record)}
                  showDate={false}
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmpty()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  summaryBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
