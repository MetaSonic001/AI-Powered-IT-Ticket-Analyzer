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
import { router } from 'expo-router';
import { Search, Filter, Plus, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, ArrowRight, Calendar, User } from 'lucide-react-native';

export default function TicketsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? '#374151' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const filters = ['All', 'Open', 'In Progress', 'Resolved', 'High Priority'];

  const tickets = [
    {
      id: '1',
      title: 'Network Connectivity Issues in Building A',
      description: 'Multiple users reporting intermittent connection drops',
      priority: 'High',
      status: 'Open',
      assignee: 'John Smith',
      created: '2h ago',
      category: 'Network',
    },
    {
      id: '2',
      title: 'Printer Queue Jam - HP LaserJet Pro',
      description: 'Print jobs stuck in queue, unable to clear',
      priority: 'Medium',
      status: 'In Progress',
      assignee: 'You',
      created: '4h ago',
      category: 'Hardware',
    },
    {
      id: '3',
      title: 'Software Installation Request - Adobe Creative Suite',
      description: 'User needs Creative Suite installed on new workstation',
      priority: 'Low',
      status: 'Resolved',
      assignee: 'Mike Johnson',
      created: '1d ago',
      category: 'Software',
    },
    {
      id: '4',
      title: 'Email Server Performance Degradation',
      description: 'Slow email delivery and retrieval reported',
      priority: 'High',
      status: 'Open',
      assignee: 'Sarah Davis',
      created: '3h ago',
      category: 'Server',
    },
    {
      id: '5',
      title: 'Password Reset Request - Multiple Users',
      description: 'Batch password reset for security compliance',
      priority: 'Medium',
      status: 'In Progress',
      assignee: 'You',
      created: '5h ago',
      category: 'Security',
    },
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = activeFilter === 'All' || 
                         ticket.status === activeFilter ||
                         (activeFilter === 'High Priority' && ticket.priority === 'High');
    
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Tickets</Text>
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => router.push('/tickets/create')}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: cardBg }]}>
          <Search size={20} color={subTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search tickets..."
            placeholderTextColor={subTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: cardBg }]}>
          <Filter size={20} color={subTextColor} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              { 
                backgroundColor: activeFilter === filter ? '#3B82F6' : cardBg,
                borderColor: activeFilter === filter ? '#3B82F6' : 'transparent',
              }
            ]}
            onPress={() => setActiveFilter(filter)}>
            <Text style={[
              styles.filterText,
              { 
                color: activeFilter === filter ? '#FFFFFF' : textColor 
              }
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tickets List */}
      <ScrollView style={styles.ticketsList}>
        {filteredTickets.map((ticket) => {
          const StatusIcon = getStatusIcon(ticket.status);
          
          return (
            <TouchableOpacity 
              key={ticket.id} 
              style={[styles.ticketCard, { backgroundColor: cardBg }]}
              onPress={() => router.push(`/tickets/${ticket.id}`)}>
              
              {/* Priority Indicator */}
              <View 
                style={[
                  styles.priorityIndicator, 
                  { backgroundColor: getPriorityColor(ticket.priority) }
                ]} 
              />
              
              <View style={styles.ticketContent}>
                {/* Header */}
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketTitleContainer}>
                    <Text style={[styles.ticketTitle, { color: textColor }]} numberOfLines={1}>
                      {ticket.title}
                    </Text>
                    <Text style={[styles.ticketCategory, { color: subTextColor }]}>
                      {ticket.category}
                    </Text>
                  </View>
                  <ArrowRight size={16} color={subTextColor} />
                </View>

                {/* Description */}
                <Text style={[styles.ticketDescription, { color: subTextColor }]} numberOfLines={2}>
                  {ticket.description}
                </Text>

                {/* Meta Information */}
                <View style={styles.ticketMeta}>
                  <View style={styles.ticketStatus}>
                    <StatusIcon size={14} color={getStatusColor(ticket.status)} />
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
                      <Calendar size={12} color={subTextColor} />
                      <Text style={[styles.infoText, { color: subTextColor }]}>
                        {ticket.created}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
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
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ticketsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  ticketCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  priorityIndicator: {
    width: 4,
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
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  ticketDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
});