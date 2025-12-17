/**
 * Blood Pressure Mobile Application - TypeScript Types
 * ไฟล์รวม type definitions ทั้งหมดของแอปพลิเคชัน
 */

// ===========================================
// Blood Pressure Record Types
// ===========================================

/**
 * BP Record - ข้อมูลบันทึกความดันโลหิต
 */
export interface BPRecord {
  id: number;
  systolic: number;        // ความดันตัวบน (mmHg)
  diastolic: number;       // ความดันตัวล่าง (mmHg)
  pulse: number;           // ชีพจร (bpm)
  measured_at: string;     // วันเวลาที่วัด (ISO string)
  note?: string;           // หมายเหตุ (optional)
  image_path?: string;     // path รูปภาพ (optional)
  created_at: string;      // วันที่สร้าง record
  updated_at: string;      // วันที่แก้ไขล่าสุด
}

/**
 * BPRecordInput - ข้อมูลสำหรับสร้าง/แก้ไข record
 */
export interface BPRecordInput {
  systolic: number;
  diastolic: number;
  pulse: number;
  measured_at: string;
  note?: string;
  image_path?: string;
}

/**
 * BP Status - สถานะความดันโลหิต
 * อ้างอิงตามเกณฑ์ American Heart Association
 */
export enum BPStatus {
  NORMAL = 'normal',           // ปกติ
  ELEVATED = 'elevated',       // สูงเล็กน้อย
  HYPERTENSION_1 = 'hypertension_stage_1',  // ความดันสูงระดับ 1
  HYPERTENSION_2 = 'hypertension_stage_2',  // ความดันสูงระดับ 2
  CRISIS = 'hypertensive_crisis',           // วิกฤต
  LOW = 'low',                 // ต่ำ
}

/**
 * BP Status Info - ข้อมูลสถานะความดัน
 */
export interface BPStatusInfo {
  status: BPStatus;
  label: string;
  labelTh: string;
  color: string;
  description: string;
}

// ===========================================
// Medication Reminder Types
// ===========================================

/**
 * MedicationReminder - การแจ้งเตือนทานยา
 */
export interface MedicationReminder {
  id: number;
  medication_name: string;   // ชื่อยา
  dosage?: string;           // ปริมาณยา
  time: string;              // เวลาแจ้งเตือน (HH:mm format)
  days_of_week: string;      // วันที่แจ้งเตือน (comma separated: 0-6)
  is_enabled: boolean;       // เปิด/ปิดการแจ้งเตือน
  notification_id?: string;  // ID ของ notification ที่ตั้งไว้
  created_at: string;
  updated_at: string;
}

export interface MedicationReminderInput {
  medication_name: string;
  dosage?: string;
  time: string;
  days_of_week: string;
  is_enabled: boolean;
}

// ===========================================
// Measurement Reminder Types
// ===========================================

/**
 * MeasurementReminder - การแจ้งเตือนวัดความดัน
 */
