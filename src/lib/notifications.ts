import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function scheduleRestEndNotification(secondsFromNow: number): Promise<string | null> {
  const granted = await ensureNotificationPermission();
  if (!granted || secondsFromNow <= 0) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Rest complete', body: 'Back to it.' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsFromNow,
    },
  });
}

export async function cancelScheduledNotification(id: string | null): Promise<void> {
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id);
}
