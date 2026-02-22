-- Eksport tabeli uzytkownicy
-- Użyj w Supabase SQL Editor na starym koncie

-- 1. Struktura tabeli uzytkownicy
CREATE TABLE IF NOT EXISTS public.uzytkownicy (
  id UUID NOT NULL,
  email TEXT,
  nazwa TEXT,
  allergies JSONB DEFAULT '{}',
  medications JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  zaktualizowano_o TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 2. Eksport danych (skopiuj wynik)
SELECT 
  id,
  email,
  nazwa,
  allergies,
  medications,
  created_at,
  zaktualizowano_o
FROM public.uzytkownicy;

-- 3. Eksport planów dietetycznych
SELECT 
  id,
  nazwa,
  opis,
  czas_trwania,
  kalorie_dzienne,
  notatki,
  id_uzytkownika,
  created_at,
  zaktualizowano_o
FROM public.plany_dietetyczne;

-- 4. Eksport posiłków
SELECT 
  id,
  nazwa,
  opis,
  kalorie,
  typ_posilku,
  skladniki,
  id_planu,
  created_at,
  zaktualizowano_o
FROM public.posilki;

-- 5. Eksport przepisów
SELECT 
  id,
  tytul,
  opis,
  przygotowanie,
  skladniki,
  kalorie,
  kategoria,
  czas_przygotowania,
  trudnosc,
  created_at,
  zaktualizowano_o
FROM public.przepisy;
