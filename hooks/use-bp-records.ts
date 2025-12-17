/**
 * useBPRecords Hook
 * Custom hook สำหรับจัดการ Blood Pressure records
 */

import {
    createBPRecord,
    deleteBPRecord,
    getAppSettings,
    getBPRecords,
    getBPStatistics,
    getLatestBPRecord,
    updateBPRecord,
} from '@/database';
import { sendAbnormalBPAlert } from '@/services/notification';
import {
    BPRecord,
    BPRecordFilter,
    BPRecordInput,
    BPStatistics
} from '@/types';
import { shouldAlert } from '@/utils/blood-pressure';
import { useCallback, useEffect, useState } from 'react';

interface UseBPRecordsReturn {
  records: BPRecord[];
  latestRecord: BPRecord | null;
  statistics: BPStatistics | null;
  isLoading: boolean;
  error: string | null;
  fetchRecords: (filter?: BPRecordFilter) => Promise<void>;
  fetchLatest: () => Promise<void>;
  fetchStatistics: (filter?: BPRecordFilter) => Promise<void>;
  addRecord: (input: BPRecordInput) => Promise<{ success: boolean; id?: number; error?: string }>;
  editRecord: (id: number, input: Partial<BPRecordInput>) => Promise<boolean>;
  removeRecord: (id: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Hook สำหรับจัดการ Blood Pressure records
 * @param initialFilter filter เริ่มต้น (optional)
 */
export function useBPRecords(initialFilter?: BPRecordFilter): UseBPRecordsReturn {
  const [records, setRecords] = useState<BPRecord[]>([]);
  const [latestRecord, setLatestRecord] = useState<BPRecord | null>(null);
  const [statistics, setStatistics] = useState<BPStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<BPRecordFilter | undefined>(
    initialFilter
  );

  /**
   * ดึงข้อมูล records
   */
  const fetchRecords = useCallback(async (filter?: BPRecordFilter) => {
    setIsLoading(true);
    setError(null);

    try {
      const filterToUse = filter ?? currentFilter;
      if (filter) {
        setCurrentFilter(filter);
      }

      const result = await getBPRecords(filterToUse);
      if (result.success && result.data) {
        setRecords(result.data);
      } else {
        setError(result.error ?? 'Failed to fetch records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [currentFilter]);

  /**
   * ดึง record ล่าสุด
   */
  const fetchLatest = useCallback(async () => {
    try {
      const result = await getLatestBPRecord();
      if (result.success && result.data) {
        setLatestRecord(result.data);
      }
    } catch (err) {
      console.error('[useBPRecords] Fetch latest error:', err);
    }
  }, []);

  /**
   * ดึงสถิติ
   */
  const fetchStatistics = useCallback(async (filter?: BPRecordFilter) => {
    try {
      const result = await getBPStatistics(filter);
      if (result.success && result.data) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('[useBPRecords] Fetch statistics error:', err);
    }
  }, []);

  /**
   * เพิ่ม record ใหม่
   */
  const addRecord = useCallback(
    async (input: BPRecordInput): Promise<{ success: boolean; id?: number; error?: string }> => {
      try {
        const result = await createBPRecord(input);

        if (result.success && result.data) {
          // Refresh records
          await fetchRecords();
          await fetchLatest();

          // ตรวจสอบค่าผิดปกติและส่ง notification
          const settingsResult = await getAppSettings();
          if (settingsResult.success && settingsResult.data?.abnormal_alert_enabled) {
            const threshold = settingsResult.data.bp_threshold;
            if (shouldAlert(input.systolic, input.diastolic, threshold)) {
              await sendAbnormalBPAlert(input.systolic, input.diastolic, result.data.id);
            }
          }

          return { success: true, id: result.data.id };
        }

        return { success: false, error: result.error };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: errorMsg };
      }
    },
    [fetchRecords, fetchLatest]
  );

  /**
   * แก้ไข record
   */
  const editRecord = useCallback(
    async (id: number, input: Partial<BPRecordInput>): Promise<boolean> => {
      try {
        const result = await updateBPRecord(id, input);
        if (result.success) {
          await fetchRecords();
          await fetchLatest();
          return true;
        }
        setError(result.error ?? 'Failed to update record');
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchRecords, fetchLatest]
  );

  /**
   * ลบ record
   */
  const removeRecord = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const result = await deleteBPRecord(id);
        if (result.success) {
          await fetchRecords();
          await fetchLatest();
          return true;
        }
        setError(result.error ?? 'Failed to delete record');
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchRecords, fetchLatest]
  );

  /**
   * Refresh ทุกอย่าง
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchRecords(),
      fetchLatest(),
      fetchStatistics(currentFilter),
    ]);
  }, [fetchRecords, fetchLatest, fetchStatistics, currentFilter]);

  // Auto-fetch เมื่อ mount
  useEffect(() => {
    fetchRecords();
    fetchLatest();
  }, []);

  return {
    records,
    latestRecord,
    statistics,
    isLoading,
    error,
    fetchRecords,
    fetchLatest,
    fetchStatistics,
    addRecord,
    editRecord,
    removeRecord,
    refresh,
  };
}
