import { supabase } from '../lib/supabase';

interface Recipe {
  id: number;
  tytul: string;
  opis: string;
  kalorie?: number;
  id_kategorii?: number;
  zrodlo?: string;
  utworzono_o: string;
  zaktualizowano_o: string;
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
}

interface RecipeIngredient {
  id: string;
  id_przepisu: string;
  id_skladnika: string;
  ilosc: number;
  jednostka: string;
  skladniki?: {
    id: string;
    nazwa: string;
    kategoria: string;
  };
}

interface RandomizationOptions {
  targetCalories: number;
  excludedIngredients?: string[];
  excludedCategories?: string[];
  excludedRecipeIds?: string[]; // Dodane: ID już użytych przepisów
  mealDistribution?: {
    sniadanie: number;
    drugie_sniadanie: number;
    obiad: number;
    podwieczorek: number;
    kolacja: number;
  };
}

interface RandomizedMeal {
  recipe: Recipe;
  calories: number;
  mealType: 'sniadanie' | 'drugie_sniadanie' | 'obiad' | 'podwieczorek' | 'kolacja';
}

interface WeeklyPlan {
  day: number;
  meals: RandomizedMeal[];
  totalCalories: number;
  targetCalories: number;
  achieved: boolean; // czy osiągnięto cel kaloryczny
}

interface RandomizationResult {
  meals: RandomizedMeal[];
  totalCalories: number;
  success: boolean;
  message?: string;
}

class EnhancedRandomizationService {
  private readonly DEFAULT_MEAL_DISTRIBUTION = {
    sniadanie: 0.25,
    drugie_sniadanie: 0.15,
    obiad: 0.35,
    podwieczorek: 0.10,
    kolacja: 0.15
  };

  private readonly MIN_CALORIES_PER_MEAL = 100;
  private readonly MAX_CALORIES_PER_MEAL = 1000;

  async getRandomizedMeals(
    userId: string,
    options: RandomizationOptions,
    numberOfMeals: number = 5
  ): Promise<RandomizationResult> {
    try {
      console.log('🎲 Rozpoczynam randomizację posiłków...');
      console.log('📋 Opcje randomizacji:', {
        targetCalories: options.targetCalories,
        excludedIngredients: options.excludedIngredients,
        excludedCategories: options.excludedCategories,
        excludedRecipeIds: options.excludedRecipeIds,
        numberOfMeals
      });
      
      // Pobierz wszystkie przepisy użytkownika z składnikami
      const recipes = await this.fetchRecipesWithIngredients(userId);
      console.log(`📚 Pobrano ${recipes.length} przepisów z bazy danych`);
      
      // Filtruj przepisy na podstawie ograniczeń
      const filteredRecipes = this.filterRecipes(recipes, options);
      console.log(`🔍 Po filtrowaniu pozostało ${filteredRecipes.length} przepisów`);
      
      if (filteredRecipes.length === 0) {
        return {
          meals: [],
          totalCalories: 0,
          success: false,
          message: 'Nie znaleziono przepisów spełniających podane kryteria. Spróbuj zmniejszyć liczbę wykluczonych składników.'
        };
      }

      // Wykonaj randomizację - po prostu rozdziel kalorie i szukaj najlepszych dopasowań
      const result = await this.performRandomization(filteredRecipes, options, numberOfMeals);
      
      console.log(`✅ Randomizacja zakończona. Wygenerowano ${result.meals.length} posiłków (${result.totalCalories} kcal)`);
      return result;
    } catch (error) {
      console.error('❌ Błąd podczas randomizacji:', error);
      return {
        meals: [],
        totalCalories: 0,
        success: false,
        message: 'Wystąpił błąd podczas losowania posiłków'
      };
    }
  }

  private async fetchRecipesWithIngredients(userId: string): Promise<Recipe[]> {
    try {
      // Pobierz wszystkie przepisy systemowe (większy limit, aby znaleźć te z składnikami)
      const { data: systemRecipes, error: systemError } = await supabase
        .from('przepisy')
        .select('id, tytul, kalorie, id_kategorii, opis, zrodlo, utworzono_o, zaktualizowano_o')
        .is('id_uzytkownika', null)
        .limit(200); // Zwiększamy limit, aby znaleźć przepisy z składnikami

      // Pobierz przepisy użytkownika
      const { data: userRecipes, error: userError } = await supabase
        .from('przepisy')
        .select('id, tytul, kalorie, id_kategorii, opis, zrodlo, utworzono_o, zaktualizowano_o')
        .eq('id_uzytkownika', userId)
        .limit(100);

      if (systemError) throw systemError;
      if (userError) throw userError;
      
      const allRecipes = [...(systemRecipes || []), ...(userRecipes || [])];
      
      // Pobierz składniki dla wszystkich przepisów
      const recipeIds = allRecipes.map(recipe => recipe.id);
      
      if (recipeIds.length === 0) {
        console.log('⚠️ Nie znaleziono przepisów');
        return [];
      }
      
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('skladniki_przepisow')
        .select(`
          id,
          id_przepisu,
          id_skladnika,
          ilosc,
          skladniki (
            id,
            nazwa
          )
        `)
        .in('id_przepisu', recipeIds);
      
      if (ingredientsError) throw ingredientsError;
      
      // Połącz przepisy z ich składnikami
      const recipesWithIngredients: Recipe[] = allRecipes.map(recipe => {
        const recipeIngredients = ingredients?.filter(ing => ing.id_przepisu === recipe.id).map(ing => ({
          id: Number(ing.id),
          id_przepisu: Number(ing.id_przepisu),
          id_skladnika: Number((ing as any).id_skladnika),
          ilosc: String(ing.ilosc),
          skladnik: ing.skladniki ? {
            id: Number((ing.skladniki as any).id),
            nazwa: String((ing.skladniki as any).nazwa)
          } : undefined
        })) || [];
        
        return {
          ...recipe,
          skladniki_przepisow: recipeIngredients
        } as Recipe;
      });
      
      // Filtruj tylko przepisy, które mają składniki
      const recipesWithActualIngredients = recipesWithIngredients.filter(
        recipe => recipe.skladniki_przepisow && recipe.skladniki_przepisow.length > 0
      );
      
      console.log(`📚 Pobrano ${recipesWithActualIngredients.length} przepisów z składnikami (z ${allRecipes.length} wszystkich przepisów)`);
      
      return recipesWithActualIngredients;
    } catch (error) {
      console.error('Błąd pobierania przepisów z składnikami:', error);
      return [];
    }
  }

