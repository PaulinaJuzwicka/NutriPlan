import { supabase } from '../lib/supabase';

interface Recipe {
  id: string;
  nazwa: string;
  opis: string;
  instrukcje: string;
  czas_przygotowania: number;
  trudnosc: string;
  kalorie: number;
  bialko: number;
    weglowodany: number;
    tluszcze: number;
    blonnik: number;
  id_kategorii: string;
  id_uzytkownika: string;
  zdjecie_url?: string;
}

interface RecipeIngredient {
  id: string;
  id_przepisu: string;
  id_skladnika: string;
  ilosc: number;
  jednostka: string;
}

interface Ingredient {
  id: string;
  nazwa: string;
  kategoria: string;
  kalorie_na_100g: number;
  bialko_na_100g: number;
  weglowodany_na_100g: number;
  tluszcze_na_100g: number;
  blonnik_na_100g: number;
  witaminy: Record<string, number>;
  mineraly: Record<string, number>;
}

interface UserProfile {
  id: string;
  wiek: number;
  plec: 'm' | 'k';
  waga: number;
  wzrost: number;
  poziom_aktywnosci: string;
  cel: 'schudniecie' | 'utrzymanie' | 'masa';
  alergie: string[];
  wykluczone_skladniki: string[];
  preferencje: string[];
}

interface DailyNutrientNeeds {
  kalorie: number;
  bialko: number;
  weglowodany: number;
  tluszcze: number;
  blonnik: number;
  witaminy: Record<string, number>;
  mineraly: Record<string, number>;
}

interface MealPlan {
  dzien: number;
  sniadanie: Recipe;
  drugie_sniadanie: Recipe;
  obiad: Recipe;
  podwieczorek: Recipe;
  kolacja: Recipe;
  dzienne_kalorie: number;
  dzienne_bialko: number;
  dzienne_weglowodany: number;
  dzienne_tluszcze: number;
  dzienne_blonnik: number;
}

