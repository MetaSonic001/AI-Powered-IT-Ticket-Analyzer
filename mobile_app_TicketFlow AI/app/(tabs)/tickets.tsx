import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  TextInput,
  Animated,
  Dimensions
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTickets } from '../../contexts/TicketContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  TriangleAlert as AlertTriangle, 
  CircleCheck as CheckCircle, 
  ArrowRight, 
  Calendar, 
  User, 
  Sparkles, 
  Eye,
  ThumbsUp,
  Zap,
  Shield,
  X,
  ChevronRight,
  Brain,
  TrendingUp,
  Star,
  Mic,
  Camera,
  BookOpen,
  Target,
  Activity,
  BarChart3
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function TicketsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state } = useTickets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchScaleAnim = useRef(new Animated.Value(0.98)).current;
  const statsAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  const ticketAnims = useRef([...Array(20)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(searchScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
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
  }, []);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? 'rgba(55, 65, 81, 0.9)' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const backgroundColor = isDark ? '#0F0F23' : '#F8FAFC';

  // Helper function to get or create animation value
  const getTicketAnim = (index: number) => {
    if (!ticketAnims[index]) {
      ticketAnims[index] = new Animated.Value(1); // Default to visible for new tickets
    }
    return ticketAnims[index];
  };

  const tickets = state.tickets;

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = activeFilter === 'All' || 
                         ticket.status === activeFilter ||
                         (activeFilter === 'High Priority' && ticket.priority === 'High');
    
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Animate tickets when they change
  useEffect(() => {
    const visibleTickets = filteredTickets.slice(0, 20); // Limit to first 20 tickets
    Animated.stagger(100,
      visibleTickets.map((_, index) => {
        const anim = getTicketAnim(index);
        return Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        });
      })
    ).start();
  }, [filteredTickets]);

  const filters = [
    { 
      label: 'All', 
      gradient: ['#8B5CF6', '#A855F7'], 
      count: state.tickets.length 
    },
    { 
      label: 'Open', 
      gradient: ['#3B82F6', '#2563EB'], 
      count: state.tickets.filter(t => t.status === 'Open').length 
    },
    { 
      label: 'In Progress', 
      gradient: ['#F59E0B', '#F97316'], 
      count: state.tickets.filter(t => t.status === 'In Progress').length 
    },
    { 
      label: 'Resolved', 
      gradient: ['#10B981', '#059669'], 
      count: state.tickets.filter(t => t.status === 'Resolved').length 
    },
    { 
      label: 'High Priority', 
      gradient: ['#EF4444', '#DC2626'], 
      count: state.tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length 
    }
  ];

  const quickActions = [
    { 
      title: 'AI Photo Scan', 
      subtitle: 'Scan hardware issues instantly', 
      icon: Camera, 
      gradient: ['#3B82F6', '#1E40AF'],
      badge: 'Smart'
    },
    { 
      title: 'Voice Report', 
      subtitle: 'Describe issues naturally', 
      icon: Mic, 
      gradient: ['#10B981', '#059669'],
      badge: 'Fast'
    },
    { 
      title: 'Quick Template', 
      subtitle: 'Use pre-built ticket forms', 
      icon: BookOpen, 
      gradient: ['#F59E0B', '#D97706'],
      badge: 'Easy'
    },
  ];

  const ticketStats = [
    { 
      label: 'Total Tickets', 
      value: state.stats.totalTickets.toString(), 
      change: '+12%',
      trend: 'up',
      gradient: ['#8B5CF6', '#A855F7'],
      icon: Target
    },
    { 
      label: 'Avg Response', 
      value: state.stats.avgResponseTime, 
      change: '-8%',
      trend: 'down',
      gradient: ['#10B981', '#059669'],
      icon: Clock
    },
    { 
      label: 'Resolution Rate', 
      value: `${state.stats.resolutionRate}%`, 
      change: '+3%',
      trend: 'up',
      gradient: ['#3B82F6', '#2563EB'],
      icon: CheckCircle
    },
    { 
      label: 'Satisfaction', 
      value: state.stats.satisfaction.toString(), 
      change: '+0.2',
      trend: 'up',
      gradient: ['#F59E0B', '#F97316'],
      icon: Star
    }
  ];

  const aiInsights = [
    {
      id: '1',
      title: 'Peak Hour Alert',
      description: 'Ticket volume 40% higher between 9-11 AM. Consider additional staffing.',
      type: 'Trend',
      priority: 'Medium',
      effectiveness: 85
    },
    {
      id: '2',
      title: 'Network Issue Pattern',
      description: 'Building A shows recurring connectivity issues. Infrastructure review recommended.',
      type: 'Pattern',
      priority: 'High',
      effectiveness: 92
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return Clock;
      case 'In Progress': return AlertTriangle;
      case 'Resolved': return CheckCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#3B82F6';
      case 'In Progress': return '#F59E0B';
      case 'Resolved': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'High': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <LinearGradient
      colors={isDark 
        ? ['#0F0F23', '#1A1B3A'] 
        : ['#F8FAFC', '#E2E8F0']
      }
      style={styles.container}>
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.headerIcon}>
                <Zap size={24} color="#FFFFFF" />
                <Sparkles size={12} color="#FFFFFF" style={styles.sparkle} />
              </LinearGradient>
              <View>
                <Text style={[styles.title, { color: textColor }]}>Smart Tickets</Text>
                <Text style={[styles.subtitle, { color: subTextColor }]}>
                  AI-powered ticket management system
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/tickets/create')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.createButton}>
                <Plus size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Enhanced Search Bar */}
        <Animated.View style={[
          styles.searchSection,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: searchScaleAnim }
            ]
          }
        ]}>
          <View style={[
            styles.searchBar, 
            { 
              backgroundColor: cardBg,
              borderColor: searchFocused ? '#3B82F6' : 'transparent',
              borderWidth: 2,
              shadowColor: searchFocused ? '#3B82F6' : '#000',
              shadowOpacity: searchFocused ? 0.1 : 0.05,
            }
          ]}>
            <Search size={20} color={searchFocused ? '#3B82F6' : subTextColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search tickets, ask AI for help..."
              placeholderTextColor={subTextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <X size={18} color={subTextColor} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.voiceButton} activeOpacity={0.8}>
              <Mic size={18} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </Animated.View>



        {/* Filter Chips */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.label}
                style={[
                  styles.filterChip,
                  activeFilter === filter.label && styles.activeFilterChip
                ]}
                onPress={() => setActiveFilter(filter.label)}
                activeOpacity={0.8}>
                {activeFilter === filter.label ? (
                  <LinearGradient
                    colors={filter.gradient as [string, string]}
                    style={styles.filterGradient}>
                    <Text style={styles.activeFilterText}>{filter.label}</Text>
                    <View style={styles.filterCount}>
                      <Text style={styles.filterCountText}>{filter.count}</Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={[styles.filterText, { color: textColor }]}>{filter.label}</Text>
                    <View style={[styles.filterCount, { backgroundColor: 'rgba(107, 114, 128, 0.2)' }]}>
                      <Text style={[styles.filterCountText, { color: subTextColor }]}>{filter.count}</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={20} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>AI Insights</Text>
            <View style={styles.aiIndicator}>
              <Sparkles size={12} color="#8B5CF6" />
              <Text style={styles.aiText}>AI</Text>
            </View>
          </View>
          
          <View style={styles.insightsList}>
            {aiInsights.map((insight) => (
              <TouchableOpacity key={insight.id} style={[styles.insightCard, { backgroundColor: cardBg }]} activeOpacity={0.8}>
                <View style={styles.insightHeader}>
                  <View style={styles.insightTitleContainer}>
                    <Text style={[styles.insightTitle, { color: textColor }]}>{insight.title}</Text>
                    <View style={styles.insightType}>
                      <Text style={[styles.insightTypeText, { color: '#8B5CF6' }]}>{insight.type}</Text>
                    </View>
                  </View>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(insight.priority) }]} />
                </View>
                
                <Text style={[styles.insightDescription, { color: subTextColor }]}>
                  {insight.description}
                </Text>
                
                <View style={styles.insightFooter}>
                  <View style={styles.effectivenessContainer}>
                    <Shield size={12} color="#10B981" />
                    <Text style={[styles.effectivenessText, { color: subTextColor }]}>
                      {insight.effectiveness}% confidence
                    </Text>
                  </View>
                  <ChevronRight size={14} color={subTextColor} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tickets List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Active Tickets</Text>
          </View>
          
          <View style={styles.ticketsList}>
            {filteredTickets.map((ticket, index) => {
              const StatusIcon = getStatusIcon(ticket.status);
              const animValue = getTicketAnim(index);
              
              return (
                <Animated.View
                  key={ticket.id}
                  style={{
                    opacity: animValue,
                    transform: [
                      {
                        translateY: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0]
                        })
                      }
                    ]
                  }}>
                  <TouchableOpacity 
                    style={[styles.ticketCard, { backgroundColor: cardBg }]}
                    onPress={() => router.push('/tickets/create')}
                    activeOpacity={0.8}>
                    
                    {/* Priority Gradient Bar */}
                    <LinearGradient
                      colors={ticket.gradient as [string, string]}
                      style={styles.priorityIndicator}
                    />
                    
                    <View style={styles.ticketContent}>
                      {/* Header */}
                      <View style={styles.ticketHeader}>
                        <View style={styles.ticketTitleContainer}>
                          <Text style={[styles.ticketTitle, { color: textColor }]} numberOfLines={1}>
                            {ticket.title}
                          </Text>
                          <View style={styles.ticketBadges}>
                            <View style={[styles.categoryBadge, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                              <Text style={[styles.categoryText, { color: '#3B82F6' }]}>
                                {ticket.category}
                              </Text>
                            </View>
                            <View style={[styles.complexityBadge, { backgroundColor: getComplexityColor(ticket.complexity) + '20' }]}>
                              <Text style={[styles.complexityText, { color: getComplexityColor(ticket.complexity) }]}>
                                {ticket.complexity}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <ArrowRight size={16} color={subTextColor} />
                      </View>

                      {/* Description */}
                      <Text style={[styles.ticketDescription, { color: subTextColor }]} numberOfLines={2}>
                        {ticket.description}
                      </Text>

                      {/* AI Suggestion */}
                      <View style={styles.aiSuggestion}>
                        <Brain size={12} color="#8B5CF6" />
                        <Text style={[styles.aiSuggestionText, { color: '#8B5CF6' }]}>
                          AI: {ticket.aiSuggestion}
                        </Text>
                      </View>

                      {/* Meta Information */}
                      <View style={styles.ticketMeta}>
                        <View style={styles.ticketStatus}>
                          <LinearGradient
                            colors={ticket.gradient as [string, string]}
                            style={styles.statusIconContainer}>
                            <StatusIcon size={12} color="#FFFFFF" />
                          </LinearGradient>
                          <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                            {ticket.status}
                          </Text>
                        </View>

                        <View style={styles.ticketInfo}>
                          <View style={styles.infoItem}>
                            <User size={12} color={subTextColor} />
                            <Text style={[styles.infoText, { color: subTextColor }]}>
                              {ticket.assignee}
                            </Text>
                          </View>
                          <View style={styles.infoItem}>
                            <Clock size={12} color={subTextColor} />
                            <Text style={[styles.infoText, { color: subTextColor }]}>
                              {ticket.estimatedTime}
                            </Text>
                          </View>
                          <View style={styles.infoItem}>
                            <Calendar size={12} color={subTextColor} />
                            <Text style={[styles.infoText, { color: subTextColor }]}>
                              {ticket.created}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
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
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 4,
    right: 4,
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
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  voiceButton: {
    padding: 4,
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 64) / 2,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  statIconContainer: {
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
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  quickActions: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  filtersContent: {
    paddingRight: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  activeFilterChip: {
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  filterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: -16,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  insightType: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  insightTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  insightDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  insightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  effectivenessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  effectivenessText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketsList: {
    gap: 12,
  },
  ticketCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    height:220
  },
  priorityIndicator: {
    width: 4,
    minHeight: '100%',
  },
  ticketContent: {
    flex: 1,
    padding: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  ticketBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  complexityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  complexityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    fontWeight: '400',
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  aiSuggestionText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  ticketInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 32,
  },
})