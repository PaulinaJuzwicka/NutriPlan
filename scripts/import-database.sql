-- Import danych do nowej bazy
-- Użyj w Supabase SQL Editor na nowym koncie

-- 1. Tworzenie tabel
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

CREATE TABLE IF NOT EXISTS public.plany_dietetyczne (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  nazwa TEXT,
  opis TEXT,
  czas_trwania INTEGER,
  kalorie_dzienne INTEGER,
  notatki TEXT,
  id_uzytkownika UUID REFERENCES public.uzytkownicy(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  zaktualizowano_o TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.posilki (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  nazwa TEXT,
  opis TEXT,
  kalorie INTEGER,
  typ_posilku TEXT,
  skladniki JSONB DEFAULT '{}',
  id_planu UUID REFERENCES public.plany_dietetyczne(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  zaktualizowano_o TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.przepisy (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  tytul TEXT,
  opis TEXT,
  przygotowanie TEXT,
  skladniki JSONB DEFAULT '{}',
  kalorie INTEGER,
  kategoria TEXT,
  czas_przygotowania INTEGER,
  trudnosc TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  zaktualizowano_o TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 2. Wstawianie danych (wklej dane ze starej bazy)
-- Przykład:
INSERT INTO public.uzytkownicy (id, email, nazwa, allergies, medications, created_at, zaktualizowano_o)
VALUES 
  ('uuid-uzytkownika-1', 'email@example.com', 'Nazwa Użytkownika', '{}', '{}', '2026-01-01 00:00:00', '2026-01-01 00:00:00');

-- 3. Włącz RLS (Row Level Security)
ALTER TABLE public.uzytkownicy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plany_dietetyczne ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posilki ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.przepisy ENABLE ROW LEVEL SECURITY;

-- 4. Tworzenie polityk RLS
CREATE POLICY "Users can view own profile" ON public.uzytkownicy FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.uzytkownicy FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.uzytkownicy FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own diet plans" ON public.plany_dietetyczne FOR SELECT USING (auth.uid() = id_uzytkownika);
CREATE POLICY "Users can create own diet plans" ON public.plany_dietetyczne FOR INSERT WITH CHECK (auth.uid() = id_uzytkownika);
CREATE POLICY "Users can update own diet plans" ON public.plany_dietetyczne FOR UPDATE USING (auth.uid() = id_uzytkownika);

CREATE POLICY "Users can view own meals" ON public.posilki FOR SELECT USING (auth.uid() = (SELECT id_uzytkownika FROM public.plany_dietetyczne WHERE id = id_planu));
CREATE POLICY "Users can create own meals" ON public.posilki FOR INSERT WITH CHECK (auth.uid() = (SELECT id_uzytkownika FROM public.plany_dietetyczne WHERE id = id_planu));
CREATE POLICY "Users can update own meals" ON public.posilki FOR UPDATE USING (auth.uid() = (SELECT id_uzytkownika FROM public.plany_dietetyczne WHERE id = id_planu));

CREATE POLICY "Users can view all recipes" ON public.przepisy FOR SELECT USING (true);
CREATE POLICY "Users can create recipes" ON public.przepisy FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own recipes" ON public.przepisy FOR UPDATE USING (auth.uid() = (SELECT id_uzytkownika FROM public.przepisy WHERE id = id));
