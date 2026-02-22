import React from 'react';
import { Utensils, Clock3, Plus } from 'lucide-react';
import { Meal } from '../../services/dietPlanService';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface UpcomingMealsProps {
  meals: Meal[];
  loading?: boolean;
  error?: Error | null;
  onMealClick?: (meal: Meal) => void;
}

const mealTimes = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
  snack: 'Przekąska',
} as const;

const mealTimeIcons = {
  breakfast: <Utensils className="h-4 w-4 text-amber-500" />,
  lunch: <Utensils className="h-4 w-4 text-green-500" />,
  dinner: <Utensils className="h-4 w-4 text-blue-500" />,
  snack: <Utensils className="h-4 w-4 text-purple-500" />,
};

const UpcomingMeals: React.FC<UpcomingMealsProps> = ({
  meals = [],
  loading = false,
  error = null,
  onMealClick,
}) => {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">Błąd podczas ładowania posiłków</p>
        <div className="mt-2 space-x-2">
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Spróbuj ponownie
          </button>
          <button
            onClick={() => navigate('/diet-plans')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Zobacz plany
          </button>
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-6">
        <Utensils className="mx-auto h-10 w-10 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Brak zaplanowanych posiłków</h3>
        <p className="mt-1 text-sm text-gray-500">Dodaj posiłki do planu żywieniowego</p>
        <button
          onClick={() => navigate('/diet-plans/new')}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800"
        >
          Stwórz plan dietetyczny
        </button>
      </div>
    );
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatMealTime = (date: string) => {
    const mealDate = new Date(date);
    return format(mealDate, 'HH:mm');
  };

  const getDayLabel = (date: string) => {
    const mealDate = new Date(date);
    if (mealDate.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (mealDate.toDateString() === tomorrow.toDateString()) {
      return 'Jutro';
    } else {
      return format(mealDate, 'EEEE', { locale: pl });
    }
  };

  return (
    <div className="space-y-4">
      {meals.slice(0, 5).map((meal) => (
        <div 
          key={`${meal.id}-${meal.scheduledFor}`}
          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          onClick={() => onMealClick?.(meal)}
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            {meal.mealType ? (
              mealTimeIcons[meal.mealType as keyof typeof mealTimeIcons] || 
              <Utensils className="h-5 w-5 text-gray-400" />
            ) : (
              <Utensils className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {meal.name || 'Nienazwany posiłek'}
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <Clock3 className="h-3.5 w-3.5 mr-1" />
                <span>{formatMealTime(meal.scheduledFor)}</span>
              </div>
            </div>
            <div className="flex items-center mt-0.5">
              <span className="text-xs text-gray-500">
                {getDayLabel(meal.scheduledFor)} • {meal.mealType ? mealTimes[meal.mealType as keyof typeof mealTimes] : 'Posiłek'}
              </span>
            </div>
          </div>
        </div>
      ))}
      {meals.length > 5 && (
        <div className="text-center">
          <button 
            onClick={() => navigate('/diet-plans')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Zobacz więcej ({meals.length - 5} więcej)
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingMeals;
