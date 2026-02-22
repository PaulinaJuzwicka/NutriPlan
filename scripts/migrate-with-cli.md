# Migracja z Supabase CLI (NAJSZYBSZA)

## 1. Instalacja Supabase CLI
```bash
npm install -g supabase
```

## 2. Logowanie do starego konta
```bash
supabase login
```

## 3. Link do starego projektu
```bash
cd f:/Paulina/Praca inżynierska/NutriPlan
supabase link --project-ref stary-projekt-id
```

## 4. Dump bazy danych
```bash
supabase db dump > stara-baza.sql
```

## 5. Wyloguj i zaloguj na nowe konto
```bash
supabase logout
supabase login
```

## 6. Link do nowego projektu
```bash
supabase link --project-ref nowy-projekt-id
```

## 7. Import bazy
```bash
supabase db reset
supabase db push stara-baza.sql
```

## 8. Aktualizacja .env.local
Zaktualizuj VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY

Gotowe!
