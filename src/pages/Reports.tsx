import React, { useState, useEffect } from 'react';
import { format, subDays, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { FileText, Calendar, Download, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { healthService } from '../services/healthService';
import { mealPlanService } from '../services/mealPlanService';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [healthData, setHealthData] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const startDate = timeframe === 'week' 
          ? startOfWeek(new Date()) 
          : subMonths(new Date(), 1);
        const endDate = timeframe === 'week'
          ? endOfWeek(new Date())
          : new Date();

        
        const healthEntries = await healthService.getHealthEntries(
          user.id,
          undefined,
          format(startDate, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd')
        );

        
        const processedHealthData = healthEntries.reduce((acc: any[], entry) => {
          const date = format(new Date(entry.measured_at), 'MMM dd');
          const existing = acc.find(item => item.date === date);

          if (existing) {
            existing[entry.type] = entry.value;
          } else {
            acc.push({
              date,
              [entry.type]: entry.value,
            });
          }

          return acc;
        }, []);

        setHealthData(processedHealthData);

        
        const mealPlans = await mealPlanService.getMealPlans(
          user.id,
          format(startDate, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd')
        );

        
        const processedNutritionData = mealPlans.reduce((acc: any[], plan) => {
          const date = format(new Date(plan.date), 'MMM dd');
          const existing = acc.find(item => item.date === date);

          if (existing) {
            existing.meals += 1;
          } else {
            acc.push({
              date,
              meals: 1,
            });
          }

          return acc;
        }, []);

        setNutritionData(processedNutritionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch report data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, timeframe]);

  const downloadReport = () => {
    
    console.log('Downloading report...');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="w-8 h-8 mr-2" />
          Health & Nutrition Reports
        </h1>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'week' | 'month')}
              className="border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-xl font-semibold mb-6">Blood Sugar Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="blood-sugar"
                  stroke="#0EA5E9"
                  name="Blood Sugar"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-xl font-semibold mb-6">Blood Pressure Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="blood-pressure"
                  stroke="#14B8A6"
                  name="Blood Pressure"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Meal Plan Adherence</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutritionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="meals" fill="#F97316" name="Meals Tracked" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
              Average blood sugar: 120 mg/dL
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></span>
              Blood pressure trending normal
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
              85% meal plan adherence
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-success-500 rounded-full mr-2"></span>
              Maintain current medication schedule
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-warning-500 rounded-full mr-2"></span>
              Consider increasing physical activity
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-error-500 rounded-full mr-2"></span>
              Schedule next health check-up
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold mb-4">Goals Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Blood Sugar Control</span>
                <span className="text-primary-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Meal Plan Adherence</span>
                <span className="text-secondary-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-secondary-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Exercise Goals</span>
                <span className="text-accent-600">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-accent-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;