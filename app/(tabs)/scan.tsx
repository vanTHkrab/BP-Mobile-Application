import React, { useEffect } from 'react';
import CameraComponent from '@/components/camera';

import { StyleSheet, View, Dimensions, Platform } from "react-native";
import { ThemedText } from '@/components/themed-text';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function ScanScreen() {
    const insets = useSafeAreaInsets();

    const scanLine = useSharedValue(0);

    useEffect(() => {
        scanLine.value = withRepeat(
            withTiming(1, {
                duration: 2000,
                easing: Easing.linear,
            }),
            -1,
            true
        );
    }, []);

    const animatedLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLine.value * SCAN_FRAME_SIZE }],
        opacity: 0.8
    }));

    return (
        <SafeAreaProvider style={styles.container}>
            <View style={StyleSheet.absoluteFill}>
                <CameraComponent style={{ flex: 1 }} />
            </View>

            <View style={styles.overlayContainer}>
                <View style={styles.overlayMask} />

                <View style={styles.centerRow}>
                    <View style={styles.overlayMask} />

                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        <Animated.View style={[styles.laserLine, animatedLineStyle]} />
                    </View>

                    <View style={styles.overlayMask} />
                </View>

                <View style={[styles.overlayMask, { alignItems: 'center', paddingTop: 20 }]}>
                    <View style={styles.instructionContainer}>
                        <ThemedText style={styles.instructionText}>
                            วางรหัสให้อยู่ในกรอบ
                        </ThemedText>
                        <ThemedText style={[styles.instructionText, { fontSize: 14, opacity: 0.7 }]}>
                            Scanning...
                        </ThemedText>
                    </View>
                </View>
            </View>

            <View style={[styles.header, { top: insets.top + 10 }]}>
                <ThemedText type="subtitle" style={{ color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 }}>
                    Scan QR / Barcode
                </ThemedText>
            </View>

        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    overlayMask: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    centerRow: {
        flexDirection: 'row',
        height: SCAN_FRAME_SIZE,
    },

    scanFrame: {
        width: SCAN_FRAME_SIZE,
        height: SCAN_FRAME_SIZE,
        backgroundColor: 'transparent',
        position: 'relative',
    },

    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#00FF88',
        borderWidth: 4,
    },
    topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 16 },
    topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 16 },
    bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 16 },
    bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 16 },

    laserLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#00FF88',
        shadowColor: '#00FF88',
        shadowOpacity: 1,
        shadowRadius: 10,
    },

    header: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        zIndex: 10,
    },
    instructionContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    instructionText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
    }
});