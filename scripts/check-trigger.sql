-- Sprawdź czy trigger istnieje
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Sprawdź czy funkcja istnieje
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Sprawdź ostatnie błędy
SELECT 
    error,
    detail,
    hint
FROM pg_stat_activity 
WHERE state = 'active' AND query LIKE '%handle_new_user%';
