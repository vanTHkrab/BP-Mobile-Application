/**
 * Blood Pressure Utilities
 * Helper functions สำหรับการคำนวณและวิเคราะห์ความดันโลหิต
 */

import { BPRecord, BPStatus, BPStatusInfo, BPThreshold } from '@/types';

/**
 * Default threshold values (ตาม American Heart Association)
 */
export const DEFAULT_THRESHOLD: BPThreshold = {
  high_systolic: 140,
  high_diastolic: 90,
  low_systolic: 90,
  low_diastolic: 60,
};

/**
 * ข้อมูลสถานะความดันโลหิต
 */
export const BP_STATUS_INFO: Record<BPStatus, BPStatusInfo> = {
  [BPStatus.NORMAL]: {
    status: BPStatus.NORMAL,
    label: 'Normal',
    labelTh: 'ปกติ',
    color: '#4CAF50', // Green
    description: 'ความดันโลหิตอยู่ในเกณฑ์ปกติ',
  },
  [BPStatus.ELEVATED]: {
    status: BPStatus.ELEVATED,
    label: 'Elevated',
    labelTh: 'สูงเล็กน้อย',
    color: '#FFC107', // Yellow
    description: 'ความดันโลหิตสูงกว่าปกติเล็กน้อย ควรระวัง',
  },
  [BPStatus.HYPERTENSION_1]: {
    status: BPStatus.HYPERTENSION_1,
    label: 'Hypertension Stage 1',
    labelTh: 'ความดันสูงระดับ 1',
    color: '#FF9800', // Orange
    description: 'ความดันโลหิตสูง ควรปรึกษาแพทย์',
  },
  [BPStatus.HYPERTENSION_2]: {
    status: BPStatus.HYPERTENSION_2,
    label: 'Hypertension Stage 2',
    labelTh: 'ความดันสูงระดับ 2',
    color: '#F44336', // Red
    description: 'ความดันโลหิตสูงมาก ควรพบแพทย์โดยเร็ว',
  },
  [BPStatus.CRISIS]: {
    status: BPStatus.CRISIS,
    label: 'Hypertensive Crisis',
    labelTh: 'วิกฤต',
    color: '#9C27B0', // Purple
    description: 'ความดันโลหิตอยู่ในระดับวิกฤต ควรพบแพทย์ทันที',
  },
  [BPStatus.LOW]: {
    status: BPStatus.LOW,
    label: 'Low',
    labelTh: 'ต่ำ',
    color: '#2196F3', // Blue
    description: 'ความดันโลหิตต่ำกว่าปกติ',
  },
};

/**
 * วิเคราะห์ค่าความดันโลหิต และได้สถานะ
 * อ้างอิงตามเกณฑ์ American Heart Association
 * 
 * - Normal: systolic < 120 AND diastolic < 80
 * - Elevated: systolic 120-129 AND diastolic < 80
 * - Hypertension Stage 1: systolic 130-139 OR diastolic 80-89
 * - Hypertension Stage 2: systolic >= 140 OR diastolic >= 90
 * - Hypertensive Crisis: systolic > 180 OR diastolic > 120
 * - Low: systolic < 90 OR diastolic < 60
 */
export function analyzeBPStatus(
  systolic: number,
  diastolic: number,
  threshold?: BPThreshold
): BPStatus {
  const t = threshold ?? DEFAULT_THRESHOLD;

  // ตรวจสอบความดันต่ำก่อน
  if (systolic < t.low_systolic || diastolic < t.low_diastolic) {
    return BPStatus.LOW;
  }

  // ตรวจสอบวิกฤต
  if (systolic > 180 || diastolic > 120) {
    return BPStatus.CRISIS;
  }

  // ตรวจสอบความดันสูงระดับ 2
  if (systolic >= t.high_systolic || diastolic >= t.high_diastolic) {
    return BPStatus.HYPERTENSION_2;
  }

  // ตรวจสอบความดันสูงระดับ 1
  if (systolic >= 130 || diastolic >= 80) {
    return BPStatus.HYPERTENSION_1;
  }

  // ตรวจสอบสูงเล็กน้อย
  if (systolic >= 120 && systolic < 130 && diastolic < 80) {
    return BPStatus.ELEVATED;
  }

  // ปกติ
  return BPStatus.NORMAL;
}

/**
 * ได้ข้อมูลสถานะความดันโลหิตครบถ้วน
 */
