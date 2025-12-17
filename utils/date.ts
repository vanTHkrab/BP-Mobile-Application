/**
 * Date Utilities
 * Helper functions สำหรับจัดการวันที่และเวลา
 */

import { DateRange, DateRangePreset } from '@/types';

/**
 * แปลง DateRangePreset เป็น DateRange
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  switch (preset) {
    case DateRangePreset.LAST_7_DAYS: {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return {
        start_date: start.toISOString(),
        end_date: endOfToday.toISOString(),
      };
    }
    case DateRangePreset.LAST_30_DAYS: {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return {
        start_date: start.toISOString(),
        end_date: endOfToday.toISOString(),
      };
    }
    case DateRangePreset.LAST_90_DAYS: {
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return {
        start_date: start.toISOString(),
        end_date: endOfToday.toISOString(),
      };
    }
    case DateRangePreset.THIS_MONTH: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start_date: start.toISOString(),
        end_date: endOfToday.toISOString(),
      };
    }
    case DateRangePreset.LAST_MONTH: {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };
    }
    case DateRangePreset.ALL:
    case DateRangePreset.CUSTOM:
    default:
      return null;
  }
}

/**
 * Format วันที่เป็น string ภาษาไทย
 * @param dateString ISO date string
 * @param options format options
 */
export function formatDate(
  dateString: string,
  options: {
    showTime?: boolean;
    shortMonth?: boolean;
    showYear?: boolean;
  } = {}
): string {
  const { showTime = false, shortMonth = false, showYear = true } = options;
  const date = new Date(dateString);

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  const thaiShortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];

  const day = date.getDate();
  const month = shortMonth ? thaiShortMonths[date.getMonth()] : thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

  let result = `${day} ${month}`;
  if (showYear) {
    result += ` ${year}`;
  }

  if (showTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    result += ` ${hours}:${minutes} น.`;
  }

  return result;
}

/**
 * Format วันที่แบบสั้น
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
}

/**
 * Format เวลา
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format วันที่และเวลา
 */
export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

/**
 * คำนวณความแตกต่างระหว่างวัน
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * ตรวจสอบว่าเป็นวันนี้หรือไม่
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * ตรวจสอบว่าเป็นเมื่อวานหรือไม่
 */
export function isYesterday(dateString: string): boolean {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * ได้ relative time string (เช่น "วันนี้", "เมื่อวาน", "3 วันที่แล้ว")
 */
export function getRelativeTime(dateString: string): string {
  if (isToday(dateString)) {
    return 'วันนี้';
  }
  if (isYesterday(dateString)) {
    return 'เมื่อวาน';
  }

  const now = new Date();
  const date = new Date(dateString);
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 7) {
    return `${diffDays} วันที่แล้ว`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} สัปดาห์ที่แล้ว`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} เดือนที่แล้ว`;
  }

  return formatDate(dateString, { shortMonth: true });
}

/**
 * แปลง HH:mm เป็น Date object สำหรับวันนี้
 */
export function timeStringToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * แปลง Date เป็น HH:mm string
 */
export function dateToTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * ได้ชื่อวันในสัปดาห์ภาษาไทย
 */
export function getDayName(dayIndex: number, short = false): string {
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
  const shortDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  return short ? shortDays[dayIndex] : days[dayIndex];
}

/**
 * Parse days_of_week string เป็น array of numbers
 */
export function parseDaysOfWeek(daysString: string): number[] {
  return daysString.split(',').map(Number);
}

/**
 * Format days_of_week array เป็น readable string
 */
export function formatDaysOfWeek(days: number[]): string {
  if (days.length === 7) {
    return 'ทุกวัน';
  }
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) {
    return 'วันทำงาน';
  }
  if (days.length === 2 && days.includes(0) && days.includes(6)) {
    return 'วันหยุด';
  }
  return days.map((d) => getDayName(d, true)).join(', ');
}
