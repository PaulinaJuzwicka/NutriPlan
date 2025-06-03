import { useState, useCallback } from 'react';
import { tasteApi, Recipe, ExtendedRecipe } from '../services/tasteApi';

interface RecipeWithDetails {
  id: number;
  title: string;
  image?: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  diets: string[];
  dishTypes: string[];
  cuisines: string[];
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    originalString: string;
  }>;
  analyzedInstructions: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
}

interface SearchOptions {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string[];
  maxReadyTime?: number;
  minCalories?: number;
  maxCalories?: number;
  tags?: string[];
  number?: number;
  offset?: number;
}

interface UseTasteApiReturn {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  searchRecipes: (query: string, options?: SearchOptions) => Promise<void>;
  getRecipeById: (id: number) => Promise<Recipe>;
  getRandomRecipes: (params?: { tags?: string[]; number?: number }) => Promise<RecipeWithDetails[]>;
  getMealPlanByDiet: (params: {
    diet: string;
    calories: number;
    timeFrame: 'day' | 'week';
  }) => Promise<any>;
  generateShoppingList: (recipeIds: number[], servings?: number) => Promise<Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original?: string;
    recipeTitles: string[];
  }>>;
  getPersonalizedRecommendations: (user: { id: string; preferences?: string[] }) => Promise<void>;
}

export function useTasteApi(): UseTasteApiReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = useCallback(async (query: string, options: SearchOptions = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const { tags, ...searchParams } = options;
      const results = await tasteApi.searchRecipes({
        query,
        ...searchParams,
        number: options.number || 10,
        offset: options.offset || 0,
      });
      
      
      const detailedRecipes = await Promise.all(
        results.results.map(recipe => 
          tasteApi.getRecipeDetails(recipe.id).catch(err => {
            console.error(`Error fetching details for recipe ${recipe.id}:`, err);
            return null;
          })
        )
      );

      
      const mappedRecipes = detailedRecipes
        .filter((recipe): recipe is ExtendedRecipe => recipe !== null)
        .map(recipe => {
          const instructions = Array.isArray(recipe.instructions) 
            ? recipe.instructions 
            : recipe.instructions 
              ? [{ number: 1, step: recipe.instructions }] 
              : [];

          
          const safeRecipe: RecipeWithDetails = {
            id: recipe.id,
            title: recipe.title || 'Untitled Recipe',
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes || 30,
            servings: recipe.servings || 2,
            summary: (recipe as any).summary || '',
            diets: recipe.diets || [],
            dishTypes: [], // Not provided by the API
            cuisines: [], // Not provided by the API
            extendedIngredients: ((recipe as any).extendedIngredients || []).map((ing: any) => ({
              id: ing.id,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              originalString: ing.original || `${ing.amount} ${ing.unit} ${ing.name}`
            })),
            analyzedInstructions: [{
              steps: instructions.map((step, idx) => ({
                number: step.number || idx + 1,
                step: step.step
              }))
            }]
          };
          
          return safeRecipe;
        });
      
      setRecipes(mappedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for recipes');
      console.error('Error searching recipes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPersonalizedRecommendations = useCallback(async (user: { id: string; preferences?: string[] }) => {
    setIsLoading(true);
    setError(null);
    try {
      
      const tags = user.preferences?.length ? user.preferences : ['healthy', 'balanced'];
      await searchRecipes('', { tags });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching recommendations');
      console.error('Error getting personalized recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchRecipes]);

  const getRandomRecipes = useCallback(async (params: { tags?: string[]; number?: number } = { number: 10 }) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await tasteApi.getRandomRecipes({
        ...params,
        number: params.number || 10
      });
      
      
      const detailedRecipes = await Promise.all(
        results.map(recipe => 
          tasteApi.getRecipeDetails(recipe.id).catch(err => {
            console.error(`Error fetching details for recipe ${recipe.id}:`, err);
            return null;
          })
        )
      );
      
      
      const mappedRecipes = detailedRecipes
        .filter((recipe): recipe is ExtendedRecipe => recipe !== null)
        .map(recipe => {
          const instructions = Array.isArray(recipe.instructions) 
            ? recipe.instructions 
            : recipe.instructions 
              ? [{ number: 1, step: recipe.instructions }] 
              : [];

          
          const safeRecipe: RecipeWithDetails = {
            id: recipe.id,
            title: recipe.title || 'Untitled Recipe',
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes || 30,
            servings: recipe.servings || 2,
            summary: (recipe as any).summary || '',
            diets: recipe.diets || [],
            dishTypes: [], // Not provided by the API
            cuisines: [], // Not provided by the API
            extendedIngredients: ((recipe as any).extendedIngredients || []).map((ing: any) => ({
              id: ing.id,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              originalString: ing.original || `${ing.amount} ${ing.unit} ${ing.name}`
            })),
            analyzedInstructions: [{
              steps: instructions.map((step, idx) => ({
                number: step.number || idx + 1,
                step: step.step
              }))
            }]
          };
          
          return safeRecipe;
        });
      
      setRecipes(mappedRecipes);
      return mappedRecipes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching random recipes';
      setError(errorMessage);
      console.error('Error getting random recipes:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecipeById = useCallback(async (id: number): Promise<Recipe> => {
    setIsLoading(true);
    setError(null);
    try {
      const recipe = await tasteApi.getRecipeDetails(id);
      return recipe;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recipe details';
      setError(errorMessage);
      console.error('Error getting recipe by ID:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMealPlanByDiet = useCallback(async (params: {
    diet: string;
    calories: number;
    timeFrame: 'day' | 'week';
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      return await tasteApi.getMealPlanByDiet(params);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate meal plan';
      setError(errorMessage);
      console.error('Error getting meal plan:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateShoppingList = useCallback(async (recipeIds: number[], servings: number = 2) => {
    setIsLoading(true);
    setError(null);
    try {
      return await tasteApi.generateShoppingList(recipeIds, servings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate shopping list';
      setError(errorMessage);
      console.error('Error generating shopping list:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    recipes,
    isLoading,
    error,
    searchRecipes,
    getRecipeById,
    getRandomRecipes,
    getMealPlanByDiet,
    generateShoppingList,
    getPersonalizedRecommendations,
  };
}
