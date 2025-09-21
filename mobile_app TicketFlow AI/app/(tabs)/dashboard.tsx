import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  RefreshControl,
  Animated,
  Dimensions
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTickets } from '../../contexts/TicketContext';
import { 
  Plus, 
  Camera, 
  Mic, 
  TriangleAlert as AlertTriangle, 
  CircleCheck as CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Server, 
  Zap,
  Bell,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Activity,
  Shield,
  Sparkles
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state } = useTickets();
  const [refreshing, setRefreshing] = useState(false);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const statsAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
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
      ]),
      Animated.stagger(100,
        statsAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();

    // Pulse animation for notifications
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? 'rgba(55, 65, 81, 0.9)' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const backgroundColor = isDark ? '#0F0F23' : '#F8FAFC';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const stats = [
    { 
      title: 'Open Tickets', 
      value: state.stats.openTickets.toString(), 
      gradient: ['#3B82F6', '#1E40AF'], 
      icon: Clock, 
      change: '+2',
      trend: 'up'
    },
    { 
      title: 'Resolved Today', 
      value: state.stats.resolvedToday.toString(), 
      gradient: ['#10B981', '#059669'], 
      icon: CheckCircle, 
      change: '+3',
      trend: 'up'
    },
    { 
      title: 'High Priority', 
      value: state.stats.highPriority.toString(), 
      gradient: ['#EF4444', '#DC2626'], 
      icon: AlertTriangle, 
      change: '-1',
      trend: 'down'
    },
    { 
      title: 'Team Performance', 
      value: `${state.stats.teamPerformance}%`, 
      gradient: ['#8B5CF6', '#7C3AED'], 
      icon: TrendingUp, 
      change: '+2%',
      trend: 'up'
    },
  ];

  const quickActions = [
    { 
      title: 'New Ticket', 
      subtitle: 'Create ticket',
      icon: Plus, 
      gradient: ['#3B82F6', '#1E40AF'], 
      action: () => router.push('/tickets/create') 
    },
    { 
      title: 'Scan Asset', 
      subtitle: 'QR/Barcode',
      icon: Camera, 
      gradient: ['#10B981', '#059669'], 
      action: () => {} 
    },
    { 
      title: 'Voice Note', 
      subtitle: 'Quick report',
      icon: Mic, 
      gradient: ['#F59E0B', '#D97706'], 
      action: () => {} 
    },
    { 
      title: 'Emergency', 
      subtitle: 'Urgent help',
      icon: Zap, 
      gradient: ['#EF4444', '#DC2626'], 
      action: () => {} 
    },
  ];

  const recentTickets = state.tickets.slice(0, 3).map(ticket => ({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    time: ticket.created,
    assignee: ticket.assignee,
    progress: ticket.progress
  }));

  const systemAlerts = state.systemAlerts;

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'High': return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'Medium': return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'Low': return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
      default: return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Open': return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
      case 'In Progress': return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'Resolved': return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
      default: return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

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
        
        {/* Header */}
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View>
            <Text style={[styles.greeting, { color: subTextColor }]}>Good morning,</Text>
            <Text style={[styles.userName, { color: textColor }]}>Sarah Johnson</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.onlineIndicator} />
              <Text style={[styles.statusText, { color: subTextColor }]}>Online • IT Administrator</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: cardBg }]} activeOpacity={0.8}>
              <Search size={20} color={textColor} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: cardBg }]} activeOpacity={0.8}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Bell size={20} color={textColor} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>3</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.profileButton, { backgroundColor: cardBg }]} activeOpacity={0.8}>
              <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.profileGradient}>
                <Text style={styles.profileInitial}>SJ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Animated.View
              key={index}
              style={[
                styles.statCard,
                { backgroundColor: cardBg },
                {
                  opacity: statsAnims[index],
                  transform: [
                    {
                      translateY: statsAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    },
                    {
                      scale: statsAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1]
                      })
                    }
                  ]
                }
              ]}>
              <LinearGradient
                colors={[...stat.gradient, stat.gradient[1] + '20']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                
                <View style={styles.statHeader}>
                  <View style={styles.statIconContainer}>
                    <stat.icon size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.trendContainer}>
                    {stat.trend === 'up' ? (
                      <ArrowUp size={12} color="#10B981" />
                    ) : (
                      <ArrowDown size={12} color="#EF4444" />
                    )}
                    <Text style={[styles.statChange, { 
                      color: stat.trend === 'up' ? '#10B981' : '#EF4444' 
                    }]}>{stat.change}</Text>
                  </View>
                </View>
                
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
              <Filter size={16} color={subTextColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.actionCard, { backgroundColor: cardBg }]}
                  onPress={action.action}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.actionIconContainer}>
                    <action.icon size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.actionTitle, { color: textColor }]}>{action.title}</Text>
                  <Text style={[styles.actionSubtitle, { color: subTextColor }]}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Recent Tickets */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Tickets</Text>
            <TouchableOpacity onPress={() => router.push('/tickets')} activeOpacity={0.8}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.ticketsList}>
            {recentTickets.map((ticket, index) => {
              const priorityConfig = getPriorityConfig(ticket.priority);
              const statusConfig = getStatusConfig(ticket.status);
              
              return (
                <TouchableOpacity 
                  key={ticket.id} 
                  style={[styles.ticketCard, { backgroundColor: cardBg }]}
                  activeOpacity={0.8}>
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketTitleContainer}>
                      <View style={[styles.priorityIndicator, { backgroundColor: priorityConfig.bg }]}>
                        <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
                        <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                          {ticket.priority}
                        </Text>
                      </View>
                      <Text style={[styles.ticketTitle, { color: textColor }]} numberOfLines={1}>
                        {ticket.title}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {ticket.status}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.ticketDescription, { color: subTextColor }]} numberOfLines={2}>
                    {ticket.description}
                  </Text>
                  
                  <View style={styles.ticketProgress}>
                    <View style={[styles.progressBar, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                      <View style={[
                        styles.progressFill, 
                        { 
                          width: `${ticket.progress}%`,
                          backgroundColor: statusConfig.color
                        }
                      ]} />
                    </View>
                    <Text style={[styles.progressText, { color: subTextColor }]}>
                      {ticket.progress}%
                    </Text>
                  </View>
                  
                  <View style={styles.ticketMeta}>
                    <View style={styles.assigneeContainer}>
                      <Users size={12} color={subTextColor} />
                      <Text style={[styles.assigneeText, { color: subTextColor }]}>
                        {ticket.assignee}
                      </Text>
                    </View>
                    <Text style={[styles.ticketTime, { color: subTextColor }]}>{ticket.time}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* System Alerts */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Activity size={20} color={textColor} />
              <Text style={[styles.sectionTitle, { color: textColor }]}>System Status</Text>
            </View>
            <View style={styles.systemHealthBadge}>
              <Shield size={12} color="#10B981" />
              <Text style={styles.healthText}>Healthy</Text>
            </View>
          </View>
          
          <View style={styles.alertsList}>
            {systemAlerts.map((alert, index) => {
              const alertConfig = {
                warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
                success: { icon: CheckCircle, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
                info: { icon: Server, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' }
              }[alert.type] || { icon: Server, color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
              
              return (
                <TouchableOpacity 
                  key={alert.id} 
                  style={[styles.alertCard, { backgroundColor: cardBg }]}
                  activeOpacity={0.8}>
                  <View style={[styles.alertIconContainer, { backgroundColor: alertConfig.bg }]}>
                    <alertConfig.icon size={16} color={alertConfig.color} />
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertMessage, { color: textColor }]}>{alert.message}</Text>
                    <Text style={[styles.alertDescription, { color: subTextColor }]}>
                      {alert.description}
                    </Text>
                    <Text style={[styles.alertTime, { color: subTextColor }]}>{alert.time}</Text>
                  </View>
                  <View style={styles.alertActions}>
                    <Sparkles size={12} color={subTextColor} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

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
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statGradient: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  filterButton: {
    padding: 8,
  },
  systemHealthBadge: {
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
    fontWeight: '600',
    color: '#10B981',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  quickActionsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  actionCard: {
    width: 120,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  actionSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  ticketsList: {
    gap: 12,
  },
  ticketCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  ticketProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 32,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ticketTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  alertDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  alertTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  alertActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 32,
  },
});