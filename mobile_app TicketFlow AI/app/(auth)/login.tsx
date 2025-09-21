import { View, Text, StyleSheet, TextInput, TouchableOpacity, useColorScheme, Alert, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Fingerprint, Shield, Sparkles, Check, AlertCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const formSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields to continue');
      return;
    }

    if (!emailValid) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    // Simulate API call with better UX
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)/dashboard');
    }, 1800);
  };

  const handleBiometricLogin = () => {
    router.push('/(auth)/biometric');
  };

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const inputBg = isDark ? 'rgba(55, 65, 81, 0.8)' : '#FFFFFF';
  const placeholderColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(107, 114, 128, 0.2)';

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={isDark 
          ? ['#0F0F23', '#1A1B3A', '#2D1B69'] 
          : ['#F8FAFC', '#E2E8F0', '#CBD5E1']
        }
        style={styles.container}>
        
        {/* Background Elements */}
        <View style={styles.backgroundElements}>
          <Animated.View style={[
            styles.floatingElement,
            styles.element1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1]
              })
            }
          ]} />
          <Animated.View style={[
            styles.floatingElement,
            styles.element2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.05]
              })
            }
          ]} />
        </View>

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)' }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <ArrowLeft size={20} color={textColor} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: logoScaleAnim }
            ]
          }
        ]}>
          <LinearGradient
            colors={isDark ? ['#4C1D95', '#5B21B6'] : ['#3B82F6', '#1E40AF']}
            style={styles.logoContainer}>
            <Shield size={28} color="#FFFFFF" />
            <Sparkles size={14} color="#A855F7" style={styles.sparkle} />
          </LinearGradient>
          
          <Text style={[styles.title, { color: textColor }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: placeholderColor }]}>
            Sign in to access your AI-powered IT support dashboard
          </Text>
        </Animated.View>

        <Animated.View style={[
          styles.form,
          {
            opacity: fadeAnim,
            transform: [{ translateY: formSlideAnim }]
          }
        ]}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Email Address</Text>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: inputBg,
                borderColor: emailFocused ? '#3B82F6' : borderColor,
                borderWidth: emailFocused ? 2 : 1,
                shadowColor: emailFocused ? '#3B82F6' : '#000',
                shadowOpacity: emailFocused ? 0.1 : 0.05,
              }
            ]}>
              <Mail size={20} color={emailFocused ? '#3B82F6' : placeholderColor} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="your.email@company.com"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
              {email.length > 0 && (
                <View style={styles.validationIcon}>
                  {emailValid ? (
                    <Check size={16} color="#10B981" />
                  ) : (
                    <AlertCircle size={16} color="#EF4444" />
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Password</Text>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: inputBg,
                borderColor: passwordFocused ? '#3B82F6' : borderColor,
                borderWidth: passwordFocused ? 2 : 1,
                shadowColor: passwordFocused ? '#3B82F6' : '#000',
                shadowOpacity: passwordFocused ? 0.1 : 0.05,
              }
            ]}>
              <Lock size={20} color={passwordFocused ? '#3B82F6' : placeholderColor} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Enter your secure password"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}>
                {showPassword ? (
                  <EyeOff size={20} color={placeholderColor} />
                ) : (
                  <Eye size={20} color={placeholderColor} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: formSlideAnim }]
          }
        ]}>
          <TouchableOpacity
            style={[styles.loginButton, { opacity: loading ? 0.8 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}>
            <LinearGradient
              colors={loading 
                ? ['#6B7280', '#4B5563'] 
                : ['#3B82F6', '#1E40AF']
              }
              style={styles.gradientButton}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={[
                    styles.loadingDot,
                    { 
                      opacity: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1]
                      })
                    }
                  ]} />
                  <Text style={styles.loginButtonText}>Signing you in...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In Securely</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            <View style={[styles.dividerContainer, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}>
              <Text style={[styles.dividerText, { color: placeholderColor }]}>or continue with</Text>
            </View>
            <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
          </View>

          <TouchableOpacity
            style={[
              styles.biometricButton, 
              { 
                backgroundColor: inputBg,
                borderColor: borderColor,
                borderWidth: 1,
              }
            ]}
            onPress={handleBiometricLogin}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.biometricIconContainer}>
              <Fingerprint size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.biometricButtonText, { color: textColor }]}>
              Biometric Authentication
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: formSlideAnim }]
          }
        ]}>
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => router.replace('/(tabs)/dashboard')}
            activeOpacity={0.7}>
            <Text style={styles.demoButtonText}>
              Continue with Demo Account
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.securityNote, { color: placeholderColor }]}>
            🔒 Your data is protected with enterprise-grade security
          </Text>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: height * 0.08,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElement: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    borderRadius: 20,
  },
  element1: {
    width: 120,
    height: 120,
    top: height * 0.1,
    right: -40,
    transform: [{ rotate: '45deg' }],
  },
  element2: {
    width: 80,
    height: 80,
    bottom: height * 0.25,
    left: -30,
    transform: [{ rotate: '-30deg' }],
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  validationIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  buttonContainer: {
    gap: 20,
    marginBottom: 20,
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerContainer: {
    paddingHorizontal: 16,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  biometricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    gap: 16,
  },
  demoButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  demoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
    letterSpacing: -0.1,
  },
  securityNote: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
});