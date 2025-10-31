import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../../services/api';
import { DashboardResponse, DashboardMetrics, CategoryStats, PriorityStats, ModelInfo, AgentInfo } from '../../types/api';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap, 
  Brain, 
  Shield, 
  Clock, 
  CheckCircle, 
  Target,
  Sparkles,
  Database,
  Server,
  Eye,
  RefreshCw
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const metrics = dashboardData?.metrics;

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? 'rgba(55, 65, 81, 0.9)' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, modelsData, agentsData] = await Promise.all([
        apiService.getDashboardMetrics(30),
        apiService.getModelStatus(),
        apiService.getAgentPerformance()
      ]);
      
      setDashboardData(dashboardResponse);
      setModels(modelsData.models);
      setAgents(agentsData.agents);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleReloadModels = async () => {
    try {
      await apiService.reloadModels();
      await fetchAnalytics();
    } catch (error) {
      console.error('Failed to reload models:', error);
    }
  };

  if (loading && !metrics) {
    return (
      <LinearGradient
        colors={isDark ? ['#0F0F23', '#1A1B3A'] : ['#F8FAFC', '#E2E8F0']}
        style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading Analytics...</Text>
        </View>
      </LinearGradient>
    );
  }

  const metricCards = [
    {
      title: 'Total Analyzed',
      value: metrics?.total_tickets_analyzed.toString() || '0',
      icon: Target,
      gradient: ['#3B82F6', '#1E40AF'] as [string, string],
      change: '+12%'
    },
    {
      title: 'Avg Processing',
      value: `${metrics?.avg_processing_time_ms || 0}ms`,
      icon: Clock,
      gradient: ['#10B981', '#059669'] as [string, string],
      change: '-8%'
    },
    {
      title: 'Accuracy Rate',
      value: `${Math.round((metrics?.accuracy_rate || 0) * 100)}%`,
      icon: CheckCircle,
      gradient: ['#8B5CF6', '#7C3AED'] as [string, string],
      change: '+3%'
    },
    {
      title: 'KB Size',
      value: metrics?.knowledge_base_size.toString() || '0',
      icon: Database,
      gradient: ['#F59E0B', '#D97706'] as [string, string],
      change: '+15'
    }
  ];

  return (
    <LinearGradient
      colors={isDark ? ['#0F0F23', '#1A1B3A'] : ['#F8FAFC', '#E2E8F0']}
      style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.headerIcon}>
                <BarChart3 size={24} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.title, { color: textColor }]}>Analytics Hub</Text>
                <Text style={[styles.subtitle, { color: subTextColor }]}>
                  Real-time AI performance metrics
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: cardBg }]}
              onPress={handleReloadModels}
              activeOpacity={0.8}>
              <RefreshCw size={18} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.section}>
          <View style={styles.metricsGrid}>
            {metricCards.map((metric, index) => (
              <View key={index} style={[styles.metricCard, { backgroundColor: cardBg }]}>
                <LinearGradient
                  colors={metric.gradient}
                  style={styles.metricIconContainer}>
                  <metric.icon size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.metricValue, { color: textColor }]}>{metric.value}</Text>
                <Text style={[styles.metricTitle, { color: subTextColor }]}>{metric.title}</Text>
                <View style={styles.metricChange}>
                  <TrendingUp size={12} color="#10B981" />
                  <Text style={[styles.changeText, { color: '#10B981' }]}>{metric.change}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* AI Models Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={20} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>AI Models</Text>
            <View style={styles.aiIndicator}>
              <Sparkles size={12} color="#8B5CF6" />
              <Text style={styles.aiText}>Live</Text>
            </View>
          </View>
          
          <View style={styles.modelsList}>
            {models.map((model, index) => (
              <View key={index} style={[styles.modelCard, { backgroundColor: cardBg }]}>
                <View style={styles.modelHeader}>
                  <View style={styles.modelInfo}>
                    <Server size={16} color="#3B82F6" />
                    <Text style={[styles.modelName, { color: textColor }]}>{model.name}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: model.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                  ]}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: model.status === 'active' ? '#10B981' : '#EF4444' }
                    ]} />
                    <Text style={[
                      styles.statusText, 
                      { color: model.status === 'active' ? '#10B981' : '#EF4444' }
                    ]}>
                      {model.status}
                    </Text>
                  </View>
                </View>
                {model.accuracy && (
                  <View style={styles.accuracyContainer}>
                    <View style={styles.accuracyBar}>
                      <View style={[
                        styles.accuracyFill, 
                        { 
                          width: `${model.accuracy * 100}%`,
                          backgroundColor: '#10B981'
                        }
                      ]} />
                    </View>
                    <Text style={[styles.accuracyText, { color: subTextColor }]}>
                      {Math.round(model.accuracy * 100)}%
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Agent Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Agent Performance</Text>
          </View>
          
          <View style={styles.agentsList}>
            {agents.map((agent, index) => (
              <View key={index} style={[styles.agentCard, { backgroundColor: cardBg }]}>
                <View style={styles.agentHeader}>
                  <View style={styles.agentInfo}>
                    <LinearGradient
                      colors={['#F59E0B', '#D97706']}
                      style={styles.agentIcon}>
                      <Activity size={14} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.agentName, { color: textColor }]}>{agent.name}</Text>
                  </View>
                  <View style={styles.agentMetrics}>
                    <View style={styles.metricItem}>
                      <Shield size={12} color="#10B981" />
                      <Text style={[styles.metricItemText, { color: subTextColor }]}>
                        {Math.round(agent.accuracy * 100)}%
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Clock size={12} color="#3B82F6" />
                      <Text style={[styles.metricItemText, { color: subTextColor }]}>
                        {agent.avg_latency_ms}ms
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.performanceBar}>
                  <View style={[
                    styles.performanceFill, 
                    { 
                      width: `${agent.accuracy * 100}%`,
                      backgroundColor: agent.accuracy > 0.9 ? '#10B981' : agent.accuracy > 0.8 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Active Solutions */}
        <View style={styles.section}>
          <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={styles.summaryIcon}>
              <Eye size={24} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                {metrics?.active_solutions || 0}
              </Text>
              <Text style={[styles.summaryLabel, { color: subTextColor }]}>
                Active Solutions in Knowledge Base
              </Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
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
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    flex: 1,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modelsList: {
    gap: 12,
  },
  modelCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accuracyBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 3,
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 40,
  },
  agentsList: {
    gap: 12,
  },
  agentCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agentIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  agentMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
  performanceBar: {
    height: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  performanceFill: {
    height: '100%',
    borderRadius: 2,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 32,
  },
});
