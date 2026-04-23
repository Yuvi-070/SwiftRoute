import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth, signInWithPopup } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, googleProvider } from '../../../configs/firebaseConfig';
import { useTheme } from '../../../context/ThemeContext';
import { radii, spacing } from '../../../constants/theme';


export default function SignUp() {
    const navigation = useNavigation();
    const router = useRouter();
    const { theme } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    function validateEmailAddress(value) {
        return /^\S+@\S+\.\S+$/.test(value);
    }

    const OnCreateAccount = async () => {
        setError('');
        setFieldErrors({});

        const trimmedFullName = (fullName || '').trim();
        if (!trimmedFullName) {
            setFieldErrors({ fullName: 'Please enter your full name.' });
            return;
        }
        const trimmedEmail = (email || '').trim();
        if (!trimmedEmail || !validateEmailAddress(trimmedEmail)) {
            setFieldErrors({ email: 'Please enter a valid email address.' });
            return;
        }
        if (!password || password.length < 6) {
            setFieldErrors({ password: 'Password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            router.replace('/(tabs)/mytrip');
        } catch (err) {
            const code = err.code || '';
            if (code.includes('invalid-email')) {
                setFieldErrors({ email: 'The email address is badly formatted.' });
            } else if (code.includes('email-already-in-use')) {
                setFieldErrors({ email: 'This email is already in use. Try signing in instead.' });
            } else if (code.includes('weak-password')) {
                setFieldErrors({ password: 'The password is too weak. Choose a stronger password.' });
            } else {
                setError(err.message || 'An error occurred during sign up.');
            }
            console.error('Sign up error', err);
        } finally {
            setLoading(false);
        }
    }

    const onGoogleSignUp = () => {
        if (Platform.OS === 'web') {
            signInWithPopup(auth, googleProvider)
                .then((result) => {
                    const user = result.user;
                    router.replace('/(tabs)/mytrip');
                    console.log('Google Sign-Up Success', user);
                })
                .catch((error) => {
                    console.error('Google Sign-Up Error', error.code, error.message);
                    alert('Google Sign-Up failed: ' + error.message);
                });
        } else {
            alert('Google Sign-Up is configured for web only in this version.');
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
                Create New Account
            </Text>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Full Name</Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: fieldErrors.fullName ? theme.error : theme.border,
                            backgroundColor: theme.surfaceElevated,
                            color: theme.textPrimary,
                        },
                    ]}
                    value={fullName}
                    onChangeText={(value) => { setFullName(value); if (fieldErrors.fullName) setFieldErrors({}); }}
                    placeholder='Enter Full Name'
                    placeholderTextColor={theme.textTertiary}
                />
                {fieldErrors.fullName ? (
                    <Text style={[styles.fieldError, { color: theme.error }]}>{fieldErrors.fullName}</Text>
                ) : null}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Email</Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: fieldErrors.email ? theme.error : theme.border,
                            backgroundColor: theme.surfaceElevated,
                            color: theme.textPrimary,
                        },
                    ]}
                    value={email}
                    onChangeText={(value) => { setEmail(value); if (fieldErrors.email) setFieldErrors({}); }}
                    placeholder='Enter Email'
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {fieldErrors.email ? (
                    <Text style={[styles.fieldError, { color: theme.error }]}>{fieldErrors.email}</Text>
                ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Password</Text>
                <TextInput
                    secureTextEntry={true}
                    style={[
                        styles.input,
                        {
                            borderColor: fieldErrors.password ? theme.error : theme.border,
                            backgroundColor: theme.surfaceElevated,
                            color: theme.textPrimary,
                        },
                    ]}
                    value={password}
                    onChangeText={(value) => { setPassword(value); if (fieldErrors.password) setFieldErrors({}); }}
                    placeholder='Enter Password'
                    placeholderTextColor={theme.textTertiary}
                />
                {fieldErrors.password ? (
                    <Text style={[styles.fieldError, { color: theme.error }]}>{fieldErrors.password}</Text>
                ) : null}
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
                onPress={OnCreateAccount}
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.85}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                )}
            </TouchableOpacity>

            {error ? (
                <Text style={[styles.generalError, { color: theme.error }]}>{error}</Text>
            ) : null}

            {/* Sign-In Button */}
            <TouchableOpacity
                onPress={() => router.replace('/auth/sign-in')}
                style={[styles.secondaryBtn, { borderColor: theme.primary }]}
                activeOpacity={0.85}
            >
                <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>
                    Sign In
                </Text>
            </TouchableOpacity>

            {/* Google Sign In Button */}
            <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textSecondary, backgroundColor: theme.background }]}>OR</Text>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
                onPress={onGoogleSignUp}
                style={[styles.googleBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                activeOpacity={0.85}
            >
                <Ionicons name="logo-google" size={24} color={theme.textPrimary} style={styles.googleIcon} />
                <Text style={[styles.googleBtnText, { color: theme.textPrimary }]}>Sign Up with Google</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
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
    fieldGroup: {
        marginTop: spacing.xl,
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
    fieldError: {
        fontFamily: 'outfit',
        fontSize: 13,
        marginTop: 8,
    },
    generalError: {
        fontFamily: 'outfit',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
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