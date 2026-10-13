import { Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { useEnsureSeeded } from '../../lib/seed';
import { supabase } from '../../lib/supabase';
import { brand, dangerText, functional, spacing } from '../../lib/theme';

export default function TabsLayout() {
  const seeded = useEnsureSeeded();

  // First sign-in creates the program and supplement stack server-side; the
  // tabs read from it, so wait for that rather than flash empty screens.
  if (seeded.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={functional.text} />
      </View>
    );
  }

  if (seeded.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn&apos;t set up your account</Text>
        <Text style={styles.errorBody}>{seeded.error.message}</Text>
        <View style={styles.retry}>
          <Button label="Try again" onPress={() => seeded.refetch()} loading={seeded.isFetching} />
        </View>
      </View>
    );
  }

  return (
    <Tabs
      initialRouteName="today"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: brand.black },
        headerTintColor: functional.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: { backgroundColor: brand.black, borderTopColor: functional.border },
        tabBarActiveTintColor: brand.redBright,
        tabBarInactiveTintColor: functional.textDim,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => supabase.auth.signOut()}
              style={{ paddingHorizontal: spacing.lg }}
            >
              <Text style={{ color: functional.textDim, fontSize: 15 }}>Sign out</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ title: 'Workout' }} />
      <Tabs.Screen name="diet" options={{ title: 'Diet' }} />
      <Tabs.Screen name="supplements" options={{ title: 'Supplements' }} />
      <Tabs.Screen name="weight" options={{ title: 'Weight' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.black,
    padding: spacing.xxl,
    gap: spacing.md,
  },
  errorTitle: { color: functional.text, fontSize: 18, fontWeight: '700' },
  errorBody: { color: dangerText, textAlign: 'center' },
  retry: { alignSelf: 'stretch', marginTop: spacing.md },
});
