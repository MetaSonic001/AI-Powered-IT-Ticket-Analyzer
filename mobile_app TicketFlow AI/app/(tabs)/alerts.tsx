import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  Switch,
  RefreshControl
} from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  TriangleAlert as AlertTriangle, 
  CircleCheck as CheckCircle, 
  Info, 
  Clock, 
  Server, 
  Wifi, 
  Database, 
  Shield, 
  Settings,
  Filter,
  Eye,
  EyeOff,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react-native';

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? 'rgba(55, 65, 81, 0.9)' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const backgroundColor = isDark ? '#0F0F23' : '#F8FAFC';

  const alerts = [
    {
      id: '1',
      type: 'critical',
      title: 'Database Server Critical Alert',
      message: 'CPU usage at 95%, memory at 92%. Immediate intervention required to prevent service disruption.',
      time: '2 minutes ago',
      icon: Server,
      read: false,
      priority: 'P1',
      source: 'Auto-Monitor',
      affectedSystems: 3,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Network Performance Degradation',
      message: 'Response times 40% above baseline. AI suggests checking router configuration and bandwidth usage.',
      time: '15 minutes ago',
      icon: Wifi,
      read: false,
      priority: 'P2',
      source: 'AI Monitor',
      affectedSystems: 1,
    },
    {
      id: '3',
      type: 'info',
      title: 'Scheduled Maintenance Window',
      message: 'System maintenance tonight 11 PM - 2 AM EST. All services will be temporarily unavailable.',
      time: '1 hour ago',
      icon: Clock,
      read: true,
      priority: 'P4',
      source: 'Schedule',
      affectedSystems: 5,
    },
    {
      id: '4',
      type: 'success',
      title: 'Backup Process Completed',
      message: 'Daily incremental backup finished successfully. 847GB backed up with zero errors.',
      time: '2 hours ago',
      icon: Database,
      read: true,
      priority: 'P4',
      source: 'Backup System',
      affectedSystems: 0,
    },
    {
      id: '5',
      type: 'warning',
      title: 'Security Updates Available',
      message: 'Critical patches for Windows Server 2019. AI recommends immediate deployment during next maintenance window.',
      time: '3 hours ago',
      icon: Shield,
      read: false,
      priority: 'P2',
      source: 'Security Scanner',
      affectedSystems: 12,
    },
  ];

  const systemStatus = [
    { 
      name: 'Web Servers', 
      status: 'operational', 
      uptime: '99.9%',
      responseTime: '120ms',
      load: '42%'
    },
    { 
      name: 'Database Cluster', 
      status: 'warning', 
      uptime: '98.2%',
      responseTime: '340ms',
      load: '87%'
    },
    { 
      name: 'Email Service', 
      status: 'operational', 
      uptime: '99.8%',
      responseTime: '89ms',
      load: '23%'
    },
    { 
      name: 'File Storage', 
      status: 'operational', 
      uptime: '100%',
      responseTime: '45ms',
      load: '34%'
    },
    { 
      name: 'Backup System', 
      status: 'operational', 
      uptime: '99.5%',
      responseTime: '67ms',
      load: '12%'
    },
    { 
      name: 'Security Gateway', 
      status: 'operational', 
      uptime: '99.7%',
      responseTime: '78ms',
      load: '56%'
    },
  ];

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'critical': return { 
        color: '#EF4444', 
        gradient: ['#EF4444', '#DC2626'],
        bgColor: 'rgba(239, 68, 68, 0.1)'
      };
      case 'warning': return { 
        color: '#F59E0B', 
        gradient: ['#F59E0B', '#D97706'],
        bgColor: 'rgba(245, 158, 11, 0.1)'
      };
      case 'success': return { 
        color: '#10B981', 
        gradient: ['#10B981', '#059669'],
        bgColor: 'rgba(16, 185, 129, 0.1)'
      };
      case 'info': return { 
        color: '#3B82F6', 
        gradient: ['#3B82F6', '#1E40AF'],
        bgColor: 'rgba(59, 130, 246, 0.1)'
      };
      default: return { 
        color: '#6B7280', 
        gradient: ['#6B7280', '#4B5563'],
        bgColor: 'rgba(107, 114, 128, 0.1)'
      };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'operational': return { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
      case 'warning': return { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
      case 'critical': return { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
      default: return { color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical').length;
  const filteredAlerts = showOnlyUnread ? alerts.filter(alert => !alert.read) : alerts;
  const operationalSystems = systemStatus.filter(system => system.status === 'operational').length;

  return (
    <LinearGradient
      colors={isDark 
        ? ['#0F0F23', '#1A1B3A'] 
        : ['#F8FAFC', '#E2E8F0']
      }
      style={styles.container}>
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTitleContainer}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.headerIcon}>
                <Activity size={20} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.title, { color: textColor }]}>System Alerts</Text>
                <View style={styles.headerStats}>
                  <View style={styles.statBadge}>
                    <AlertCircle size={12} color="#EF4444" />
                    <Text style={[styles.statText, { color: '#EF4444' }]}>{criticalCount} Critical</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <Text style={[styles.statText, { color: subTextColor }]}>
                    {unreadCount} unread
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: cardBg }]}
              onPress={() => setShowOnlyUnread(!showOnlyUnread)}
              activeOpacity={0.8}>
              {showOnlyUnread ? (
                <Eye size={18} color="#3B82F6" />
              ) : (
                <EyeOff size={18} color={subTextColor} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: cardBg }]}
              activeOpacity={0.8}>
              <Filter size={18} color={subTextColor} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: cardBg }]}
              activeOpacity={0.8}>
              <Settings size={18} color={subTextColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* System Health Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={18} color="#10B981" />
              <Text style={[styles.sectionTitle, { color: textColor }]}>System Health</Text>
            </View>
            <View style={styles.healthBadge}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={styles.healthText}>
                {operationalSystems}/{systemStatus.length} Operational
              </Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statusGrid}>
              {systemStatus.map((system, index) => {
                const statusConfig = getStatusConfig(system.status);
                
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.statusCard, { backgroundColor: cardBg }]}
                    activeOpacity={0.8}>
                    <View style={styles.statusHeader}>
                      <Text style={[styles.statusName, { color: textColor }]}>{system.name}</Text>
                      <View style={[styles.statusIndicator, { backgroundColor: statusConfig.bgColor }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                      </View>
                    </View>
                    
                    <View style={styles.statusMetrics}>
                      <View style={styles.metric}>
                        <Text style={[styles.metricLabel, { color: subTextColor }]}>Uptime</Text>
                        <Text style={[styles.metricValue, { color: textColor }]}>{system.uptime}</Text>
                      </View>
                      <View style={styles.metric}>
                        <Text style={[styles.metricLabel, { color: subTextColor }]}>Load</Text>
                        <Text style={[styles.metricValue, { color: textColor }]}>{system.load}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.responseTime}>
                      <Clock size={10} color={subTextColor} />
                      <Text style={[styles.responseText, { color: subTextColor }]}>
                        {system.responseTime}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Notification Settings */}
        <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.settingIcon}>
                <Bell size={16} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.settingTitle, { color: textColor }]}>Smart Notifications</Text>
                <Text style={[styles.settingDescription, { color: subTextColor }]}>
                  AI-powered alert prioritization
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: subTextColor + '40', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {showOnlyUnread ? 'Unread Alerts' : 'Recent Alerts'}
            </Text>
            <Text style={[styles.sectionCount, { color: subTextColor }]}>
              {filteredAlerts.length}
            </Text>
          </View>
          
          <View style={styles.alertsList}>
            {filteredAlerts.map((alert) => {
              const alertConfig = getAlertConfig(alert.type);
              
              return (
                <TouchableOpacity 
                  key={alert.id} 
                  style={[
                    styles.alertCard, 
                    { backgroundColor: cardBg },
                    !alert.read && { borderLeftWidth: 4, borderLeftColor: alertConfig.color }
                  ]}
                  activeOpacity={0.8}>
                  
                  <View style={styles.alertMain}>
                    <LinearGradient
                      colors={alertConfig.gradient}
                      style={styles.alertIconContainer}>
                      <alert.icon size={18} color="#FFFFFF" />
                    </LinearGradient>
                    
                    <View style={styles.alertContent}>
                      <View style={styles.alertHeader}>
                        <View style={styles.alertTitleContainer}>
                          <Text style={[
                            styles.alertTitle, 
                            { color: textColor },
                            !alert.read && { fontWeight: '700' }
                          ]} numberOfLines={1}>
                            {alert.title}
                          </Text>
                          {!alert.read && <View style={styles.unreadDot} />}
                        </View>
                        
                        <View style={styles.alertMeta}>
                          <View style={[styles.priorityBadge, { backgroundColor: alertConfig.bgColor }]}>
                            <Text style={[styles.priorityText, { color: alertConfig.color }]}>
                              {alert.priority}
                            </Text>
                          </View>
                          <Text style={[styles.alertTime, { color: subTextColor }]}>
                            {alert.time}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.alertMessage, { color: subTextColor }]} numberOfLines={2}>
                        {alert.message}
                      </Text>
                      
                      <View style={styles.alertFooter}>
                        <View style={styles.alertSource}>
                          {alert.source === 'AI Monitor' && (
                            <Brain size={10} color="#8B5CF6" />
                          )}
                          <Text style={[styles.sourceText, { color: subTextColor }]}>
                            {alert.source}
                          </Text>
                        </View>
                        
                        {alert.affectedSystems > 0 && (
                          <View style={styles.affectedSystems}>
                            <Server size={10} color={subTextColor} />
                            <Text style={[styles.affectedText, { color: subTextColor }]}>
                              {alert.affectedSystems} systems
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* AI Insights */}
        <View style={[styles.aiInsightsCard, { backgroundColor: cardBg }]}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.aiInsightsHeader}>
            <Brain size={18} color="#FFFFFF" />
            <Text style={styles.aiInsightsTitle}>AI Insights</Text>
            <Sparkles size={14} color="#FFFFFF" />
          </LinearGradient>
          
          <View style={styles.aiInsightsContent}>
            <Text style={[styles.aiInsightsText, { color: textColor }]}>
              System analysis shows 23% increase in database queries over the past hour. 
              Consider scaling resources during peak traffic periods.
            </Text>
            
            <View style={styles.aiRecommendations}>
              <View style={styles.recommendation}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={[styles.recommendationText, { color: subTextColor }]}>
                  Enable auto-scaling for database cluster
                </Text>
              </View>
              <View style={styles.recommendation}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={[styles.recommendationText, { color: subTextColor }]}>
                  Schedule maintenance during low-traffic window
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: cardBg }]}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                //style={styles.actionIcon}
                >
                <AlertTriangle size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.actionText, { color: textColor }]}>View Critical Alerts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: cardBg }]}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                //style={styles.actionIcon}
                >
                <CheckCircle size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.actionText, { color: textColor }]}>Mark All as Read</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: cardBg }]}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                //style={styles.actionIcon}
                >
                <Activity size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.actionText, { color: textColor }]}>System Dashboard</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  healthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  statusCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  responseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  responseText: {
    fontSize: 10,
    fontWeight: '600',
  },
  settingsCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  alertMain: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    marginBottom: 8,
  },
  alertTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  alertTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  alertMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  affectedSystems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  affectedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  aiInsightsCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  aiInsightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  aiInsightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  aiInsightsContent: {
    padding: 16,
    paddingTop: 0,
  },
  aiInsightsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  aiRecommendations: {
    gap: 8,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationText: {
    fontSize: 13,
    fontWeight: '500',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 24,
  },
});