const intelligentDietPlanner = {
  // Oblicz dzienne zapotrzebowanie na podstawie profilu
  calculateDailyNeeds: (profile: UserProfile): DailyNutrientNeeds => {
    // Podstawowa przemiana materii (Harris-Benedict)
    let ppm: number;
    if (profile.plec === 'm') {
      ppm = 88.362 + (13.397 * profile.waga) + (4.799 * profile.wzrost) - (5.677 * profile.wiek);
    } else {
      ppm = 447.593 + (9.247 * profile.waga) + (3.098 * profile.wzrost) - (4.330 * profile.wiek);
    }

    // Mnożnik aktywności
    const activityMultipliers: Record<string, number> = {
      'bardzo_niska': 1.2,
      'niska': 1.375,
      'srednia': 1.55,
      'wysoka': 1.725,
      'bardzo_wysoka': 1.9
    };

    const cpm = ppm * (activityMultipliers[profile.poziom_aktywnosci] || 1.55);

    // Dostosuj do celu
    let targetCalories: number;
    switch (profile.cel) {
      case 'schudniecie':
        targetCalories = cpm - 500; // deficyt 500 kcal
        break;
      case 'masa':
        targetCalories = cpm + 500; // nadwyżka 500 kcal
        break;
      default:
        targetCalories = cpm;
    }

    return {
      kalorie: targetCalories,
      bialko: targetCalories * 0.15 / 4, // 15% kalorii z białka
      weglowodany: targetCalories * 0.55 / 4, // 55% z węglowodanów
      tluszcze: targetCalories * 0.30 / 9, // 30% z tłuszczów
      blonnik: 25, // 25g błonnika dziennie
      witaminy: {
        'A': 900, 'C': 90, 'D': 20, 'E': 15, 'K': 120,
        'B1': 1.2, 'B2': 1.3, 'B6': 1.7, 'B12': 2.4,
        'kwas_foliowy': 400, 'niacyna': 16, 'biotyna': 30
      },
      mineraly: {
        'wapń': 1000, 'żelazo': 18, 'magnez': 420, 'potas': 4700,
        'sód': 2300, 'cynk': 11, 'miedź': 0.9, 'mangan': 2.3,
        'selen': 55, 'jod': 150, 'fosfor': 700
      }
    };
  },

  // Analizuj braki żywieniowe na podstawie ostatnich posiłków
  analyzeNutrientGaps: async (userId: string, days: number = 7): Promise<Record<string, number>> => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Pobierz ostatnie posiłki z planów
    const { data: meals, error } = await supabase
      .from('posilki_planu')
      .select(`
        id_przepisu,
        przepisy!inner(
          kalorie, bialko, weglowodany, tluszcze, blonnik
        )
      `)
      .eq('id_uzytkownika', userId)
      .gte('data_posilku', startDate.toISOString())
      .lte('data_posilku', endDate.toISOString());

    if (error) throw error;

    // Oblicz średnie dzienne spożycie
    const dailyIntake = meals?.reduce((acc: { 
      kalorie: number; 
      bialko: number; 
      weglowodany: number; 
      tluszcze: number; 
      blonnik: number; 
    }, meal) => {
      const recipe = meal.przepisy;
      if (!recipe) return acc;
      
      acc.kalorie += recipe.kalorie || 0;
      acc.bialko += recipe.bialko || 0;
      acc.weglowodany += recipe.weglowodany || 0;
      acc.tluszcze += recipe.tluszcze || 0;
      acc.blonnik += recipe.blonnik || 0;
      
      return acc;
    }, { kalorie: 0, bialko: 0, weglowodany: 0, tluszcze: 0, blonnik: 0 });

    const daysWithData = Math.max(1, Math.floor(meals?.length || 0 / 4)); // 4 posiłki dziennie
    const averageDaily = {
      kalorie: dailyIntake.kalorie / daysWithData,
      bialko: dailyIntake.bialko / daysWithData,
      weglowodany: dailyIntake.weglowodany / daysWithData,
      tluszcze: dailyIntake.tluszcze / daysWithData,
      blonnik: dailyIntake.blonnik / daysWithData
    };

    return averageDaily;
  },

  // Inteligentnie dobierz przepisy do dziennego celu
  selectOptimalRecipes: async (
    targetCalories: number,
    excludedIngredients: string[] = [],
    preferredCategories: string[] = []
  ): Promise<Recipe[]> => {
    // Pobierz wszystkie przepisy z ich składnikami
    const { data: recipes, error } = await supabase
      .from('przepisy')
      .select(`
        *,
        skladniki_przepisow!inner(
          id_skladnika,
          skladniki!inner(nazwa, kategoria)
        )
      `)
      .order('kalorie', { ascending: true });

    if (error) throw error;

    // Filtruj przepisy na podstawie ograniczeń
    const filteredRecipes = recipes?.filter(recipe => {
      // Sprawdź alergie i wykluczenia
      const hasExcludedIngredient = recipe.skladniki_przepisow?.some(
        si => excludedIngredients.includes(si.skladniki.nazwa)
      );
      
      // Sprawdź preferencje kategorii
      const hasPreferredCategory = preferredCategories.length === 0 || 
        preferredCategories.includes(recipe.id_kategorii);

      return !hasExcludedIngredient && hasPreferredCategory;
    }) || [];

    // Użyj algorytmu zachłannego do wyboru przepisów
    return this.greedyRecipeSelection(filteredRecipes, targetCalories);
  },

  // Algorytm zachłanny - wybierz przepisy maksymalizujące wartość odżywczą
  greedyRecipeSelection: (recipes: Recipe[], targetCalories: number): Recipe[] => {
    const selectedRecipes: Recipe[] = [];
    let remainingCalories = targetCalories;

    // Sortuj przepisy po stosunku kalorii do wartości odżywczej
    const sortedRecipes = recipes.sort((a, b) => {
      const scoreA = (a.bialko + a.weglowodany + a.tluszcze) / a.kalorie;
      const scoreB = (b.bialko + b.weglowodany + b.tluszcze) / b.kalorie;
      return scoreB - scoreA;
    });

    for (const recipe of sortedRecipes) {
      if (recipe.kalorie <= remainingCalories) {
        selectedRecipes.push(recipe);
        remainingCalories -= recipe.kalorie;
      }
    }

    return selectedRecipes;
  },

  // Stwórz zrównoważony plan na 7 dni
  generateWeeklyPlan: async (
    profile: UserProfile,
    excludedIngredients: string[] = [],
    preferredCategories: string[] = []
  ): Promise<MealPlan[]> => {
    const dailyNeeds = this.calculateDailyNeeds(profile);
    const weeklyPlan: MealPlan[] = [];

    for (let day = 1; day <= 7; day++) {
      const dailyRecipes = await this.selectOptimalRecipes(
        dailyNeeds.kalorie,
        excludedIngredients,
        preferredCategories
      );

      // Podziel na 5 posiłków (śniadanie, II śniadanie, obiad, podwieczorek, kolacja)
      const mealPlan = this.distributeRecipesToMeals(dailyRecipes, dailyNeeds);
      mealPlan.dzien = day;
      
      weeklyPlan.push(mealPlan);
    }

    return weeklyPlan;
  },

  // Rozdziel przepisy na posiłki w ciągu dnia
  distributeRecipesToMeals: (recipes: Recipe[], needs: DailyNutrientNeeds): MealPlan => {
    // Prosty podział: 25% śniadanie, 15% II śniadanie, 35% obiad, 10% podwieczorek, 15% kolacja
    const mealDistribution = {
      sniadanie: 0.25,
      drugie_sniadanie: 0.15,
      obiad: 0.35,
      podwieczorek: 0.10,
      kolacja: 0.15
    };

    const emptyRecipe: Recipe = {
      id: '',
      nazwa: '',
      opis: '',
      instrukcje: '',
      czas_przygotowania: 0,
      trudnosc: '',
      kalorie: 0,
      bialko: 0,
      weglowodany: 0,
      tluszcze: 0,
      blonnik: 0,
      id_kategorii: '',
      id_uzytkownika: ''
    };

    const mealPlan: MealPlan = {
      dzien: 0,
      sniadanie: recipes[0] || emptyRecipe,
      drugie_sniadanie: recipes[1] || emptyRecipe,
      obiad: recipes[2] || emptyRecipe,
      podwieczorek: recipes[3] || emptyRecipe,
      kolacja: recipes[4] || emptyRecipe,
      dzienne_kalorie: 0,
      dzienne_bialko: 0,
      dzienne_weglowodany: 0,
      dzienne_tluszcze: 0,
      dzienne_blonnik: 0
    };

    // Oblicz dzienne wartości odżywcze
    mealPlan.dzienne_kalorie = 
      (mealPlan.sniadanie?.kalorie || 0) + (mealPlan.drugie_sniadanie?.kalorie || 0) + 
      (mealPlan.obiad?.kalorie || 0) + (mealPlan.podwieczorek?.kalorie || 0) + (mealPlan.kolacja?.kalorie || 0);
  
    mealPlan.dzienne_bialko = 
      (mealPlan.sniadanie?.bialko || 0) + (mealPlan.drugie_sniadanie?.bialko || 0) + 
      (mealPlan.obiad?.bialko || 0) + (mealPlan.podwieczorek?.bialko || 0) + (mealPlan.kolacja?.bialko || 0);
  
    mealPlan.dzienne_weglowodany = 
      (mealPlan.sniadanie?.weglowodany || 0) + (mealPlan.drugie_sniadanie?.weglowodany || 0) + 
      (mealPlan.obiad?.weglowodany || 0) + (mealPlan.podwieczorek?.weglowodany || 0) + (mealPlan.kolacja?.weglowodany || 0);
  
    mealPlan.dzienne_tluszcze = 
      (mealPlan.sniadanie?.tluszcze || 0) + (mealPlan.drugie_sniadanie?.tluszcze || 0) + 
      (mealPlan.obiad?.tluszcze || 0) + (mealPlan.podwieczorek?.tluszcze || 0) + (mealPlan.kolacja?.tluszcze || 0);
  
    mealPlan.dzienne_blonnik = 
      (mealPlan.sniadanie?.blonnik || 0) + (mealPlan.drugie_sniadanie?.blonnik || 0) + 
      (mealPlan.obiad?.blonnik || 0) + (mealPlan.podwieczorek?.blonnik || 0) + (mealPlan.kolacja?.blonnik || 0);

    return mealPlan;
  }
};

export default intelligentDietPlanner;
