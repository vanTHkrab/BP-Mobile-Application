/**
 * Reminders Service
 * จัดการ CRUD operations สำหรับการแจ้งเตือนทานยาและวัดความดัน
 */

import {
    MeasurementReminder,
    MeasurementReminderInput,
    MedicationReminder,
    MedicationReminderInput,
    QueryResult,
} from '@/types';
import { getDatabase } from './connection';

// ===========================================
// Medication Reminders
// ===========================================

/**
 * สร้างแจ้งเตือนทานยาใหม่
 */
export async function createMedicationReminder(
  input: MedicationReminderInput
): Promise<QueryResult<{ id: number }>> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = await db.runAsync(
      `INSERT INTO medication_reminders (medication_name, dosage, time, days_of_week, is_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.medication_name,
        input.dosage ?? null,
        input.time,
        input.days_of_week,
        input.is_enabled ? 1 : 0,
        now,
        now,
      ]
    );

    return {
      success: true,
      data: { id: result.lastInsertRowId },
    };
  } catch (error) {
    console.error('[RemindersService] Create medication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึงแจ้งเตือนทานยาทั้งหมด
 */
export async function getMedicationReminders(): Promise<
  QueryResult<MedicationReminder[]>
> {
  try {
    const db = await getDatabase();
    const reminders = await db.getAllAsync<MedicationReminder>(
      `SELECT id, medication_name, dosage, time, days_of_week, 
              is_enabled = 1 as is_enabled, notification_id, created_at, updated_at
       FROM medication_reminders ORDER BY time ASC`
    );

    // Convert is_enabled จาก 0/1 เป็น boolean
    const processedReminders = reminders.map((r) => ({
      ...r,
      is_enabled: Boolean(r.is_enabled),
    }));

    return { success: true, data: processedReminders };
  } catch (error) {
    console.error('[RemindersService] Get medication reminders error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึงแจ้งเตือนทานยาที่เปิดใช้งาน
 */
export async function getEnabledMedicationReminders(): Promise<
  QueryResult<MedicationReminder[]>
> {
  try {
    const db = await getDatabase();
    const reminders = await db.getAllAsync<MedicationReminder>(
      `SELECT * FROM medication_reminders WHERE is_enabled = 1 ORDER BY time ASC`
    );

    const processedReminders = reminders.map((r) => ({
      ...r,
      is_enabled: true,
    }));

    return { success: true, data: processedReminders };
  } catch (error) {
    console.error('[RemindersService] Get enabled medication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * แก้ไขแจ้งเตือนทานยา
 */
export async function updateMedicationReminder(
  id: number,
  input: Partial<MedicationReminderInput> & { notification_id?: string }
): Promise<QueryResult<void>> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (input.medication_name !== undefined) {
      updates.push('medication_name = ?');
      params.push(input.medication_name);
    }
    if (input.dosage !== undefined) {
      updates.push('dosage = ?');
      params.push(input.dosage);
    }
    if (input.time !== undefined) {
      updates.push('time = ?');
      params.push(input.time);
    }
    if (input.days_of_week !== undefined) {
      updates.push('days_of_week = ?');
      params.push(input.days_of_week);
    }
    if (input.is_enabled !== undefined) {
      updates.push('is_enabled = ?');
      params.push(input.is_enabled ? 1 : 0);
    }
    if (input.notification_id !== undefined) {
      updates.push('notification_id = ?');
      params.push(input.notification_id);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const query = `UPDATE medication_reminders SET ${updates.join(', ')} WHERE id = ?`;
    await db.runAsync(query, params);

    return { success: true };
  } catch (error) {
    console.error('[RemindersService] Update medication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ลบแจ้งเตือนทานยา
 */
export async function deleteMedicationReminder(
  id: number
): Promise<QueryResult<void>> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM medication_reminders WHERE id = ?', [id]);

    return { success: true };
  } catch (error) {
    console.error('[RemindersService] Delete medication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ===========================================
// Measurement Reminders
// ===========================================

/**
 * สร้างแจ้งเตือนวัดความดันใหม่
 */
export async function createMeasurementReminder(
  input: MeasurementReminderInput
): Promise<QueryResult<{ id: number }>> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = await db.runAsync(
      `INSERT INTO measurement_reminders (name, time, days_of_week, is_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.time,
        input.days_of_week,
        input.is_enabled ? 1 : 0,
        now,
        now,
      ]
    );

    return {
      success: true,
      data: { id: result.lastInsertRowId },
    };
  } catch (error) {
    console.error('[RemindersService] Create measurement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึงแจ้งเตือนวัดความดันทั้งหมด
 */
export async function getMeasurementReminders(): Promise<
  QueryResult<MeasurementReminder[]>
> {
  try {
    const db = await getDatabase();
    const reminders = await db.getAllAsync<MeasurementReminder>(
      `SELECT * FROM measurement_reminders ORDER BY time ASC`
    );

    const processedReminders = reminders.map((r) => ({
      ...r,
      is_enabled: Boolean(r.is_enabled),
    }));

    return { success: true, data: processedReminders };
  } catch (error) {
    console.error('[RemindersService] Get measurement reminders error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึงแจ้งเตือนวัดความดันที่เปิดใช้งาน
 */
export async function getEnabledMeasurementReminders(): Promise<
  QueryResult<MeasurementReminder[]>
> {
  try {
    const db = await getDatabase();
    const reminders = await db.getAllAsync<MeasurementReminder>(
      `SELECT * FROM measurement_reminders WHERE is_enabled = 1 ORDER BY time ASC`
    );

    const processedReminders = reminders.map((r) => ({
      ...r,
      is_enabled: true,
    }));

    return { success: true, data: processedReminders };
  } catch (error) {
    console.error('[RemindersService] Get enabled measurement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * แก้ไขแจ้งเตือนวัดความดัน
 */
export async function updateMeasurementReminder(
  id: number,
  input: Partial<MeasurementReminderInput> & { notification_id?: string }
): Promise<QueryResult<void>> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name);
    }
    if (input.time !== undefined) {
      updates.push('time = ?');
      params.push(input.time);
    }
    if (input.days_of_week !== undefined) {
      updates.push('days_of_week = ?');
      params.push(input.days_of_week);
    }
    if (input.is_enabled !== undefined) {
      updates.push('is_enabled = ?');
      params.push(input.is_enabled ? 1 : 0);
    }
    if (input.notification_id !== undefined) {
      updates.push('notification_id = ?');
      params.push(input.notification_id);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const query = `UPDATE measurement_reminders SET ${updates.join(', ')} WHERE id = ?`;
    await db.runAsync(query, params);

    return { success: true };
  } catch (error) {
    console.error('[RemindersService] Update measurement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ลบแจ้งเตือนวัดความดัน
 */
export async function deleteMeasurementReminder(
  id: number
): Promise<QueryResult<void>> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM measurement_reminders WHERE id = ?', [id]);

    return { success: true };
  } catch (error) {
    console.error('[RemindersService] Delete measurement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
