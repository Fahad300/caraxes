import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { brand, functional, spacing } from '../lib/theme';

export default function Welcome() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <View style={styles.hero}>
        <Logo size={240} />
        <Text style={styles.wordmark} accessibilityRole="header">
          CARAXES
        </Text>
        <Text style={styles.tagline}>
          Workouts, protein, water and weight — logged plainly.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Create account"
          onPress={() => router.push({ pathname: '/sign-in', params: { mode: 'sign-up' } })}
        />
        <Button label="Sign in" variant="secondary" onPress={() => router.push('/sign-in')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: brand.black,
    paddingHorizontal: spacing.xxl,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  wordmark: {
    color: functional.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: spacing.lg,
  },
  tagline: {
    color: functional.textDim,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: { gap: spacing.md },
});
