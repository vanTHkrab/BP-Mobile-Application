/**
 * Database Connection - Web Version (Mock)
 * Mock database สำหรับ web platform พร้อม localStorage persistence
 */

import { BPRecord } from '@/types';

// Key for localStorage
const STORAGE_KEY = 'bp_app_mock_db';

// Helper: Load from localStorage
function loadFromStorage(): { bp_records: BPRecord[] } {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('[MockDB] Error loading from localStorage:', e);
    }
  }
  return { bp_records: [] };
}

// Helper: Save to localStorage
function saveToStorage(data: { bp_records: BPRecord[] }) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[MockDB] Error saving to localStorage:', e);
    }
  }
}

// Mock database storage (ใช้ memory + localStorage)
let mockStorage = loadFromStorage();

// Auto-increment ID
let nextId = mockStorage.bp_records.length > 0
  ? Math.max(...mockStorage.bp_records.map(r => r.id)) + 1
  : 1;

// Helper: Parse INSERT statement and extract values
function parseInsertAndExecute(sql: string, params: any[]): { lastInsertRowId: number; changes: number } {
  console.log('[MockDB] runAsync:', sql);
  console.log('[MockDB] params:', params);

  // Check if it's a BP record insert
  if (sql.toLowerCase().includes('insert into bp_records')) {
    const now = new Date().toISOString();
    const record: BPRecord = {
      id: nextId++,
      systolic: params[0] as number,
      diastolic: params[1] as number,
      pulse: params[2] as number,
      measured_at: params[3] as string,
      note: params[4] as string | undefined,
      image_path: params[5] as string | undefined,
      created_at: now,
      updated_at: now,
    };
    mockStorage.bp_records.push(record);
    saveToStorage(mockStorage);
    console.log('[MockDB] Inserted record:', record);
    return { lastInsertRowId: record.id, changes: 1 };
  }

  // Check if it's an UPDATE
  if (sql.toLowerCase().includes('update bp_records')) {
    // Simple update - find by id (last param)
    const id = params[params.length - 1] as number;
    const index = mockStorage.bp_records.findIndex(r => r.id === id);
    if (index !== -1) {
      mockStorage.bp_records[index] = {
        ...mockStorage.bp_records[index],
        systolic: params[0] as number,
        diastolic: params[1] as number,
        pulse: params[2] as number,
        measured_at: params[3] as string,
        note: params[4] as string | undefined,
        image_path: params[5] as string | undefined,
        updated_at: new Date().toISOString(),
      };
      saveToStorage(mockStorage);
      console.log('[MockDB] Updated record:', mockStorage.bp_records[index]);
      return { lastInsertRowId: id, changes: 1 };
    }
    return { lastInsertRowId: 0, changes: 0 };
  }

  // Check if it's a DELETE
  if (sql.toLowerCase().includes('delete from bp_records')) {
    const id = params[0] as number;
    const index = mockStorage.bp_records.findIndex(r => r.id === id);
    if (index !== -1) {
      mockStorage.bp_records.splice(index, 1);
      saveToStorage(mockStorage);
      console.log('[MockDB] Deleted record with id:', id);
      return { lastInsertRowId: 0, changes: 1 };
    }
    return { lastInsertRowId: 0, changes: 0 };
  }

  return { lastInsertRowId: 0, changes: 0 };
}

// Helper: Parse SELECT and return results
function parseSelectAndExecute<T>(sql: string, params: any[]): T[] {
  console.log('[MockDB] getAllAsync:', sql);
  console.log('[MockDB] params:', params);

  // Reload from storage to get latest
  mockStorage = loadFromStorage();

  // Get all records
  if (sql.toLowerCase().includes('select') && sql.toLowerCase().includes('from bp_records')) {
    let results = [...mockStorage.bp_records];

    // Apply WHERE id = ?
    if (sql.toLowerCase().includes('where id = ?')) {
      const id = params[0] as number;
      results = results.filter(r => r.id === id);
    }

    // Apply ORDER BY
    if (sql.toLowerCase().includes('order by measured_at desc')) {
      results.sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime());
    } else if (sql.toLowerCase().includes('order by measured_at asc')) {
      results.sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
    }

    // Apply LIMIT
    const limitMatch = sql.toLowerCase().match(/limit\s+(\d+)/);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      results = results.slice(0, limit);
    }

    // Apply OFFSET
    const offsetMatch = sql.toLowerCase().match(/offset\s+(\d+)/);
    if (offsetMatch) {
      const offset = parseInt(offsetMatch[1], 10);
      results = results.slice(offset);
    }

    console.log('[MockDB] Returning', results.length, 'records');
    return results as T[];
  }

  // Count query
  if (sql.toLowerCase().includes('count(*)')) {
    return [{ count: mockStorage.bp_records.length }] as T[];
  }

  return [] as T[];
}

// Mock SQLite database interface
const mockDatabase = {
  async execAsync(_sql: string): Promise<void> {
    console.log('[MockDB] execAsync called:', _sql);
  },
  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    return parseInsertAndExecute(sql, params);
  },
  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    return parseSelectAndExecute<T>(sql, params);
  },
  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const results = parseSelectAndExecute<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  },
  async closeAsync(): Promise<void> {
    console.log('[MockDB] closeAsync called');
  },
};

let dbInstance: typeof mockDatabase | null = null;

/**
 * เปิด/สร้าง mock database connection
 */
export async function getDatabase() {
  if (!dbInstance) {
    console.log('[MockDB] Creating mock database for web');
    dbInstance = mockDatabase;
  }
  return dbInstance;
}

/**
 * ปิด database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

/**
 * Initialize database (mock version)
 */
export async function initializeDatabase(): Promise<void> {
  console.log('[MockDB] Initializing mock database for web');
  await getDatabase();
  console.log('[MockDB] Mock database initialization complete');
}

/**
 * Reset database (mock version)
 */
export async function resetDatabase(): Promise<void> {
  mockStorage = { bp_records: [] };
  saveToStorage(mockStorage);
  nextId = 1;
  console.log('[MockDB] Database reset complete');
}

// Type alias for compatibility
type SQLiteBindValue = string | number | null | boolean | Uint8Array;

/**
 * Execute raw SQL (mock)
 */
export async function executeSQL(_sql: string, _params: SQLiteBindValue[] = []) {
  const db = await getDatabase();
  return db.runAsync(_sql, _params);
}

/**
 * Query raw SQL (mock)
 */
export async function querySQL<T>(_sql: string, _params: SQLiteBindValue[] = []): Promise<T[]> {
  const db = await getDatabase();
  return db.getAllAsync<T>(_sql, _params);
}

/**
 * Get first result from query (mock)
 */
export async function queryFirst<T>(_sql: string, _params: SQLiteBindValue[] = []): Promise<T | null> {
  const db = await getDatabase();
  return db.getFirstAsync<T>(_sql, _params);
}
