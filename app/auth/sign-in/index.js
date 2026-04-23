import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { auth, googleProvider } from '../../../configs/firebaseConfig';
import { useTheme } from '../../../context/ThemeContext';
import { radii, spacing, typography } from '../../../constants/theme';


export default function SignIn() {
    const navigation = useNavigation();
    const router = useRouter();
    const { theme } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const onSignIn = () => {
        setLoginError('');
        if (!email && !password) {
            setLoginError('Please enter email and password.');
            ToastAndroid.show('Please enter email and password.', ToastAndroid.LONG);
            return;
        }
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                router.replace('/(tabs)/mytrip');
                console.log('Signed in', user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Sign-in error', errorCode, errorMessage);
                if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
                    setLoginError('Invalid email or password.');
                    if (Platform.OS === 'android') ToastAndroid.show('Invalid credential', ToastAndroid.LONG);
                } else {
                    setLoginError(errorMessage);
                }
            });
    }

    const onGoogleSignIn = () => {
        if (Platform.OS === 'web') {
            signInWithPopup(auth, googleProvider)
                .then((result) => {
                    const user = result.user;
                    router.replace('/(tabs)/mytrip');
                    console.log('Google Sign-In Success', user);
                })
                .catch((error) => {
                    console.log('Google Sign-In Error', error.code, error.message);
                    setLoginError('Google Sign-In failed: ' + error.message);
                    if (Platform.OS === 'android' || Platform.OS === 'ios') {
                        ToastAndroid.show('Google Sign-In failed', ToastAndroid.LONG);
                    } else {
                        alert('Google Sign-In failed: ' + error.message);
                    }
                });
        } else {
            if (Platform.OS === 'android' || Platform.OS === 'ios') {
                ToastAndroid.show('Google Sign-In is configured for web only in this version.', ToastAndroid.LONG);
            } else {
                alert('Google Sign-In is configured for web only in this version.');
            }
        }
    };

	return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
		<View style={[styles.container, { backgroundColor: theme.background }]}>
            <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: theme.primaryMuted }]}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={22} color={theme.primary} />
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: theme.textPrimary }]}>
                Let's Sign You In
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Welcome Back
            </Text>
            <Text style={[styles.subtitle2, { color: theme.textSecondary }]}>
                You Have Been Missed
            </Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Email</Text>
                <TextInput
                    style={[styles.input, {
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceElevated,
                        color: theme.textPrimary,
                    }]}
                    onChangeText={(value) => setEmail(value)}
                    placeholder='Enter Email'
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Password</Text>
                <TextInput
                    secureTextEntry={true}
                    style={[styles.input, {
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceElevated,
                        color: theme.textPrimary,
                    }]}
                    onChangeText={(value) => setPassword(value)}
                    placeholder='Enter Password'
                    placeholderTextColor={theme.textTertiary}
                />
            </View>

            {/* Error Message */}
            {loginError ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={theme.error || '#EF4444'} />
                    <Text style={[styles.errorText, { color: theme.error || '#EF4444' }]}>{loginError}</Text>
                </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
                onPress={onSignIn}
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.85}
            >
                <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity
                onPress={() => router.replace('/auth/sign-up')}
                style={[styles.secondaryBtn, { borderColor: theme.primary }]}
                activeOpacity={0.85}
            >
                <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>
                    Create Account
                </Text>
            </TouchableOpacity>

            {/* Google Sign In Button */}
            <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textSecondary, backgroundColor: theme.background }]}>OR</Text>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
                onPress={onGoogleSignIn}
                style={[styles.googleBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                activeOpacity={0.85}
            >
                <Ionicons name="logo-google" size={24} color={theme.textPrimary} style={styles.googleIcon} />
                <Text style={[styles.googleBtnText, { color: theme.textPrimary }]}>Sign In with Google</Text>
            </TouchableOpacity>
		</View>
        </View>
	)
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
    },
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 480,
        padding: 25,
        paddingTop: 50,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontFamily: 'outfit-bold',
        fontSize: 30,
        marginTop: spacing.lg,
    },
    subtitle: {
        fontFamily: 'outfit',
        fontSize: 28,
        marginTop: spacing.xl,
    },
    subtitle2: {
        fontFamily: 'outfit',
        fontSize: 28,
        marginTop: spacing.sm,
    },
    fieldGroup: {
        marginTop: spacing['2xl'],
    },
    fieldLabel: {
        fontFamily: 'outfit-medium',
        fontSize: 14,
        marginBottom: spacing.sm,
    },
    input: {
        padding: 15,
        borderWidth: 1,
        borderRadius: radii.md,
        fontFamily: 'outfit',
        fontSize: 15,
    },
    primaryBtn: {
        padding: 18,
        borderRadius: radii.lg,
        marginTop: spacing['5xl'],
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: { elevation: 4 },
        }),
    },
    primaryBtnText: {
        color: '#FFF',
        fontFamily: 'outfit-bold',
        fontSize: 16,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: radii.md,
        gap: spacing.sm,
    },
    errorText: {
        fontFamily: 'outfit-medium',
        fontSize: 14,
        flex: 1,
    },
    secondaryBtn: {
        padding: 18,
        borderRadius: radii.lg,
        marginTop: spacing.lg,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontFamily: 'outfit-bold',
        fontSize: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing['2xl'],
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontFamily: 'outfit-medium',
        fontSize: 14,
        paddingHorizontal: spacing.md,
    },
    googleBtn: {
        flexDirection: 'row',
        padding: 18,
        borderRadius: radii.lg,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        marginRight: spacing.sm,
    },
    googleBtnText: {
        fontFamily: 'outfit-bold',
        fontSize: 16,
    },
});
