export interface NutrientValue {
  name: string;
  amount: number;
  unit: string;
}

export interface MealNutrients {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  [key: string]: number; // Pozwala na dodatkowe właściwości
}

export interface Nutrient extends NutrientValue {
  // Rozszerza podstawowy interfejs o dodatkowe właściwości
  percentDailyValue?: number;
}

export interface MealIngredient {
  name: string;
  amount: number;
  unit: string;
  nutrients?: MealNutrients | Nutrient[];
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  time: string;
  calories?: number;
  ingredients: MealIngredient[];
  instructions?: string;
  nutrients?: MealNutrients | Nutrient[];
}

export interface DailyPlan {
  day: string;
  date: string;
  meals: Meal[];
}

export interface DietDay {
  id: string;
  dayNumber: number;
  meals: Meal[];
}

export interface DietPlan {
  id: string;
  title: string;
  description?: string;
  duration: number;
  days: DietDay[];
  dailyPlans: DailyPlan[];
  totalNutrients?: Nutrient[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveDietPlanOptions {
  plan: DietPlan;
  filename?: string;
  outputDir?: string;
  forceRegenerate?: boolean;
}

export interface SaveDietPlanResult {
  success: boolean;
  filePath?: string;
  error?: string;
  stack?: string;
}

export interface GenerateHTMLOptions {
  title?: string;
  styles?: string;
  lang?: string;
}
