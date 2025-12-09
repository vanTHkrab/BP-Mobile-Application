import React from 'react';

import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  return (
    <ThemedView style={styles.container}>
        <ThemedText type="title">404 - Page Not Found</ThemedText>
        <ThemedText style={{textAlign: 'center', marginTop: 16}}>
            The page you are looking for does not exist. Please check the URL or return to the home page.
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