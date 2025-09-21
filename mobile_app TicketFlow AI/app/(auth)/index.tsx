import { View, Text, StyleSheet, Image, TouchableOpacity, useColorScheme, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Zap, Users, ChartBar as BarChart, ArrowRight, Sparkles } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const featureAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(150, 
        featureAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Biometric login with enterprise-grade security',
      gradient: ['#8B5CF6', '#A855F7']
    },
    {
      icon: Zap,
      title: 'AI-Powered Solutions',
      description: 'Intelligent ticket analysis and recommendations',
      gradient: ['#F59E0B', '#F97316']
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless communication and handoff workflows',
      gradient: ['#06B6D4', '#0891B2']
    },
    {
      icon: BarChart,
      title: 'Real-time Analytics',
      description: 'Monitor performance and system health',
      gradient: ['#10B981', '#059669']
    }
  ];

  return (
    <LinearGradient
      colors={isDark 
        ? ['#0F0F23', '#1A1B3A', '#2D1B69'] 
        : ['#667EEA', '#764BA2', '#4338CA']
      }
      style={styles.container}>
      
      {/* Animated background elements */}
      <View style={styles.backgroundElements}>
        <Animated.View style={[
          styles.floatingElement,
          styles.element1,
          {
            opacity: fadeAnim,
            transform: [{ rotate: '45deg' }]
          }
        ]} />
        <Animated.View style={[
          styles.floatingElement,
          styles.element2,
          {
            opacity: fadeAnim,
            transform: [{ rotate: '-30deg' }]
          }
        ]} />
      </View>

      <Animated.View style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
        <LinearGradient
          colors={isDark ? ['#4C1D95', '#5B21B6'] : ['#FFFFFF', '#F3F4F6']}
          style={styles.logoContainer}>
          <Shield size={32} color={isDark ? '#FFFFFF' : '#4C1D95'} />
          <Sparkles size={16} color={isDark ? '#A855F7' : '#8B5CF6'} style={styles.sparkle} />
        </LinearGradient>
        
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#FFFFFF' }]}>
          TicketFlow AI
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)' }]}>
          Transform your IT support experience with intelligent automation and seamless workflows
        </Text>

        {/* Trust indicators */}
        <View style={styles.trustIndicators}>
          <View style={styles.trustBadge}>
            <Shield size={12} color="#10B981" />
            <Text style={styles.trustText}>Enterprise Ready</Text>
          </View>
          <View style={styles.trustBadge}>
            <Sparkles size={12} color="#F59E0B" />
            <Text style={styles.trustText}>AI Powered</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <Animated.View
            key={index}
            style={[
              styles.featureCard,
              {
                opacity: featureAnims[index],
                transform: [
                  {
                    translateY: featureAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  },
                  {
                    scale: featureAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1]
                    })
                  }
                ]
              }
            ]}>
            <LinearGradient
              colors={[
                isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'
              ]}
              style={styles.featureCardGradient}>
              
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureIconContainer}>
                <feature.icon size={20} color="#FFFFFF" />
              </LinearGradient>
              
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#FFFFFF' }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.8)' }]}>
                  {feature.description}
                </Text>
              </View>
              
              <ArrowRight size={16} color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)'} />
            </LinearGradient>
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[
        styles.buttonContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}>
          <LinearGradient
            colors={isDark ? ['#059669', '#10B981'] : ['#10B981', '#059669']}
            style={styles.primaryButtonGradient}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'
            }
          ]}
          onPress={() => router.push('/(tabs)/dashboard')}
          activeOpacity={0.8}>
          <Text style={[styles.secondaryButtonText, { color: isDark ? '#FFFFFF' : '#FFFFFF' }]}>
            Explore Demo
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: height * 0.08,
    paddingBottom: 40,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  element1: {
    width: 100,
    height: 100,
    top: height * 0.15,
    right: -30,
  },
  element2: {
    width: 60,
    height: 60,
    bottom: height * 0.3,
    left: -20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontWeight: '400',
  },
  trustIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 4 },
    //shadowOpacity: 0.1,
    //shadowRadius: 12,
    //elevation: 6,
  },
  featureCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  buttonContainer: {
    gap: 14,
    marginTop: 32,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.1,
    //shadowRadius: 8,
    //elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});