  private filterRecipes(
    recipes: Recipe[],
    options: RandomizationOptions
  ): Recipe[] {
    return recipes.filter(recipe => {
      // Najpierw sprawdź, czy przepis ma składniki (ważne dla filtrowania)
      if (!recipe.skladniki_przepisow || recipe.skladniki_przepisow.length === 0) {
        console.log(`⚠️ Pomijam przepis "${recipe.tytul}" - brak składników`);
        return false;
      }

      // Sprawdź wykluczone składniki
      if (options.excludedIngredients && options.excludedIngredients.length > 0) {
        const hasExcludedIngredient = recipe.skladniki_przepisow?.some(
          si => si.skladnik && options.excludedIngredients!.includes(si.skladnik.nazwa)
        );
        if (hasExcludedIngredient) {
          console.log(`❌ Pomijam przepis "${recipe.tytul}" - zawiera wykluczony składnik`);
          return false;
        }
      }

      // Sprawdź wykluczone kategorie
      if (options.excludedCategories && options.excludedCategories.length > 0) {
        if (options.excludedCategories.includes(recipe.id_kategorii?.toString() || '')) {
          console.log(`❌ Pomijam przepis "${recipe.tytul}" - wykluczona kategoria`);
          return false;
        }
      }

      // Sprawdź wykluczone ID przepisów
      if (options.excludedRecipeIds && options.excludedRecipeIds.length > 0) {
        if (options.excludedRecipeIds.includes(recipe.id.toString())) {
          console.log(`❌ Pomijam przepis "${recipe.tytul}" - już użyty`);
          return false;
        }
      }

      console.log(`✅ Dopuszczono przepis "${recipe.tytul}"`);
      return true;
    });
  }

