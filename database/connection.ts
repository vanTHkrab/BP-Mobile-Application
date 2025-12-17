/**
 * Database Connection
 * Re-export from platform-specific implementations
 * Metro bundler จะใช้ .native.ts สำหรับ native และ .web.ts สำหรับ web
 */

// This file exists for TypeScript to resolve the module
// Metro will pick the correct platform-specific file

export * from './connection.native';