export function getBPStatusInfo(
  systolic: number,
  diastolic: number,
  threshold?: BPThreshold
): BPStatusInfo {
  const status = analyzeBPStatus(systolic, diastolic, threshold);
  return BP_STATUS_INFO[status];
}

/**
 * ตรวจสอบว่าค่าความดันผิดปกติหรือไม่ (สูงหรือต่ำเกิน)
 */
export function isAbnormalBP(
  systolic: number,
  diastolic: number,
  threshold?: BPThreshold
): boolean {
  const status = analyzeBPStatus(systolic, diastolic, threshold);
  return ![BPStatus.NORMAL, BPStatus.ELEVATED].includes(status);
}

/**
 * ตรวจสอบว่าต้องแจ้งเตือนหรือไม่
 */
export function shouldAlert(
  systolic: number,
  diastolic: number,
  threshold?: BPThreshold
): boolean {
  const status = analyzeBPStatus(systolic, diastolic, threshold);
  return [
    BPStatus.HYPERTENSION_2,
    BPStatus.CRISIS,
    BPStatus.LOW,
  ].includes(status);
}

/**
 * Validation สำหรับค่าความดันโลหิต
 */
export interface BPValidationResult {
  isValid: boolean;
  errors: {
    systolic?: string;
    diastolic?: string;
    pulse?: string;
    general?: string;
  };
}

/**
 * Validate ข้อมูลความดันโลหิต
 */
export function validateBPInput(
  systolic: number | string,
  diastolic: number | string,
  pulse: number | string
): BPValidationResult {
  const errors: BPValidationResult['errors'] = {};
  
  const sys = typeof systolic === 'string' ? parseInt(systolic, 10) : systolic;
  const dia = typeof diastolic === 'string' ? parseInt(diastolic, 10) : diastolic;
  const pul = typeof pulse === 'string' ? parseInt(pulse, 10) : pulse;

  // ตรวจสอบว่าเป็นตัวเลข
  if (isNaN(sys)) {
    errors.systolic = 'กรุณากรอกค่าความดันตัวบน';
  } else if (sys < 60 || sys > 250) {
    errors.systolic = 'ค่าความดันตัวบนควรอยู่ระหว่าง 60-250';
  }

  if (isNaN(dia)) {
    errors.diastolic = 'กรุณากรอกค่าความดันตัวล่าง';
  } else if (dia < 40 || dia > 150) {
    errors.diastolic = 'ค่าความดันตัวล่างควรอยู่ระหว่าง 40-150';
  }

  if (isNaN(pul)) {
    errors.pulse = 'กรุณากรอกค่าชีพจร';
  } else if (pul < 30 || pul > 220) {
    errors.pulse = 'ค่าชีพจรควรอยู่ระหว่าง 30-220';
  }

  // ตรวจสอบว่า systolic > diastolic
  if (!isNaN(sys) && !isNaN(dia) && sys <= dia) {
    errors.general = 'ค่าความดันตัวบนต้องมากกว่าความดันตัวล่าง';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * คำนวณค่าเฉลี่ยความดัน
 */
export function calculateAverageBP(records: BPRecord[]): {
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number;
} | null {
  if (records.length === 0) {
    return null;
  }

  const sum = records.reduce(
    (acc, record) => ({
      systolic: acc.systolic + record.systolic,
      diastolic: acc.diastolic + record.diastolic,
      pulse: acc.pulse + record.pulse,
    }),
    { systolic: 0, diastolic: 0, pulse: 0 }
  );

  return {
    avgSystolic: Math.round(sum.systolic / records.length),
    avgDiastolic: Math.round(sum.diastolic / records.length),
    avgPulse: Math.round(sum.pulse / records.length),
  };
}

/**
 * คำนวณ Mean Arterial Pressure (MAP)
 * MAP = DBP + (SBP - DBP) / 3
 */
export function calculateMAP(systolic: number, diastolic: number): number {
  return Math.round(diastolic + (systolic - diastolic) / 3);
}

/**
 * คำนวณ Pulse Pressure
 * PP = SBP - DBP
 */
export function calculatePulsePressure(systolic: number, diastolic: number): number {
  return systolic - diastolic;
}

/**
 * Format ค่าความดันเป็น string
 */
export function formatBPValue(systolic: number, diastolic: number): string {
  return `${systolic}/${diastolic}`;
}

/**
 * Format ค่าความดันพร้อมหน่วย
 */
export function formatBPWithUnit(
  systolic: number,
  diastolic: number,
  unit: string = 'mmHg'
): string {
  return `${systolic}/${diastolic} ${unit}`;
}
