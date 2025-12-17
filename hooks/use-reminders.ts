/**
 * useReminders Hook
 * Custom hook สำหรับจัดการ Medication และ Measurement reminders
 */

import {
    createMeasurementReminder,
    createMedicationReminder,
    deleteMeasurementReminder,
    deleteMedicationReminder,
    getMeasurementReminders,
    getMedicationReminders,
    updateMeasurementReminder,
    updateMedicationReminder,
} from '@/database';
import {
    cancelNotification,
    scheduleMeasurementReminder,
    scheduleMedicationReminder,
} from '@/services/notification';
import {
    MeasurementReminder,
    MeasurementReminderInput,
    MedicationReminder,
    MedicationReminderInput,
} from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseRemindersReturn {
  // Medication Reminders
  medicationReminders: MedicationReminder[];
  isMedicationLoading: boolean;
  medicationError: string | null;
  fetchMedicationReminders: () => Promise<void>;
  addMedicationReminder: (input: MedicationReminderInput) => Promise<boolean>;
  editMedicationReminder: (id: number, input: Partial<MedicationReminderInput>) => Promise<boolean>;
  removeMedicationReminder: (id: number) => Promise<boolean>;
  toggleMedicationReminder: (id: number, enabled: boolean) => Promise<boolean>;

  // Measurement Reminders
  measurementReminders: MeasurementReminder[];
  isMeasurementLoading: boolean;
  measurementError: string | null;
  fetchMeasurementReminders: () => Promise<void>;
  addMeasurementReminder: (input: MeasurementReminderInput) => Promise<boolean>;
  editMeasurementReminder: (id: number, input: Partial<MeasurementReminderInput>) => Promise<boolean>;
  removeMeasurementReminder: (id: number) => Promise<boolean>;
  toggleMeasurementReminder: (id: number, enabled: boolean) => Promise<boolean>;

  // Common
  refresh: () => Promise<void>;
}

