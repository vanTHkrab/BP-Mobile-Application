import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AboutScreen() {
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={{marginBottom: 16}}>About This App</ThemedText>
            <ThemedText style={{textAlign: 'center'}}>
                This is a sample Expo Router application demonstrating file-based routing, theming, and
                cross-platform support for Android, iOS, and web.
            </ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
});