import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Pill,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { MedicationBase } from '../types/medications';
import TodaysMedications from '../components/dashboard/TodaysMedications';
import medicationService from '../services/medicationService';
import dietPlanService from '../services/dietPlanService';
import { supabase } from '../lib/supabase';

const DashboardFixed: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  const navigate = useNavigate();
  
  
  
  const [medications, setMedications] = useState<MedicationBase[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Proste ładowanie - tylko raz przy wejściu na stronę
  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      
      // Pobierz wszystkie dane bezpośrednio z API
      const [medsData, dietData, healthData] = await Promise.all([
        medicationService.getMedications(user.id),
        dietPlanService.getMealPlans(user.id),
        // Bezpośrednie zapytanie do Supabase - bez serwisu
        (async () => {
          
          try {
            const { data, error } = await supabase
              .from('wpisy_zdrowotne')
              .select('*')
              .eq('id_uzytkownika', user.id)
              .order('zmierzono_o', { ascending: false })
              .limit(10);
            
            if (error) {
              
              return [];
            }
            
            
            return data || [];
          } catch (err) {
            
            return [];
          }
        })()
      ]);
      
      setMedications(medsData || []);
      setDietPlans((dietData as any[]) || []);
      setHealthMetrics(healthData || []);
      
      
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const todayMedications = medications.filter(med => med.aktywny);
  const activeDietPlans = dietPlans.filter(plan => plan.aktywny);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Witaj, {user?.name || 'Użytkowniku'}!</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Ładowanie danych...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                Leki na dziś
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {todayMedications.length}
              </div>
              <p className="text-sm text-gray-600">aktywnych leków</p>
              {todayMedications.length > 0 && (
                <div className="mt-4">
                  <TodaysMedications medications={todayMedications} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Plany dietetyczne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {activeDietPlans.length}
              </div>
              <p className="text-sm text-gray-600">aktywnych planów</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Dane zdrowotne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {healthMetrics.length}
              </div>
              <p className="text-sm text-gray-600">ostatnich wpisów</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/medications/new')}
            className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Dodaj lek
          </button>
          <button
            onClick={() => navigate('/diet-plans/create')}
            className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Stwórz plan
          </button>
          <button
            onClick={() => navigate('/medications')}
            className="flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Pill className="h-4 w-4" />
            Leki
          </button>
          <button
            onClick={() => navigate('/diet-plans')}
            className="flex items-center justify-center gap-2 p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Plany
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFixed;
