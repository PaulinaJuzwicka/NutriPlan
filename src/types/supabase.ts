// Typy dla tabel Supabase
export interface Database {
  public: {
    Tables: {
      uzytkownicy: {
        Row: {
          id: string;
          email: string | null;
          nazwa: string | null;
          allergies: Record<string, any>;
          medications: Record<string, any>;
          created_at: string;
          zaktualizowano_o: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          nazwa?: string | null;
          allergies?: Record<string, any>;
          medications?: Record<string, any>;
          created_at?: string;
          zaktualizowano_o?: string;
        };
        Update: {
          email?: string | null;
          nazwa?: string | null;
          allergies?: Record<string, any>;
          medications?: Record<string, any>;
          zaktualizowano_o?: string;
        };
      };
      plany_dietetyczne: {
        Row: {
          id: string;
          nazwa: string;
          opis: string | null;
          id_uzytkownika: string | null;
          czas_trwania: number;
          kalorie_dzienne: number;
          notatki: string | null;
          aktywny: boolean | null;
          utworzono_o: string | null;
          zaktualizowano_o: string | null;
          start_date: string | null;
          meal_plan_type: string | null;
          standard_meals: any | null;
          custom_meals: any | null;
          alergie: string[] | null;
          wykluczone_skladniki: string[] | null;
          kategoria: string | null;
          trudnosc: string | null;
          cel_wagowy: number | null;
        };
        Insert: {
          id?: string;
          nazwa: string;
          opis?: string | null;
          id_uzytkownika?: string | null;
          czas_trwania: number;
          kalorie_dzienne: number;
          notatki?: string | null;
          aktywny?: boolean | null;
          utworzono_o?: string | null;
          zaktualizowano_o?: string | null;
          start_date?: string | null;
          meal_plan_type?: string | null;
          standard_meals?: any | null;
          custom_meals?: any | null;
          alergie?: string[] | null;
          wykluczone_skladniki?: string[] | null;
          kategoria?: string | null;
          trudnosc?: string | null;
          cel_wagowy?: number | null;
        };
        Update: {
          nazwa?: string;
          opis?: string | null;
          id_uzytkownika?: string | null;
          czas_trwania?: number;
          kalorie_dzienne?: number;
          notatki?: string | null;
          aktywny?: boolean | null;
          zaktualizowano_o?: string | null;
          start_date?: string | null;
          meal_plan_type?: string | null;
          standard_meals?: any | null;
          custom_meals?: any | null;
          alergie?: string[] | null;
          wykluczone_skladniki?: string[] | null;
          kategoria?: string | null;
          trudnosc?: string | null;
          cel_wagowy?: number | null;
        };
      };
      posilki_planu: {
        Row: {
          id: string;
          plan_id: string;
          day_number: number;
          meal_type: 'sniadanie' | 'drugie_sniadanie' | 'obiad' | 'podwieczorek' | 'kolacja';
          recipe_id: number;
          scheduled_for: string;
          calories: number;
          is_completed: boolean;
          notatki: string | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          day_number: number;
          meal_type: 'sniadanie' | 'drugie_sniadanie' | 'obiad' | 'podwieczorek' | 'kolacja';
          recipe_id: number;
          scheduled_for: string;
          calories: number;
          is_completed: boolean;
          notatki?: string | null;
        };
        Update: {
          day_number?: number;
          meal_type?: 'sniadanie' | 'drugie_sniadanie' | 'obiad' | 'podwieczorek' | 'kolacja';
          recipe_id?: number;
          scheduled_for?: string;
          calories?: number;
          is_completed?: boolean;
          notatki?: string | null;
        };
      };
      przepisy: {
        Row: {
          id: string;
          tytul: string | null;
          opis: string | null;
          przygotowanie: string | null;
          instrukcje?: string | null; // Alias dla przygotowania
          skladniki: Record<string, any>;
          kalorie: number | null;
          kategoria: string | null;
          czas_przygotowania: number | null;
          trudnosc: string | null;
          created_at: string;
          zaktualizowano_o: string;
        };
        Insert: {
          id?: string;
          tytul?: string | null;
          opis?: string | null;
          przygotowanie?: string | null;
          instrukcje?: string | null; // Alias dla przygotowania
          skladniki?: Record<string, any>;
          kalorie?: number | null;
          kategoria?: string | null;
          czas_przygotowania?: number | null;
          trudnosc?: string | null;
          created_at?: string;
          zaktualizowano_o?: string;
        };
        Update: {
          tytul?: string | null;
          opis?: string | null;
          przygotowanie?: string | null;
          instrukcje?: string | null; // Alias dla przygotowania
          skladniki?: Record<string, any>;
          kalorie?: number | null;
          kategoria?: string | null;
          czas_przygotowania?: number | null;
          trudnosc?: string | null;
          zaktualizowano_o?: string;
        };
      };
      skladniki: {
        Row: {
          id: string;
          nazwa: string;
        };
        Insert: {
          id?: string;
          nazwa: string;
        };
        Update: {
          nazwa?: string;
        };
      };
      skladniki_przepisow: {
        Row: {
          id: string;
          id_przepisu: string;
          id_skladnika: string;
          ilosc: number;
        };
        Insert: {
          id?: string;
          id_przepisu: string;
          id_skladnika: string;
          ilosc: number;
        };
        Update: {
          id_przepisu?: string;
          id_skladnika?: string;
          ilosc?: number;
        };
      };
      leki: {
        Row: {
          id: string;
          nazwa: string;
          dawka: string;
          czestotliwosc: string;
          forma: string;
          aktywny: boolean;
          czy_staly: boolean;
          godziny_przyjmowania: string[];
          notatki: string | null;
          data_zakonczenia: string | null;
          rozpoczeto_od: string;
          id_uzytkownika: string;
          dawki_dziennie: number;
          data_rozpoczecia: string;
          created_at: string;
          zaktualizowano_o: string;
        };
        Insert: {
          id?: string;
          nazwa: string;
          dawka: string;
          czestotliwosc: string;
          forma: string;
          aktywny: boolean;
          czy_staly: boolean;
          godziny_przyjmowania: string[];
          notatki?: string | null;
          data_zakonczenia?: string | null;
          rozpoczeto_od: string;
          id_uzytkownika: string;
          dawki_dziennie: number;
          data_rozpoczecia?: string;
          created_at?: string;
          zaktualizowano_o?: string;
        };
        Update: {
          nazwa?: string;
          dawka?: string;
          czestotliwosc?: string;
          forma?: string;
          aktywny?: boolean;
          czy_staly?: boolean;
          godziny_przyjmowania?: string[];
          notatki?: string | null;
          data_zakonczenia?: string | null;
          rozpoczeto_od?: string;
          dawki_dziennie?: number;
          data_rozpoczecia?: string;
          zaktualizowano_o?: string;
        };
      };
      historia_przyjmowania_lekow: {
        Row: {
          id: string;
          id_leku: string;
          id_uzytkownika: string;
          przyjeto_o: string;
          zaplanowana_godzina: string;
          status: string;
          czy_przyjete: boolean;
          data: string;
          created_at: string;
          zaktualizowano_o: string;
        };
        Insert: {
          id?: string;
          id_leku: string;
          id_uzytkownika: string;
          przyjeto_o: string;
          zaplanowana_godzina: string;
          status: string;
          czy_przyjete: boolean;
          data: string;
          created_at?: string;
          zaktualizowano_o?: string;
        };
        Update: {
          id_leku?: string;
          id_uzytkownika?: string;
          przyjeto_o?: string;
          zaplanowana_godzina?: string;
          status?: string;
          czy_przyjete?: boolean;
          data?: string;
          zaktualizowano_o?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
