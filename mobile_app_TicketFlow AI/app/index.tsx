import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const FeatureCard = ({ icon, title, description }: { 
    icon: string; 
    title: string; 
    description: string; 
  }) => (
    <Animated.View 
      style={[
        styles.featureCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={28} color="#3B82F6" />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </Animated.View>
  );

  const ActionButton = ({ 
    title, 
    subtitle, 
    href, 
    icon, 
    primary = false 
  }: { 
    title: string; 
    subtitle: string; 
    href: string; 
    icon: string; 
    primary?: boolean; 
  }) => {
    const buttonScale = useRef(new Animated.Value(1)).current;
    const buttonGlow = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    // Subtle pulsing animation for primary button
    useEffect(() => {
      if (primary) {
        const pulse = () => {
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.02,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]).start(() => pulse());
        };
        pulse();
      }
    }, [primary, pulseAnim]);
    
    const animatePress = () => {
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 0.96,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(buttonGlow, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const animateRelease = () => {
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(buttonGlow, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <Link href={href as any} asChild>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            primary ? styles.primaryButton : styles.secondaryButton
          ]}
          activeOpacity={1}
          onPressIn={animatePress}
          onPressOut={animateRelease}
        >
          <Animated.View style={[
            styles.buttonWrapper,
            {
              transform: [
                { scale: Animated.multiply(buttonScale, primary ? pulseAnim : 1) }
              ],
              opacity: buttonGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.9],
              }),
            }
          ]}>
            <LinearGradient
              colors={primary 
                ? ['#FF6B6B', '#FF8E53', '#FF6B95'] 
                : ['#667EEA', '#764BA2', '#F093FB']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.buttonContent}>
                <View style={[
                  styles.buttonIcon,
                  primary ? styles.primaryButtonIcon : styles.secondaryButtonIcon
                ]}>
                  <Ionicons 
                    name={icon as any} 
                    size={28} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.buttonText}>
                  <Text style={[
                    styles.buttonTitle,
                    { color: '#FFFFFF' }
                  ]}>
                    {title}
                  </Text>
                  <Text style={[
                    styles.buttonSubtitle,
                    { color: 'rgba(255, 255, 255, 0.9)' }
                  ]}>
                    {subtitle}
                  </Text>
                </View>
                <View style={styles.buttonArrow}>
                  <Ionicons 
                    name="arrow-forward" 
                    size={24} 
                    color="rgba(255, 255, 255, 0.9)" 
                  />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={['#1E293B', '#334155', '#475569']}
          style={styles.header}
        >
          <Animated.View 
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Logo/Icon */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#3B82F6', '#6366F1', '#8B5CF6']}
                style={styles.logoGradient}
              >
                <Ionicons name="ticket" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>

            {/* Main Title */}
            <Text style={styles.mainTitle}>TicketFlow AI</Text>
            <Text style={styles.tagline}>Intelligent IT Support Management</Text>
            
            {/* Description */}
            <Text style={styles.description}>
              Streamline your IT operations with AI-powered ticket analysis, 
              smart prioritization, and automated solution recommendations.
            </Text>

            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>95%</Text>
                <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>Accuracy</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2.5x</Text>
                <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>Faster</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>Available</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Animated.Text 
            style={[
              styles.sectionTitle,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            Key Features
          </Animated.Text>

          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="flash"
              title="AI-Powered Analysis"
              description="Instant ticket classification and priority assessment"
            />
            <FeatureCard
              icon="analytics"
              title="Smart Analytics"
              description="Real-time insights and performance metrics"
            />
            <FeatureCard
              icon="bulb"
              title="Solution Recommendations"
              description="Automated suggestions from knowledge base"
            />
            <FeatureCard
              icon="shield-checkmark"
              title="Enterprise Security"
              description="Bank-level security with data encryption"
            />
          </View>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          <Animated.Text 
            style={[
              styles.sectionTitle,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            Get Started
          </Animated.Text>

          <Animated.View 
            style={[
              styles.buttonsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >

            <ActionButton
              title="Get Started"
              subtitle="Create your first IT ticket now"
              href="/tickets/create"
              icon="add-circle"
              primary={true}
            />

            <ActionButton
              title="Sign In / Register"
              subtitle="Create account or sign in to continue"
              href="/(auth)"
              icon="person"
              primary={false}
            />
          </Animated.View>

          {/* Quick Access */}
          <Animated.View 
            style={[
              styles.quickAccessContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.quickAccessTitle}>Quick Access</Text>
            <View style={styles.quickAccessButtons}>
              <TouchableOpacity style={styles.quickAccessButton}>
                <Ionicons name="help-circle" size={20} color="#6366F1" />
                <Text style={styles.quickAccessText}>Help</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAccessButton}>
                <Ionicons name="document-text" size={20} color="#6366F1" />
                <Text style={styles.quickAccessText}>Docs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAccessButton}>
                <Ionicons name="call" size={20} color="#6366F1" />
                <Text style={styles.quickAccessText}>Support</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 TicketFlow AI</Text>
          <Text style={styles.footerSubtext}>Powered by advanced AI technology</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header Styles
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: '#E2E8F0',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  
  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0, // Allow flex items to shrink
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    flexShrink: 0,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  
  // Features Styles
  featuresSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Actions Styles
  actionsSection: {
    padding: 24,
    paddingTop: 8,
  },
  buttonsContainer: {
    gap: 16,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButton: {
    marginBottom: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  secondaryButton: {
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 24,
    minHeight: 90,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  buttonSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.9,
  },
  buttonArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Quick Access Styles
  quickAccessContainer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickAccessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAccessButton: {
    alignItems: 'center',
    padding: 12,
  },
  quickAccessText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 8,
  },
  
  // Footer Styles
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
});