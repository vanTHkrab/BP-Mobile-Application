import React from "react";

import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

interface Props {
    uri: string;
    style?: object;
}

export function ImageSource({ uri, style }: Props) {
    return (
        <Image
            source={{ uri }}
            style={[styles.image, style]}
            contentFit="cover"
            transition={1000}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0553',
    },
});