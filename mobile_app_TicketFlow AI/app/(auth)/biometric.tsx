import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Fingerprint, Shield, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function BiometricScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    
    // Haptic feedback
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Simulate biometric authentication
    setTimeout(() => {
      setAuthSuccess(true);
      setIsAuthenticating(false);
      
      if (Haptics.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 1000);
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}>
        <ArrowLeft size={24} color={textColor} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {authSuccess ? (
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.successIcon}>
              <CheckCircle size={60} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={isAuthenticating ? ['#3B82F6', '#1E40AF'] : ['#6B7280', '#4B5563']}
              style={[styles.biometricIcon, isAuthenticating && styles.authenticatingIcon]}>
              <Fingerprint size={60} color="#FFFFFF" />
            </LinearGradient>
          )}
        </View>

        <Text style={[styles.title, { color: textColor }]}>
          {authSuccess ? 'Authentication Successful!' : 
           isAuthenticating ? 'Authenticating...' : 'Biometric Authentication'}
        </Text>

        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {authSuccess ? 'Welcome back! Redirecting to your dashboard...' :
           isAuthenticating ? 'Please wait while we verify your identity' :
           'Use your fingerprint, Face ID, or other biometric method to securely access your account'}
        </Text>

        {!authSuccess && !isAuthenticating && (
          <>
            <View style={styles.securityFeatures}>
              <View style={styles.securityItem}>
                <Shield size={20} color="#10B981" />
                <Text style={[styles.securityText, { color: textColor }]}>
                  Enterprise-grade security
                </Text>
              </View>
              <View style={styles.securityItem}>
                <Shield size={20} color="#10B981" />
                <Text style={[styles.securityText, { color: textColor }]}>
                  Your data stays on device
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleBiometricAuth}>
              <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.gradientButton}>
                <Fingerprint size={24} color="#FFFFFF" />
                <Text style={styles.authButtonText}>Authenticate</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.fallbackButton}
              onPress={() => router.back()}>
              <Text style={[styles.fallbackText, { color: '#3B82F6' }]}>
                Use Password Instead
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
    marginBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  iconContainer: {
    marginBottom: 40,
  },
  biometricIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  authenticatingIcon: {
    transform: [{ scale: 1.05 }],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  securityFeatures: {
    gap: 16,
    marginBottom: 40,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  authButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fallbackButton: {
    paddingVertical: 16,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '500',
  },
});