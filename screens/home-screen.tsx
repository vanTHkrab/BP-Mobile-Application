/**
 * Home Screen
 * หน้าหลักแสดงสรุปความดันโลหิตล่าสุด และ quick actions
 */

import { BPCard } from '@/components/bp/bp-card';
import { BPGauge } from '@/components/bp/bp-gauge';
import { Colors, DarkTheme, LightTheme } from '@/constants/colors';
import { useBPRecords } from '@/hooks/use-bp-records';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/hooks/use-settings';
import { DateRangePreset } from '@/types';
import { getRelativeTime } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;
  const router = useRouter();

  const {
    records,
    latestRecord,
    statistics,
    isLoading,
    refresh,
    fetchStatistics,
  } = useBPRecords();

  const { profile } = useSettings();

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics({ preset: DateRangePreset.LAST_7_DAYS });
  }, [fetchStatistics]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refresh();
    await fetchStatistics({ preset: DateRangePreset.LAST_7_DAYS });
  }, [refresh, fetchStatistics]);

  // Navigate to add screen
  const handleAddPress = () => {
    router.push('/(tabs)/add' as any);
  };

  // Navigate to record detail
  const handleRecordPress = (id: number) => {
    router.push(`/record/${id}` as any);
  };

  // Recent records (last 5)
  const recentRecords = records.slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              สวัสดี 👋
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {profile?.name || 'ผู้ใช้'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/(tabs)/settings' as any)}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Latest BP Card */}
        <View style={[styles.latestCard, { backgroundColor: theme.colors.card }]}>
          {latestRecord ? (
            <>
              <View style={styles.latestHeader}>
                <Text style={[styles.latestTitle, { color: theme.colors.text }]}>
                  ค่าความดันล่าสุด
                </Text>
                <Text style={[styles.latestDate, { color: theme.colors.textSecondary }]}>
                  {getRelativeTime(latestRecord.measured_at)}
                </Text>
              </View>

              <View style={styles.gaugeContainer}>
                <BPGauge
                  systolic={latestRecord.systolic}
                  diastolic={latestRecord.diastolic}
                  pulse={latestRecord.pulse}
                  size="medium"
                />
              </View>
            </>
          ) : (
            <View style={styles.emptyLatest}>
              <Ionicons
                name="heart-outline"
                size={48}
                color={theme.colors.textDisabled}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                ยังไม่มีข้อมูลความดัน
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textDisabled }]}>
                กดปุ่ม "บันทึก" เพื่อเริ่มต้นใช้งาน
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={handleAddPress}
          >
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>บันทึก</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push('/(tabs)/history' as any)}
          >
            <Ionicons name="list" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>ประวัติ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.success }]}
            onPress={() => router.push('/(tabs)/chart' as any)}
          >
            <Ionicons name="stats-chart" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>กราฟ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.info }]}
            onPress={() => router.push('/camera' as any)}
          >
            <Ionicons name="camera" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>ถ่ายรูป</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Summary */}
        {statistics && statistics.total_records > 0 && (
          <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              สรุป 7 วันที่ผ่านมา
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {statistics.total_records}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  บันทึก
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {Math.round(statistics.avg_systolic)}/{Math.round(statistics.avg_diastolic)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  ค่าเฉลี่ย
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.bpNormal }]}>
                  {statistics.normal_count}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  ปกติ
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Records */}
        {recentRecords.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                บันทึกล่าสุด
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history' as any)}>
                <Text style={[styles.seeAllText, { color: Colors.primary }]}>
                  ดูทั้งหมด
                </Text>
              </TouchableOpacity>
            </View>

            {recentRecords.map((record) => (
              <BPCard
                key={record.id}
                record={record}
                onPress={() => handleRecordPress(record.id)}
                compact
              />
            ))}
          </View>
        )}

        {/* Tips Section */}
        <View style={[styles.tipsCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color={Colors.warning} />
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
              เคล็ดลับสุขภาพ
            </Text>
          </View>
          <Text style={[styles.tipsText, { color: theme.colors.textSecondary }]}>
            • วัดความดันสม่ำเสมอทุกวัน เวลาเดียวกัน{'\n'}
            • พักผ่อน 5 นาทีก่อนวัดความดัน{'\n'}
            • หลีกเลี่ยงการดื่มคาเฟอีนก่อนวัด 30 นาที{'\n'}
            • นั่งพักและผ่อนคลายก่อนทำการวัด
          </Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 10,
    borderRadius: 12,
  },
  latestCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  latestTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  latestDate: {
    fontSize: 14,
  },
  gaugeContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyLatest: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  recentSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
