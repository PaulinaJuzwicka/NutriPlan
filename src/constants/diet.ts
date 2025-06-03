
export const DIET_TYPE_MAP: Record<string, string> = {
  'balanced': 'balanced',
  'high-protein': 'high-protein',
  'low-carb': 'low-carb',
  'low-fat': 'low-fat',
  'vegetarian': 'vegetarian',
  'vegan': 'vegan',
  'mediterranean': 'mediterranean',
  'keto': 'keto',
};


export const COMMON_ALLERGENS = [
  'gluten',
  'dairy',
  'eggs',
  'peanuts',
  'tree-nuts',
  'fish',
  'shellfish',
  'soy',
  'wheat',
  'sesame',
  'mustard',
  'celery',
  'lupin',
  'molluscs',
  'sulphites'
];


export const DEFAULT_DIET_PREFERENCES = {
  dietType: 'balanced',
  targetCalories: 2000,
  exclude: [],
  intolerances: [],
  days: 7
};
