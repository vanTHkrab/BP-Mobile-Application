/**
 * Database Configuration & Schema
 * ไฟล์กำหนดค่า database และ schema ทั้งหมด
 */

// ชื่อ database
export const DATABASE_NAME = 'bp_tracker.db';

// Version ของ database (เพิ่มเมื่อมี migration)
export const DATABASE_VERSION = 1;

/**
 * SQL สำหรับสร้างตาราง bp_records
 * เก็บข้อมูลบันทึกความดันโลหิต
 */
export const CREATE_BP_RECORDS_TABLE = `
  CREATE TABLE IF NOT EXISTS bp_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    pulse INTEGER NOT NULL,
    measured_at TEXT NOT NULL,
    note TEXT,
    image_path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * SQL สำหรับสร้างตาราง medication_reminders
 * เก็บข้อมูลแจ้งเตือนทานยา
 */
export const CREATE_MEDICATION_REMINDERS_TABLE = `
  CREATE TABLE IF NOT EXISTS medication_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    time TEXT NOT NULL,
    days_of_week TEXT NOT NULL DEFAULT '0,1,2,3,4,5,6',
    is_enabled INTEGER DEFAULT 1,
    notification_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * SQL สำหรับสร้างตาราง measurement_reminders
 * เก็บข้อมูลแจ้งเตือนวัดความดัน
 */
export const CREATE_MEASUREMENT_REMINDERS_TABLE = `
  CREATE TABLE IF NOT EXISTS measurement_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    days_of_week TEXT NOT NULL DEFAULT '0,1,2,3,4,5,6',
    is_enabled INTEGER DEFAULT 1,
    notification_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * SQL สำหรับสร้างตาราง user_profile
 * เก็บข้อมูลโปรไฟล์ผู้ใช้ (เก็บได้ 1 record)
 */
export const CREATE_USER_PROFILE_TABLE = `
  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL DEFAULT '',
    age INTEGER,
    gender TEXT,
    medical_conditions TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * SQL สำหรับสร้างตาราง app_settings
 * เก็บการตั้งค่าแอป (เก็บได้ 1 record)
 */
export const CREATE_APP_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pressure_unit TEXT DEFAULT 'mmHg',
    notifications_enabled INTEGER DEFAULT 1,
    abnormal_alert_enabled INTEGER DEFAULT 1,
    bp_threshold_high_systolic INTEGER DEFAULT 140,
    bp_threshold_high_diastolic INTEGER DEFAULT 90,
    bp_threshold_low_systolic INTEGER DEFAULT 90,
    bp_threshold_low_diastolic INTEGER DEFAULT 60,
    dark_mode TEXT DEFAULT 'system',
    cloud_sync_enabled INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * SQL สำหรับสร้างตาราง migrations
 * ติดตาม migration versions
 */
export const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    executed_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * SQL สำหรับสร้าง indexes เพื่อเพิ่มประสิทธิภาพการ query
 */
export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_bp_records_measured_at ON bp_records(measured_at);
  CREATE INDEX IF NOT EXISTS idx_medication_reminders_time ON medication_reminders(time);
  CREATE INDEX IF NOT EXISTS idx_measurement_reminders_time ON measurement_reminders(time);
`;

/**
 * SQL สำหรับเพิ่มค่า default ใน user_profile และ app_settings
 */
export const INSERT_DEFAULT_PROFILE = `
  INSERT OR IGNORE INTO user_profile (id, name) VALUES (1, '');
`;

export const INSERT_DEFAULT_SETTINGS = `
  INSERT OR IGNORE INTO app_settings (id) VALUES (1);
`;

/**
 * รวม SQL ทั้งหมดสำหรับ initial setup
 */
export const INITIAL_SETUP_QUERIES = [
  CREATE_BP_RECORDS_TABLE,
  CREATE_MEDICATION_REMINDERS_TABLE,
  CREATE_MEASUREMENT_REMINDERS_TABLE,
  CREATE_USER_PROFILE_TABLE,
  CREATE_APP_SETTINGS_TABLE,
  CREATE_MIGRATIONS_TABLE,
  CREATE_INDEXES,
  INSERT_DEFAULT_PROFILE,
  INSERT_DEFAULT_SETTINGS,
];

/**
 * Migration definitions สำหรับ database upgrades ในอนาคต
 * เพิ่ม migration ใหม่โดยเพิ่ม version และ sql statements
 */
export const MIGRATIONS: { version: number; name: string; sql: string[] }[] = [
  // Version 1: Initial schema (เริ่มต้น)
  {
    version: 1,
    name: 'initial_schema',
    sql: INITIAL_SETUP_QUERIES,
  },
  // ตัวอย่าง migration ในอนาคต:
  // {
  //   version: 2,
  //   name: 'add_blood_type_column',
  //   sql: ['ALTER TABLE user_profile ADD COLUMN blood_type TEXT;'],
  // },
];
