/**
 * Camera Service
 * จัดการการถ่ายรูปและบันทึกรูปภาพ
 */

import { Directory, File, Paths } from 'expo-file-system/next';
import * as ImagePicker from 'expo-image-picker';

// Directory name สำหรับเก็บรูปภาพความดัน
const BP_IMAGES_DIR_NAME = 'bp_images';

/**
 * ได้ directory สำหรับเก็บรูปภาพ
 */
function getBPImagesDirectory(): Directory {
  return new Directory(Paths.document, BP_IMAGES_DIR_NAME);
}

/**
 * ตรวจสอบ/สร้าง directory สำหรับเก็บรูปภาพ
 */
function ensureImageDirectory(): Directory {
  const dir = getBPImagesDirectory();
  if (!dir.exists) {
    dir.create();
  }
  return dir;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Camera] Permission error:', error);
    return false;
  }
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Camera] Media library permission error:', error);
    return false;
  }
}

/**
 * Take a photo using camera
 * @returns URI ของรูปภาพที่บันทึก หรือ null ถ้าล้มเหลว
 */
export async function takePhoto(): Promise<string | null> {
  try {
    // ขอ permission ก่อน
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log('[Camera] Permission denied');
      return null;
    }

    // เปิดกล้องถ่ายรูป
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    // บันทึกรูปไปยัง local storage
    const imageUri = result.assets[0].uri;
    const savedPath = await saveImageToLocal(imageUri);

    return savedPath;
  } catch (error) {
    console.error('[Camera] Take photo error:', error);
    return null;
  }
}

/**
 * Pick image from gallery
 * @returns URI ของรูปภาพที่เลือก หรือ null ถ้าล้มเหลว
 */
export async function pickImageFromGallery(): Promise<string | null> {
  try {
    // ขอ permission ก่อน
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      console.log('[Camera] Media library permission denied');
      return null;
    }

    // เปิด gallery เลือกรูป
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    // บันทึกรูปไปยัง local storage
    const imageUri = result.assets[0].uri;
    const savedPath = await saveImageToLocal(imageUri);

    return savedPath;
  } catch (error) {
    console.error('[Camera] Pick image error:', error);
    return null;
  }
}

/**
 * Save image to local storage
 * @param sourceUri URI ต้นฉบับของรูป
 * @returns path ที่บันทึก
 */
export async function saveImageToLocal(sourceUri: string): Promise<string> {
  const dir = ensureImageDirectory();

  // สร้างชื่อไฟล์ unique
  const filename = `bp_${Date.now()}.jpg`;
  
  // สร้าง File object จาก source
  const sourceFile = new File(sourceUri);
  
  // Copy ไฟล์ไปยัง destination
  const destFile = new File(dir, filename);
  sourceFile.copy(destFile);

  return destFile.uri;
}

/**
 * Delete image from local storage
 * @param imagePath path ของรูปที่จะลบ
 */
export async function deleteImage(imagePath: string): Promise<boolean> {
  try {
    const file = new File(imagePath);
    if (file.exists) {
      file.delete();
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Camera] Delete image error:', error);
    return false;
  }
}

/**
 * Get all saved BP images
 * @returns รายการ path ของรูปภาพทั้งหมด
 */
export function getAllBPImages(): string[] {
  try {
    const dir = ensureImageDirectory();
    const contents = dir.list();
    return contents
      .filter((item): item is File => item instanceof File)
      .map((file) => file.uri);
  } catch (error) {
    console.error('[Camera] Get all images error:', error);
    return [];
  }
}

/**
 * Check if image exists
 */
export function imageExists(imagePath: string): boolean {
  try {
    const file = new File(imagePath);
    return file.exists;
  } catch {
    return false;
  }
}

/**
 * Get image file size
 */
export function getImageSize(imagePath: string): number | null {
  try {
    const file = new File(imagePath);
    if (file.exists) {
      return file.size ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Clean up old images (เก็บไว้ไม่เกิน X วัน)
 * @param daysToKeep จำนวนวันที่จะเก็บรูป (default: 90)
 */
export function cleanupOldImages(daysToKeep: number = 90): number {
  try {
    const dir = ensureImageDirectory();
    const contents = dir.list();
    const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const item of contents) {
      if (item instanceof File) {
        // ใช้ชื่อไฟล์ที่มี timestamp เป็นตัวตรวจสอบ
        const match = item.name?.match(/bp_(\d+)\.jpg/);
        if (match) {
          const fileTimestamp = parseInt(match[1], 10);
          if (fileTimestamp < cutoffDate) {
            item.delete();
            deletedCount++;
          }
        }
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('[Camera] Cleanup error:', error);
    return 0;
  }
}

/**
 * Get storage usage for BP images
 * @returns ขนาดรวมเป็น bytes
 */
export function getBPImagesStorageSize(): number {
  try {
    const dir = ensureImageDirectory();
    const contents = dir.list();
    let totalSize = 0;

    for (const item of contents) {
      if (item instanceof File) {
        totalSize += item.size ?? 0;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('[Camera] Get storage size error:', error);
    return 0;
  }
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
