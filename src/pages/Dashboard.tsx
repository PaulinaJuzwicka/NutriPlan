import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TodaysMedications from '../components/dashboard/TodaysMedications';
import RecentHealthResults from '../components/dashboard/RecentHealthResults';
import medicationService from '../services/medicationService';
import { healthService } from '../services/healthService';
import { MedicationBase } from '../types/medications';


import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Pill, 
  Heart, 
  Utensils, 
  Calendar, 
  FileText, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import dietPlanService, { DietPlan, Meal } from '../services/dietPlanService';


interface HealthEntry {
  id: string;
  type: string;
  value: number | string;
  measured_at: string;
}

const Dashboard = () => {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<MedicationBase[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]); 
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [healthResults, setHealthResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const quickLinks = [
    {
      title: 'Medications',
      description: 'Track your daily medications, set reminders, and manage prescriptions. View your medication history and get notifications for refills.',
      icon: <Pill className="h-6 w-6" />,
      path: '/medications',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Health Tracking',
      description: 'Record vital signs, symptoms, and health measurements. Monitor trends over time and share data with your healthcare providers.',
      icon: <Heart className="h-6 w-6" />,
      path: '/health',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Meal Planner',
      description: 'Create personalized meal plans, track nutrition, and manage dietary restrictions. Get recipe suggestions based on your health goals.',
      icon: <Utensils className="h-6 w-6" />,
      path: '/diet-planner',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Settings',
      description: 'Customize your profile, manage notifications, and adjust privacy settings. Set up emergency contacts and healthcare preferences.',
      icon: <Settings className="h-6 w-6" />,
      path: '/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  const fetchData = async () => {
    if (!user?.id) {
      console.log('No user ID, skipping data fetch');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      console.log('Fetching data for user:', user.id);

      const [meds, healthData, plans] = await Promise.all([
        medicationService.getMedications(user.id),
        healthService.getHealthEntries({ userId: user.id }),
        dietPlanService.getMealPlans(user.id)
      ]);

      setMedications(meds);
      
      
      const mappedPlans: DietPlan[] = plans.map((plan: any) => ({
        ...plan,
        meals: plan.meals || [],
        days: plan.days || 7,
        mealsPerDay: plan.mealsPerDay || 3,
        excludedIngredients: plan.excludedIngredients || [],
        intolerances: plan.intolerances || [],
        dietType: plan.dietType || 'balanced',
        targetCalories: plan.targetCalories || 2000
      }));
      
      setDietPlans(mappedPlans);
      
      const todaysHealthResults = healthData
        .filter((entry: HealthEntry) => {
          const entryDate = new Date(entry.measured_at);
          return entryDate >= startOfToday && entryDate <= endOfToday;
        })
        .sort((a: HealthEntry, b: HealthEntry) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())
        .map((entry: HealthEntry) => ({
          id: entry.id,
          type: entry.type,
          value: entry.value,
          unit: entry.type === 'blood-pressure' ? 'mmHg' : 
                entry.type === 'blood-sugar' ? 'mg/dL' : 
                entry.type === 'pulse' ? 'bpm' : '°C',
          timestamp: entry.measured_at,
          status: entry.type === 'blood-pressure' 
            ? (() => {
                const [systolic, diastolic] = (entry.value as string).split('/').map(Number);
                if (systolic >= 180 || diastolic >= 120) return 'critical';
                if (systolic >= 140 || diastolic >= 90) return 'warning';
                return 'normal';
              })()
            : entry.type === 'blood-sugar'
            ? (() => {
                const value = Number(entry.value);
                if (value < 70 || value > 180) return 'critical';
                if (value < 80 || value > 140) return 'warning';
                return 'normal';
              })()
            : 'normal'
        }));

      setHealthResults(todaysHealthResults);
    } catch (err) {
      console.error('Error while fetching data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitializing) {
      fetchData();
    }
  }, [isInitializing]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">You are not logged in</h2>
          <p className="text-gray-600">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name || user.email?.split('@')[0] || 'User'}!</h1>
        <p className="text-gray-600 mt-2">Quick access to your health management tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Card 
            key={link.path}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => navigate(link.path)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${link.bgColor} ${link.color}`}>
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{link.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <TodaysMedications
              medications={medications}
              loading={isLoading}
              error={error}
              onRefresh={fetchData}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Health Results</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentHealthResults results={healthResults} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;