  private async performRandomization(
    recipes: Recipe[],
    options: RandomizationOptions,
    numberOfMeals: number = 5
  ): Promise<RandomizationResult> {
    const distribution = options.mealDistribution || this.DEFAULT_MEAL_DISTRIBUTION;
    
    // Dostosuj typy posiłków do liczby posiłków
    let mealTypes: Array<'sniadanie' | 'drugie_sniadanie' | 'obiad' | 'podwieczorek' | 'kolacja'> = [];
    
    if (numberOfMeals === 3) {
      mealTypes = ['sniadanie', 'obiad', 'kolacja'];
      // Dostosuj rozkład kalorii dla 3 posiłków
      distribution.sniadanie = 0.35;  // 35% śniadanie
      distribution.drugie_sniadanie = 0;     // nie używane
      distribution.obiad = 0.45;           // 45% obiad
      distribution.podwieczorek = 0;       // nie używane
      distribution.kolacja = 0.20;          // 20% kolacja
    } else if (numberOfMeals === 4) {
      mealTypes = ['sniadanie', 'drugie_sniadanie', 'obiad', 'kolacja'];
      // Dostosuj rozkład kalorii dla 4 posiłków
      distribution.sniadanie = 0.30;          // 30% śniadanie
      distribution.drugie_sniadanie = 0.15;     // 15% drugie śniadanie
      distribution.obiad = 0.40;               // 40% obiad
      distribution.podwieczorek = 0;           // nie używane
      distribution.kolacja = 0.15;              // 15% kolacja
    } else {
      mealTypes = ['sniadanie', 'drugie_sniadanie', 'obiad', 'podwieczorek', 'kolacja'];
      // Domyślny rozkład dla 5 posiłków
    }
    
    // Najpierw filtruj wszystkie przepisy według ograniczeń
    const filteredRecipes = this.filterRecipes(recipes, options);
    
    const meals: RandomizedMeal[] = [];
    let totalCalories = 0;
    const maxAttempts = 100;
    let attempts = 0;

    // Dla każdego typu posiłku spróbuj znaleźć odpowiedni przepis
    for (const mealType of mealTypes) {
      const targetMealCalories = options.targetCalories * distribution[mealType];
      const tolerance = targetMealCalories * 0.3; // 30% tolerancja

      let bestRecipe: Recipe | null = null;
      let bestScore = Infinity;

      // Znajdź najlepszy przepis dla tego posiłku
      for (const recipe of filteredRecipes) {
        // Sprawdź czy przepis nie został już użyty
        if (meals.some(m => m.recipe.id === recipe.id)) {
          continue;
        }

        // Oblicz dopasowanie kaloryczne
        const calorieDiff = Math.abs((recipe.kalorie || 0) - targetMealCalories);
        
        // Preferuj przepisy w tolerancji kalorycznej
        const score = calorieDiff <= tolerance ? calorieDiff : calorieDiff * 2;

        if (score < bestScore) {
          bestScore = score;
          bestRecipe = recipe;
        }
      }

      if (bestRecipe) {
        meals.push({
          recipe: bestRecipe,
          calories: bestRecipe.kalorie || 0,
          mealType
        });
        totalCalories += bestRecipe.kalorie || 0;
      }

      attempts++;
      if (attempts > maxAttempts) {
        break;
      }
    }

    // Jeśli nie udało się osiągnąć celu kalorycznego, spróbuj poprawić
    if (Math.abs(totalCalories - options.targetCalories) > options.targetCalories * 0.2) {
      const improvedResult = await this.improveCalorieBalance(meals, filteredRecipes, options);
      if (improvedResult.success) {
        return improvedResult;
      }
    }

    return {
      meals,
      totalCalories,
      success: meals.length === numberOfMeals,
      message: meals.length === numberOfMeals 
        ? `Pomyślnie wylosowano ${meals.length} posiłków (${totalCalories} kcal)`
        : `Udało się wylosować tylko ${meals.length} z ${numberOfMeals} posiłków (${totalCalories} kcal)`
    };
  }

  private async improveCalorieBalance(
    currentMeals: RandomizedMeal[],
    recipes: Recipe[],
    options: RandomizationOptions
  ): Promise<RandomizationResult> {
    const targetCalories = options.targetCalories;
    const currentTotal = currentMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const difference = targetCalories - currentTotal;

    // Jeśli różnica jest mała, nie próbuj poprawiać
    if (Math.abs(difference) < targetCalories * 0.1) {
      return {
        meals: currentMeals,
        totalCalories: currentTotal,
        success: true
      };
    }

    // Znajdź najlepszy przepis do zamiany lub dodania
    const unusedRecipes = recipes.filter(recipe => 
      !currentMeals.some(meal => meal.recipe.id === recipe.id)
    );

    if (unusedRecipes.length === 0) {
      return {
        meals: currentMeals,
        totalCalories: currentTotal,
        success: true
      };
    }

    // Posortuj przepisy według odpowiednich kryteriów
    const sortedRecipes = unusedRecipes.sort((a, b) => {
      if (difference > 0) {
        // Potrzebujemy więcej kalorii - preferuj wyższe kalorie
        return (b.kalorie || 0) - (a.kalorie || 0);
      } else {
        // Potrzebujemy mniej kalorii - preferuj niższe kalorie
        return (a.kalorie || 0) - (b.kalorie || 0);
      }
    });

    // Spróbuj zamienić jeden posiłek
    for (let i = 0; i < currentMeals.length; i++) {
      const currentMeal = currentMeals[i];
      
      for (const candidateRecipe of sortedRecipes) {
        const newTotal = currentTotal - currentMeal.calories + (candidateRecipe.kalorie || 0);
        const newDifference = Math.abs(newTotal - targetCalories);
        const currentDifference = Math.abs(currentTotal - targetCalories);

        if (newDifference < currentDifference) {
          currentMeals[i] = {
            recipe: candidateRecipe,
            calories: candidateRecipe.kalorie || 0,
            mealType: currentMeal.mealType
          };

          return {
            meals: [...currentMeals],
            totalCalories: newTotal,
            success: true
          };
        }
      }
    }

    return {
      meals: currentMeals,
      totalCalories: currentTotal,
      success: true
    };
  }

  // Metoda pomocnicza do pobierania dostępnych składników
  async getAvailableIngredients(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('skladniki')
        .select('nazwa')
        .order('nazwa');

      if (error) throw error;
      return data?.map(item => item.nazwa) || [];
    } catch (error) {
      return [];
    }
  }

  // Metoda pomocnicza do pobierania dostępnych kategorii
  async getAvailableCategories(userId: string): Promise<Array<{id: string, nazwa: string}>> {
    try {
      const { data, error } = await supabase
        .from('kategorie')
        .select('id, nazwa')
        .order('nazwa');

      if (error) throw error;
      return data?.map(item => ({ id: item.id.toString(), nazwa: item.nazwa })) || [];
    } catch (error) {
      return [];
    }
  }
}

export const enhancedRandomizationService = new EnhancedRandomizationService();
export type { RandomizationOptions, RandomizedMeal, RandomizationResult };
