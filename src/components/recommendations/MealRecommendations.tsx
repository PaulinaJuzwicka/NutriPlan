import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Clock, Users, ChevronRight, AlertCircle, Heart, Star, Zap, Sun, Utensils, Apple, X } from 'lucide-react';
import { RecipeDetail } from '../recipes/RecipeDetail';
import { useAuth } from '../../context/AuthContext';
import { getPersonalizedMealRecommendations, MealRecommendation } from '../../services/recommendationService';

import { DietaryTips } from './DietaryTips';

const MealRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<MealRecommendation | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPersonalizedMealRecommendations(user);
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const handleViewRecipe = (recipe: MealRecommendation) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseRecipeDetail = () => {
    setShowRecipeDetail(false);
  };

  const handleAddToMealPlan = (recipe: MealRecommendation) => {
    console.log('Added to plan:', recipe.title);
    alert(`Added "${recipe.title}" to meal plan!`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading recommendations: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <Utensils className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No meal recommendations</h3>
        <p className="mt-1 text-sm text-gray-500">
          No meal recommendations were found for you at this time.
        </p>
      </div>
    );
  }

  const healthConditions = useMemo(() => {
    const conditions = new Set<string>();
    recommendations.forEach(recipe => {
      if (recipe.suitableFor) {
        recipe.suitableFor.forEach(condition => conditions.add(condition));
      }
    });
    return Array.from(conditions);
  }, [recommendations]);

  const getMealTypeBadge = (mealType?: string) => {
    if (!mealType) return null;
    
    const types: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      breakfast: { label: 'Breakfast', color: 'bg-yellow-100 text-yellow-800', icon: <Sun className="h-4 w-4" /> },
      lunch: { label: 'Lunch', color: 'bg-green-100 text-green-800', icon: <Utensils className="h-4 w-4" /> },
      dinner: { label: 'Dinner', color: 'bg-blue-100 text-blue-800', icon: <Utensils className="h-4 w-4" /> },
      snack: { label: 'Snack', color: 'bg-purple-100 text-purple-800', icon: <Apple className="h-4 w-4" /> },
    };

    const type = types[mealType.toLowerCase()] || { label: mealType, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.color} mr-2`}>
        {type.icon && <span className="mr-1">{type.icon}</span>}
        {type.label}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-white mr-2" />
          <h2 className="text-lg font-medium text-white">Personalized Meal Recommendations</h2>
        </div>
        <p className="mt-1 text-sm text-primary-100">Tailored to your preferences and health goals</p>
      </div>

      {healthConditions.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            Dietary Tips for You
          </h4>
          <div className="space-y-3">
            {healthConditions.map(condition => (
              <DietaryTips key={condition} condition={condition} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {recommendations.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-48 bg-gray-100">
              {recipe.image ? (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Utensils className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex space-x-1">
                {recipe.readyInMinutes < 30 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <Zap className="h-3 w-3 mr-1" /> Quick
                  </span>
                )}
                {recipe.cheap && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <span className="text-xs">$</span>
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{recipe.title}</h3>
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 'N/A'} kcal
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Clock className="h-3 w-3 mr-1" /> {recipe.readyInMinutes} min
                  </span>
                </div>
              </div>
              
              {recipe.summary && (
                <div 
                  className="mt-2 text-sm text-gray-600 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: recipe.summary }}
                />
              )}
              
              <div className="mt-3">
                <button
                  onClick={() => handleViewRecipe(recipe)}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View Recipe
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              {recipe.reasons && recipe.reasons.length > 0 && (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Why this dish?</h5>
                  <ul className="space-y-2">
                    {recipe.reasons.map((reason: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {recipe.diets?.map((diet: string) => (
                  <span
                    key={diet}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {diet}
                  </span>
                ))}
                {recipe.suitableFor?.map((condition: string) => {
                  const conditionNames: Record<string, string> = {
                    'diabetes': 'For diabetics',
                    'hypertension': 'For hypertension',
                    'celiac': 'Gluten-free',
                    'lactose intolerance': 'Lactose-free'
                  };
                  return (
                    <span
                      key={condition}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {conditionNames[condition] || condition}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && showRecipeDetail && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="relative min-h-screen">
            <button
              onClick={handleCloseRecipeDetail}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white transition-colors shadow-md"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <RecipeDetail 
              recipe={{
                ...selectedRecipe,
                id: selectedRecipe.id,
                title: selectedRecipe.title,
                image: selectedRecipe.image || '',
                readyInMinutes: selectedRecipe.readyInMinutes || 0,
                servings: selectedRecipe.servings || 2,
                matchScore: selectedRecipe.matchScore || 0,
                reasons: selectedRecipe.reasons || [],
                suitableFor: selectedRecipe.suitableFor || [],
                mealType: selectedRecipe.mealType || 'main course',
                ingredients: selectedRecipe.ingredients || [],
                nutrition: selectedRecipe.nutrition,
                instructions: Array.isArray(selectedRecipe.instructions)
                  ? selectedRecipe.instructions.map((step: any, index: number) => ({
                      number: index + 1,
                      step: typeof step === 'string' ? step : step.step || ''
                    }))
                  : typeof selectedRecipe.instructions === 'string'
                  ? [{ number: 1, step: selectedRecipe.instructions }]
                  : [{ number: 1, step: '' }],
                summary: selectedRecipe.summary || ''
              }}
              onAddToMealPlan={handleAddToMealPlan}
              onBack={handleCloseRecipeDetail}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MealRecommendations;