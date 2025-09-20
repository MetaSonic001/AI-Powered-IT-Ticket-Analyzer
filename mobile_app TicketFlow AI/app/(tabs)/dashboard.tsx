import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  RefreshControl 
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Camera, Mic, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, TrendingUp, Users, Server, Zap } from 'lucide-react-native';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [refreshing, setRefreshing] = useState(false);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? '#374151' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const stats = [
    { title: 'Open Tickets', value: '12', color: '#3B82F6', icon: Clock, change: '+2' },
    { title: 'Resolved Today', value: '8', color: '#10B981', icon: CheckCircle, change: '+3' },
    { title: 'High Priority', value: '3', color: '#EF4444', icon: AlertTriangle, change: '-1' },
    { title: 'Team Performance', value: '94%', color: '#8B5CF6', icon: TrendingUp, change: '+2%' },
  ];

  const quickActions = [
    { title: 'New Ticket', icon: Plus, color: '#3B82F6', action: () => router.push('/tickets/create') },
    { title: 'Scan Asset', icon: Camera, color: '#10B981', action: () => {} },
    { title: 'Voice Note', icon: Mic, color: '#F59E0B', action: () => {} },
    { title: 'Emergency', icon: Zap, color: '#EF4444', action: () => {} },
  ];

  const recentTickets = [
    { id: '1', title: 'Network Connectivity Issue', priority: 'High', status: 'Open', time: '2h ago' },
    { id: '2', title: 'Printer Not Working', priority: 'Medium', status: 'In Progress', time: '4h ago' },
    { id: '3', title: 'Software Installation Request', priority: 'Low', status: 'Resolved', time: '6h ago' },
  ];

  const systemAlerts = [
    { id: '1', message: 'Server CPU usage at 85%', type: 'warning', time: '1h ago' },
    { id: '2', message: 'All systems operational', type: 'success', time: '2h ago' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: textColor }]}>Good morning,</Text>
          <Text style={[styles.userName, { color: textColor }]}>Sarah Johnson</Text>
        </View>
        <TouchableOpacity style={[styles.profileButton, { backgroundColor: cardBg }]}>
          <Text style={[styles.profileInitial, { color: '#3B82F6' }]}>SJ</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: cardBg }]}>
            <View style={styles.statHeader}>
              <stat.icon size={20} color={stat.color} />
              <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
            </View>
            <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
            <Text style={[styles.statTitle, { color: subTextColor }]}>{stat.title}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.actionCard, { backgroundColor: cardBg }]}
              onPress={action.action}>
              <LinearGradient
                colors={[action.color, action.color + '20']}
                style={styles.actionIcon}>
                <action.icon size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: textColor }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Tickets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Tickets</Text>
          <TouchableOpacity onPress={() => router.push('/tickets')}>
            <Text style={[styles.seeAllText, { color: '#3B82F6' }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ticketsList}>
          {recentTickets.map((ticket) => (
            <TouchableOpacity key={ticket.id} style={[styles.ticketCard, { backgroundColor: cardBg }]}>
              <View style={styles.ticketHeader}>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(ticket.priority) }]} />
                <Text style={[styles.ticketTitle, { color: textColor }]} numberOfLines={1}>
                  {ticket.title}
                </Text>
              </View>
              <View style={styles.ticketMeta}>
                <Text style={[styles.ticketStatus, { color: subTextColor }]}>{ticket.status}</Text>
                <Text style={[styles.ticketTime, { color: subTextColor }]}>{ticket.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* System Alerts */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>System Status</Text>
        <View style={styles.alertsList}>
          {systemAlerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: cardBg }]}>
              <Server 
                size={20} 
                color={alert.type === 'warning' ? '#F59E0B' : '#10B981'} 
              />
              <View style={styles.alertContent}>
                <Text style={[styles.alertMessage, { color: textColor }]}>{alert.message}</Text>
                <Text style={[styles.alertTime, { color: subTextColor }]}>{alert.time}</Text>
              </View>
            </View>
          ))}
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
  greeting: {
    fontSize: 16,
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  ticketsList: {
    gap: 12,
  },
  ticketCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ticketTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  ticketTime: {
    fontSize: 12,
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
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
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
  },
  bottomPadding: {
    height: 24,
  },
});