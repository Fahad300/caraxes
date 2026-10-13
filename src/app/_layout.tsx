import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../lib/auth';
import { queryClient } from '../lib/queryClient';
import { brand, functional } from '../lib/theme';

// Keep the splash up until the stored session has been read, so a signed-in
// user never flashes the welcome screen.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hide();
  }, [isLoading]);

  // Until the session is known, render nothing under the splash.
  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: brand.black } }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="welcome" />
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: true,
            title: '',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: brand.black },
            headerTintColor: functional.text,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
