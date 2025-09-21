import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  Switch,
  Alert,
  Dimensions
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTickets } from '../../contexts/TicketContext';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Sun, Smartphone, Database, Award, ChartBar as BarChart, MessageSquare, Sparkles, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state } = useTickets();
  const [darkMode, setDarkMode] = useState(isDark);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(true);

  const userStats = [
    { 
      label: 'Tickets Resolved', 
      value: state.tickets.filter(t => t.status === 'Resolved').length.toString(), 
      color: '#10B981', 
      gradient: ['#10B981', '#059669'] 
    },
    { 
      label: 'Response Time', 
      value: state.stats.avgResponseTime, 
      color: '#3B82F6', 
      gradient: ['#3B82F6', '#2563EB'] 
    },
    { 
      label: 'Customer Rating', 
      value: state.stats.satisfaction.toString(), 
      color: '#F59E0B', 
      gradient: ['#F59E0B', '#F97316'] 
    },
    { 
      label: 'Streak Days', 
      value: '12', 
      color: '#8B5CF6', 
      gradient: ['#8B5CF6', '#A855F7'] 
    },
  ];

  const achievements = [
    { 
      title: 'Quick Responder', 
      description: 'Responded to 50 tickets in under 5 minutes', 
      icon: Award,
      gradient: ['#10B981', '#059669']
    },
    { 
      title: 'Problem Solver', 
      description: 'Resolved 100 tickets this month', 
      icon: BarChart,
      gradient: ['#3B82F6', '#2563EB']
    },
    { 
      title: 'Team Player', 
      description: 'Helped 10 colleagues with solutions', 
      icon: MessageSquare,
      gradient: ['#F59E0B', '#F97316']
    },
  ];

  const menuItems = [
    {
      title: 'Account Settings',
      subtitle: 'Personal information and preferences',
      icon: User,
      gradient: ['#8B5CF6', '#A855F7'],
      action: () => {},
    },
    {
      title: 'Notification Settings',
      subtitle: 'Manage your alert preferences',
      icon: Bell,
      gradient: ['#F59E0B', '#F97316'],
      action: () => {},
    },
    {
      title: 'Security & Privacy',
      subtitle: 'Password, biometrics, and privacy',
      icon: Shield,
      gradient: ['#06B6D4', '#0891B2'],
      action: () => {},
    },
    {
      title: 'Data & Storage',
      subtitle: 'Offline data and sync settings',
      icon: Database,
      gradient: ['#10B981', '#059669'],
      action: () => {},
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      gradient: ['#3B82F6', '#2563EB'],
      action: () => {},
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => router.replace('/(auth)')
        },
      ]
    );
  };

  return (
    <LinearGradient
    colors={isDark 
      ? ['#0F0F23', '#1A1B3A'] 
      : ['#F8FAFC', '#E2E8F0']
      }
      style={styles.container}>
      
      

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.avatarContainer}>
            <Text style={styles.avatarText}>SJ</Text>
            <Sparkles size={16} color="#FFFFFF" style={styles.sparkle} />
          </LinearGradient>
          
          <Text style={styles.name}>Sarah Johnson</Text>
          <Text style={styles.role}>Senior IT Support Specialist</Text>
          <Text style={styles.email}>sarah.johnson@company.com</Text>

          {/* Status badges */}
          <View style={styles.statusBadges}>
            <View style={styles.statusBadge}>
              <Star size={12} color="#F59E0B" />
              <Text style={styles.statusText}>Top Performer</Text>
            </View>
            <View style={styles.statusBadge}>
              <Shield size={12} color="#10B981" />
              <Text style={styles.statusText}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance This Month</Text>
          <View style={styles.statsGrid}>
            {userStats.map((stat, index) => (
              <View
                key={index}
                style={styles.statCard}>
                <LinearGradient
                  colors={stat.gradient as [string, string]}
                  style={styles.statIconContainer}>
                  <BarChart size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <LinearGradient
                key={index}
                colors={[
                  isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                  isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'
                ]}
                style={styles.achievementCard}>
                <LinearGradient
                  colors={achievement.gradient as [string, string]}
                  style={styles.achievementIconContainer}>
                  <achievement.icon size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
                <ChevronRight size={16} color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)'} />
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          <LinearGradient
            colors={[
              isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
              isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'
            ]}
            style={styles.settingsCard}>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <LinearGradient
                  colors={['#F59E0B', '#F97316']}
                  style={styles.settingIconContainer}>
                  {isDark ? <Moon size={16} color="#FFFFFF" /> : <Sun size={16} color="#FFFFFF" />}
                </LinearGradient>
                <Text style={styles.settingTitle}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.settingIconContainer}>
                  <Bell size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.settingTitle}>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <LinearGradient
                  colors={['#06B6D4', '#0891B2']}
                  style={styles.settingIconContainer}>
                  <Smartphone size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.settingTitle}>Biometric Authentication</Text>
              </View>
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </LinearGradient>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.action}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[
                    isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                    isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'
                  ]}
                  style={styles.menuItem}>
                  <LinearGradient
                    colors={item.gradient as [string, string]}
                    style={styles.menuIconContainer}>
                    <item.icon size={18} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={16} color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)'} />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.logoutButtonGradient}>
              <LogOut size={20} color="#FFFFFF" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>
            TicketFlow AI v1.0.0
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 80,
    height: 80,
    top: height * 0.2,
    right: -20,
    transform: [{ rotate: '45deg' }],
  },
  element2: {
    width: 60,
    height: 60,
    bottom: height * 0.4,
    left: -15,
    transform: [{ rotate: '-30deg' }],
  },
  element3: {
    width: 40,
    height: 40,
    top: height * 0.6,
    right: 20,
    transform: [{ rotate: '15deg' }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: height * 0.08,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
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
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  role: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 72) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor:'rgba(55, 65, 81, 0.5)'
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementIconContainer: {
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
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  achievementDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    fontWeight: '400',
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    fontWeight: '400',
  },
  logoutButton: {
    borderRadius: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  bottomPadding: {
    height: 32,
  },
});