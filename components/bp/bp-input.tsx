/**
 * BPInput Component
 * Form component สำหรับกรอกค่าความดันโลหิต
 */

import { Colors, DarkTheme, LightTheme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BPRecordInput } from '@/types';
import { getBPStatusInfo, validateBPInput } from '@/utils/blood-pressure';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface BPInputProps {
  initialValues?: Partial<BPRecordInput>;
  onSubmit: (data: BPRecordInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function BPInput({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'บันทึก',
  isLoading = false,
}: BPInputProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  // Form state
  const [systolic, setSystolic] = useState(initialValues?.systolic?.toString() ?? '');
  const [diastolic, setDiastolic] = useState(initialValues?.diastolic?.toString() ?? '');
  const [pulse, setPulse] = useState(initialValues?.pulse?.toString() ?? '');
  const [measuredAt, setMeasuredAt] = useState(
    initialValues?.measured_at ? new Date(initialValues.measured_at) : new Date()
  );
  const [note, setNote] = useState(initialValues?.note ?? '');
  const [imagePath, setImagePath] = useState(initialValues?.image_path);

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preview status เมื่อกรอกครบ
  const [previewStatus, setPreviewStatus] = useState<ReturnType<typeof getBPStatusInfo> | null>(null);

  // Update preview status เมื่อ values เปลี่ยน
  useEffect(() => {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    if (!isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0) {
      setPreviewStatus(getBPStatusInfo(sys, dia));
    } else {
      setPreviewStatus(null);
    }
  }, [systolic, diastolic]);

  // Handle number input with validation
  const handleNumberInput = useCallback(
    (
      value: string,
      setter: (val: string) => void,
      min: number,
      max: number
    ) => {
      // Allow empty or numbers only
      if (value === '' || /^\d+$/.test(value)) {
        setter(value);
      }
    },
    []
  );

  // Handle date change
  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(measuredAt);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setMeasuredAt(newDate);
    }
  };

  // Handle time change
  const handleTimeChange = (_event: unknown, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(measuredAt);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setMeasuredAt(newDate);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validate
    const validation = validateBPInput(systolic, diastolic, pulse);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    try {
      await onSubmit({
        systolic: parseInt(systolic, 10),
        diastolic: parseInt(diastolic, 10),
        pulse: parseInt(pulse, 10),
        measured_at: measuredAt.toISOString(),
        note: note.trim() || undefined,
        image_path: imagePath,
      });
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* BP Values Row */}
        <View style={styles.bpRow}>
          {/* Systolic */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              ความดันตัวบน
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: errors.systolic ? Colors.error : theme.colors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, styles.bpInput, { color: theme.colors.text }]}
                value={systolic}
                onChangeText={(v) => handleNumberInput(v, setSystolic, 60, 250)}
                keyboardType="numeric"
                placeholder="120"
                placeholderTextColor={theme.colors.textDisabled}
                maxLength={3}
              />
              <Text style={[styles.unitText, { color: theme.colors.textSecondary }]}>
                mmHg
              </Text>
            </View>
            {errors.systolic && (
              <Text style={styles.errorText}>{errors.systolic}</Text>
            )}
          </View>

          {/* Slash */}
          <Text style={[styles.slash, { color: theme.colors.textSecondary }]}>/</Text>

          {/* Diastolic */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              ความดันตัวล่าง
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: errors.diastolic ? Colors.error : theme.colors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, styles.bpInput, { color: theme.colors.text }]}
                value={diastolic}
                onChangeText={(v) => handleNumberInput(v, setDiastolic, 40, 150)}
                keyboardType="numeric"
                placeholder="80"
                placeholderTextColor={theme.colors.textDisabled}
                maxLength={3}
              />
              <Text style={[styles.unitText, { color: theme.colors.textSecondary }]}>
                mmHg
              </Text>
            </View>
            {errors.diastolic && (
              <Text style={styles.errorText}>{errors.diastolic}</Text>
            )}
          </View>
        </View>

        {/* General Error */}
        {errors.general && (
          <View style={styles.generalErrorContainer}>
            <Ionicons name="warning" size={16} color={Colors.error} />
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        {/* Preview Status */}
        {previewStatus && (
          <View
            style={[
              styles.statusPreview,
              { backgroundColor: previewStatus.color + '20' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: previewStatus.color },
              ]}
            />
            <Text style={[styles.statusText, { color: previewStatus.color }]}>
              {previewStatus.labelTh}
            </Text>
            <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
              - {previewStatus.description}
            </Text>
          </View>
        )}

        {/* Pulse */}
        <View style={styles.fullInputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            <Ionicons name="heart" size={16} color={Colors.primary} /> ชีพจร
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: errors.pulse ? Colors.error : theme.colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={pulse}
              onChangeText={(v) => handleNumberInput(v, setPulse, 30, 220)}
              keyboardType="numeric"
              placeholder="72"
              placeholderTextColor={theme.colors.textDisabled}
              maxLength={3}
            />
            <Text style={[styles.unitText, { color: theme.colors.textSecondary }]}>
              bpm
            </Text>
          </View>
          {errors.pulse && <Text style={styles.errorText}>{errors.pulse}</Text>}
        </View>

        {/* Date & Time */}
        <View style={styles.dateTimeRow}>
          {/* Date */}
          <TouchableOpacity
            style={[
              styles.dateTimeButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={[styles.dateTimeText, { color: theme.colors.text }]}>
              {formatDisplayDate(measuredAt)}
            </Text>
          </TouchableOpacity>

          {/* Time */}
          <TouchableOpacity
            style={[
              styles.dateTimeButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={20} color={Colors.primary} />
            <Text style={[styles.dateTimeText, { color: theme.colors.text }]}>
              {formatDisplayTime(measuredAt)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.fullInputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            <Ionicons name="document-text-outline" size={16} color={theme.colors.textSecondary} /> หมายเหตุ (ไม่บังคับ)
          </Text>
          <View
            style={[
              styles.inputContainer,
              styles.noteInputContainer,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, styles.noteInput, { color: theme.colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="เช่น หลังออกกำลังกาย, ก่อนนอน..."
              placeholderTextColor={theme.colors.textDisabled}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          {onCancel && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: theme.colors.border },
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                ยกเลิก
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: Colors.primary },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.submitButtonText}>กำลังบันทึก...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>{submitLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={measuredAt}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={measuredAt}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  inputGroup: {
    flex: 1,
  },
  fullInputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  bpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unitText: {
    fontSize: 14,
    marginLeft: 4,
  },
  slash: {
    fontSize: 32,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  generalErrorText: {
    color: Colors.error,
    fontSize: 14,
    marginLeft: 8,
  },
  statusPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDesc: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 14,
  },
  noteInputContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  noteInput: {
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
