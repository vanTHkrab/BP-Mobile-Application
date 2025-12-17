import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ใช้ Icon เพื่อความสวยงาม
import React from 'react';

// รับ Props เข้ามาเพื่อให้ Parent (ScanScreen) ควบคุมได้
export default function CameraComponent({ style, onBarcodeScanned }: { style?: any, onBarcodeScanned?: (scanningResult: any) => void }) {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.permissionContainer]}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={[styles.container, style]}>
            <CameraView
                style={StyleSheet.absoluteFill} // ให้กล้องขยายเต็มพื้นที่ Container เสมอ
                facing={facing}
                onBarcodeScanned={onBarcodeScanned} // ส่ง callback เมื่อสแกนเจอ
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13"], // กำหนดประเภทโค้ดที่ต้องการอ่าน
                }}
            />

            {/* ปุ่ม Flip กล้อง เปลี่ยนเป็นไอคอนเล็กๆ มุมขวาบน */}
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        overflow: 'hidden',
        borderRadius: 16, // เพิ่มความโค้งมนเล็กน้อย (Optional)
    },
    permissionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 20,
        color: 'white',
        fontSize: 16,
    },
    flipButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)', // พื้นหลังปุ่มจางๆ
        padding: 10,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // อยู่เหนือกล้อง
    },
});