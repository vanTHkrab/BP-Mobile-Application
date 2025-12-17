/**
 * BP Records Service
 * จัดการ CRUD operations สำหรับบันทึกความดันโลหิต
 */

import {
    BPRecord,
    BPRecordFilter,
    BPRecordInput,
    BPStatistics,
    DateRangePreset,
    QueryResult,
} from '@/types';
import { getDateRangeFromPreset } from '@/utils/date';
import { getDatabase } from './connection';

/**
 * สร้างบันทึกความดันโลหิตใหม่
 * @param input ข้อมูลความดันโลหิต
 * @returns QueryResult พร้อม id ของ record ที่สร้าง
 */
export async function createBPRecord(
  input: BPRecordInput
): Promise<QueryResult<{ id: number }>> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = await db.runAsync(
      `INSERT INTO bp_records (systolic, diastolic, pulse, measured_at, note, image_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.systolic,
        input.diastolic,
        input.pulse,
        input.measured_at,
        input.note ?? null,
        input.image_path ?? null,
        now,
        now,
      ]
    );

    return {
      success: true,
      data: { id: result.lastInsertRowId },
    };
  } catch (error) {
    console.error('[BPService] Create error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึงข้อมูล BP record ตาม id
 * @param id ID ของ record
 */
export async function getBPRecordById(
  id: number
): Promise<QueryResult<BPRecord>> {
  try {
    const db = await getDatabase();
    const record = await db.getFirstAsync<BPRecord>(
      'SELECT * FROM bp_records WHERE id = ?',
      [id]
    );

    if (!record) {
      return { success: false, error: 'Record not found' };
    }

    return { success: true, data: record };
  } catch (error) {
    console.error('[BPService] Get by ID error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึงข้อมูล BP records ทั้งหมด พร้อม filter
 * @param filter ตัวกรอง (optional)
 */
export async function getBPRecords(
  filter?: BPRecordFilter
): Promise<QueryResult<BPRecord[]>> {
  try {
    const db = await getDatabase();

    let query = 'SELECT * FROM bp_records WHERE 1=1';
    const params: (string | number | null)[] = [];

    // Filter ตามช่วงเวลา
    if (filter?.preset && filter.preset !== DateRangePreset.ALL) {
      const dateRange = getDateRangeFromPreset(filter.preset);
      if (dateRange) {
        query += ' AND measured_at >= ? AND measured_at <= ?';
        params.push(dateRange.start_date, dateRange.end_date);
      }
    } else if (filter?.date_range) {
      query += ' AND measured_at >= ? AND measured_at <= ?';
      params.push(filter.date_range.start_date, filter.date_range.end_date);
    }

    // เรียงตามวันที่ล่าสุดก่อน
    query += ' ORDER BY measured_at DESC';

    // Pagination
    if (filter?.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
    }
    if (filter?.offset) {
      query += ' OFFSET ?';
      params.push(filter.offset);
    }

    const records = await db.getAllAsync<BPRecord>(query, params);

    return { success: true, data: records };
  } catch (error) {
    console.error('[BPService] Get all error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึง BP record ล่าสุด
 */
export async function getLatestBPRecord(): Promise<QueryResult<BPRecord>> {
  try {
    const db = await getDatabase();
    const record = await db.getFirstAsync<BPRecord>(
      'SELECT * FROM bp_records ORDER BY measured_at DESC LIMIT 1'
    );

    if (!record) {
      return { success: false, error: 'No records found' };
    }

    return { success: true, data: record };
  } catch (error) {
    console.error('[BPService] Get latest error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * แก้ไขข้อมูล BP record
 * @param id ID ของ record
 * @param input ข้อมูลที่ต้องการแก้ไข
 */
export async function updateBPRecord(
  id: number,
  input: Partial<BPRecordInput>
): Promise<QueryResult<void>> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // สร้าง dynamic UPDATE query
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (input.systolic !== undefined) {
      updates.push('systolic = ?');
      params.push(input.systolic);
    }
    if (input.diastolic !== undefined) {
      updates.push('diastolic = ?');
      params.push(input.diastolic);
    }
    if (input.pulse !== undefined) {
      updates.push('pulse = ?');
      params.push(input.pulse);
    }
    if (input.measured_at !== undefined) {
      updates.push('measured_at = ?');
      params.push(input.measured_at);
    }
    if (input.note !== undefined) {
      updates.push('note = ?');
      params.push(input.note);
    }
    if (input.image_path !== undefined) {
      updates.push('image_path = ?');
      params.push(input.image_path);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const query = `UPDATE bp_records SET ${updates.join(', ')} WHERE id = ?`;
    await db.runAsync(query, params);

    return { success: true };
  } catch (error) {
    console.error('[BPService] Update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ลบ BP record
 * @param id ID ของ record
 */
export async function deleteBPRecord(id: number): Promise<QueryResult<void>> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM bp_records WHERE id = ?', [id]);

    return { success: true };
  } catch (error) {
    console.error('[BPService] Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * คำนวณสถิติความดันโลหิต
 * @param filter ตัวกรองช่วงเวลา (optional)
 */
export async function getBPStatistics(
  filter?: BPRecordFilter
): Promise<QueryResult<BPStatistics>> {
  try {
    const db = await getDatabase();

    let query = `
      SELECT 
        COUNT(*) as total_records,
        AVG(systolic) as avg_systolic,
        AVG(diastolic) as avg_diastolic,
        AVG(pulse) as avg_pulse,
        MAX(systolic) as max_systolic,
        MIN(systolic) as min_systolic,
        MAX(diastolic) as max_diastolic,
        MIN(diastolic) as min_diastolic,
        MAX(pulse) as max_pulse,
        MIN(pulse) as min_pulse,
        SUM(CASE WHEN systolic < 120 AND diastolic < 80 THEN 1 ELSE 0 END) as normal_count,
        SUM(CASE WHEN systolic >= 120 AND systolic < 130 AND diastolic < 80 THEN 1 ELSE 0 END) as elevated_count,
        SUM(CASE WHEN systolic >= 130 OR diastolic >= 80 THEN 1 ELSE 0 END) as hypertension_count
      FROM bp_records
      WHERE 1=1
    `;
    const params: (string | number | null)[] = [];

    // Filter ตามช่วงเวลา
    if (filter?.preset && filter.preset !== DateRangePreset.ALL) {
      const dateRange = getDateRangeFromPreset(filter.preset);
      if (dateRange) {
        query += ' AND measured_at >= ? AND measured_at <= ?';
        params.push(dateRange.start_date, dateRange.end_date);
      }
    } else if (filter?.date_range) {
      query += ' AND measured_at >= ? AND measured_at <= ?';
      params.push(filter.date_range.start_date, filter.date_range.end_date);
    }

    const result = await db.getFirstAsync<BPStatistics>(query, params);

    if (!result) {
      return { success: false, error: 'Failed to calculate statistics' };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('[BPService] Statistics error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ดึงข้อมูลสำหรับแสดงกราฟ
 * @param filter ตัวกรอง
 */
export async function getChartData(
  filter?: BPRecordFilter
): Promise<QueryResult<BPRecord[]>> {
  // ใช้ getBPRecords และเรียงตามวันที่จากเก่าไปใหม่สำหรับกราฟ
  const result = await getBPRecords(filter);

  if (result.success && result.data) {
    // Reverse เพื่อเรียงจากเก่าไปใหม่สำหรับกราฟ
    result.data = result.data.reverse();
  }

  return result;
}
