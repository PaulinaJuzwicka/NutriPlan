import React, { createContext, useContext, useState, useEffect } from 'react';
import { MealPlanDay, ShoppingListItem, MealPlanContextType } from '../types/mealPlan';
import { IMealRecommendation } from '../services/recommendationService';

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    const savedMealPlan = localStorage.getItem('mealPlan');
    if (savedMealPlan) {
      setMealPlan(JSON.parse(savedMealPlan));
    }

    const savedShoppingList = localStorage.getItem('shoppingList');
    if (savedShoppingList) {
      setShoppingList(JSON.parse(savedShoppingList));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  const addToMealPlan = (date: string, mealType: string, recipe: IMealRecommendation) => {
    setMealPlan(prev => {
      const dayIndex = prev.findIndex(day => day.date === date);
      const newPlan = [...prev];
      
      if (dayIndex === -1) {
        newPlan.push({
          date,
          meals: { [mealType]: recipe }
        });
      } else {
        const updatedDay = { ...newPlan[dayIndex] };
        updatedDay.meals = { ...updatedDay.meals, [mealType]: recipe };
        newPlan[dayIndex] = updatedDay;
      }

      return newPlan;
    });
  };

  const removeFromMealPlan = (date: string, mealType: string, _recipeId: number) => {
    setMealPlan(prev => {
      const dayIndex = prev.findIndex(day => day.date === date);
      if (dayIndex === -1) return prev;

      const newPlan = [...prev];
      const updatedDay = { ...newPlan[dayIndex] };
      
      if (mealType in updatedDay.meals) {
        delete updatedDay.meals[mealType as keyof typeof updatedDay.meals];
      }

      if (Object.keys(updatedDay.meals).length === 0) {
        newPlan.splice(dayIndex, 1);
      } else {
        newPlan[dayIndex] = updatedDay;
      }
      if (Object.keys(updatedDay.meals).length === 0) {
        newPlan.splice(dayIndex, 1);
      } else {
        newPlan[dayIndex] = updatedDay;
      }

      return newPlan;
    });
  };

  const generateShoppingList = (startDate: string, endDate: string) => {
    const daysInRange = mealPlan.filter(day => 
      day.date >= startDate && day.date <= endDate
    );
    const allIngredients: Record<string, ShoppingListItem> = {};

    daysInRange.forEach(day => {
      const meals = Object.values(day.meals).flat();
      const recipes = Array.isArray(meals) ? meals : [meals];

      recipes.forEach(recipe => {
        if (!recipe?.ingredients) return;

        recipe.ingredients.forEach((ingredient: { name: string; unit: string; amount: number }) => {
          const key = `${ingredient.name.toLowerCase()}_${ingredient.unit}`;
          
          if (allIngredients[key]) {
            allIngredients[key] = {
              ...allIngredients[key],
              amount: allIngredients[key].amount + ingredient.amount,
              recipeNames: [...new Set([...allIngredients[key].recipeNames, recipe.title])]
            };
          } else {
            allIngredients[key] = {
              id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
              checked: false,
              recipeNames: [recipe.title]
            };
          }
        });
      });
    });

    setShoppingList(Object.values(allIngredients));
  };

  const toggleShoppingItem = (itemId: string) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <MealPlanContext.Provider
      value={{
        mealPlan,
        addToMealPlan,
        removeFromMealPlan,
        shoppingList,
        generateShoppingList,
        toggleShoppingItem
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};