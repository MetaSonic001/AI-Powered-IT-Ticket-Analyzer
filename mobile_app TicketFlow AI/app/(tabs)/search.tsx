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
import { LinearGradient } from 'expo-linear-gradient';
import { useTickets } from '../../contexts/TicketContext';
import { 
  Search, 
  Camera, 
  Mic, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Lightbulb, 
  PenTool as Tool, 
  Wifi, 
  Monitor, 
  Smartphone,
  Filter,
  Sparkles,
  Eye,
  ThumbsUp,
  Clock,
  Zap,
  Shield,
  X,
  ChevronRight,
  Brain
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchFocused, setSearchFocused] = useState(false);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchScaleAnim = useRef(new Animated.Value(0.98)).current;
  const methodAnims = useRef([...Array(3)].map(() => new Animated.Value(0))).current;
  const solutionAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;

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
      Animated.stagger(150,
        methodAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
      Animated.stagger(100,
        solutionAnims.map(anim =>
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

  const categories = ['All', 'Network', 'Hardware', 'Software', 'Security', 'Server'];

  const searchMethods = [
    { 
      title: 'AI Visual Search', 
      subtitle: 'Take a photo to find instant solutions', 
      icon: Camera, 
      gradient: ['#3B82F6', '#1E40AF'],
      badge: 'Smart'
    },
    { 
      title: 'Voice Assistant', 
      subtitle: 'Describe the problem naturally', 
      icon: Mic, 
      gradient: ['#10B981', '#059669'],
      badge: 'Popular'
    },
    { 
      title: 'QR Scanner', 
      subtitle: 'Scan asset tags for quick help', 
      icon: Camera, 
      gradient: ['#F59E0B', '#D97706'],
      badge: 'Fast'
    },
  ];

  const popularSolutions = [
    {
      id: '1',
      title: 'Fix Network Connection Issues',
      description: 'Complete guide to diagnose and resolve connectivity problems',
      category: 'Network',
      views: '2.3k',
      rating: 4.8,
      icon: Wifi,
      difficulty: 'Beginner',
      estimatedTime: '5 min',
      gradient: ['#3B82F6', '#1E40AF']
    },
    {
      id: '2',
      title: 'Resolve Printer Problems',
      description: 'Step-by-step troubleshooting for common printer issues',
      category: 'Hardware',
      views: '1.8k',
      rating: 4.6,
      icon: Tool,
      difficulty: 'Intermediate',
      estimatedTime: '10 min',
      gradient: ['#10B981', '#059669']
    },
    {
      id: '3',
      title: 'Monitor Performance Issues',
      description: 'Optimize display settings and fix common problems',
      category: 'Hardware',
      views: '1.5k',
      rating: 4.7,
      icon: Monitor,
      difficulty: 'Beginner',
      estimatedTime: '3 min',
      gradient: ['#8B5CF6', '#7C3AED']
    },
    {
      id: '4',
      title: 'Mobile Device Setup Guide',
      description: 'Complete configuration guide for corporate devices',
      category: 'Software',
      views: '1.2k',
      rating: 4.5,
      icon: Smartphone,
      difficulty: 'Advanced',
      estimatedTime: '15 min',
      gradient: ['#F59E0B', '#D97706']
    },
  ];

  const trendingTopics = [
    { 
      name: 'Password Reset', 
      trend: 'up', 
      count: state.tickets.filter(t => t.category === 'Security').length 
    },
    { 
      name: 'VPN Configuration', 
      trend: 'hot', 
      count: state.tickets.filter(t => t.category === 'Network').length 
    },
    { 
      name: 'Email Setup', 
      trend: 'up', 
      count: state.tickets.filter(t => t.category === 'Software').length 
    },
    { 
      name: 'Software Updates', 
      trend: 'stable', 
      count: state.tickets.filter(t => t.category === 'Software').length 
    },
    { 
      name: 'Backup Recovery', 
      trend: 'up', 
      count: state.tickets.filter(t => t.category === 'Server').length 
    },
    { 
      name: 'Network Troubleshooting', 
      trend: 'hot', 
      count: state.tickets.filter(t => t.category === 'Network').length 
    },
  ];

  const quickTips = [
    {
      id: '1',
      title: 'AI Pro Tip: Clear Browser Cache',
      description: 'Our AI detected this resolves 80% of web application issues. Clear cache and cookies first.',
      category: 'Quick Fix',
      aiGenerated: true,
      effectiveness: 95
    },
    {
      id: '2',
      title: 'Smart Network Fix',
      description: 'AI recommendation: Restart router and modem in sequence for optimal connectivity recovery.',
      category: 'Network',
      aiGenerated: true,
      effectiveness: 88
    },
    {
      id: '3',
      title: 'Performance Boost',
      description: 'Close unused browser tabs to free up system memory and improve overall performance.',
      category: 'Performance',
      aiGenerated: false,
      effectiveness: 72
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={12} color="#10B981" />;
      case 'hot': return <Zap size={12} color="#EF4444" />;
      default: return <Clock size={12} color="#6B7280" />;
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} color="#F59E0B" />);
    }

    return <View style={styles.starRating}>{stars}</View>;
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
                colors={['#3B82F6', '#1E40AF']}
                style={styles.headerIcon}>
                <Brain size={24} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.title, { color: textColor }]}>AI Knowledge Base</Text>
                <Text style={[styles.subtitle, { color: subTextColor }]}>
                  Intelligent solutions powered by machine learning
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: cardBg }]} activeOpacity={0.8}>
              <Filter size={18} color={textColor} />
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
              placeholder="Ask AI or search solutions, guides, tips..."
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

        {/* Smart Search Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>AI-Powered Search</Text>
          </View>
          
          <View style={styles.searchMethods}>
            {searchMethods.map((method, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: methodAnims[index],
                  transform: [
                    {
                      translateY: methodAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }
                  ]
                }}>
                <TouchableOpacity style={[styles.methodCard, { backgroundColor: cardBg }]} activeOpacity={0.8}>
                  <LinearGradient
                    colors={method.gradient}
                    style={styles.methodIconContainer}>
                    <method.icon size={20} color="#FFFFFF" />
                  </LinearGradient>
                  
                  <View style={styles.methodContent}>
                    <View style={styles.methodHeader}>
                      <Text style={[styles.methodTitle, { color: textColor }]}>{method.title}</Text>
                      <View style={[styles.methodBadge, { backgroundColor: method.gradient[0] + '20' }]}>
                        <Text style={[styles.methodBadgeText, { color: method.gradient[0] }]}>
                          {method.badge}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.methodSubtitle, { color: subTextColor }]}>{method.subtitle}</Text>
                  </View>
                  
                  <ChevronRight size={16} color={subTextColor} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Enhanced Categories */}
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
            contentContainerStyle={styles.categoriesContent}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  activeCategory === category && styles.activeCategoryChip
                ]}
                onPress={() => setActiveCategory(category)}
                activeOpacity={0.8}>
                {activeCategory === category ? (
                  <LinearGradient
                    colors={['#3B82F6', '#1E40AF']}
                    style={styles.categoryGradient}>
                    <Text style={styles.activeCategoryText}>{category}</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={[styles.categoryText, { color: textColor }]}>{category}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Trending Topics */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Trending Now</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.trendingContainer}>
              {trendingTopics.map((topic, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.trendingCard, { backgroundColor: cardBg }]}
                  activeOpacity={0.8}>
                  <View style={styles.trendingHeader}>
                    <View style={styles.trendingIcon}>
                      {getTrendIcon(topic.trend)}
                    </View>
                    <Text style={[styles.trendingCount, { color: subTextColor }]}>
                      {topic.count}
                    </Text>
                  </View>
                  <Text style={[styles.trendingText, { color: textColor }]}>{topic.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Popular Solutions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThumbsUp size={20} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Popular Solutions</Text>
          </View>
          
          <View style={styles.solutionsList}>
            {popularSolutions.map((solution, index) => (
              <Animated.View
                key={solution.id}
                style={{
                  opacity: solutionAnims[index],
                  transform: [
                    {
                      translateY: solutionAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      })
                    }
                  ]
                }}>
                <TouchableOpacity style={[styles.solutionCard, { backgroundColor: cardBg }]} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[...solution.gradient, solution.gradient[1] + '20']}
                    style={styles.solutionIconContainer}>
                    <solution.icon size={22} color="#FFFFFF" />
                  </LinearGradient>
                  
                  <View style={styles.solutionContent}>
                    <View style={styles.solutionHeader}>
                      <Text style={[styles.solutionTitle, { color: textColor }]} numberOfLines={1}>
                        {solution.title}
                      </Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(solution.difficulty) + '20' }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(solution.difficulty) }]}>
                          {solution.difficulty}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.solutionDescription, { color: subTextColor }]} numberOfLines={2}>
                      {solution.description}
                    </Text>
                    
                    <View style={styles.solutionMeta}>
                      <View style={styles.metaLeft}>
                        {renderStarRating(solution.rating)}
                        <Text style={[styles.ratingText, { color: subTextColor }]}>
                          {solution.rating}
                        </Text>
                        <View style={styles.metaDivider} />
                        <Eye size={12} color={subTextColor} />
                        <Text style={[styles.solutionViews, { color: subTextColor }]}>
                          {solution.views}
                        </Text>
                      </View>
                      
                      <View style={styles.timeContainer}>
                        <Clock size={12} color={subTextColor} />
                        <Text style={[styles.estimatedTime, { color: subTextColor }]}>
                          {solution.estimatedTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* AI Quick Tips */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.sectionHeader}>
            <Brain size={20} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>AI Quick Tips</Text>
            <View style={styles.aiIndicator}>
              <Sparkles size={12} color="#8B5CF6" />
              <Text style={styles.aiText}>AI</Text>
            </View>
          </View>
          
          <View style={styles.tipsList}>
            {quickTips.map((tip) => (
              <TouchableOpacity key={tip.id} style={[styles.tipCard, { backgroundColor: cardBg }]} activeOpacity={0.8}>
                <View style={styles.tipHeader}>
                  <View style={styles.tipTitleContainer}>
                    <Text style={[styles.tipTitle, { color: textColor }]}>{tip.title}</Text>
                    {tip.aiGenerated && (
                      <View style={styles.aiGeneratedBadge}>
                        <Sparkles size={10} color="#8B5CF6" />
                        <Text style={styles.aiGeneratedText}>AI</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.categoryContainer}>
                    <Text style={[styles.tipCategory, { color: '#10B981' }]}>{tip.category}</Text>
                  </View>
                </View>
                
                <Text style={[styles.tipDescription, { color: subTextColor }]}>
                  {tip.description}
                </Text>
                
                <View style={styles.tipFooter}>
                  <View style={styles.effectivenessContainer}>
                    <Shield size={12} color="#10B981" />
                    <Text style={[styles.effectivenessText, { color: subTextColor }]}>
                      {tip.effectiveness}% effective
                    </Text>
                  </View>
                  <ChevronRight size={14} color={subTextColor} />
                </View>
              </TouchableOpacity>
            ))}
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
  filterButton: {
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
  searchMethods: {
    gap: 12,
  },
  methodCard: {
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
  methodIconContainer: {
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
  methodContent: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  methodSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoriesContent: {
    paddingRight: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeCategoryChip: {
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  categoryGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trendingContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  trendingCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trendingIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  trendingText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  solutionsList: {
    gap: 12,
  },
  solutionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  solutionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  solutionContent: {
    flex: 1,
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  solutionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  solutionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  solutionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starRating: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    marginHorizontal: 2,
  },
  solutionViews: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  estimatedTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  tipsList: {
    gap: 12,
  },
  tipCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  aiGeneratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiGeneratedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  categoryContainer: {
    alignItems: 'flex-end',
  },
  tipCategory: {
    fontSize: 12,
    fontWeight: '700',
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  tipFooter: {
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
  bottomPadding: {
    height: 32,
  },
});