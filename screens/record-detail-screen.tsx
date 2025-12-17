/**
 * Record Detail Screen
 * หน้าจอแสดงรายละเอียดการบันทึกความดัน
 */

import { BPGauge } from '@/components/bp';
import { Colors, LightTheme } from '@/constants/colors';
import { deleteBPRecord, getBPRecordById } from '@/database/bp-records';
import { BPRecord } from '@/types';
import { analyzeBPStatus, BP_STATUS_INFO } from '@/utils/blood-pressure';
import { formatDate, formatDateTime, formatTime } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const theme = LightTheme.colors;

export default function RecordDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  
  const [record, setRecord] = useState<BPRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // โหลดข้อมูล
  const loadRecord = useCallback(async () => {
    if (!params.id) {
      router.back();
      return;
    }

    try {
      const id = parseInt(params.id);
      const result = await getBPRecordById(id);
      if (result.success && result.data) {
        setRecord(result.data);
      } else {
        Alert.alert('ข้อผิดพลาด', result.error || 'ไม่พบข้อมูล');
      }
    } catch (error) {
      console.error('Error loading record:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useFocusEffect(
    useCallback(() => {
      loadRecord();
    }, [loadRecord])
  );

  // ลบข้อมูล
  const handleDelete = () => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบข้อมูลนี้หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            if (!record) return;
            
            setIsDeleting(true);
            try {
              const success = await deleteBPRecord(record.id);
              if (success) {
                router.back();
              } else {
                Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้');
              }
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // แก้ไขข้อมูล
  const handleEdit = () => {
    if (record) {
      router.push(`/edit-record?id=${record.id}` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.textSecondary} />
        <Text style={styles.errorText}>ไม่พบข้อมูล</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>กลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = analyzeBPStatus(record.systolic, record.diastolic);
  const statusInfo = BP_STATUS_INFO[status];

  // สีพื้นหลังของ status card
  const getStatusBackgroundColor = () => {
    return statusInfo.color + '20'; // เพิ่ม opacity
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียด</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="pencil-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <Ionicons name="trash-outline" size={24} color={Colors.error} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* BP Gauge */}
        <View style={styles.gaugeContainer}>
          <BPGauge 
            systolic={record.systolic} 
            diastolic={record.diastolic}
            size="large"
          />
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: getStatusBackgroundColor() }]}>
          <View style={styles.statusHeader}>
            <Ionicons name="heart" size={24} color={statusInfo.color} />
            <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
              {statusInfo.labelTh}
            </Text>
          </View>
          <Text style={[styles.statusDescription, { color: statusInfo.color }]}>
            {statusInfo.description}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>ข้อมูลการวัด</Text>
          
          {/* Date & Time */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>วันที่</Text>
              <Text style={styles.detailValue}>{formatDate(record.measured_at)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>เวลา</Text>
              <Text style={styles.detailValue}>{formatTime(record.measured_at)}</Text>
            </View>
          </View>

          {/* Readings */}
          <View style={styles.readingsContainer}>
            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>Systolic</Text>
              <Text style={[styles.readingValue, { color: statusInfo.color }]}>
                {record.systolic}
              </Text>
              <Text style={styles.readingUnit}>mmHg</Text>
            </View>

            <View style={styles.readingDivider} />

            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>Diastolic</Text>
              <Text style={[styles.readingValue, { color: statusInfo.color }]}>
                {record.diastolic}
              </Text>
              <Text style={styles.readingUnit}>mmHg</Text>
            </View>

            <View style={styles.readingDivider} />

            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>ชีพจร</Text>
              <Text style={styles.readingValue}>
                {record.pulse ?? '-'}
              </Text>
              <Text style={styles.readingUnit}>bpm</Text>
            </View>
          </View>

          {/* Notes */}
          {record.note && (
            <View style={styles.notesContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="document-text-outline" size={20} color={theme.textSecondary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>หมายเหตุ</Text>
                  <Text style={styles.notesText}>{record.note}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Image */}
          {record.image_path && (
            <View style={styles.imageContainer}>
              <Text style={styles.detailLabel}>รูปภาพ</Text>
              <Image 
                source={{ uri: record.image_path }} 
                style={styles.recordImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Record Info */}
          <View style={styles.recordInfo}>
            <Text style={styles.recordInfoText}>
              บันทึกเมื่อ: {formatDateTime(record.created_at)}
            </Text>
            {record.updated_at !== record.created_at && (
              <Text style={styles.recordInfoText}>
                แก้ไขล่าสุด: {formatDateTime(record.updated_at)}
              </Text>
            )}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>คำแนะนำ</Text>
          <Text style={styles.recommendationsText}>
            {getRecommendation(status)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// คำแนะนำตามสถานะความดัน
function getRecommendation(status: string): string {
  switch (status) {
    case 'normal':
      return 'ค่าความดันโลหิตของคุณอยู่ในเกณฑ์ปกติ รักษาสุขภาพที่ดีไว้ด้วยการออกกำลังกายสม่ำเสมอ รับประทานอาหารที่มีประโยชน์ และพักผ่อนให้เพียงพอ';
    case 'elevated':
      return 'ค่าความดันโลหิตของคุณสูงกว่าปกติเล็กน้อย ควรลดการบริโภคเกลือ ออกกำลังกายอย่างสม่ำเสมอ และติดตามค่าความดันอย่างใกล้ชิด';
    case 'hypertension_stage_1':
      return 'คุณอยู่ในระยะความดันโลหิตสูงระดับ 1 ควรปรึกษาแพทย์เพื่อรับคำแนะนำ ปรับเปลี่ยนพฤติกรรมการใช้ชีวิต และอาจต้องใช้ยาตามคำแนะนำของแพทย์';
    case 'hypertension_stage_2':
      return 'คุณอยู่ในระยะความดันโลหิตสูงระดับ 2 ควรพบแพทย์โดยเร็วเพื่อรับการรักษาที่เหมาะสม อาจต้องใช้ยาและปรับเปลี่ยนพฤติกรรมอย่างเข้มงวด';
    case 'hypertensive_crisis':
      return '⚠️ ค่าความดันโลหิตของคุณสูงมาก! หากมีอาการปวดหัว มองเห็นไม่ชัด หายใจลำบาก หรือเจ็บหน้าอก ควรไปพบแพทย์ทันที หรือโทรเรียกรถพยาบาล';
    case 'low':
      return 'ค่าความดันโลหิตของคุณต่ำ หากมีอาการหน้ามืด วิงเวียน หรือเป็นลม ควรนั่งพักและดื่มน้ำ หากอาการไม่ดีขึ้นควรปรึกษาแพทย์';
    default:
      return 'ควรติดตามค่าความดันโลหิตอย่างสม่ำเสมอ และปรึกษาแพทย์หากมีข้อสงสัย';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightTheme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LightTheme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LightTheme.colors.background,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: LightTheme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: LightTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: LightTheme.colors.border,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LightTheme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: LightTheme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LightTheme.colors.text,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: LightTheme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: LightTheme.colors.text,
  },
  readingsContainer: {
    flexDirection: 'row',
    backgroundColor: LightTheme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  readingItem: {
    flex: 1,
    alignItems: 'center',
  },
  readingDivider: {
    width: 1,
    backgroundColor: LightTheme.colors.border,
  },
  readingLabel: {
    fontSize: 12,
    color: LightTheme.colors.textSecondary,
    marginBottom: 8,
  },
  readingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: LightTheme.colors.text,
  },
  readingUnit: {
    fontSize: 12,
    color: LightTheme.colors.textSecondary,
    marginTop: 4,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: LightTheme.colors.text,
    lineHeight: 20,
  },
  imageContainer: {
    marginTop: 16,
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  recordInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: LightTheme.colors.border,
  },
  recordInfoText: {
    fontSize: 12,
    color: LightTheme.colors.textSecondary,
    marginBottom: 4,
  },
  recommendationsCard: {
    backgroundColor: Colors.info + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.info,
    marginBottom: 12,
  },
  recommendationsText: {
    fontSize: 14,
    color: LightTheme.colors.text,
    lineHeight: 22,
  },
});
