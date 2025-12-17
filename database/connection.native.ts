/**
 * Database Connection & Initialization
 * จัดการการเชื่อมต่อและ initialize database
 */

import { Platform } from 'react-native';
import { DATABASE_NAME, MIGRATIONS } from './schema';

// Dynamic import for SQLite (not supported on web)
let SQLite: typeof import('expo-sqlite') | null = null;

// Singleton database instance
let dbInstance: import('expo-sqlite').SQLiteDatabase | null = null;

// Check if we're on a native platform
const isNative = Platform.OS !== 'web';

/**
 * Load SQLite module (only on native platforms)
 */
async function loadSQLite(): Promise<typeof import('expo-sqlite')> {
  if (!SQLite) {
    if (!isNative) {
      throw new Error('SQLite is not supported on web platform');
    }
    SQLite = await import('expo-sqlite');
  }
  return SQLite;
}

/**
 * เปิด/สร้าง database connection
 * ใช้ singleton pattern เพื่อใช้ connection เดียวตลอด app lifecycle
 */
export async function getDatabase(): Promise<import('expo-sqlite').SQLiteDatabase> {
  if (!isNative) {
    throw new Error('Database is not available on web platform');
  }
  
  if (!dbInstance) {
    const sqlite = await loadSQLite();
    dbInstance = await sqlite.openDatabaseAsync(DATABASE_NAME);
    // เปิด WAL mode สำหรับ performance ที่ดีขึ้น
    await dbInstance.execAsync('PRAGMA journal_mode = WAL;');
  }
  return dbInstance;
}

/**
 * ปิด database connection
 * เรียกเมื่อ app ปิด หรือต้องการ clean up
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

/**
 * เรียก migration version ปัจจุบันจาก database
 */
async function getCurrentVersion(db: import('expo-sqlite').SQLiteDatabase): Promise<number> {
  try {
    // ตรวจสอบว่า migrations table มีอยู่หรือไม่
    const tableExists = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations';"
    );
    
    if (!tableExists) {
      return 0;
    }
    
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM migrations;'
    );
    
    return result?.version ?? 0;
  } catch {
    return 0;
  }
}

/**
 * บันทึก migration version ที่ทำเสร็จแล้ว
 */
async function recordMigration(
  db: import('expo-sqlite').SQLiteDatabase,
  version: number,
  name: string
): Promise<void> {
  await db.runAsync(
    'INSERT INTO migrations (version, name) VALUES (?, ?);',
    [version, name]
  );
}

/**
 * Initialize database และรัน migrations
 * เรียกครั้งเดียวตอน app start
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();
  const currentVersion = await getCurrentVersion(db);
  
  console.log(`[DB] Current database version: ${currentVersion}`);
  
  // รัน migrations ที่ยังไม่ได้ทำ
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(`[DB] Running migration ${migration.version}: ${migration.name}`);
      
      try {
        // รัน SQL statements ทั้งหมดใน migration
        for (const sql of migration.sql) {
          await db.execAsync(sql);
        }
        
        // บันทึกว่า migration นี้เสร็จแล้ว
        await recordMigration(db, migration.version, migration.name);
        
        console.log(`[DB] Migration ${migration.version} completed`);
      } catch (error) {
        console.error(`[DB] Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }
  
  console.log('[DB] Database initialization complete');
}

/**
 * Reset database (ลบข้อมูลทั้งหมด)
 * ใช้สำหรับ development/testing เท่านั้น
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  
  // ลบ tables ทั้งหมด
  await db.execAsync(`
    DROP TABLE IF EXISTS bp_records;
    DROP TABLE IF EXISTS medication_reminders;
    DROP TABLE IF EXISTS measurement_reminders;
    DROP TABLE IF EXISTS user_profile;
    DROP TABLE IF EXISTS app_settings;
    DROP TABLE IF EXISTS migrations;
  `);
  
  // Re-initialize
  await initializeDatabase();
  
  console.log('[DB] Database reset complete');
}

// Type alias for SQLite bind value
type SQLiteBindValue = string | number | null | boolean | Uint8Array;

/**
 * Execute raw SQL (สำหรับ advanced usage)
 */
export async function executeSQL(sql: string, params: SQLiteBindValue[] = []): Promise<import('expo-sqlite').SQLiteRunResult> {
  const db = await getDatabase();
  return db.runAsync(sql, params);
}

/**
 * Query raw SQL (สำหรับ advanced usage)
 */
export async function querySQL<T>(sql: string, params: SQLiteBindValue[] = []): Promise<T[]> {
  const db = await getDatabase();
  return db.getAllAsync<T>(sql, params);
}

/**
 * Get first result from query
 */
export async function queryFirst<T>(sql: string, params: SQLiteBindValue[] = []): Promise<T | null> {
  const db = await getDatabase();
  return db.getFirstAsync<T>(sql, params);
}
