/**
 * Camera Screen
 * หน้าจอสำหรับถ่ายภาพเครื่องวัดความดัน
 */

import { Colors, LightTheme } from '@/constants/colors';
import { saveImageToLocal } from '@/services/camera';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ recordId?: string }>();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // กำลังโหลด permission
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // ไม่มี permission
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color={LightTheme.colors.textSecondary} />
        <Text style={styles.permissionTitle}>ต้องการสิทธิ์เข้าถึงกล้อง</Text>
        <Text style={styles.permissionText}>
          กรุณาอนุญาตให้แอปเข้าถึงกล้องเพื่อถ่ายภาพเครื่องวัดความดัน
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>อนุญาตการเข้าถึงกล้อง</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>ยกเลิก</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ถ่ายภาพ
  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายภาพได้');
    }
  };

  // สลับกล้อง
  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // บันทึกภาพ
  const handleSave = async () => {
    if (!capturedImage) return;

    setIsSaving(true);
    try {
      // บันทึกภาพไป local storage
      const savedUri = await saveImageToLocal(capturedImage);
      if (savedUri) {
        Alert.alert('สำเร็จ', 'บันทึกภาพเรียบร้อยแล้ว', [
          { text: 'ตกลง', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกภาพได้');
    } finally {
      setIsSaving(false);
    }
  };

  // ถ่ายภาพใหม่
  const handleRetake = () => {
    setCapturedImage(null);
  };

  // แสดงภาพที่ถ่ายได้
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        
        <View style={styles.previewOverlay}>
          <Text style={styles.previewTitle}>ตรวจสอบภาพ</Text>
          <Text style={styles.previewSubtitle}>
            ตรวจสอบว่าภาพชัดเจนและอ่านค่าได้
          </Text>
        </View>

        <View style={styles.previewActions}>
          <TouchableOpacity
            style={[styles.previewButton, styles.retakeButton]}
            onPress={handleRetake}
          >
            <Ionicons name="camera-reverse-outline" size={24} color={LightTheme.colors.text} />
            <Text style={styles.retakeButtonText}>ถ่ายใหม่</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.previewButton, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={24} color={Colors.white} />
                <Text style={styles.saveButtonText}>ใช้ภาพนี้</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // แสดงกล้อง
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ถ่ายภาพเครื่องวัดความดัน</Text>
          <TouchableOpacity style={styles.headerButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Guide Frame */}
        <View style={styles.guideContainer}>
          <View style={styles.guideFrame}>
            <View style={[styles.guideCorner, styles.guideTopLeft]} />
            <View style={[styles.guideCorner, styles.guideTopRight]} />
            <View style={[styles.guideCorner, styles.guideBottomLeft]} />
            <View style={[styles.guideCorner, styles.guideBottomRight]} />
          </View>
          <Text style={styles.guideText}>วางเครื่องวัดความดันให้อยู่ในกรอบ</Text>
        </View>

        {/* Capture Button */}
        <View style={styles.captureContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 280,
    height: 200,
    position: 'relative',
  },
  guideCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.white,
  },
  guideTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  guideTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  guideBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  guideBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  guideText: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  captureContainer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    backgroundColor: LightTheme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LightTheme.colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: LightTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: LightTheme.colors.textSecondary,
    fontSize: 16,
  },
  // Preview styles
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  previewTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  previewSubtitle: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  previewActions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  retakeButtonText: {
    color: LightTheme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
