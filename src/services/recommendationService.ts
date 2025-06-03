import { User } from '../types';
import { TastyRecipeResult } from './tastyApi';

type RecipeTag = string | { name?: string; title?: string } | null | undefined;

export interface IMealRecommendation {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  matchScore: number;
  reasons: string[];
  suitableFor: string[];
  mealType: string;
  ingredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    potassium?: number;
    phosphorus?: number;
  };
  
  
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  veryHealthy?: boolean;
  cheap?: boolean;
  
  
  healthScore?: number;
  sourceName?: string;
  pricePerServing?: number;
  creditsText?: string;
}

const hasTag = (recipe: TastyRecipeResult | IMealRecommendation, tagName: string): boolean => {
  try {
    if (!recipe) return false;
    
    
    if ('tags' in recipe && Array.isArray(recipe.tags)) {
      return recipe.tags.some(tag => {
        if (!tag) return false;
        if (typeof tag === 'string') return tag.toLowerCase() === tagName.toLowerCase();
        if (typeof tag === 'object') {
          return (
            tag.name?.toLowerCase() === tagName.toLowerCase() ||
            tag.title?.toLowerCase() === tagName.toLowerCase()
          );
        }
        return false;
      });
    }
    
    
    if ('suitableFor' in recipe && Array.isArray(recipe.suitableFor)) {
      return recipe.suitableFor.some(
        item => item?.toLowerCase() === tagName.toLowerCase()
      );
    }
    
    
    const lowerTagName = tagName.toLowerCase();
    return (
      (recipe.vegetarian && lowerTagName === 'vegetarian') ||
      (recipe.vegan && lowerTagName === 'vegan') ||
      (recipe.glutenFree && lowerTagName === 'gluten free') ||
      (recipe.dairyFree && lowerTagName === 'dairy free') ||
      (recipe.veryHealthy && lowerTagName === 'very healthy') ||
      (recipe.cheap && lowerTagName === 'cheap')
    );
  } catch (error) {
    console.error('Error checking tag:', error);
    return false;
  }
};

const transformTastyRecipe = (recipe: TastyRecipeResult): IMealRecommendation => {
  
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || '',
    readyInMinutes: recipe.readyInMinutes || 30,
    servings: recipe.servings || 2,
    matchScore: 0, // Will be calculated later
    reasons: [], // Will be populated later
    suitableFor: [], // Will be populated later
    mealType: recipe.mealType || 'lunch',
    ingredients: recipe.extendedIngredients?.map(ing => ({
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit
    })) || [],
    nutrition: {
      calories: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase() === 'calories')?.amount || 0,
      protein: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase() === 'protein')?.amount || 0,
      fat: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase() === 'fat')?.amount || 0,
      carbohydrates: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase().includes('carbohydrate'))?.amount || 0,
      fiber: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase() === 'fiber')?.amount,
      sugar: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase() === 'sugar')?.amount,
      sodium: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase() === 'sodium')?.amount,
      potassium: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase() === 'potassium')?.amount,
      phosphorus: recipe.nutrition?.nutrients?.find(n => n.name?.toLowerCase() === 'phosphorus')?.amount
    },
    vegetarian: recipe.vegetarian,
    vegan: recipe.vegan,
    glutenFree: recipe.glutenFree,
    dairyFree: recipe.dairyFree,
    veryHealthy: recipe.veryHealthy,
    cheap: recipe.cheap,
    healthScore: recipe.healthScore,
    sourceName: recipe.sourceName,
    pricePerServing: recipe.pricePerServing,
    creditsText: recipe.creditsText
  };
};

const calculateMatchScore = (recipe: IMealRecommendation, user: User): number => {
  let score = 0;
  
  
  score += 20;

  
  if (user.cookingTimePreference && recipe.readyInMinutes) {
    if (user.cookingTimePreference === 'quick' && recipe.readyInMinutes <= 30) {
      score += 10;
    } else if (user.cookingTimePreference === 'medium' && recipe.readyInMinutes <= 60) {
      score += 5;
    }
  }

  
  if (recipe.healthScore) {
    score += Math.min(recipe.healthScore / 10, 10); 
  }

  
  if (recipe.pricePerServing) {
    if (recipe.pricePerServing < 5) score += 5;
    else if (recipe.pricePerServing < 10) score += 3;
    else if (recipe.pricePerServing < 15) score += 1;
    else if (recipe.pricePerServing > 30) score -= 5;
  }

  
  return Math.max(0, Math.min(100, score));
};

export const getRecommendations = async (user: User, count: number = 5): Promise<IMealRecommendation[]> => {
  try {
    
    
    return [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

const recommendationService = {
  getRecommendations,
  calculateMatchScore,
  transformTastyRecipe,
  hasTag
};

export default recommendationService;
