import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Globalna instancja Supabase
let supabaseInstance: ReturnType<typeof createClient> | null = null;

// Funkcja do tworzenia/uzyskiwania instancji
export function getSupabaseInstance() {
  if (!supabaseInstance) {
    console.log('🔧 Creating new Supabase instance');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'nutriplan-app',
        },
      },
    });
  }
  return supabaseInstance;
}

// Funkcja do resetowania instancji (przy odświeżeniu strony)
export function resetSupabaseInstance() {
  console.log('🔄 Resetting Supabase instance');
  if (supabaseInstance) {
    // Cleanup jeśli potrzebne
    supabaseInstance = null;
  }
}

// Eksport instancji dla kompatybilności
export const supabase = getSupabaseInstance();
