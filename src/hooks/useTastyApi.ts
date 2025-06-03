import { useState, useCallback } from 'react';
import { tastyApi, TastyRecipeResult } from '../services/tastyApi';
import { Recipe } from '../types/recipes';

interface SearchParams {
  query?: string;
  tags?: string[];
  from?: number;
  number?: number;
}

interface UseTastyApiReturn {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  searchRecipes: (query: string, options?: SearchParams) => Promise<void>;
  getPersonalizedRecommendations: (user: any) => Promise<void>;
  getRandomRecipes: (params?: { tags?: string[]; number?: number }) => Promise<Recipe[]>;
}

export function useTastyApi(): UseTastyApiReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = useCallback(async (query: string, options: SearchParams = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await tastyApi.searchRecipes({
        query,
        ...options,
      });
      
      
      const mappedRecipes = results.map((recipe: TastyRecipeResult) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes || 30,
        servings: recipe.servings || 2,
        summary: recipe.summary || '',
        diets: recipe.diets || [],
        dishTypes: recipe.dishTypes || [],
        cuisines: recipe.cuisines || [],
        extendedIngredients: (recipe.ingredients || []).map((ing: any) => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount || 1,
          unit: ing.unit || '',
          originalString: `${ing.amount || 1} ${ing.unit || ''} ${ing.name}`
        })),
        analyzedInstructions: Array.isArray(recipe.instructions) ? [{
          steps: recipe.instructions.map((inst: any, idx: number) => ({
            number: inst.number || idx + 1,
            step: inst.step || ''
          }))
        }] : []
      }));
      
      setRecipes(mappedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for recipes');
      console.error('Error searching recipes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPersonalizedRecommendations = useCallback(async (user: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await tastyApi.getPersonalizedRecommendations(user);
      
      
      const mappedRecipes = results.map((recipe: TastyRecipeResult) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes || 30,
        servings: recipe.servings || 2,
        summary: recipe.summary || '',
        diets: recipe.diets || [],
        dishTypes: recipe.dishTypes || [],
        cuisines: recipe.cuisines || [],
        extendedIngredients: (recipe.ingredients || []).map((ing: any) => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount || 1,
          unit: ing.unit || '',
          originalString: `${ing.amount || 1} ${ing.unit || ''} ${ing.name}`
        })),
        analyzedInstructions: Array.isArray(recipe.instructions) ? [{
          steps: recipe.instructions.map((inst: any, idx: number) => ({
            number: inst.number || idx + 1,
            step: inst.step || ''
          }))
        }] : []
      }));
      
      setRecipes(mappedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching recommendations');
      console.error('Error getting personalized recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRandomRecipes = useCallback(async (params: { tags?: string[]; number?: number } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await tastyApi.searchRecipes({
        ...params,
        number: params.number || 10
      });
      
      
      const mappedRecipes = results.map((recipe: TastyRecipeResult) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes || 30,
        servings: recipe.servings || 2,
        summary: recipe.summary || '',
        diets: recipe.diets || [],
        dishTypes: recipe.dishTypes || [],
        cuisines: recipe.cuisines || [],
        extendedIngredients: (recipe.ingredients || []).map((ing: any) => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount || 1,
          unit: ing.unit || '',
          originalString: `${ing.amount || 1} ${ing.unit || ''} ${ing.name}`
        })),
        analyzedInstructions: Array.isArray(recipe.instructions) ? [{
          steps: recipe.instructions.map((inst: any, idx: number) => ({
            number: inst.number || idx + 1,
            step: inst.step || ''
          }))
        }] : []
      }));
      
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

  return {
    recipes,
    isLoading,
    error,
    searchRecipes,
    getPersonalizedRecommendations,
    getRandomRecipes,
  };
}

export default useTastyApi;
