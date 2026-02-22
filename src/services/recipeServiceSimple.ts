import { supabase } from '../lib/supabase';

export type Przepis = {
  id: number;
  tytul: string;
  opis: string;
  kalorie?: number;
  id_kategorii?: number;
  zrodlo?: string;
  utworzono_o: string;
  zaktualizowano_o: string;
  instrukcje?: string;
  kategorie?: {
    id: number;
    nazwa: string;
    opis?: string;
  } | null;
  skladniki_przepisow?: Array<{
    id: number;
    id_przepisu: number;
    id_skladnika: number;
    ilosc: string;
    skladnik?: {
      id: number;
      nazwa: string;
    };
  }>;
};

export interface WyszukiwarkaPrzepisow {
  query?: string;
  categoryId?: number;
  limit?: number;
  offset?: number;
  excludeIngredients?: string[];
}

export const recipeService = {
  // Pobieranie przepisu po ID
  async getRecipeById(id: number): Promise<Przepis | null> {
    try {
      const { data, error } = await supabase
        .from('przepisy')
        .select(`
          *,
          kategorie (id, nazwa),
          skladniki_przepisow (id, id_przepisu, id_skladnika, ilosc, skladnik:skladniki (id, nazwa))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      
      return null;
    }
  },

  // Wyszukiwanie przepisów
  async searchRecipes(params: WyszukiwarkaPrzepisow): Promise<Przepis[]> {
    try {
      let query = supabase
        .from('przepisy')
        .select(`
          *,
          kategorie (id, nazwa),
          skladniki_przepisow (id, id_przepisu, id_skladnika, ilosc, skladnik:skladniki (id, nazwa))
        `)
        .order('utworzono_o', { ascending: false });

      if (params.query) {
        query = query.ilike('tytul', `%${params.query}%`);
      }

      if (params.categoryId) {
        query = query.eq('id_kategorii', params.categoryId);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      let recipes = data || [];

      // Filtrowanie po wykluczonych składnikach (po stronie klienta)
      if (params.excludeIngredients && params.excludeIngredients.length > 0) {
        recipes = recipes.filter(recipe => {
          if (!recipe.skladniki_przepisow || recipe.skladniki_przepisow.length === 0) return true;
          
          const ingredientNames = recipe.skladniki_przepisow
            .map(s => s.skladnik?.nazwa?.toLowerCase() || '')
            .filter(name => name.length > 0);
          
          const hasExcludedIngredient = params.excludeIngredients!.some(excludeIngredient => 
            ingredientNames.some(ingredientName => 
              ingredientName.includes(excludeIngredient.toLowerCase()) ||
              excludeIngredient.toLowerCase().includes(ingredientName)
            )
          );
          
          return !hasExcludedIngredient;
        });
      }

      return recipes;
    } catch (error) {
      
      return [];
    }
  },

  // Pobieranie kategorii
  async getCategories(): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('kategorie')
        .select('*')
        .order('nazwa');

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      return [];
    }
  },

  // Pobieranie kategorii posiłków
  async getMealCategories(): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('kategorie')
        .select('*')
        .in('nazwa', ['Śniadanie', 'Obiad', 'Kolacja', 'Przekąski', 'Desery', 'Napoje'])
        .order('nazwa');

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      return [];
    }
  },

  // Pobieranie składników
  async getIngredients(): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('skladniki')
        .select('*')
        .order('nazwa');

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      return [];
    }
  },

  // Dodawanie składnika
  async addIngredient(name: string): Promise<unknown> {
    try {
      const { data, error } = await supabase
        .from('skladniki')
        .insert([{ nazwa: name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      
      return null;
    }
  },

  // Aktualizacja przepisu
  async updateRecipe(id: number, updates: Partial<Przepis>): Promise<Przepis> {
    try {
      const { data, error } = await supabase
        .from('przepisy')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from recipe update');
      return data;
    } catch (error) {
      
      throw error;
    }
  },

  // Usuwanie przepisu
  async deleteRecipe(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('przepisy')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      
      throw error;
    }
  }
};

export default recipeService;
