-- Funkcja która automatycznie tworzy profil użytkownika
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Sprawdź czy użytkownik już istnieje w tabeli uzytkownicy
  IF NOT EXISTS (
    SELECT 1 FROM public.uzytkownicy WHERE id = NEW.id
  ) THEN
    -- Tworzy nowy profil
    INSERT INTO public.uzytkownicy (id, email, nazwa, allergies, medications)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      '{}', -- allergies
      '{}'  -- medications
    );
    
    -- Log dla debugowania (można usunąć w produkcji)
    RAISE LOG 'Created user profile for % (%)', NEW.id, NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Podłącz trigger do tabeli auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Dodaj komentarz dla dokumentacji
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatycznie tworzy profil w tabeli uzytkownicy gdy nowy użytkownik jest tworzony w Supabase Auth';
