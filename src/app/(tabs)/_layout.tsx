import { Tabs } from 'expo-router';

import { brand, functional } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
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
      <Tabs.Screen name="index" options={{ title: 'Workout' }} />
      <Tabs.Screen name="diet" options={{ title: 'Diet' }} />
      <Tabs.Screen name="supplements" options={{ title: 'Supplements' }} />
      <Tabs.Screen name="weight" options={{ title: 'Weight' }} />
    </Tabs>
  );
}