export interface MeasurementReminder {
  id: number;
  name: string;              // ชื่อการแจ้งเตือน (เช่น "เช้า", "เย็น")
  time: string;              // เวลาแจ้งเตือน (HH:mm format)
  days_of_week: string;      // วันที่แจ้งเตือน
  is_enabled: boolean;
  notification_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MeasurementReminderInput {
  name: string;
  time: string;
  days_of_week: string;
  is_enabled: boolean;
}

// ===========================================
// User Profile Types
// ===========================================

/**
 * Gender - เพศ
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

/**
 * UserProfile - ข้อมูลผู้ใช้
 */
export interface UserProfile {
  id: number;
  name: string;
  age?: number;
  gender?: Gender;
  medical_conditions?: string;  // โรคประจำตัว (comma separated)
  created_at: string;
  updated_at: string;
}

export interface UserProfileInput {
  name: string;
  age?: number;
  gender?: Gender;
  medical_conditions?: string;
}

// ===========================================
// App Settings Types
// ===========================================

/**
 * BPThreshold - เกณฑ์ความดันผิดปกติ
 */
export interface BPThreshold {
  high_systolic: number;     // ค่า systolic ที่ถือว่าสูง (default: 140)
  high_diastolic: number;    // ค่า diastolic ที่ถือว่าสูง (default: 90)
  low_systolic: number;      // ค่า systolic ที่ถือว่าต่ำ (default: 90)
  low_diastolic: number;     // ค่า diastolic ที่ถือว่าต่ำ (default: 60)
}

/**
 * AppSettings - การตั้งค่าแอป
 */
export interface AppSettings {
  id: number;
  pressure_unit: 'mmHg';     // หน่วยวัดความดัน (ปัจจุบันรองรับแค่ mmHg)
  notifications_enabled: boolean;
  abnormal_alert_enabled: boolean;  // แจ้งเตือนค่าผิดปกติ
  bp_threshold: BPThreshold;
  dark_mode: 'system' | 'light' | 'dark';
  cloud_sync_enabled: boolean;  // สำหรับอนาคต
  created_at: string;
  updated_at: string;
}

export interface AppSettingsInput {
  pressure_unit?: 'mmHg';
  notifications_enabled?: boolean;
  abnormal_alert_enabled?: boolean;
  bp_threshold?: BPThreshold;
  dark_mode?: 'system' | 'light' | 'dark';
  cloud_sync_enabled?: boolean;
}

// ===========================================
// Filter & Query Types
// ===========================================

/**
 * DateRange - ช่วงวันที่สำหรับ filter
 */
export interface DateRange {
  start_date: string;  // ISO string
  end_date: string;    // ISO string
}

/**
 * DateRangePreset - preset ช่วงวันที่
 */
export enum DateRangePreset {
  LAST_7_DAYS = '7_days',
  LAST_30_DAYS = '30_days',
  LAST_90_DAYS = '90_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom',
  ALL = 'all',
}

/**
 * BPRecordFilter - ตัวกรองสำหรับ BP records
 */
export interface BPRecordFilter {
  date_range?: DateRange;
  preset?: DateRangePreset;
  status?: BPStatus[];
  limit?: number;
  offset?: number;
}

// ===========================================
// Chart Types
// ===========================================

/**
 * ChartDataPoint - จุดข้อมูลสำหรับกราฟ
 */
export interface ChartDataPoint {
  date: string;
  systolic: number;
  diastolic: number;
  pulse: number;
}

/**
 * ChartType - ประเภทกราฟ
 */
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
}

// ===========================================
// Notification Types
// ===========================================

/**
 * NotificationType - ประเภท notification
 */
export enum NotificationType {
  MEDICATION = 'medication',
  MEASUREMENT = 'measurement',
  ABNORMAL_BP = 'abnormal_bp',
}

/**
 * NotificationPayload - ข้อมูลที่แนบมากับ notification
 */
export interface NotificationPayload extends Record<string, unknown> {
  type: NotificationType;
  record_id?: number;
  reminder_id?: number;
}

// ===========================================
// UI Types
// ===========================================

/**
 * ModalType - ประเภท modal
 */
export enum ModalType {
  ADD_BP = 'add_bp',
  EDIT_BP = 'edit_bp',
  ADD_MEDICATION = 'add_medication',
  ADD_MEASUREMENT = 'add_measurement',
  DATE_PICKER = 'date_picker',
  CONFIRM = 'confirm',
}

/**
 * ToastType - ประเภท toast message
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// ===========================================
// Database Types
// ===========================================

/**
 * DBMigration - ข้อมูล migration
 */
export interface DBMigration {
  version: number;
  name: string;
  executed_at?: string;
}

/**
 * QueryResult - ผลลัพธ์จาก query
 */
export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===========================================
// Statistics Types
// ===========================================

/**
 * BPStatistics - สถิติความดันโลหิต
 */
export interface BPStatistics {
  total_records: number;
  avg_systolic: number;
  avg_diastolic: number;
  avg_pulse: number;
  max_systolic: number;
  min_systolic: number;
  max_diastolic: number;
  min_diastolic: number;
  max_pulse: number;
  min_pulse: number;
  normal_count: number;
  elevated_count: number;
  hypertension_count: number;
}
