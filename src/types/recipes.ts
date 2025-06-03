export interface Recipe {
  id: number;
  title: string;
  servings?: number;
  readyInMinutes?: number;
  image?: string;
  imageType?: string;
  sourceUrl?: string;
  summary?: string;
  cuisines?: string[];
  dishTypes?: string[];
  instructions?: string;
  extendedIngredients?: Array<{
    id: number;
    aisle?: string;
    name: string;
    amount: number;
    unit: string;
    unitShort?: string;
    unitLong?: string;
    originalString?: string;
    metaInformation?: string[];
    measures?: {
      us?: {
        amount: number;
        unitShort: string;
        unitLong: string;
      };
      metric?: {
        amount: number;
        unitShort: string;
        unitLong: string;
      };
    };
  }>;
  analyzedInstructions?: Array<{
    name?: string;
    steps: Array<{
      number: number;
      step: string;
      ingredients?: Array<{
        id: number;
        name: string;
        localizedName?: string;
        image?: string;
      }>;
      equipment?: Array<{
        id: number;
        name: string;
        localizedName?: string;
        image?: string;
      }>;
    }>;
  }>;
  nutrition?: {
    nutrients?: Array<{
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds?: number;
    }>;
    properties?: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
    flavonoids?: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
    caloricBreakdown?: {
      percentProtein?: number;
      percentFat?: number;
      percentCarbs?: number;
    };
    weightPerServing?: {
      amount: number;
      unit: string;
    };
  };
  pricePerServing?: number;
  cheap?: boolean;
  creditsText?: string;
  license?: string;
  sourceName?: string;
  gaps?: string;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  veryHealthy?: boolean;
  sustainable?: boolean;
  lowFodmap?: boolean;
  weightWatcherSmartPoints?: number;
  preparationMinutes?: number;
  cookingMinutes?: number;
  aggregateLikes?: number;
  healthScore?: number;
  spoonacularScore?: number;
  spoonacularSourceUrl?: string;
  originalId?: number | null;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  missedIngredients?: any[];
  usedIngredients?: any[];
  unusedIngredients?: any[];
  likes?: number;
}
