import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TicketFlow AI</Text>
      <Text style={styles.subtitle}>Welcome to the app!</Text>
      <Link href="/(auth)" style={styles.link}>
        <Text style={styles.linkText}>Go to Auth</Text>
      </Link>
      <Link href="/(tabs)/dashboard" style={styles.link}>
        <Text style={styles.linkText}>Go to Dashboard</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  link: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  linkText: {
    color: 'white',
    fontWeight: 'bold',
  },
});