import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  TextInput,
  Alert
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, Camera, Mic, MapPin, Plus, X, User, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function CreateTicketScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('');
  const [assignee, setAssignee] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const cardBg = isDark ? '#374151' : '#FFFFFF';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const categories = ['Network', 'Hardware', 'Software', 'Security', 'Server', 'Other'];
  const teamMembers = ['Auto Assign', 'John Smith', 'Mike Johnson', 'Sarah Davis', 'Alex Chen'];

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F97316';
      case 'Medium': return '#EAB308';
      case 'Low': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Simulate ticket creation
    Alert.alert(
      'Success',
      'Ticket created successfully!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const addAttachment = () => {
    // Simulate adding an attachment
    const newAttachment = `attachment_${Date.now()}.jpg`;
    setAttachments([...attachments, newAttachment]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Create Ticket</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: cardBg }]}>
            <Camera size={20} color="#3B82F6" />
            <Text style={[styles.quickActionText, { color: textColor }]}>Add Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: cardBg }]}>
            <Mic size={20} color="#10B981" />
            <Text style={[styles.quickActionText, { color: textColor }]}>Voice Input</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: cardBg }]}>
            <MapPin size={20} color="#F59E0B" />
            <Text style={[styles.quickActionText, { color: textColor }]}>Add Location</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: cardBg }]}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Title *</Text>
            <TextInput
              style={[styles.input, { 
                color: textColor, 
                borderColor: isDark ? '#4B5563' : '#D1D5DB',
                backgroundColor: isDark ? '#4B5563' : '#F9FAFB'
              }]}
              placeholder="Brief description of the issue"
              placeholderTextColor={subTextColor}
              value={title}
              onChangeText={setTitle}
              multiline
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { 
                color: textColor,
                borderColor: isDark ? '#4B5563' : '#D1D5DB',
                backgroundColor: isDark ? '#4B5563' : '#F9FAFB'
              }]}
              placeholder="Detailed description of the issue, steps to reproduce, and any error messages"
              placeholderTextColor={subTextColor}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Priority */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Priority</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priorityContainer}>
              {priorities.map((priorityLevel) => (
                <TouchableOpacity
                  key={priorityLevel}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: priority === priorityLevel 
                        ? getPriorityColor(priorityLevel)
                        : isDark ? '#4B5563' : '#F3F4F6',
                      borderColor: getPriorityColor(priorityLevel),
                      borderWidth: priority === priorityLevel ? 2 : 1,
                    }
                  ]}
                  onPress={() => setPriority(priorityLevel)}>
                  <AlertTriangle 
                    size={16} 
                    color={priority === priorityLevel ? '#FFFFFF' : getPriorityColor(priorityLevel)} 
                  />
                  <Text style={[
                    styles.priorityText,
                    { color: priority === priorityLevel ? '#FFFFFF' : getPriorityColor(priorityLevel) }
                  ]}>
                    {priorityLevel}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat ? '#3B82F6' : isDark ? '#4B5563' : '#F3F4F6',
                      borderColor: category === cat ? '#3B82F6' : 'transparent',
                    }
                  ]}
                  onPress={() => setCategory(cat)}>
                  <Text style={[
                    styles.categoryText,
                    { color: category === cat ? '#FFFFFF' : textColor }
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Assignee */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Assign To</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assigneeContainer}>
              {teamMembers.map((member) => (
                <TouchableOpacity
                  key={member}
                  style={[
                    styles.assigneeChip,
                    {
                      backgroundColor: assignee === member ? '#10B981' : isDark ? '#4B5563' : '#F3F4F6',
                      borderColor: assignee === member ? '#10B981' : 'transparent',
                    }
                  ]}
                  onPress={() => setAssignee(member)}>
                  <User 
                    size={16} 
                    color={assignee === member ? '#FFFFFF' : subTextColor} 
                  />
                  <Text style={[
                    styles.assigneeText,
                    { color: assignee === member ? '#FFFFFF' : textColor }
                  ]}>
                    {member}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Attachments */}
          <View style={styles.formGroup}>
            <View style={styles.attachmentHeader}>
              <Text style={[styles.label, { color: textColor }]}>Attachments</Text>
              <TouchableOpacity onPress={addAttachment}>
                <Plus size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
                  <View key={index} style={[styles.attachmentItem, { backgroundColor: isDark ? '#4B5563' : '#F3F4F6' }]}>
                    <Text style={[styles.attachmentName, { color: textColor }]}>{attachment}</Text>
                    <TouchableOpacity onPress={() => removeAttachment(index)}>
                      <X size={16} color={subTextColor} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Ticket</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  form: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  priorityContainer: {
    marginTop: 8,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryContainer: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  assigneeContainer: {
    marginTop: 8,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  assigneeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderRadius: 8,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});