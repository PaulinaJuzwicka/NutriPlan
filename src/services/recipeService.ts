import axios from 'axios';
import { MealPreference } from '../types/diet';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || 'a391fb6c21msh5dc1d1aeea381b2p192e49jsn261439b3507c';

const api = axios.create({
  baseURL: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
  },
});

export interface RecipeSearchResult {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export const searchRecipes = async (query: string, number: number = 5): Promise<MealPreference[]> => {
  try {
    const response = await api.get('/recipes/complexSearch', {
      params: {
        query,
        number,
        addRecipeNutrition: true,
        fillIngredients: true,
      },
    });

    
    const recipePromises = response.data.results.map((recipe: any) => 
      getRecipeInformation(recipe.id)
    );
    
    const recipes = await Promise.all(recipePromises);
    
    return recipes.map(recipe => ({
      id: recipe.id.toString(),
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      nutrition: {
        calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0,
        protein: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0,
        fat: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0,
        carbohydrates: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
      },
    }));
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
};

const getRecipeInformation = async (id: number) => {
  try {
    const response = await api.get(`/recipes/${id}/information`, {
      params: {
        includeNutrition: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    return null;
  }
};
