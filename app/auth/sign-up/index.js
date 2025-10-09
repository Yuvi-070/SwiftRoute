import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth, user } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { app } from '../../../configs/FirebaseConfig';
import { Colors } from '../../../constants/theme';





export default function SignUp() {
    const navigation = useNavigation();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const auth = getAuth(app);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        navigation.setOptions({ 
            headerShown: false 
        });
    }, [navigation]);

// Firebase - Create New User

    function validateEmailAddress(value) {
        // simple email regex
        return /^\S+@\S+\.\S+$/.test(value);
    }

    const OnCreateAccount = async () => {
        // reset errors
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
            createUserWithEmailAndPassword(auth, trimmedEmail, password);
            // router.replace('/auth/sign-in');
            router.replace('/(tabs)/mytrip');
            console.log(user);

            
        } catch (err) {
            // Surface friendly error messages for common auth errors
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




  return (
    <View style={{
        padding: 25,
        paddingTop: 50,
        backgroundColor: Colors.WHITE,
        height: '100%'
        }}>

        <TouchableOpacity onPress={()=>router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
            

      <Text style={{
        fontFamily: 'outfit-bold',
        fontSize: 30,
        marginTop: 30
    
      }}>Create New Account</Text>

      
{/* User Full Name */}
    <View style={{
        marginTop: 50
                      
        }}>
        <Text style={{
            fontFamily: 'outfit'
        }}>Full Name</Text>
    <TextInput style={[styles.input, fieldErrors.fullName ? styles.inputError : null]} 
        value={fullName}
        onChangeText={(value)=>{ setFullName(value); if (fieldErrors.fullName) setFieldErrors({}); }}
        placeholder='Enter Full Name'/>
    {fieldErrors.fullName ? <Text style={styles.fieldError}>{fieldErrors.fullName}</Text> : null}
    </View>	




{/* Email */}
    <View style={{
        marginTop: 20
                      
        }}>
        <Text style={{
            fontFamily: 'outfit'
        }}>Email</Text>
    <TextInput style={[styles.input, fieldErrors.email ? styles.inputError : null]}
    value={email}
    onChangeText={(value)=>{ setEmail(value); if (fieldErrors.email) setFieldErrors({}); }}
    placeholder='Enter Email'/>
    {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
    </View>	
      
{/* Password */}
    <View style={{
        marginTop: 20
        }}>
        <Text style={{
            fontFamily: 'outfit',
        }}>Password</Text>
        <TextInput 
            secureTextEntry={true} 
            style={[styles.input, fieldErrors.password ? styles.inputError : null]} 
            value={password}
            onChangeText={(value)=>{ setPassword(value); if (fieldErrors.password) setFieldErrors({}); }}
            placeholder='Enter Password'/>
        {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
     </View>	
      
{/* Create Account Button */}
    <TouchableOpacity onPress={OnCreateAccount} style={{
                padding: 20,
                backgroundColor: Colors.PRIMARY,
                borderRadius: 15,
                marginTop: 50
        }}>
        {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
        ) : (
            <Text style={{
            color: Colors.WHITE,
            textAlign: 'center',
            }}>Create Account</Text>
        )}

    </TouchableOpacity>

    {error ? (
        <Text style={{ color: 'red', marginTop: 12 }}>{error}</Text>
    ) : null}


{/* Sign-In Button */}
    <TouchableOpacity 
        onPress={()=>router.replace('/auth/sign-in')} 
        style={{
            padding: 20,
            backgroundColor: Colors.WHITE,
            borderRadius: 15,
            marginTop: 20,
            borderWidth: 1,
            borderColor: Colors.PRIMARY
            }}>
            
        <Text style={{
            color: Colors.PRIMARY,
            textAlign: 'center',
        }}>Sign In</Text>

    </TouchableOpacity>      
      

    </View>
  )
}


const styles = StyleSheet.create({
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    fontFamily: 'outfit'
  }
    ,inputError: {
        borderColor: 'red'
    },
    fieldError: {
        color: 'red',
        marginTop: 8
    }
});