import { View, Text, StyleSheet, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Zap, Users, ChartBar as BarChart } from 'lucide-react-native';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Biometric login with enterprise-grade security'
    },
    {
      icon: Zap,
      title: 'AI-Powered Solutions',
      description: 'Intelligent ticket analysis and recommendations'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless communication and handoff workflows'
    },
    {
      icon: BarChart,
      title: 'Real-time Analytics',
      description: 'Monitor performance and system health'
    }
  ];

  return (
    <LinearGradient
      colors={isDark ? ['#1F2937', '#111827'] : ['#3B82F6', '#1E40AF']}
      style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: isDark ? '#374151' : 'rgba(255, 255, 255, 0.2)' }]}>
          <Shield size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>TicketFlow AI</Text>
        <Text style={styles.subtitle}>
          Your AI-powered IT support companion for seamless ticket management on the go
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={[styles.featureCard, { backgroundColor: isDark ? '#374151' : 'rgba(255, 255, 255, 0.15)' }]}>
            <feature.icon size={24} color="#FFFFFF" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: isDark ? '#059669' : '#10B981' }]}
          onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }]}
          onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={styles.secondaryButtonText}>Demo Mode</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
    marginTop: 40,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});