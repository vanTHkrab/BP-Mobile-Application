/**
 * Add BP Screen
 * หน้าบันทึกค่าความดันโลหิตใหม่
 */

import { BPInput } from '@/components/bp/bp-input';
import { DarkTheme, LightTheme } from '@/constants/colors';
import { useBPRecords } from '@/hooks/use-bp-records';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BPRecordInput } from '@/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    View,
} from 'react-native';

export default function AddBPScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;
  const router = useRouter();
  const { addRecord } = useBPRecords();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: BPRecordInput) => {
    setIsLoading(true);
    try {
      const result = await addRecord(data);
      if (result.success) {
        Alert.alert(
          'บันทึกสำเร็จ',
          'บันทึกค่าความดันโลหิตเรียบร้อยแล้ว',
          [
            {
              text: 'ตกลง',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('เกิดข้อผิดพลาด', result.error ?? 'ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BPInput
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="บันทึก"
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
