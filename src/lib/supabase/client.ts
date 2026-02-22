import { createBrowserClient } from '@supabase/ssr';

// Eksport domyślnej instancji klienta Supabase
export const supabase = createBrowserClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Eksport funkcji createClient dla kompatybilności wstecznej
export function createClient() {
  return supabase;
}
