import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChartBar as BarChart3, Search, Bell, User, Chrome as Home, Sparkles } from 'lucide-react-native';

// Custom Tab Bar Icon with Gradient Background
function TabBarIcon({ IconComponent, focused, size, color }) {
  if (focused) {
    return (
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
        <IconComponent size={size - 2} color="#FFFFFF" />
        <Sparkles 
          size={10} 
          color="#FFFFFF" 
          style={{ 
            position: 'absolute', 
            top: 2, 
            right: 2, 
            opacity: 0.8 
          }} 
        />
      </LinearGradient>
    );
  }
  
  return <IconComponent size={size} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
          borderTopWidth: 1,
          paddingTop: 12,
          paddingBottom: 12,
          paddingHorizontal: 8,
          height: 88,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 16,
          elevation: 20,
          // Glassmorphism effect
          backdropFilter: 'blur(20px)',
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
          letterSpacing: -0.2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={isDark 
              ? ['rgba(31, 41, 55, 0.95)', 'rgba(17, 24, 39, 0.95)']
              : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']
            }
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />
        ),
      }}>
      
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              IconComponent={Home} 
              focused={focused} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              IconComponent={BarChart3} 
              focused={focused} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              IconComponent={Search} 
              focused={focused} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              IconComponent={BarChart3} 
              focused={focused} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon 
              IconComponent={User} 
              focused={focused} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}