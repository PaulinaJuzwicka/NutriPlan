import React, { useState } from 'react';

interface MealPreview {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  imageType?: string;
  day: string;
  mealType: string;
  calories?: number;
  recipe?: any;
}

interface DietPlan {
  id: string;
  name: string;
  calories: number;
  allergens: string[];
  meals?: MealPreview[];
  week?: any;
}

const ALLERGENS = [
  'gluten', 'peanut', 'soy', 'dairy', 'egg', 'fish', 'shellfish', 'tree nut', 'sesame', 'mustard', 'celery', 'sulphite', 'lupin', 'mollusk'
];

const DietPlannerPage: React.FC = () => {

  const [plans, setPlans] = useState<DietPlan[]>(() => {
    
    try {
      const stored = localStorage.getItem('dietPlans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [previewPlan, setPreviewPlan] = useState<DietPlan | null>(null);
  const [previewMeals, setPreviewMeals] = useState<MealPreview[]>([]);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; calories?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Handle allergen button toggle
  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  // Validate form
  const validate = () => {
    const newErrors: { name?: string; calories?: string } = {};
    if (!name.trim()) newErrors.name = 'Plan name is required.';
    if (!calories.trim()) newErrors.calories = 'Daily calories are required.';
    else if (isNaN(Number(calories)) || Number(calories) < 800 || Number(calories) > 6000) newErrors.calories = 'Calories must be between 800 and 6000.';
    return newErrors;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    try {
      const exclude = selectedAllergens.join(",");
      const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
      const apiHost = import.meta.env.VITE_SPOONACULAR_API_HOST;
      if (!apiKey || !apiHost) {
        throw new Error('Spoonacular API Key or Host is not configured in .env');
      }
      const url = `https://${apiHost}/recipes/mealplans/generate?timeFrame=week&targetCalories=${encodeURIComponent(calories)}${exclude ? `&exclude=${encodeURIComponent(exclude)}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': apiHost
        }
      });
      if (!response.ok) throw new Error('Failed to fetch meal plan.');
      const data = await response.json();
      console.log('Spoonacular API response:', data);
      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('No plan generated or items array is empty.');
      }

      const meals: any[] = [];
      const weekDataForSave: { [key: string]: { meals: any[], nutrients?: any } } = {};
      const dayMapping: { [key: number]: string } = {
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday',
        7: 'sunday',
      };
      const mealTypeMapping: { [key: number]: string } = {
        1: 'breakfast',
        2: 'lunch',
        3: 'dinner',
      };

      data.items.forEach((item: any) => {
        if (item.type === 'RECIPE' && item.value) {
          try {
            const recipeDetails = JSON.parse(item.value);
            const dayName = dayMapping[item.day] || `day${item.day}`;
            const mealType = mealTypeMapping[item.slot] || `meal${item.slot}`;

            const mealEntry = {
              id: recipeDetails.id,
              title: recipeDetails.title,
              imageType: recipeDetails.imageType,
              readyInMinutes: recipeDetails.readyInMinutes, 
              servings: recipeDetails.servings, 
              sourceUrl: recipeDetails.sourceUrl, 
              day: dayName,
              mealType: mealType,
              calories: recipeDetails.calories, 
            };
            meals.push(mealEntry);

            if (!weekDataForSave[dayName]) {
              weekDataForSave[dayName] = { meals: [] };
            }
            weekDataForSave[dayName].meals.push({
              id: recipeDetails.id,
              title: recipeDetails.title,
              imageType: recipeDetails.imageType,
              readyInMinutes: recipeDetails.readyInMinutes,
              servings: recipeDetails.servings,
              sourceUrl: recipeDetails.sourceUrl,
              slot: item.slot, 
            });

          } catch (parseError) {
            console.error('Failed to parse recipe value:', item.value, parseError);
          }
        }
      });

      if (meals.length === 0) {
        throw new Error('No valid meals processed from API response.');
      }

      const planToSave = {
        id: Date.now().toString(),
        name,
        calories: Number(calories),
        allergens: selectedAllergens,
        meals,
        week: weekDataForSave,
      };

      await fetch('/api/save-diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planToSave)
      });
      
      setName('');
      setCalories('');
      setSelectedAllergens([]);
      setErrors({});
    } catch (err: any) {
      setApiError(err.message || 'Failed to generate plan.');
    } finally {
      setSubmitting(false);
    }
  };


  // Accept and save the previewed plan
  // Fetch full recipe info for all meals and save plan
  const handleAcceptPlan = async () => {
    if (!previewPlan) return;
    setSubmitting(true);
    try {
      const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
      const apiHost = import.meta.env.VITE_SPOONACULAR_API_HOST;
      if (!apiKey || !apiHost) {
        throw new Error('Spoonacular API Key or Host is not configured in .env');
      }
      
      const mealDetails = await Promise.all(
        (previewPlan.meals || []).map(async meal => {
          const url = `https://${apiHost}/recipes/${meal.id}/information?includeNutrition=true`;
          const res = await fetch(url, {
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': apiHost
            }
          });
          if (!res.ok) throw new Error('Failed to fetch recipe');
          const data = await res.json();
          return { ...meal, recipe: data };
        })
      );
      const planToSave = { ...previewPlan, meals: mealDetails };
      const newPlans = [planToSave, ...plans];
      setPlans(newPlans);
      localStorage.setItem('dietPlans', JSON.stringify(newPlans));
      setPreviewPlan(null);
      setPreviewMeals([]);
      setName('');
      setCalories('');
      setSelectedAllergens([]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch recipes.');
    } finally {
      setSubmitting(false);
    }
  };

  // Discard the previewed plan
  const handleDiscardPlan = () => {
    setPreviewPlan(null);
    setPreviewMeals([]);
  };

  // Delete plan
  const handleDelete = (id: string) => {
    const filtered = plans.filter(plan => plan.id !== id);
    setPlans(filtered);
    localStorage.setItem('dietPlans', JSON.stringify(filtered));
  };

  
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Diet Planner</h1>

      {}
      {}
      {previewPlan ? (
        <div className="bg-white shadow rounded p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Preview Generated Plan</h2>
          <div className="mb-4">
            <div className="font-medium">{previewPlan.name}</div>
            <div className="text-sm text-gray-600">{previewPlan.calories} kcal/day</div>
            {previewPlan.allergens.length > 0 && (
              <div className="text-xs text-red-500 mt-1">Allergens: {previewPlan.allergens.join(', ')}</div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Day</th>
                  <th className="border px-2 py-1">Meal Type</th>
                  <th className="border px-2 py-1">Title</th>
                  <th className="border px-2 py-1">Ready in (min)</th>
                  <th className="border px-2 py-1">Calories</th>
                  <th className="border px-2 py-1">Recipe</th>
                </tr>
              </thead>
              <tbody>
                {previewMeals.map((meal, idx) => (
                  <tr key={meal.id + '-' + meal.day + '-' + meal.mealType}>
                    <td className="border px-2 py-1">{meal.day}</td>
                    <td className="border px-2 py-1">{meal.mealType}</td>
                    <td className="border px-2 py-1">{meal.title}</td>
                    <td className="border px-2 py-1">{meal.readyInMinutes}</td>
                    <td className="border px-2 py-1">{meal.calories ? Math.round(meal.calories) : '-'}</td>
                    <td className="border px-2 py-1">
                      {meal.sourceUrl ? (
                        <a href={meal.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Recipe</a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-6">
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleAcceptPlan}>Accept & Save</button>
            <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded" onClick={handleDiscardPlan}>Discard</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create New Diet Plan</h2>
          {apiError && <p className="text-red-500 mb-4">Error: {apiError}</p>}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Plan Name</label>
            <input
              type="text"
              className={`border rounded px-3 py-2 w-full ${errors.name ? 'border-red-500' : ''}`}
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={submitting}
            />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Daily Calories</label>
            <input
              type="number"
              className={`border rounded px-3 py-2 w-full ${errors.calories ? 'border-red-500' : ''}`}
              value={calories}
              onChange={e => setCalories(e.target.value)}
              min={800}
              max={6000}
              disabled={submitting}
            />
            {errors.calories && <div className="text-red-600 text-sm mt-1">{errors.calories}</div>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Allergens to avoid</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALLERGENS.map(allergen => (
                <button
                  type="button"
                  key={allergen}
                  onClick={() => toggleAllergen(allergen)}
                  className={`px-3 py-1 rounded border ${selectedAllergens.includes(allergen) ? 'bg-red-500 text-white border-red-500' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                  disabled={submitting}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Plan'}
          </button>
        </form>
      )}

      {}
      {}

    </div>
  );
}

export default DietPlannerPage;
