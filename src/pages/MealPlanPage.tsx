import React, { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { useMealPlan } from '../context/MealPlanContext';
import { MealPlanDay } from '../types/mealPlan';
import { IMealRecommendation } from '../services/recommendationService';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};
const getDayName = (date: Date, locale = 'en-US') => {
  return date.toLocaleDateString(locale, { weekday: 'short' });
};

const MealPlanPage: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { mealPlan, generateShoppingList } = useMealPlan();
  
  const mealPlanDays = mealPlan as MealPlanDay[];

  const handleGenerateShoppingList = async () => {
    try {
      setIsSearching(true);
      const today = formatDate(new Date());
      const nextWeek = formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      
      generateShoppingList(today, nextWeek);
      
      console.log('Shopping list generated successfully');
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getMealForDay = (date: Date, mealType: MealType): IMealRecommendation | null => {
    const dateStr = formatDate(date);
    const dayPlan = mealPlanDays.find(day => day.date === dateStr);
    if (!dayPlan) return null;
    
    const meal = dayPlan.meals[mealType];
    if (Array.isArray(meal) && meal.length > 0) {
      return meal[0] as IMealRecommendation; 
    } else if (meal && !Array.isArray(meal)) {
      return meal as IMealRecommendation;
    }
    
    return null;
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Meal Planner</h1>
          <p className="text-gray-600 mt-1">Manage your weekly meal plan</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {}}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Meal</span>
          </Button>
          <Button 
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleGenerateShoppingList}
            disabled={isSearching}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isSearching ? 'Generating...' : 'Shopping List'}
            </span>
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Weekly Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {weekDays.map((date, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="text-center mb-3">
                  <div className="font-medium text-gray-900">{getDayName(date)}</div>
                  <div className="text-sm text-gray-500">
                    {date.getDate()}.{date.getMonth() + 1}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(MEAL_TYPE_LABELS).map(([mealType, label]) => {
                    const meal = getMealForDay(date, mealType as MealType);
                    return (
                      <div 
                        key={mealType} 
                        className="p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-700">{label}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {meal?.title || 'No meal'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanPage;
