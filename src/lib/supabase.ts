import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

// Only the publishable key belongs in the app: it is visible to anyone who
// has the bundle, and row-level security on every table is what protects the
// data. Never put a service-role key or any other secret in an
// EXPO_PUBLIC_ variable.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase config. Copy .env.example to .env.local, fill in EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then restart `npx expo start`. See supabase/README.md.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // no URL to read a session from on mobile
  },
});
