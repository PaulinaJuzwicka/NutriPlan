export interface Recipe {
  id: string;
  title: string;
  description?: string;
  preparation_time?: number;
  cooking_time?: number;
  servings?: number;
  difficulty?: 'łatwy' | 'średni' | 'trudny';
  instructions?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  categories?: Array<{
    id: number;
    name: string;
    description?: string;
    created_at: string;
  }>;
  recipe_ingredients?: Array<{
    id: string;
    recipe_id: string;
    ingredient_id: string;
    amount: number;
    unit: string;
    notes?: string;
    created_at: string;
    updated_at?: string;
    ingredient: {
      id: string;
      name: string;
      description?: string;
      unit_type?: string;
      is_allergen: boolean;
      created_at: string;
      updated_at?: string;
    };
  }>;
  // Zachowujemy niektóre właściwości ze starego typu dla kompatybilności
  readyInMinutes?: number;
  image?: string;
  summary?: string;
  extendedIngredients?: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
  }>;
  spoonacularSourceUrl?: string;
  originalId?: number | null;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  missedIngredients?: unknown[];
  usedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  unusedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  likes?: number;
}
