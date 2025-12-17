/**
 * Database Index
 * Export ทุก database functions จากที่เดียว
 */

// Database connection & initialization
// Platform-specific files: connection.native.ts, connection.web.ts
// Metro will auto-resolve based on platform
export {
    closeDatabase,
    executeSQL,
    getDatabase,
    initializeDatabase,
    queryFirst,
    querySQL,
    resetDatabase
} from './connection';

// Schema
export { DATABASE_NAME, DATABASE_VERSION, MIGRATIONS } from './schema';

// BP Records operations
export {
    createBPRecord, deleteBPRecord, getBPRecordById,
    getBPRecords, getBPStatistics,
    getChartData, getLatestBPRecord,
    updateBPRecord
} from './bp-records';

// Reminders operations
export {
    createMeasurementReminder, createMedicationReminder, deleteMeasurementReminder, deleteMedicationReminder, getEnabledMeasurementReminders, getEnabledMedicationReminders, getMeasurementReminders, getMedicationReminders, updateMeasurementReminder, updateMedicationReminder
} from './reminders';

// Settings & Profile operations
export {
    getAppSettings, getBPThreshold, getUserProfile, updateAppSettings, updateBPThreshold, updateUserProfile
} from './settings';

