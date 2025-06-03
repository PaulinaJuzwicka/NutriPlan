import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface NutritionSummaryProps {
  calories: number;
  caloriesGoal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  calories,
  caloriesGoal,
  protein,
  carbs,
  fat,
}) => {
  const total = protein + carbs + fat;
  const proteinPercentage = Math.round((protein / total) * 100);
  const carbsPercentage = Math.round((carbs / total) * 100);
  const fatPercentage = Math.round((fat / total) * 100);
  const data = [
    { name: 'Protein', value: protein },
    { name: 'Carbs', value: carbs },
    { name: 'Fat', value: fat },
  ];

  const COLORS = ['#38BDF8', '#0D9488', '#FB923C'];

  const calorieProgress = Math.min(Math.round((calories / caloriesGoal) * 100), 100);

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-secondary-600 to-secondary-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <Utensils className="h-5 w-5 mr-2" /> Today's Nutrition
          </h3>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Nutrition Summary</h3>
          <span className="text-sm text-gray-500">
            {format(new Date(), 'MMM d, yyyy', { locale: enUS })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Calories</div>
            <div className="text-2xl font-semibold">{calories} kcal</div>
            <div className="text-sm text-gray-500">
              {calories < 2000 ? 'Below target' : 'Above target'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Protein</div>
            <div className="text-2xl font-semibold">{protein}g</div>
            <div className="text-sm text-gray-500">
              {protein < 50 ? 'Below target' : 'Above target'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Carbs</div>
            <div className="text-2xl font-semibold">{carbs}g</div>
            <div className="text-sm text-gray-500">
              {carbs < 250 ? 'Below target' : 'Above target'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Fat</div>
            <div className="text-2xl font-semibold">{fat}g</div>
            <div className="text-sm text-gray-500">
              {fat < 70 ? 'Below target' : 'Above target'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-500">Calories</p>
                <span className="text-sm text-gray-500">
                  {calories} / {caloriesGoal}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    calorieProgress > 100 ? 'bg-error-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${calorieProgress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {calorieProgress > 100
                  ? 'Daily calorie limit exceeded'
                  : `${calorieProgress}% of daily goal`}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[0] }}
                    ></span>
                    <div>
                      <p className="text-sm text-gray-500">Protein</p>
                      <p className="font-medium text-gray-900">{protein}g</p>
                      <p className="text-xs text-gray-500">{proteinPercentage}%</p>
                    </div>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${proteinPercentage}%`,
                      backgroundColor: COLORS[0],
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[1] }}
                    ></span>
                    <div>
                      <p className="text-sm text-gray-500">Carbs</p>
                      <p className="font-medium text-gray-900">{carbs}g</p>
                      <p className="text-xs text-gray-500">{carbsPercentage}%</p>
                    </div>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${carbsPercentage}%`,
                      backgroundColor: COLORS[1],
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[2] }}
                    ></span>
                    <div>
                      <p className="text-sm text-gray-500">Fat</p>
                      <p className="font-medium text-gray-900">{fat}g</p>
                      <p className="text-xs text-gray-500">{fatPercentage}%</p>
                    </div>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${fatPercentage}%`,
                      backgroundColor: COLORS[2],
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionSummary;