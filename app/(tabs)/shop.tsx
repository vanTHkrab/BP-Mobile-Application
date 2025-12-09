import React, {useEffect} from 'react';
import {StyleSheet, View} from "react-native";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    Easing,
    withRepeat
} from 'react-native-reanimated';

export default function ShopScreen() {
    const animation = useSharedValue(0);

    useEffect(() => {
        animation.value = withRepeat(
            withTiming(1, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: animation.value * -100,
                },
            ],
            opacity: animation.value,
        };
    });

    const insets = useSafeAreaInsets();
    return (
        <SafeAreaProvider style={{flex: 1}}>
            <ThemedView style={{flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, justifyContent: 'center', alignItems: 'center'}}>
                <Animated.View style={[{height: 50, width: 50, backgroundColor: 'blue'}, animatedStyle]} />
            </ThemedView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});