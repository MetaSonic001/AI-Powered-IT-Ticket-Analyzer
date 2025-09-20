import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  Switch,
  Alert
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Sun, Smartphone, Database, Award, ChartBar as BarChart, MessageSquare } from 'lucide-react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [darkMode, setDarkMode] = useState(isDark);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(true);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? '#374151' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const userStats = [
    { label: 'Tickets Resolved', value: '156', color: '#10B981' },
    { label: 'Response Time', value: '4.2m', color: '#3B82F6' },
    { label: 'Customer Rating', value: '4.8', color: '#F59E0B' },
    { label: 'Streak Days', value: '12', color: '#8B5CF6' },
  ];

  const achievements = [
    { title: 'Quick Responder', description: 'Responded to 50 tickets in under 5 minutes', icon: Award },
    { title: 'Problem Solver', description: 'Resolved 100 tickets this month', icon: BarChart },
    { title: 'Team Player', description: 'Helped 10 colleagues with solutions', icon: MessageSquare },
  ];

  const menuItems = [
    {
      title: 'Account Settings',
      subtitle: 'Personal information and preferences',
      icon: User,
      action: () => {},
    },
    {
      title: 'Notification Settings',
      subtitle: 'Manage your alert preferences',
      icon: Bell,
      action: () => {},
    },
    {
      title: 'Security & Privacy',
      subtitle: 'Password, biometrics, and privacy',
      icon: Shield,
      action: () => {},
    },
    {
      title: 'Data & Storage',
      subtitle: 'Offline data and sync settings',
      icon: Database,
      action: () => {},
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
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
          onPress: () => router.replace('/(auth)/')
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: '#3B82F6' }]}>
          <Text style={styles.avatarText}>SJ</Text>
        </View>
        <Text style={[styles.name, { color: textColor }]}>Sarah Johnson</Text>
        <Text style={[styles.role, { color: subTextColor }]}>Senior IT Support Specialist</Text>
        <Text style={[styles.email, { color: subTextColor }]}>sarah.johnson@company.com</Text>
      </View>

      {/* Performance Stats */}
      <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.statsTitle, { color: textColor }]}>Performance This Month</Text>
        <View style={styles.statsGrid}>
          {userStats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Achievements</Text>
        <View style={styles.achievementsList}>
          {achievements.map((achievement, index) => (
            <View key={index} style={[styles.achievementCard, { backgroundColor: cardBg }]}>
              <View style={[styles.achievementIcon, { backgroundColor: '#10B981' + '20' }]}>
                <achievement.icon size={20} color="#10B981" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementTitle, { color: textColor }]}>
                  {achievement.title}
                </Text>
                <Text style={[styles.achievementDescription, { color: subTextColor }]}>
                  {achievement.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Settings</Text>
        <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              {isDark ? <Moon size={20} color={textColor} /> : <Sun size={20} color={textColor} />}
              <Text style={[styles.settingTitle, { color: textColor }]}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: subTextColor, true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: isDark ? '#4B5563' : '#E5E7EB' }]}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={textColor} />
              <Text style={[styles.settingTitle, { color: textColor }]}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: subTextColor, true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: isDark ? '#4B5563' : '#E5E7EB' }]}>
            <View style={styles.settingInfo}>
              <Smartphone size={20} color={textColor} />
              <Text style={[styles.settingTitle, { color: textColor }]}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
              trackColor={{ false: subTextColor, true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index !== menuItems.length - 1 && styles.menuItemBorder,
                { borderBottomColor: isDark ? '#4B5563' : '#E5E7EB' }
              ]}
              onPress={item.action}>
              <item.icon size={20} color={subTextColor} />
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: textColor }]}>{item.title}</Text>
                <Text style={[styles.menuSubtitle, { color: subTextColor }]}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={16} color={subTextColor} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: cardBg, borderColor: '#EF4444' }]}
          onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: subTextColor }]}>
          TicketFlow AI v1.0.0
        </Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  statsCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingRowBorder: {
    borderTopWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 24,
  },
});