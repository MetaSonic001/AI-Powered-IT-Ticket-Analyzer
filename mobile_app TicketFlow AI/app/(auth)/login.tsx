import { View, Text, StyleSheet, TextInput, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Fingerprint } from 'lucide-react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)/dashboard');
    }, 1500);
  };

  const handleBiometricLogin = () => {
    router.push('/(auth)/biometric');
  };

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const inputBg = isDark ? '#374151' : '#FFFFFF';
  const placeholderColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}>
        <ArrowLeft size={24} color={textColor} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: placeholderColor }]}>
          Sign in to access your IT support dashboard
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>Email</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
            <Mail size={20} color={placeholderColor} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Enter your email"
              placeholderTextColor={placeholderColor}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
            <Lock size={20} color={placeholderColor} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Enter your password"
              placeholderTextColor={placeholderColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={placeholderColor} />
              ) : (
                <Eye size={20} color={placeholderColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={[styles.forgotPasswordText, { color: '#3B82F6' }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={loading}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.gradientButton}>
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: placeholderColor }]} />
          <Text style={[styles.dividerText, { color: placeholderColor }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: placeholderColor }]} />
        </View>

        <TouchableOpacity
          style={[styles.biometricButton, { backgroundColor: inputBg, borderColor: placeholderColor }]}
          onPress={handleBiometricLogin}>
          <Fingerprint size={24} color="#3B82F6" />
          <Text style={[styles.biometricButtonText, { color: textColor }]}>
            Use Biometric Authentication
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.demoButton} onPress={() => router.replace('/(tabs)/dashboard')}>
        <Text style={[styles.demoButtonText, { color: '#3B82F6' }]}>
          Continue with Demo Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 20,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  demoButton: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 16,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});