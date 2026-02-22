import { supabase } from '../lib/supabase';
import { DietTemplate, TemplateFilterOptions, TemplateUsageStats, TemplateRating } from './types/diet-templates';

export const TEMPLATE_CATEGORIES = [
  { id: 'weight_loss', name: 'Odchudzanie' },
  { id: 'muscle_gain', name: 'Przyrost masy mięśniowej' },
  { id: 'balanced', name: 'Zbilansowana' },
  { id: 'vegetarian', name: 'Wegetariańska' },
  { id: 'vegan', name: 'Wegańska' },
  { id: 'keto', name: 'Keto' },
  { id: 'other', name: 'Inna' },
] as const;

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Początkujący' },
  { id: 'intermediate', name: 'Średniozaawansowany' },
  { id: 'advanced', name: 'Zaawansowany' },
] as const;


export const getTemplates = async (filters: TemplateFilterOptions = {}): Promise<{ data: DietTemplate[] | null; error: any }> => {
  try {
    let query = supabase
      .from('diet_templates')
      .select('*')
      .order('name', { ascending: true });

    // Filtrowanie po kategoriach
    if (filters.category?.length) {
      query = query.in('category', filters.category);
    }

    // Filtrowanie po trudności
    if (filters.difficulty?.length) {
      query = query.in('difficulty', filters.difficulty);
    }

    // Wyszukiwanie po nazwie i opisie
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Tylko publiczne szablony
    if (filters.onlyPublic !== false) {
      query = query.eq('is_public', true);
    }

    // Minimalna ocena
    if (filters.minRating) {
      query = query.gte('average_rating', filters.minRating);
    }

    // Filtrowanie po tagach
    if (filters.tags?.length) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getTemplateById = async (id: string): Promise<{ data: DietTemplate | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('diet_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createTemplate = async (templateData: Omit<DietTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<{ data: DietTemplate | null; error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Użytkownik nie jest zalogowany');

    const newTemplate = {
      ...templateData,
      author_id: user.id,
      usage_count: 0,
      is_public: templateData.isPublic,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('diet_templates')
      .insert([newTemplate])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateTemplate = async (id: string, updates: Partial<DietTemplate>): Promise<{ data: DietTemplate | null; error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Użytkownik nie jest zalogowany');

    // Sprawdź, czy użytkownik jest autorem szablonu
    const { data: existingTemplate } = await supabase
      .from('diet_templates')
      .select('author_id')
      .eq('id', id)
      .single();

    if (existingTemplate?.author_id !== user.id) {
      throw new Error('Nie masz uprawnień do edycji tego szablonu');
    }

    const { data, error } = await supabase
      .from('diet_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteTemplate = async (id: string): Promise<{ error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Użytkownik nie jest zalogowany');

    // Sprawdź, czy użytkownik jest autorem szablonu
    const { data: existingTemplate } = await supabase
      .from('diet_templates')
      .select('author_id')
      .eq('id', id)
      .single();

    if (existingTemplate?.author_id !== user.id) {
      throw new Error('Nie masz uprawnień do usunięcia tego szablonu');
    }

    const { error } = await supabase
      .from('diet_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const useTemplate = async (templateId: string): Promise<{ data: DietTemplate | null; error: any }> => {
  try {
    // Pobierz szablon
    const { data: template, error: fetchError } = await getTemplateById(templateId);
    if (fetchError || !template) throw fetchError || new Error('Nie znaleziono szablonu');

    // Zwiększ licznik użyć
    const { error: updateError } = await supabase
      .from('diet_templates')
      .update({ 
        usage_count: (template.usageCount || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (updateError) throw updateError;

    // Zwróć dane szablonu do wykorzystania
    return { data: template, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const rateTemplate = async (
  templateId: string, 
  rating: number, 
  comment?: string
): Promise<{ data: TemplateRating | null; error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Użytkownik nie jest zalogowany');

    // Sprawdź, czy użytkownik już ocenił ten szablon
    const { data: existingRating } = await supabase
      .from('template_ratings')
      .select('id')
      .eq('template_id', templateId)
      .eq('user_id', user.id)
      .maybeSingle();

    let result;
    
    if (existingRating) {
      // Aktualizuj istniejącą ocenę
      const { data, error } = await supabase
        .from('template_ratings')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Dodaj nową ocenę
      const { data, error } = await supabase
        .from('template_ratings')
        .insert([{
          template_id: templateId,
          user_id: user.id,
          rating,
          comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    // Oblicz nową średnią ocen
    await updateTemplateAverageRating(templateId);

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

const updateTemplateAverageRating = async (templateId: string): Promise<void> => {
  try {
    // Pobierz wszystkie oceny dla szablonu
    const { data: ratings, error: ratingsError } = await supabase
      .from('template_ratings')
      .select('rating')
      .eq('template_id', templateId);

    if (ratingsError) throw ratingsError;

    // Oblicz średnią ocenę
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, { rating }) => sum + rating, 0) / ratings.length
      : null;

    // Zaktualizuj średnią ocenę w szablonie
    const { error: updateError } = await supabase
      .from('diet_templates')
      .update({
        average_rating: averageRating,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (updateError) throw updateError;
  } catch (error) {
    throw error;
  }
};

export const getTemplateUsageStats = async (templateId: string): Promise<{ data: TemplateUsageStats | null; error: any }> => {
  try {
    // Pobierz dane użycia szablonu
    const { data: template, error: templateError } = await supabase
      .from('diet_plans')
      .select('id, created_at')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (templateError) throw templateError;

    // Pobierz oceny szablonu
    const { data: ratings, error: ratingsError } = await supabase
      .from('template_ratings')
      .select('rating')
      .eq('template_id', templateId);

    if (ratingsError) throw ratingsError;

    // Oblicz statystyki
    const usageCount = template?.length || 0;
    const lastUsedAt = usageCount > 0 ? template[0].created_at : null;
    
    const ratingsCount = ratings?.length || 0;
    const averageRating = ratingsCount > 0 
      ? ratings.reduce((sum, { rating }) => sum + rating, 0) / ratingsCount 
      : null;

    return {
      data: {
        templateId,
        usageCount,
        lastUsedAt,
        averageRating,
        ratingsCount
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};
