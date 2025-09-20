import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  TextInput
} from 'react-native';
import { useState } from 'react';
import { Search, Camera, Mic, BookOpen, Star, TrendingUp, Lightbulb, PenTool as Tool, Wifi, Monitor, Smartphone } from 'lucide-react-native';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? '#374151' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const categories = ['All', 'Network', 'Hardware', 'Software', 'Security', 'Server'];

  const searchMethods = [
    { title: 'Visual Search', subtitle: 'Take a photo to find solutions', icon: Camera, color: '#3B82F6' },
    { title: 'Voice Search', subtitle: 'Describe the problem verbally', icon: Mic, color: '#10B981' },
    { title: 'QR Code', subtitle: 'Scan asset tags for quick help', icon: Camera, color: '#F59E0B' },
  ];

  const popularSolutions = [
    {
      id: '1',
      title: 'Fix Network Connection Issues',
      category: 'Network',
      views: '2.3k views',
      rating: 4.8,
      icon: Wifi,
    },
    {
      id: '2',
      title: 'Resolve Printer Problems',
      category: 'Hardware',
      views: '1.8k views',
      rating: 4.6,
      icon: Tool,
    },
    {
      id: '3',
      title: 'Monitor Performance Issues',
      category: 'Hardware',
      views: '1.5k views',
      rating: 4.7,
      icon: Monitor,
    },
    {
      id: '4',
      title: 'Mobile Device Setup Guide',
      category: 'Software',
      views: '1.2k views',
      rating: 4.5,
      icon: Smartphone,
    },
  ];

  const trendingTopics = [
    'Password Reset',
    'VPN Configuration',
    'Email Setup',
    'Software Updates',
    'Backup Recovery',
    'Network Troubleshooting',
  ];

  const quickTips = [
    {
      id: '1',
      title: 'Pro Tip: Clear Browser Cache',
      description: 'Resolve 80% of web application issues by clearing cache and cookies',
      category: 'Quick Fix',
    },
    {
      id: '2',
      title: 'Network Best Practice',
      description: 'Restart your router and modem when experiencing connectivity issues',
      category: 'Network',
    },
  ];

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
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Knowledge Base</Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>
          Find solutions and get AI-powered recommendations
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: cardBg }]}>
          <Search size={20} color={subTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search solutions, guides, and tips..."
            placeholderTextColor={subTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Smart Search Methods */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Smart Search</Text>
        <View style={styles.searchMethods}>
          {searchMethods.map((method, index) => (
            <TouchableOpacity key={index} style={[styles.methodCard, { backgroundColor: cardBg }]}>
              <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                <method.icon size={24} color={method.color} />
              </View>
              <Text style={[styles.methodTitle, { color: textColor }]}>{method.title}</Text>
              <Text style={[styles.methodSubtitle, { color: subTextColor }]}>{method.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                { 
                  backgroundColor: activeCategory === category ? '#3B82F6' : cardBg,
                  borderColor: activeCategory === category ? '#3B82F6' : 'transparent',
                }
              ]}
              onPress={() => setActiveCategory(category)}>
              <Text style={[
                styles.categoryText,
                { 
                  color: activeCategory === category ? '#FFFFFF' : textColor 
                }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trending Topics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#F59E0B" />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Trending Now</Text>
        </View>
        <View style={styles.trendingTags}>
          {trendingTopics.map((topic, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.trendingTag, { backgroundColor: cardBg, borderColor: subTextColor }]}>
              <Text style={[styles.trendingText, { color: subTextColor }]}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Popular Solutions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Popular Solutions</Text>
        <View style={styles.solutionsList}>
          {popularSolutions.map((solution) => (
            <TouchableOpacity key={solution.id} style={[styles.solutionCard, { backgroundColor: cardBg }]}>
              <View style={[styles.solutionIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                <solution.icon size={24} color="#3B82F6" />
              </View>
              <View style={styles.solutionContent}>
                <Text style={[styles.solutionTitle, { color: textColor }]} numberOfLines={2}>
                  {solution.title}
                </Text>
                <Text style={[styles.solutionCategory, { color: subTextColor }]}>
                  {solution.category}
                </Text>
                <View style={styles.solutionMeta}>
                  {renderStarRating(solution.rating)}
                  <Text style={[styles.solutionViews, { color: subTextColor }]}>
                    {solution.views}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Tips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Lightbulb size={20} color="#10B981" />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Tips</Text>
        </View>
        <View style={styles.tipsList}>
          {quickTips.map((tip) => (
            <TouchableOpacity key={tip.id} style={[styles.tipCard, { backgroundColor: cardBg }]}>
              <View style={styles.tipHeader}>
                <Text style={[styles.tipTitle, { color: textColor }]}>{tip.title}</Text>
                <Text style={[styles.tipCategory, { color: '#10B981' }]}>{tip.category}</Text>
              </View>
              <Text style={[styles.tipDescription, { color: subTextColor }]}>
                {tip.description}
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 24,
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
    fontWeight: '700',
  },
  searchMethods: {
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    position: 'absolute',
    left: 80,
    bottom: 16,
  },
  categoriesContent: {
    paddingRight: 24,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  trendingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  solutionsList: {
    gap: 16,
  },
  solutionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  solutionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solutionContent: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  solutionCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  solutionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starRating: {
    flexDirection: 'row',
    gap: 2,
  },
  solutionViews: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsList: {
    gap: 16,
  },
  tipCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  tipCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 24,
  },
});