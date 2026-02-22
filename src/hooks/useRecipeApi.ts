import { useState, useCallback } from 'react';
import { recipeService, type Przepis } from '../services/recipeService';

interface UseRecipeApiReturn {
  przepisy: Przepis[];
  isLoading: boolean;
  error: string | null;
  searchRecipes: (query: string, options?: {
    categoryId?: number;
    limit?: number;
    offset?: number;
    excludeIngredients?: string[];
  }) => Promise<void>;
  getRecipeById: (id: number) => Promise<Przepis | null>;
  getCategories: () => Promise<unknown[]>;
  getSources: () => Promise<unknown[]>;
  getIngredients: () => Promise<unknown[]>;
  addIngredient: (name: string) => Promise<unknown>;
}

export const useRecipeApi = (): UseRecipeApiReturn => {
  const [przepisy, setPrzepisy] = useState<Przepis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = useCallback(async (query: string, options?: {
    categoryId?: number;
    limit?: number;
    offset?: number;
    excludeIngredients?: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        query,
        categoryId: options?.categoryId,
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        excludeIngredients: options?.excludeIngredients,
      };
      
      const data = await recipeService.searchRecipes(params);
      setPrzepisy(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas wyszukiwania przepisów');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecipeById = useCallback(async (id: number): Promise<Przepis | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const recipe = await recipeService.getRecipeById(id);
      return recipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania przepisu');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const categories = await recipeService.getCategories();
      return categories;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania kategorii');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sources = await recipeService.getSources();
      return sources;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania źródeł');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getIngredients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ingredients = await recipeService.getIngredients();
      return ingredients;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania składników');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addIngredient = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ingredient = await recipeService.addIngredient(name);
      return ingredient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas dodawania składnika');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    przepisy,
    isLoading,
    error,
    searchRecipes,
    getRecipeById,
    getCategories,
    getSources,
    getIngredients,
    addIngredient,
  };
};
