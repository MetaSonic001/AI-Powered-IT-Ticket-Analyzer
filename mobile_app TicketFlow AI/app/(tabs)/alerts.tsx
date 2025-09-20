import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  Switch
} from 'react-native';
import { useState } from 'react';
import { Bell, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, Clock, Server, Wifi, Database, Shield, Settings } from 'lucide-react-native';

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? '#374151' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const alerts = [
    {
      id: '1',
      type: 'critical',
      title: 'Server CPU Usage Critical',
      message: 'Database server CPU usage has reached 95% and requires immediate attention',
      time: '2 minutes ago',
      icon: Server,
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Network Latency High',
      message: 'Network response times are 40% above normal baseline',
      time: '15 minutes ago',
      icon: Wifi,
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Scheduled Maintenance Reminder',
      message: 'System maintenance scheduled for tonight at 11 PM EST',
      time: '1 hour ago',
      icon: Clock,
      read: true,
    },
    {
      id: '4',
      type: 'success',
      title: 'Backup Completed Successfully',
      message: 'Daily database backup completed without errors',
      time: '2 hours ago',
      icon: Database,
      read: true,
    },
    {
      id: '5',
      type: 'warning',
      title: 'Security Update Available',
      message: 'Critical security patches available for Windows servers',
      time: '3 hours ago',
      icon: Shield,
      read: false,
    },
  ];

  const systemStatus = [
    { name: 'Web Servers', status: 'operational', uptime: '99.9%' },
    { name: 'Database', status: 'warning', uptime: '98.2%' },
    { name: 'Email Service', status: 'operational', uptime: '99.8%' },
    { name: 'File Storage', status: 'operational', uptime: '100%' },
    { name: 'Backup System', status: 'operational', uptime: '99.5%' },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'success': return '#10B981';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Alerts & Monitoring</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {unreadCount} new notifications
          </Text>
        </View>
        <TouchableOpacity style={[styles.settingsButton, { backgroundColor: cardBg }]}>
          <Settings size={20} color={subTextColor} />
        </TouchableOpacity>
      </View>

      {/* Notification Settings */}
      <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Bell size={20} color={textColor} />
            <Text style={[styles.settingTitle, { color: textColor }]}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: subTextColor, true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* System Status Overview */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>System Status</Text>
        <View style={styles.statusGrid}>
          {systemStatus.map((system, index) => (
            <View key={index} style={[styles.statusCard, { backgroundColor: cardBg }]}>
              <View style={styles.statusHeader}>
                <Text style={[styles.statusName, { color: textColor }]}>{system.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(system.status) }]} />
              </View>
              <Text style={[styles.statusUptime, { color: subTextColor }]}>
                Uptime: {system.uptime}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Alerts */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Alerts</Text>
        <View style={styles.alertsList}>
          {alerts.map((alert) => (
            <TouchableOpacity 
              key={alert.id} 
              style={[
                styles.alertCard, 
                { 
                  backgroundColor: cardBg,
                  opacity: alert.read ? 0.7 : 1,
                }
              ]}>
              
              {/* Alert Indicator */}
              <View 
                style={[
                  styles.alertIndicator, 
                  { backgroundColor: getAlertColor(alert.type) }
                ]} 
              />
              
              <View style={styles.alertIcon}>
                <alert.icon size={20} color={getAlertColor(alert.type)} />
              </View>
              
              <View style={styles.alertContent}>
                <View style={styles.alertHeader}>
                  <Text 
                    style={[
                      styles.alertTitle, 
                      { color: textColor },
                      !alert.read && styles.unreadAlert
                    ]} 
                    numberOfLines={1}>
                    {alert.title}
                  </Text>
                  <Text style={[styles.alertTime, { color: subTextColor }]}>
                    {alert.time}
                  </Text>
                </View>
                
                <Text 
                  style={[styles.alertMessage, { color: subTextColor }]} 
                  numberOfLines={2}>
                  {alert.message}
                </Text>
                
                <View style={styles.alertActions}>
                  <Text 
                    style={[
                      styles.alertType, 
                      { 
                        color: getAlertColor(alert.type),
                        backgroundColor: getAlertColor(alert.type) + '20',
                      }
                    ]}>
                    {alert.type.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardBg }]}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={[styles.actionText, { color: textColor }]}>View All Alerts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardBg }]}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={[styles.actionText, { color: textColor }]}>Mark All Read</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardBg }]}>
            <Server size={20} color="#3B82F6" />
            <Text style={[styles.actionText, { color: textColor }]}>System Health</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsCard: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
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
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusName: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusUptime: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  alertIndicator: {
    width: 4,
  },
  alertIcon: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  unreadAlert: {
    fontWeight: '700',
  },
  alertTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertActions: {
    flexDirection: 'row',
  },
  alertType: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
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
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 24,
  },
});