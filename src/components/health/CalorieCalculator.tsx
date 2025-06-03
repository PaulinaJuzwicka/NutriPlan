import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

interface CalorieCalculatorProps {
  onCalculate?: (calories: number) => void;
}

const CalorieCalculator: React.FC<CalorieCalculatorProps> = ({ onCalculate }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'sedentary',
    goal: 'maintain'
  });

  const [result, setResult] = useState<number | null>(null);

  const activityLevels = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  const goalMultipliers = {
    lose: 0.85,
    maintain: 1,
    gain: 1.15
  };

  const calculateCalories = () => {
    const { age, gender, weight, height, activityLevel, goal } = formData;
    
    const numAge = parseInt(age);
    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);

    let bmr;
    if (gender === 'male') {
      bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
    } else {
      bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge - 161;
    }

    const tdee = bmr * activityLevels[activityLevel as keyof typeof activityLevels];
    
    const dailyCalories = Math.round(tdee * goalMultipliers[goal as keyof typeof goalMultipliers]);
    
    setResult(dailyCalories);
    if (onCalculate) {
      onCalculate(dailyCalories);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateCalories();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex items-center">
          <Calculator className="h-6 w-6 text-white mr-2" />
          <h3 className="text-lg font-medium text-white">Daily Calorie Calculator</h3>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                min="15"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                step="0.1"
                min="30"
                max="300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                min="100"
                max="250"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Lightly active (1-3 days/week)</option>
                <option value="moderate">Moderately active (3-5 days/week)</option>
                <option value="active">Very active (6-7 days/week)</option>
                <option value="veryActive">Extra active (very physical job/training)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Calculate
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-primary-900">
                  Recommended Daily Calories
                </h4>
                <p className="text-sm text-primary-600">
                  Based on your {formData.goal === 'maintain' ? 'maintenance' : `${formData.goal} weight`} goal
                </p>
              </div>
              <div className="text-2xl font-bold text-primary-700">
                {result.toLocaleString()} kcal
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-2 bg-white rounded shadow-sm">
                <div className="font-medium text-gray-500">Protein</div>
                <div className="mt-1 font-semibold text-gray-900">
                  {Math.round(result * 0.3 / 4)}g
                </div>
              </div>
              <div className="p-2 bg-white rounded shadow-sm">
                <div className="font-medium text-gray-500">Carbs</div>
                <div className="mt-1 font-semibold text-gray-900">
                  {Math.round(result * 0.4 / 4)}g
                </div>
              </div>
              <div className="p-2 bg-white rounded shadow-sm">
                <div className="font-medium text-gray-500">Fats</div>
                <div className="mt-1 font-semibold text-gray-900">
                  {Math.round(result * 0.3 / 9)}g
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalorieCalculator;