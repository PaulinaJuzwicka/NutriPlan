-- Kompletne usunięcie triggera
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Potwierdzenie
SELECT 'Trigger completely removed' as status;