export function useReminders(): UseRemindersReturn {
  // Medication state
  const [medicationReminders, setMedicationReminders] = useState<MedicationReminder[]>([]);
  const [isMedicationLoading, setIsMedicationLoading] = useState(false);
  const [medicationError, setMedicationError] = useState<string | null>(null);

  // Measurement state
  const [measurementReminders, setMeasurementReminders] = useState<MeasurementReminder[]>([]);
  const [isMeasurementLoading, setIsMeasurementLoading] = useState(false);
  const [measurementError, setMeasurementError] = useState<string | null>(null);

  // ==========================================
  // Medication Reminders
  // ==========================================

  const fetchMedicationReminders = useCallback(async () => {
    setIsMedicationLoading(true);
    setMedicationError(null);
    try {
      const result = await getMedicationReminders();
      if (result.success && result.data) {
        setMedicationReminders(result.data);
      } else {
        setMedicationError(result.error ?? 'Failed to fetch medication reminders');
      }
    } catch (err) {
      setMedicationError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsMedicationLoading(false);
    }
  }, []);

  const addMedicationReminder = useCallback(
    async (input: MedicationReminderInput): Promise<boolean> => {
      try {
        const result = await createMedicationReminder(input);
        if (result.success && result.data) {
          // Schedule notification if enabled
          if (input.is_enabled) {
            const reminder: MedicationReminder = {
              id: result.data.id,
              ...input,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            const notificationId = await scheduleMedicationReminder(reminder);
            if (notificationId) {
              await updateMedicationReminder(result.data.id, { notification_id: notificationId });
            }
          }
          await fetchMedicationReminders();
          return true;
        }
        setMedicationError(result.error ?? 'Failed to add reminder');
        return false;
      } catch (err) {
        setMedicationError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchMedicationReminders]
  );

  const editMedicationReminder = useCallback(
    async (id: number, input: Partial<MedicationReminderInput>): Promise<boolean> => {
      try {
        const result = await updateMedicationReminder(id, input);
        if (result.success) {
          // Reschedule notification if time or days changed
          const current = medicationReminders.find((r) => r.id === id);
          if (current && (input.time || input.days_of_week)) {
            if (current.notification_id) {
              await cancelNotification(current.notification_id);
            }
            if (current.is_enabled) {
              const updated = { ...current, ...input };
              const notificationId = await scheduleMedicationReminder(updated as MedicationReminder);
              if (notificationId) {
                await updateMedicationReminder(id, { notification_id: notificationId });
              }
            }
          }
          await fetchMedicationReminders();
          return true;
        }
        return false;
      } catch (err) {
        setMedicationError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchMedicationReminders, medicationReminders]
  );

  const removeMedicationReminder = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const current = medicationReminders.find((r) => r.id === id);
        if (current?.notification_id) {
          await cancelNotification(current.notification_id);
        }

        const result = await deleteMedicationReminder(id);
        if (result.success) {
          await fetchMedicationReminders();
          return true;
        }
        return false;
      } catch (err) {
        setMedicationError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchMedicationReminders, medicationReminders]
  );

  const toggleMedicationReminder = useCallback(
    async (id: number, enabled: boolean): Promise<boolean> => {
      try {
        const current = medicationReminders.find((r) => r.id === id);
        if (!current) return false;

        // Cancel existing notification
        if (current.notification_id) {
          await cancelNotification(current.notification_id);
        }

        let newNotificationId: string | undefined;

        // Schedule new notification if enabled
        if (enabled) {
          const notificationId = await scheduleMedicationReminder(current);
          if (notificationId) {
            newNotificationId = notificationId;
          }
        }

        // Update database
        await updateMedicationReminder(id, {
          is_enabled: enabled,
          notification_id: newNotificationId,
        });

        await fetchMedicationReminders();
        return true;
      } catch (err) {
        setMedicationError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchMedicationReminders, medicationReminders]
  );

  // ==========================================
  // Measurement Reminders
  // ==========================================

  const fetchMeasurementReminders = useCallback(async () => {
    setIsMeasurementLoading(true);
    setMeasurementError(null);
    try {
      const result = await getMeasurementReminders();
      if (result.success && result.data) {
        setMeasurementReminders(result.data);
      } else {
        setMeasurementError(result.error ?? 'Failed to fetch measurement reminders');
      }
    } catch (err) {
      setMeasurementError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsMeasurementLoading(false);
    }
  }, []);

  const addMeasurementReminder = useCallback(
    async (input: MeasurementReminderInput): Promise<boolean> => {
      try {
        const result = await createMeasurementReminder(input);
        if (result.success && result.data) {
          if (input.is_enabled) {
            const reminder: MeasurementReminder = {
              id: result.data.id,
              ...input,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            const notificationId = await scheduleMeasurementReminder(reminder);
            if (notificationId) {
              await updateMeasurementReminder(result.data.id, { notification_id: notificationId });
            }
          }
          await fetchMeasurementReminders();
          return true;
        }
        setMeasurementError(result.error ?? 'Failed to add reminder');
        return false;
      } catch (err) {
        setMeasurementError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchMeasurementReminders]
  );

  const editMeasurementReminder = useCallback(
    async (id: number, input: Partial<MeasurementReminderInput>): Promise<boolean> => {
      try {
        const result = await updateMeasurementReminder(id, input);
        if (result.success) {
          const current = measurementReminders.find((r) => r.id === id);
          if (current && (input.time || input.days_of_week)) {
            if (current.notification_id) {
              await cancelNotification(current.notification_id);
            }
            if (current.is_enabled) {
              const updated = { ...current, ...input };
              const notificationId = await scheduleMeasurementReminder(updated as MeasurementReminder);
              if (notificationId) {
                await updateMeasurementReminder(id, { notification_id: notificationId });
              }
            }
          }
          await fetchMeasurementReminders();
          return true;
        }
        return false;
      } catch (err) {
        setMeasurementError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchMeasurementReminders, measurementReminders]
  );

  const removeMeasurementReminder = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const current = measurementReminders.find((r) => r.id === id);
        if (current?.notification_id) {
          await cancelNotification(current.notification_id);
        }

        const result = await deleteMeasurementReminder(id);
        if (result.success) {
          await fetchMeasurementReminders();
          return true;
        }
        return false;
      } catch (err) {
        setMeasurementError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchMeasurementReminders, measurementReminders]
  );

  const toggleMeasurementReminder = useCallback(
    async (id: number, enabled: boolean): Promise<boolean> => {
      try {
        const current = measurementReminders.find((r) => r.id === id);
        if (!current) return false;

        if (current.notification_id) {
          await cancelNotification(current.notification_id);
        }

        let newNotificationId: string | undefined;

        if (enabled) {
          const notificationId = await scheduleMeasurementReminder(current);
          if (notificationId) {
            newNotificationId = notificationId;
          }
        }

        await updateMeasurementReminder(id, {
          is_enabled: enabled,
          notification_id: newNotificationId,
        });

        await fetchMeasurementReminders();
        return true;
      } catch (err) {
        setMeasurementError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [fetchMeasurementReminders, measurementReminders]
  );

  // Refresh all
  const refresh = useCallback(async () => {
    await Promise.all([fetchMedicationReminders(), fetchMeasurementReminders()]);
  }, [fetchMedicationReminders, fetchMeasurementReminders]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchMedicationReminders();
    fetchMeasurementReminders();
  }, []);

  return {
    // Medication
    medicationReminders,
    isMedicationLoading,
    medicationError,
    fetchMedicationReminders,
    addMedicationReminder,
    editMedicationReminder,
    removeMedicationReminder,
    toggleMedicationReminder,

    // Measurement
    measurementReminders,
    isMeasurementLoading,
    measurementError,
    fetchMeasurementReminders,
    addMeasurementReminder,
    editMeasurementReminder,
    removeMeasurementReminder,
    toggleMeasurementReminder,

    // Common
    refresh,
  };
}
