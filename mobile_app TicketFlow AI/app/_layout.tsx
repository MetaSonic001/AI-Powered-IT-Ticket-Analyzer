import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TicketProvider } from '../contexts/TicketContext';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  // useFrameworkReady();

  return (
    <TicketProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tickets/create" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </TicketProvider>
  );
}