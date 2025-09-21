import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Animated, Dimensions, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Zap, Users, BarChart, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Responsive helper function
const useResponsiveDimensions = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  return screenData;
};

// Responsive values
const getResponsiveValue = (width: number, small: number, medium: number, large: number, tablet?: number) => {
  const isTablet = width >= 768;
  const isLargeDevice = width >= 414;
  const isMediumDevice = width >= 375 && width < 414;
  
  if (isTablet && tablet) return tablet;
  if (isLargeDevice) return large;
  if (isMediumDevice) return medium;
  return small;
};

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { width, height } = useResponsiveDimensions();

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
      gradient: ['#8B5CF6', '#A855F7'] as const
    },
    {
      icon: Zap,
      title: 'AI-Powered Solutions',
      description: 'Intelligent ticket analysis and recommendations',
      gradient: ['#F59E0B', '#F97316'] as const
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless communication and handoff workflows',
      gradient: ['#06B6D4', '#0891B2'] as const
    },
    {
      icon: BarChart,
      title: 'Real-time Analytics',
      description: 'Monitor performance and system health',
      gradient: ['#10B981', '#059669'] as const
    }
  ];

  const styles = createResponsiveStyles(isDark, insets, width, height);

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

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        
        {/* Back Button */}
        <Animated.View style={[
          styles.backButtonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <ArrowLeft size={getResponsiveValue(width, 20, 22, 24)} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </Animated.View>
        
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
            <Shield size={getResponsiveValue(width, 28, 32, 36, 40)} color={isDark ? '#FFFFFF' : '#4C1D95'} />
            <Sparkles size={getResponsiveValue(width, 14, 16, 18, 20)} color={isDark ? '#A855F7' : '#8B5CF6'} style={styles.sparkle} />
          </LinearGradient>
          
          <Text style={styles.title}>
            TicketFlow AI
          </Text>
          <Text style={styles.subtitle}>
            Transform your IT support experience with intelligent automation and seamless workflows
          </Text>

          {/* Trust indicators */}
          <View style={styles.trustIndicators}>
            <View style={styles.trustBadge}>
              <Shield size={getResponsiveValue(width, 10, 12, 14)} color="#10B981" />
              <Text style={styles.trustText}>Enterprise Ready</Text>
            </View>
            <View style={styles.trustBadge}>
              <Sparkles size={getResponsiveValue(width, 10, 12, 14)} color="#F59E0B" />
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
                  <feature.icon size={getResponsiveValue(width, 18, 20, 22, 24)} color="#FFFFFF" />
                </LinearGradient>
                
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>
                    {feature.title}
                  </Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
                
                <ArrowRight size={getResponsiveValue(width, 14, 16, 18)} color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)'} />
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
              <ArrowRight size={getResponsiveValue(width, 18, 20, 22)} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/dashboard')}
            activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>
              Explore Demo
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const createResponsiveStyles = (isDark: boolean, insets: any, width: number, height: number) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: getResponsiveValue(width, 16, 20, 24, 32),
      paddingTop: Math.max(insets.top + getResponsiveValue(width, 20, 30, 40, 50), 60),
      paddingBottom: Math.max(insets.bottom + getResponsiveValue(width, 20, 30, 40), 40),
      minHeight: height,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
      minHeight: height - Math.max(insets.top + getResponsiveValue(width, 20, 30, 40, 50), 60) - Math.max(insets.bottom + getResponsiveValue(width, 20, 30, 40), 40),
    },
    backButtonContainer: {
      alignItems: 'flex-start',
      marginBottom: getResponsiveValue(width, 16, 20, 24),
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getResponsiveValue(width, 12, 16, 20),
      paddingVertical: getResponsiveValue(width, 8, 10, 12),
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: getResponsiveValue(width, 8, 10, 12),
      gap: getResponsiveValue(width, 6, 8, 10),
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    backButtonText: {
      fontSize: getResponsiveValue(width, 14, 16, 18),
      fontWeight: '600',
      color: '#FFFFFF',
      letterSpacing: -0.2,
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
      borderRadius: getResponsiveValue(width, 15, 20, 25),
    },
    element1: {
      width: getResponsiveValue(width, 80, 100, 120, 140),
      height: getResponsiveValue(width, 80, 100, 120, 140),
      top: height * 0.15,
      right: getResponsiveValue(width, -25, -30, -35),
    },
    element2: {
      width: getResponsiveValue(width, 50, 60, 70, 80),
      height: getResponsiveValue(width, 50, 60, 70, 80),
      bottom: height * 0.3,
      left: getResponsiveValue(width, -15, -20, -25),
    },
    header: {
      alignItems: 'center',
      marginBottom: getResponsiveValue(width, 24, 32, 40, 48),
    },
    logoContainer: {
      width: getResponsiveValue(width, 64, 72, 80, 88),
      height: getResponsiveValue(width, 64, 72, 80, 88),
      borderRadius: getResponsiveValue(width, 16, 20, 24),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: getResponsiveValue(width, 16, 20, 24),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: getResponsiveValue(width, 6, 8, 10) },
      shadowOpacity: 0.3,
      shadowRadius: getResponsiveValue(width, 12, 16, 20),
      elevation: 12,
      position: 'relative',
    },
    sparkle: {
      position: 'absolute',
      top: getResponsiveValue(width, 6, 8, 10),
      right: getResponsiveValue(width, 6, 8, 10),
    },
    title: {
      fontSize: getResponsiveValue(width, 24, 28, 32, 36),
      fontWeight: '800',
      marginBottom: getResponsiveValue(width, 8, 12, 16),
      textAlign: 'center',
      letterSpacing: -0.5,
      color: '#FFFFFF',
      paddingHorizontal: getResponsiveValue(width, 8, 12, 16),
    },
    subtitle: {
      fontSize: getResponsiveValue(width, 14, 16, 18, 20),
      textAlign: 'center',
      lineHeight: getResponsiveValue(width, 20, 24, 28),
      paddingHorizontal: getResponsiveValue(width, 12, 16, 20, 24),
      marginBottom: getResponsiveValue(width, 16, 20, 24),
      fontWeight: '400',
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    },
    trustIndicators: {
      flexDirection: 'row',
      gap: getResponsiveValue(width, 8, 12, 16),
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    trustBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: getResponsiveValue(width, 8, 10, 12),
      paddingVertical: getResponsiveValue(width, 4, 6, 8),
      borderRadius: getResponsiveValue(width, 10, 12, 14),
      gap: getResponsiveValue(width, 3, 4, 5),
    },
    trustText: {
      fontSize: getResponsiveValue(width, 10, 11, 12),
      color: '#FFFFFF',
      fontWeight: '600',
    },
    featuresContainer: {
      flex: 1,
      justifyContent: 'center',
      gap: getResponsiveValue(width, 10, 12, 16),
      minHeight: width >= 768 ? 400 : 280,
      maxHeight: width >= 768 ? undefined : height * 0.5,
      paddingVertical: getResponsiveValue(width, 8, 12, 16),
    },
    featureCard: {
      borderRadius: getResponsiveValue(width, 12, 16, 20),
      overflow: 'hidden',
    },
    featureCardGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getResponsiveValue(width, 14, 18, 22, 26),
      gap: getResponsiveValue(width, 10, 14, 18),
      borderRadius: getResponsiveValue(width, 12, 16, 20),
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      minHeight: getResponsiveValue(width, 70, 80, 90, 100),
    },
    featureIconContainer: {
      width: getResponsiveValue(width, 36, 40, 44, 48),
      height: getResponsiveValue(width, 36, 40, 44, 48),
      borderRadius: getResponsiveValue(width, 10, 12, 14),
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
      paddingRight: getResponsiveValue(width, 8, 12, 16),
    },
    featureTitle: {
      fontSize: getResponsiveValue(width, 14, 16, 18, 20),
      fontWeight: '700',
      marginBottom: getResponsiveValue(width, 2, 4, 6),
      letterSpacing: -0.2,
      color: '#FFFFFF',
      lineHeight: getResponsiveValue(width, 18, 22, 24),
    },
    featureDescription: {
      fontSize: getResponsiveValue(width, 11, 13, 15, 16),
      lineHeight: getResponsiveValue(width, 16, 18, 22),
      fontWeight: '400',
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.8)',
    },
    buttonContainer: {
      gap: getResponsiveValue(width, 12, 14, 16),
      marginTop: getResponsiveValue(width, 24, 32, 40),
    },
    primaryButton: {
      height: getResponsiveValue(width, 52, 56, 60, 64),
      borderRadius: getResponsiveValue(width, 12, 16, 20),
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: getResponsiveValue(width, 6, 8, 10) },
      shadowOpacity: 0.3,
      shadowRadius: getResponsiveValue(width, 12, 16, 20),
      elevation: 12,
    },
    primaryButtonGradient: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: getResponsiveValue(width, 12, 16, 20),
      gap: getResponsiveValue(width, 6, 8, 10),
      paddingHorizontal: getResponsiveValue(width, 20, 24, 28),
    },
    primaryButtonText: {
      fontSize: getResponsiveValue(width, 16, 18, 20, 22),
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },
    secondaryButton: {
      height: getResponsiveValue(width, 52, 56, 60, 64),
      borderRadius: getResponsiveValue(width, 12, 16, 20),
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)',
      paddingHorizontal: getResponsiveValue(width, 20, 24, 28),
    },
    secondaryButtonText: {
      fontSize: getResponsiveValue(width, 14, 16, 18, 20),
      fontWeight: '600',
      letterSpacing: -0.2,
      color: '#FFFFFF',
    },
  });
};