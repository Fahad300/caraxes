import { Stack } from 'expo-router';

import { brand, functional } from '../../lib/theme';

export default function RoutineLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: brand.black },
        headerTintColor: functional.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: functional.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Routine' }} />
      <Stack.Screen name="[dayId]" options={{ title: 'Edit day' }} />
      <Stack.Screen name="pick-exercise" options={{ title: 'Choose exercise', presentation: 'modal' }} />
    </Stack>
  );
}
