import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';



export default function Login() {
    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <View style={styles.root}>
            <Image
                source={require('./../assets/images/login.jpg')}
                style={styles.heroImage}
                resizeMode="cover"
            />

            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Pill handle */}
                <View style={styles.handle} />

                <Text style={styles.title}>Welcome to SwiftRoute</Text>

                <Text style={styles.subtitle}>
                    Discover your next adventure effortlessly. Personalized
                    itineraries at your fingertips. Travel smarter with
                    AI-driven insights.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.85}
                    onPress={() => router.push('/auth/sign-in')}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.signInLink}
                    onPress={() => router.push('/auth/sign-in')}
                >
                    <Text style={styles.signInText}>
                        Already have an account?{' '}
                        <Text style={styles.signInTextBold}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.DARK,
    },
    heroImage: {
        width: '100%',
        height: 480,
    },
    card: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.WHITE,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 16,
        paddingBottom: 40,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.LIGHT_GRAY,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontFamily: 'outfit-bold',
        textAlign: 'center',
        color: Colors.DARK,
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: 'outfit',
        textAlign: 'center',
        fontSize: 15,
        color: Colors.GRAY,
        lineHeight: 22,
        marginBottom: 32,
    },
    button: {
        backgroundColor: Colors.PRIMARY_DARK,
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: Colors.PRIMARY_DARK,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    buttonText: {
        color: Colors.WHITE,
        fontFamily: 'outfit-bold',
        fontSize: 17,
        letterSpacing: 0.5,
    },
    signInLink: {
        marginTop: 18,
        alignItems: 'center',
    },
    signInText: {
        fontFamily: 'outfit',
        fontSize: 14,
        color: Colors.GRAY,
    },
    signInTextBold: {
        fontFamily: 'outfit-bold',
        color: Colors.PRIMARY,
    },
});