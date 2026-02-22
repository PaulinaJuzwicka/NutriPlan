import { supabase } from '../supabase';

export type PrzepisFormData = {
  tytul: string;
  opis: string;
  id_kategorii?: number;
  zrodlo?: string;
  kalorie?: number;
  instrukcje?: string;
  skladniki?: Array<{
    id_skladnika: number;
    ilosc: string;
    jednostka: string;
  }>;
};

export async function createRecipe(data: PrzepisFormData, userId: string) {
  try {
    
    // Najpierw dodaj przepis
    const { data: przepis, error: recipeError } = await supabase
      .from('przepisy')
      .insert({
        id_uzytkownika: userId,
        tytul: data.tytul,
        opis: data.opis,
        id_kategorii: data.id_kategorii,
        zrodlo: data.zrodlo,
        kalorie: data.kalorie,
        instrukcje: data.instrukcje,
      })
      .select()
      .single();

    if (recipeError) {
      throw recipeError;
    }

    if (!przepis) {
      throw new Error('Nie udało się utworzyć przepisu - brak danych zwrotnych');
    }

    // Jeśli są składniki, dodaj je
    if (data.skladniki && data.skladniki.length > 0) {
      
      const skladnikiZPrzepisu = data.skladniki.map(skladnik => ({
        id_przepisu: przepis.id,
        id_skladnika: skladnik.id_skladnika,
        ilosc: skladnik.ilosc
        // Usunięto jednostka - tabela nie ma tej kolumny
      }));

      const { error: ingredientsError } = await supabase
        .from('skladniki_przepisow')  // Poprawna nazwa tabeli
        .insert(skladnikiZPrzepisu)
        .select();  // Wymuś odświeżenie

      if (ingredientsError) {
        throw ingredientsError;
      }
      
    } else {
      // No ingredients to add
    }

    return przepis;
  } catch (error) {
    throw error;
  }
}

export async function getRecipes(): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('przepisy')
    .select(`
      *,
      kategorie (*),
      zrodla (*),
      skladniki_przepisow (*, skladnik:skladniki (*))
    `)
    .order('utworzono_o', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getCategories(): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('kategorie')
    .select('*')
    .order('nazwa');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getSources(): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('zrodla')
    .select('*')
    .order('nazwa');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getIngredients(): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('skladniki')
    .select('*')
    .order('nazwa');

  if (error) {
    throw error;
  }

  return data || [];
}
