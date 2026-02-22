-- Usuń trigger i funkcję jeśli istnieją
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Sprawdź czy usunięto
SELECT 'Trigger removed' as status;
