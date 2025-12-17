/**
 * Settings & Profile Service
 * จัดการ User Profile และ App Settings
 */

import {
    AppSettings,
    AppSettingsInput,
    BPThreshold,
    QueryResult,
    UserProfile,
    UserProfileInput,
} from '@/types';
import { getDatabase } from './connection';

// ===========================================
// User Profile
// ===========================================

/**
 * ดึงข้อมูล User Profile
 */
export async function getUserProfile(): Promise<QueryResult<UserProfile>> {
  try {
    const db = await getDatabase();
    const profile = await db.getFirstAsync<UserProfile>(
      'SELECT * FROM user_profile WHERE id = 1'
    );

    if (!profile) {
      // สร้าง default profile ถ้ายังไม่มี
      await db.runAsync('INSERT OR IGNORE INTO user_profile (id, name) VALUES (1, "")');
      const newProfile = await db.getFirstAsync<UserProfile>(
        'SELECT * FROM user_profile WHERE id = 1'
      );
      return { success: true, data: newProfile! };
    }

    return { success: true, data: profile };
  } catch (error) {
    console.error('[SettingsService] Get profile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * บันทึก/อัพเดท User Profile
 */
export async function updateUserProfile(
  input: UserProfileInput
): Promise<QueryResult<void>> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE user_profile 
       SET name = ?, age = ?, gender = ?, medical_conditions = ?, updated_at = ?
       WHERE id = 1`,
      [
        input.name,
        input.age ?? null,
        input.gender ?? null,
        input.medical_conditions ?? null,
        now,
      ]
    );

    return { success: true };
  } catch (error) {
    console.error('[SettingsService] Update profile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ===========================================
// App Settings
// ===========================================

/**
 * แปลง database row เป็น AppSettings object
 */
interface AppSettingsRow {
  id: number;
  pressure_unit: 'mmHg';
  notifications_enabled: number;
  abnormal_alert_enabled: number;
  bp_threshold_high_systolic: number;
  bp_threshold_high_diastolic: number;
  bp_threshold_low_systolic: number;
  bp_threshold_low_diastolic: number;
  dark_mode: 'system' | 'light' | 'dark';
  cloud_sync_enabled: number;
  created_at: string;
  updated_at: string;
}

function rowToAppSettings(row: AppSettingsRow): AppSettings {
  return {
    id: row.id,
    pressure_unit: row.pressure_unit,
    notifications_enabled: Boolean(row.notifications_enabled),
    abnormal_alert_enabled: Boolean(row.abnormal_alert_enabled),
    bp_threshold: {
      high_systolic: row.bp_threshold_high_systolic,
      high_diastolic: row.bp_threshold_high_diastolic,
      low_systolic: row.bp_threshold_low_systolic,
      low_diastolic: row.bp_threshold_low_diastolic,
    },
    dark_mode: row.dark_mode,
    cloud_sync_enabled: Boolean(row.cloud_sync_enabled),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * ดึงการตั้งค่าแอป
 */
export async function getAppSettings(): Promise<QueryResult<AppSettings>> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<AppSettingsRow>(
      'SELECT * FROM app_settings WHERE id = 1'
    );

    if (!row) {
      // สร้าง default settings ถ้ายังไม่มี
      await db.runAsync('INSERT OR IGNORE INTO app_settings (id) VALUES (1)');
      const newRow = await db.getFirstAsync<AppSettingsRow>(
        'SELECT * FROM app_settings WHERE id = 1'
      );
      return { success: true, data: rowToAppSettings(newRow!) };
    }

    return { success: true, data: rowToAppSettings(row) };
  } catch (error) {
    console.error('[SettingsService] Get settings error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * อัพเดทการตั้งค่าแอป
 */
export async function updateAppSettings(
  input: AppSettingsInput
): Promise<QueryResult<void>> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (input.pressure_unit !== undefined) {
      updates.push('pressure_unit = ?');
      params.push(input.pressure_unit);
    }
    if (input.notifications_enabled !== undefined) {
      updates.push('notifications_enabled = ?');
      params.push(input.notifications_enabled ? 1 : 0);
    }
    if (input.abnormal_alert_enabled !== undefined) {
      updates.push('abnormal_alert_enabled = ?');
      params.push(input.abnormal_alert_enabled ? 1 : 0);
    }
    if (input.bp_threshold !== undefined) {
      updates.push('bp_threshold_high_systolic = ?');
      params.push(input.bp_threshold.high_systolic);
      updates.push('bp_threshold_high_diastolic = ?');
      params.push(input.bp_threshold.high_diastolic);
      updates.push('bp_threshold_low_systolic = ?');
      params.push(input.bp_threshold.low_systolic);
      updates.push('bp_threshold_low_diastolic = ?');
      params.push(input.bp_threshold.low_diastolic);
    }
    if (input.dark_mode !== undefined) {
      updates.push('dark_mode = ?');
      params.push(input.dark_mode);
    }
    if (input.cloud_sync_enabled !== undefined) {
      updates.push('cloud_sync_enabled = ?');
      params.push(input.cloud_sync_enabled ? 1 : 0);
    }

    updates.push('updated_at = ?');
    params.push(now);

    const query = `UPDATE app_settings SET ${updates.join(', ')} WHERE id = 1`;
    await db.runAsync(query, params);

    return { success: true };
  } catch (error) {
    console.error('[SettingsService] Update settings error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึง BP Threshold settings
 */
export async function getBPThreshold(): Promise<QueryResult<BPThreshold>> {
  try {
    const settingsResult = await getAppSettings();
    if (!settingsResult.success || !settingsResult.data) {
      return { success: false, error: 'Failed to get settings' };
    }

    return { success: true, data: settingsResult.data.bp_threshold };
  } catch (error) {
    console.error('[SettingsService] Get threshold error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * อัพเดท BP Threshold settings
 */
export async function updateBPThreshold(
  threshold: BPThreshold
): Promise<QueryResult<void>> {
  return updateAppSettings({ bp_threshold: threshold });
}
