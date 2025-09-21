import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTickets } from '../../contexts/TicketContext';
import { 
  ArrowLeft, 
  Camera, 
  Mic, 
  MapPin, 
  Plus, 
  X, 
  User, 
  Clock, 
  TriangleAlert as AlertTriangle,
  Send,
  Sparkles,
  Brain,
  Zap,
  Shield,
  FileText,
  Image,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';

export default function CreateTicketScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { dispatch } = useTickets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [category, setCategory] = useState('');
  const [assignee, setAssignee] = useState('Auto Assign');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? 'rgba(55, 65, 81, 0.5)' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const backgroundColor = isDark ? '#0F0F23' : '#F8FAFC';

  const priorities = [
    { name: 'Low', icon: CheckCircle, description: 'Can wait' },
    { name: 'Medium', icon: Clock, description: 'Normal priority' },
    { name: 'High', icon: AlertTriangle, description: 'Needs attention' },
    { name: 'Critical', icon: Zap, description: 'Urgent!' }
  ];

  const categories = [
    { name: 'Network', icon: '🌐', color: '#3B82F6' },
    { name: 'Hardware', icon: '💻', color: '#10B981' },
    { name: 'Software', icon: '⚙️', color: '#8B5CF6' },
    { name: 'Security', icon: '🔒', color: '#EF4444' },
    { name: 'Server', icon: '🖥️', color: '#F59E0B' },
    { name: 'Other', icon: '📋', color: '#6B7280' }
  ];

  const teamMembers = [
    { name: 'Auto Assign', role: 'AI will choose best fit', avatar: '🤖', available: true },
    { name: 'John Smith', role: 'Senior IT Specialist', avatar: '👨‍💻', available: true },
    { name: 'Mike Johnson', role: 'Network Administrator', avatar: '👨‍🔧', available: false },
    { name: 'Sarah Davis', role: 'Security Analyst', avatar: '👩‍💻', available: true },
    { name: 'Alex Chen', role: 'System Administrator', avatar: '👨‍💼', available: true }
  ];

  const quickActionItems = [
    { 
      title: 'AI Photo Analysis', 
      subtitle: 'Analyze screenshot/photo',
      icon: Camera, 
      gradient: ['#3B82F6', '#1E40AF'],
      badge: 'Smart'
    },
    { 
      title: 'Voice Description', 
      subtitle: 'Speak your issue',
      icon: Mic, 
      gradient: ['#10B981', '#059669'],
      badge: 'Fast'
    },
    { 
      title: 'Asset Location', 
      subtitle: 'Add device location',
      icon: MapPin, 
      gradient: ['#F59E0B', '#D97706'],
      badge: 'Helpful'
    }
  ];

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F97316';
      case 'Medium': return '#EAB308';
      case 'Low': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const getPriorityGradient = (priorityLevel: string): [string, string] => {
    switch (priorityLevel) {
      case 'Critical': return ['#EF4444', '#DC2626'];
      case 'High': return ['#F97316', '#EA580C'];
      case 'Medium': return ['#EAB308', '#CA8A04'];
      case 'Low': return ['#22C55E', '#16A34A'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const getComplexityFromPriority = (priority: string): 'Low' | 'Medium' | 'High' => {
    switch (priority) {
      case 'Critical': return 'High';
      case 'High': return 'High';
      case 'Medium': return 'Medium';
      case 'Low': return 'Low';
      default: return 'Medium';
    }
  };

  const generateAISuggestion = (title: string, description: string, category: string) => {
    const suggestions = {
      'Network': 'Check router configuration and restart network services',
      'Hardware': 'Verify hardware connections and update drivers if needed',
      'Software': 'Clear cache and restart the application',
      'Security': 'Review security policies and update authentication settings',
      'Server': 'Check server logs and restart services',
      'Other': 'Review system logs for error patterns'
    };
    return suggestions[category as keyof typeof suggestions] || 'AI analysis in progress...';
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in the title and description to continue');
      return;
    }

    if (!category) {
      Alert.alert('Category Required', 'Please select a category for better routing');
      return;
    }

    // Create new ticket
    const newTicket = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'Open' as const,
      assignee: assignee === 'Auto Assign' ? 'AI Assignment' : assignee,
      category,
      gradient: getPriorityGradient(priority),
      aiSuggestion: generateAISuggestion(title, description, category),
      estimatedTime: priority === 'Critical' ? '15 min' : priority === 'High' ? '30 min' : '1h',
      complexity: getComplexityFromPriority(priority)
    };

    // Dispatch the action to add the ticket
    dispatch({ type: 'ADD_TICKET', payload: newTicket });

    Alert.alert(
      'Ticket Created Successfully! 🎉',
      `Your ticket has been created and assigned to ${assignee}. You'll receive updates via email and push notifications.`,
      [{ text: 'View Dashboard', onPress: () => router.back() }]
    );
  };

  const addAttachment = () => {
    const newAttachment = `screenshot_${Date.now()}.jpg`;
    setAttachments([...attachments, newAttachment]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const isFormValid = title.trim() && description.trim() && category;

  return (
    <LinearGradient
      colors={isDark 
        ? ['#0F0F23', '#1A1B3A'] 
        : ['#F8FAFC', '#E2E8F0']
      }
      style={styles.container}>
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: cardBg }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <ArrowLeft size={20} color={textColor} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleContainer}>
              <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.headerIcon}>
                <FileText size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.headerTitle, { color: textColor }]}>Create Ticket</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
              AI-powered ticket creation
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.submitHeaderButton,
              { 
                opacity: isFormValid ? 1 : 0.5,
                backgroundColor: isFormValid ? '#10B981' : cardBg 
              }
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid}
            activeOpacity={0.8}>
            <Send size={18} color={isFormValid ? '#FFFFFF' : subTextColor} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Enhanced Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Brain size={18} color="#8B5CF6" />
              <Text style={[styles.sectionTitle, { color: textColor }]}>Smart Tools</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickActions}>
                {quickActionItems.map((action, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[styles.quickAction, { backgroundColor: cardBg }]}
                    activeOpacity={0.8}>
                    <LinearGradient
                      colors={action.gradient as [string, string]}
                      style={styles.quickActionIcon}>
                      <action.icon size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.quickActionContent}>
                      <View style={styles.quickActionHeader}>
                        <Text style={[styles.quickActionTitle, { color: textColor }]}>
                          {action.title}
                        </Text>
                        <View style={[styles.quickActionBadge, { backgroundColor: action.gradient[0] + '20' }]}>
                          <Text style={[styles.quickActionBadgeText, { color: action.gradient[0] }]}>
                            {action.badge}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.quickActionSubtitle, { color: subTextColor }]}>
                        {action.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Enhanced Form */}
          <View style={[styles.form, { backgroundColor: cardBg }]}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Issue Title <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={[
                styles.inputContainer,
                {
                  borderColor: titleFocused ? '#3B82F6' : (isDark ? '#4B5563' : '#D1D5DB'),
                  borderWidth: titleFocused ? 2 : 1,
                  backgroundColor: isDark ? '#374151' : '#FFFFFF'
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Brief, clear description of the issue"
                  placeholderTextColor={subTextColor}
                  value={title}
                  onChangeText={setTitle}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                  multiline
                />
                {title.length > 0 && (
                  <CheckCircle size={16} color="#10B981" />
                )}
              </View>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Detailed Description <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={[
                styles.textAreaContainer,
                {
                  borderColor: descriptionFocused ? '#3B82F6' : (isDark ? '#4B5563' : '#D1D5DB'),
                  borderWidth: descriptionFocused ? 2 : 1,
                  backgroundColor: isDark ? '#374151' : '#FFFFFF'
                }
              ]}>
                <TextInput
                  style={[styles.textArea, { color: textColor }]}
                  placeholder="• What happened?&#10;• When did it occur?&#10;• Steps to reproduce&#10;• Error messages (if any)"
                  placeholderTextColor={subTextColor}
                  value={description}
                  onChangeText={setDescription}
                  onFocus={() => setDescriptionFocused(true)}
                  onBlur={() => setDescriptionFocused(false)}
                  multiline
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.aiSuggestion}>
                <Sparkles size={12} color="#8B5CF6" />
                <Text style={[styles.aiSuggestionText, { color: subTextColor }]}>
                  AI will analyze your description for better routing
                </Text>
              </View>
            </View>

            {/* Priority */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: textColor }]}>Priority Level</Text>
              <View style={styles.priorityGrid}>
                {priorities.map((priorityItem) => {
                  const isSelected = priority === priorityItem.name;
                  const PriorityIcon = priorityItem.icon;
                  
                  return (
                    <TouchableOpacity
                      key={priorityItem.name}
                      style={[
                        styles.priorityCard,
                        { backgroundColor: cardBg },
                        isSelected && { borderColor: getPriorityColor(priorityItem.name), borderWidth: 2 }
                      ]}
                      onPress={() => setPriority(priorityItem.name as 'Low' | 'Medium' | 'High' | 'Critical')}
                      activeOpacity={0.8}>
                      {isSelected ? (
                        <LinearGradient
                          colors={getPriorityGradient(priorityItem.name)}
                          style={styles.priorityIconContainer}>
                          <PriorityIcon size={16} color="#FFFFFF" />
                        </LinearGradient>
                      ) : (
                        <View style={[styles.priorityIconContainer, { backgroundColor: getPriorityColor(priorityItem.name) + '20' }]}>
                          <PriorityIcon size={16} color={getPriorityColor(priorityItem.name)} />
                        </View>
                      )}
                      <Text style={[
                        styles.priorityName,
                        { color: isSelected ? getPriorityColor(priorityItem.name) : textColor }
                      ]}>
                        {priorityItem.name}
                      </Text>
                      <Text style={[styles.priorityDescription, { color: subTextColor }]}>
                        {priorityItem.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Category <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const isSelected = category === cat.name;
                  
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      style={[
                        styles.categoryCard,
                        { backgroundColor: cardBg },
                        isSelected && { borderColor: cat.color, borderWidth: 2 }
                      ]}
                      onPress={() => setCategory(cat.name)}
                      activeOpacity={0.8}>
                      <View style={[
                        styles.categoryIconContainer,
                        { backgroundColor: isSelected ? cat.color : cat.color + '20' }
                      ]}>
                        <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                      </View>
                      <Text style={[
                        styles.categoryName,
                        { color: isSelected ? cat.color : textColor }
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Assignee */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: textColor }]}>Assign To</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.assigneeList}>
                  {teamMembers.map((member) => {
                    const isSelected = assignee === member.name;
                    
                    return (
                      <TouchableOpacity
                        key={member.name}
                        style={[
                          styles.assigneeCard,
                          { backgroundColor: cardBg },
                          isSelected && { borderColor: '#10B981', borderWidth: 2 },
                          !member.available && { opacity: 0.6 }
                        ]}
                        onPress={() => member.available && setAssignee(member.name)}
                        activeOpacity={0.8}
                        disabled={!member.available}>
                        <View style={[
                          styles.assigneeAvatar,
                          { backgroundColor: isSelected ? '#10B981' : '#E5E7EB' }
                        ]}>
                          <Text style={styles.assigneeEmoji}>{member.avatar}</Text>
                        </View>
                        <Text style={[
                          styles.assigneeName,
                          { color: isSelected ? '#10B981' : textColor }
                        ]} numberOfLines={1}>
                          {member.name}
                        </Text>
                        <Text style={[styles.assigneeRole, { color: subTextColor }]} numberOfLines={1}>
                          {member.role}
                        </Text>
                        {!member.available && (
                          <Text style={styles.unavailableText}>Away</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Attachments */}
            <View style={styles.formGroup}>
              <View style={styles.attachmentHeader}>
                <Text style={[styles.label, { color: textColor }]}>Attachments</Text>
                <TouchableOpacity 
                  onPress={addAttachment}
                  style={[styles.addButton, { backgroundColor: '#3B82F6' + '20' }]}
                  activeOpacity={0.8}>
                  <Plus size={16} color="#3B82F6" />
                  <Text style={[styles.addButtonText, { color: '#3B82F6' }]}>Add File</Text>
                </TouchableOpacity>
              </View>
              
              {attachments.length > 0 && (
                <View style={styles.attachmentsList}>
                  {attachments.map((attachment, index) => (
                    <View key={index} style={[styles.attachmentItem, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                      <View style={styles.attachmentInfo}>
                        <Image size={16} color="#3B82F6" />
                        <Text style={[styles.attachmentName, { color: textColor }]}>{attachment}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => removeAttachment(index)}
                        style={styles.removeButton}
                        activeOpacity={0.8}>
                        <X size={14} color={subTextColor} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              { opacity: isFormValid ? 1 : 0.5 }
            ]} 
            onPress={handleSubmit}
            disabled={!isFormValid}
            activeOpacity={0.8}>
            <LinearGradient
              colors={isFormValid ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
              style={styles.submitGradient}>
              <Send size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Create Ticket</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.1,
    //shadowRadius: 4,
    //elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  submitHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.1,
    //shadowRadius: 4,
    //elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  quickAction: {
    width: 160,
    padding: 14,
    borderRadius: 16,
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.1,
    //shadowRadius: 6,
    //elevation: 4,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionContent: {
    gap: 4,
  },
  quickActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
    flex: 1,
  },
  quickActionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quickActionBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  quickActionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  form: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 4 },
    //shadowOpacity: 0.1,
    //shadowRadius: 12,
    //elevation: 8,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
      //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.05,
    //shadowRadius: 2,
    //elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 14,
  },
  textAreaContainer: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.05,
    //shadowRadius: 2,
    //elevation: 1,
  },
  textArea: {
    minHeight: 100,
    fontSize: 16,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  aiSuggestionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityCard: {
    flex: 1,
    minWidth: '47%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.05,
    //shadowRadius: 2,
    //elevation: 1,
  },
  priorityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  priorityName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  priorityDescription: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.05,
    //shadowRadius: 2,
    //elevation: 1,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  assigneeList: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  assigneeCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.05,
    //shadowRadius: 2,
    //elevation: 1,
  },
  assigneeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  assigneeEmoji: {
    fontSize: 18,
  },
  assigneeName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  assigneeRole: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  unavailableText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },
  attachmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attachmentsList: {
    marginTop: 12,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  submitGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bottomPadding: {
    height: 32,
  },
});