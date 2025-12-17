/**
 * Settings Screen
 * หน้าการตั้งค่าและโปรไฟล์
 */

import { Colors, DarkTheme, LightTheme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/hooks/use-settings';
import { BPThreshold, Gender } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  const {
    profile,
    settings,
    isProfileLoading,
    isSettingsLoading,
    saveProfile,
    saveSettings,
    saveBPThreshold,
    toggleNotifications,
    toggleAbnormalAlert,
    setDarkMode,
  } = useSettings();

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    age: profile?.age?.toString() || '',
    gender: profile?.gender || Gender.PREFER_NOT_TO_SAY,
    medical_conditions: profile?.medical_conditions || '',
  });

  // Threshold edit state
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [thresholdForm, setThresholdForm] = useState<BPThreshold>({
    high_systolic: settings?.bp_threshold.high_systolic || 140,
    high_diastolic: settings?.bp_threshold.high_diastolic || 90,
    low_systolic: settings?.bp_threshold.low_systolic || 90,
    low_diastolic: settings?.bp_threshold.low_diastolic || 60,
  });

  // Handle save profile
  const handleSaveProfile = async () => {
    const success = await saveProfile({
      name: profileForm.name,
      age: profileForm.age ? parseInt(profileForm.age, 10) : undefined,
      gender: profileForm.gender,
      medical_conditions: profileForm.medical_conditions || undefined,
    });

    if (success) {
      setIsEditingProfile(false);
      Alert.alert('สำเร็จ', 'บันทึกโปรไฟล์เรียบร้อยแล้ว');
    } else {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกโปรไฟล์ได้');
    }
  };

  // Handle save threshold
  const handleSaveThreshold = async () => {
    const success = await saveBPThreshold(thresholdForm);

    if (success) {
      setIsEditingThreshold(false);
      Alert.alert('สำเร็จ', 'บันทึกค่าเกณฑ์เรียบร้อยแล้ว');
    } else {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกค่าเกณฑ์ได้');
    }
  };

  // Gender options
  const genderOptions = [
    { label: 'ชาย', value: Gender.MALE },
    { label: 'หญิง', value: Gender.FEMALE },
    { label: 'อื่นๆ', value: Gender.OTHER },
    { label: 'ไม่ระบุ', value: Gender.PREFER_NOT_TO_SAY },
  ];

  // Section component
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  // Setting row component
  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    isSwitch,
    switchValue,
    onSwitchChange,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    isSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon as any}
          size={22}
          color={Colors.primary}
          style={styles.settingIcon}
        />
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.colors.border, true: Colors.primary + '60' }}
          thumbColor={switchValue ? Colors.primary : '#f4f3f4'}
        />
      ) : (
        <View style={styles.settingRight}>
          {value && (
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              {value}
            </Text>
          )}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Section */}
      <Section title="โปรไฟล์ของฉัน">
        {isEditingProfile ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                ชื่อ
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surface, color: theme.colors.text },
                ]}
                value={profileForm.name}
                onChangeText={(text) =>
                  setProfileForm((prev) => ({ ...prev, name: text }))
                }
                placeholder="กรอกชื่อ"
                placeholderTextColor={theme.colors.textDisabled}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                อายุ
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surface, color: theme.colors.text },
                ]}
                value={profileForm.age}
                onChangeText={(text) =>
                  setProfileForm((prev) => ({ ...prev, age: text }))
                }
                placeholder="กรอกอายุ"
                placeholderTextColor={theme.colors.textDisabled}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                เพศ
              </Text>
              <View style={styles.genderOptions}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderButton,
                      {
                        backgroundColor:
                          profileForm.gender === option.value
                            ? Colors.primary
                            : theme.colors.surface,
                      },
                    ]}
                    onPress={() =>
                      setProfileForm((prev) => ({ ...prev, gender: option.value }))
                    }
                  >
                    <Text
                      style={{
                        color:
                          profileForm.gender === option.value
                            ? '#FFF'
                            : theme.colors.text,
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                โรคประจำตัว (ถ้ามี)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  { backgroundColor: theme.colors.surface, color: theme.colors.text },
                ]}
                value={profileForm.medical_conditions}
                onChangeText={(text) =>
                  setProfileForm((prev) => ({ ...prev, medical_conditions: text }))
                }
                placeholder="เช่น เบาหวาน, ความดันโลหิตสูง"
                placeholderTextColor={theme.colors.textDisabled}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setIsEditingProfile(false)}
              >
                <Text style={{ color: theme.colors.text }}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: Colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <SettingRow
              icon="person"
              label="ชื่อ"
              value={profile?.name || 'ไม่ระบุ'}
              onPress={() => setIsEditingProfile(true)}
            />
            <SettingRow
              icon="calendar"
              label="อายุ"
              value={profile?.age ? `${profile.age} ปี` : 'ไม่ระบุ'}
              onPress={() => setIsEditingProfile(true)}
            />
            <SettingRow
              icon="male-female"
              label="เพศ"
              value={
                genderOptions.find((o) => o.value === profile?.gender)?.label ||
                'ไม่ระบุ'
              }
              onPress={() => setIsEditingProfile(true)}
            />
            <SettingRow
              icon="medical"
              label="โรคประจำตัว"
              value={profile?.medical_conditions || 'ไม่ระบุ'}
              onPress={() => setIsEditingProfile(true)}
            />
          </>
        )}
      </Section>

      {/* Notification Settings */}
      <Section title="การแจ้งเตือน">
        <SettingRow
          icon="notifications"
          label="เปิดการแจ้งเตือน"
          isSwitch
          switchValue={settings?.notifications_enabled}
          onSwitchChange={toggleNotifications}
        />
        <SettingRow
          icon="warning"
          label="แจ้งเตือนค่าผิดปกติ"
          isSwitch
          switchValue={settings?.abnormal_alert_enabled}
          onSwitchChange={toggleAbnormalAlert}
        />
      </Section>

      {/* Threshold Settings */}
      <Section title="เกณฑ์ค่าความดันผิดปกติ">
        {isEditingThreshold ? (
          <View style={styles.editForm}>
            <View style={styles.thresholdRow}>
              <View style={styles.thresholdItem}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  ตัวบนสูง
                </Text>
                <TextInput
                  style={[
                    styles.thresholdInput,
                    { backgroundColor: theme.colors.surface, color: theme.colors.text },
                  ]}
                  value={thresholdForm.high_systolic.toString()}
                  onChangeText={(text) =>
                    setThresholdForm((prev) => ({
                      ...prev,
                      high_systolic: parseInt(text, 10) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.thresholdItem}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  ตัวล่างสูง
                </Text>
                <TextInput
                  style={[
                    styles.thresholdInput,
                    { backgroundColor: theme.colors.surface, color: theme.colors.text },
                  ]}
                  value={thresholdForm.high_diastolic.toString()}
                  onChangeText={(text) =>
                    setThresholdForm((prev) => ({
                      ...prev,
                      high_diastolic: parseInt(text, 10) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.thresholdRow}>
              <View style={styles.thresholdItem}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  ตัวบนต่ำ
                </Text>
                <TextInput
                  style={[
                    styles.thresholdInput,
                    { backgroundColor: theme.colors.surface, color: theme.colors.text },
                  ]}
                  value={thresholdForm.low_systolic.toString()}
                  onChangeText={(text) =>
                    setThresholdForm((prev) => ({
                      ...prev,
                      low_systolic: parseInt(text, 10) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.thresholdItem}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  ตัวล่างต่ำ
                </Text>
                <TextInput
                  style={[
                    styles.thresholdInput,
                    { backgroundColor: theme.colors.surface, color: theme.colors.text },
                  ]}
                  value={thresholdForm.low_diastolic.toString()}
                  onChangeText={(text) =>
                    setThresholdForm((prev) => ({
                      ...prev,
                      low_diastolic: parseInt(text, 10) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setIsEditingThreshold(false)}
              >
                <Text style={{ color: theme.colors.text }}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: Colors.primary }]}
                onPress={handleSaveThreshold}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <SettingRow
              icon="arrow-up-circle"
              label="ความดันสูง"
              value={`${settings?.bp_threshold.high_systolic}/${settings?.bp_threshold.high_diastolic} mmHg`}
              onPress={() => setIsEditingThreshold(true)}
            />
            <SettingRow
              icon="arrow-down-circle"
              label="ความดันต่ำ"
              value={`${settings?.bp_threshold.low_systolic}/${settings?.bp_threshold.low_diastolic} mmHg`}
              onPress={() => setIsEditingThreshold(true)}
            />
          </>
        )}
      </Section>

      {/* Display Settings */}
      <Section title="การแสดงผล">
        <SettingRow
          icon="moon"
          label="โหมดมืด"
          value={
            settings?.dark_mode === 'system'
              ? 'ตามระบบ'
              : settings?.dark_mode === 'dark'
              ? 'เปิด'
              : 'ปิด'
          }
          onPress={() => {
            Alert.alert('เลือกโหมด', '', [
              {
                text: 'ตามระบบ',
                onPress: () => setDarkMode('system'),
              },
              {
                text: 'เปิด',
                onPress: () => setDarkMode('dark'),
              },
              {
                text: 'ปิด',
                onPress: () => setDarkMode('light'),
              },
              { text: 'ยกเลิก', style: 'cancel' },
            ]);
          }}
        />
        <SettingRow
          icon="speedometer"
          label="หน่วย"
          value={settings?.pressure_unit || 'mmHg'}
        />
      </Section>

      {/* App Info */}
      <Section title="เกี่ยวกับ">
        <SettingRow icon="information-circle" label="เวอร์ชัน" value="1.0.0" />
        <SettingRow
          icon="cloud-upload"
          label="Sync กับ Cloud"
          value="เร็วๆ นี้"
        />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    opacity: 0.7,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  editForm: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  thresholdItem: {
    flex: 1,
  },
  thresholdInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});
