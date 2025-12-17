/**
 * Notification Service
 * จัดการระบบแจ้งเตือนด้วย expo-notifications
 */

import {
    MeasurementReminder,
    MedicationReminder,
    NotificationPayload,
    NotificationType,
} from '@/types';
import { parseDaysOfWeek } from '@/utils/date';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 * ต้องเรียกก่อนใช้งาน notification
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notification] Permission not granted');
      return false;
    }

    // สำหรับ Android, ต้องสร้าง notification channel
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    return true;
  } catch (error) {
    console.error('[Notification] Permission error:', error);
    return false;
  }
}

/**
 * Setup Android notification channels
 */
async function setupAndroidChannels(): Promise<void> {
  await Notifications.setNotificationChannelAsync('medication', {
    name: 'แจ้งเตือนทานยา',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('measurement', {
    name: 'แจ้งเตือนวัดความดัน',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('alert', {
    name: 'แจ้งเตือนค่าผิดปกติ',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500],
    sound: 'default',
  });
}

/**
 * Schedule medication reminder notification
 */
export async function scheduleMedicationReminder(
  reminder: MedicationReminder
): Promise<string | null> {
  try {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const days = parseDaysOfWeek(reminder.days_of_week);

    // สร้าง notification สำหรับแต่ละวัน
    const identifiers: string[] = [];

    for (const day of days) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 ถึงเวลาทานยา',
          body: `${reminder.medication_name}${reminder.dosage ? ` (${reminder.dosage})` : ''}`,
          data: {
            type: NotificationType.MEDICATION,
            reminder_id: reminder.id,
          } as NotificationPayload,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1, // expo-notifications ใช้ 1-7 (Sunday = 1)
          hour: hours,
          minute: minutes,
        },
      });
      identifiers.push(identifier);
    }

    // เก็บ identifier แรกเป็น reference (หรือจะเก็บทั้งหมดก็ได้)
    return identifiers[0] ?? null;
  } catch (error) {
    console.error('[Notification] Schedule medication error:', error);
    return null;
  }
}

/**
 * Schedule measurement reminder notification
 */
export async function scheduleMeasurementReminder(
  reminder: MeasurementReminder
): Promise<string | null> {
  try {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const days = parseDaysOfWeek(reminder.days_of_week);

    const identifiers: string[] = [];

    for (const day of days) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🩺 ถึงเวลาวัดความดัน',
          body: reminder.name || 'อย่าลืมบันทึกค่าความดันวันนี้นะ',
          data: {
            type: NotificationType.MEASUREMENT,
            reminder_id: reminder.id,
          } as NotificationPayload,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1,
          hour: hours,
          minute: minutes,
        },
      });
      identifiers.push(identifier);
    }

    return identifiers[0] ?? null;
  } catch (error) {
    console.error('[Notification] Schedule measurement error:', error);
    return null;
  }
}

/**
 * Send immediate abnormal BP alert
 */
export async function sendAbnormalBPAlert(
  systolic: number,
  diastolic: number,
  recordId?: number
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ ค่าความดันผิดปกติ!',
        body: `ความดันโลหิต ${systolic}/${diastolic} mmHg อยู่ในระดับที่ควรระวัง กรุณาปรึกษาแพทย์`,
        data: {
          type: NotificationType.ABNORMAL_BP,
          record_id: recordId,
        } as NotificationPayload,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // ส่งทันที
    });
  } catch (error) {
    console.error('[Notification] Abnormal BP alert error:', error);
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('[Notification] Cancel error:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notification] Cancel all error:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notification] Get scheduled error:', error);
    return [];
  }
}

/**
 * Setup notification listeners
 * @returns cleanup function
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[Notification] Received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('[Notification] Response:', response);
      onNotificationResponse?.(response);
    }
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
