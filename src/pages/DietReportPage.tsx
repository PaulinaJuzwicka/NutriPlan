import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';
import { useToast } from '../hooks/use-toast';
import { usePageState } from '../hooks/usePageState';
import { usePreventReload } from '../hooks/usePreventReload';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  ArrowLeft,
  Download,
  FileText,
  Code,
  Loader2,
  Settings,
  Utensils,
  Target,
  Flame,
  CheckCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import dietPlanService from '../services/dietPlanService';
import DietReportGenerator from '../components/diet/DietReportGenerator';

interface DietReportConfig {
  planId: string;
  format: 'pdf' | 'json';
  includeDetails: boolean;
  includeMeals: boolean;
  includeIngredients: boolean;
  includeNutritionSummary: boolean;
  includeProgress: boolean;
}

const DietReportPage: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isRestored, saveState } = usePageState('diet-report');
  const { isPreventingReload } = usePreventReload(true);
  
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Start with false - work in background
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Fetch diet plans on mount
  useEffect(() => {
    // Reset cache on page refresh to force fresh data loading
    const isPageRefresh = performance.navigation.type === 1; // 1 = page refresh
    if (isPageRefresh) {
      localStorage.removeItem('nutriplan_diet_plans_cache');
      setDietPlans([]);
    }
    
    // Skip if we already have data (but not on refresh)
    if (!isPageRefresh && dietPlans.length > 0) {
      return;
    }

    const fetchDietPlans = async () => {
      if (!user) return;
      
      try {
        // Check cache first
        const cachedData = localStorage.getItem('nutriplan_diet_plans_cache');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsed.timestamp;
          
          if (cacheAge < 5 * 60 * 1000 && (parsed.dietPlans?.length || 0) > 0) { // 5 minutes
            setDietPlans(parsed.dietPlans || []);
            return;
          }
        }
        
        const plans = await dietPlanService.getMealPlans(user.id);
        
        setDietPlans((plans as any[]) || []);
        
        // Cache the data
        const cacheData = {
          dietPlans: (plans as any[]) || [],
          timestamp: Date.now()
        };
        localStorage.setItem('nutriplan_diet_plans_cache', JSON.stringify(cacheData));
        
      } catch (error) {
        addToast({
          title: "Błąd",
          description: "Nie udało się pobrać planów dietetycznych",
          variant: "destructive"
        });
      }
    };

    fetchDietPlans();
  }, [user, addToast]); // Only depend on user and addToast

  const handleReportGenerated = (config: DietReportConfig) => {
    const plan = dietPlans.find(p => p.id === config.planId);
    addToast({
      title: "Sukces",
      description: `Raport dla planu "${plan?.nazwa}" został wygenerowany pomyślnie`,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md">
          <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Musisz być zalogowany</h2>
          <p className="text-gray-600 mb-6">Aby generować raporty dietetyczne, zaloguj się na swoje konto.</p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Zaloguj się
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Ładowanie planów dietetycznych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/diet-plans')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Powrót do planów
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                  <span className="text-white text-2xl">📊</span>
                </div>
                Raporty Dietetyczne
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Liczba planów</p>
                  <p className="text-2xl font-bold text-gray-900">{dietPlans.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Utensils className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktywne plany</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dietPlans.filter(p => p.aktywny !== false).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Średnia kaloryczność</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dietPlans.length > 0 
                      ? Math.round(dietPlans.reduce((sum, p) => sum + p.kalorie_dzienne, 0) / dietPlans.length)
                      : 0} kcal
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Łączne dni</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dietPlans.reduce((sum, p) => sum + (p.czas_trwania || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                  <Download className="w-5 h-5 text-white" />
                </div>
                Szybki raport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Wygeneruj raport dla wybranego planu dietetycznego w formacie PDF lub JSON.
              </p>
              <div className="space-y-3">
                <select
                  value={selectedPlan?.id || ''}
                  onChange={(e) => setSelectedPlan(dietPlans.find(p => p.id === e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Wybierz plan...</option>
                  {dietPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nazwa} ({plan.czas_trwania} dni, {plan.kalorie_dzienne} kcal)
                    </option>
                  ))}
                </select>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => selectedPlan && navigate(`/diet-reports/generate/${selectedPlan.id}?format=pdf`)}
                    disabled={!selectedPlan}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => selectedPlan && navigate(`/diet-reports/generate/${selectedPlan.id}?format=json`)}
                    disabled={!selectedPlan}
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-500"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                Zaawansowany raport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Dostosuj zawartość raportu, wybierz konkretne elementy do wygenerowania.
              </p>
              <Button
                onClick={() => navigate('/diet-reports/advanced')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Otwórz generator zaawansowany
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Plans */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Ostatnie plany
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dietPlans.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak planów dietetycznych</h3>
                <p className="text-gray-600 mb-4">Nie masz jeszcze żadnych planów dietetycznych.</p>
                <Button
                  onClick={() => navigate('/diet-plans/new')}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Stwórz pierwszy plan
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dietPlans.slice(0, 6).map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">{plan.nazwa}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/diet-reports/generate/${plan.id}?format=pdf`)}
                          className="border-blue-300 hover:border-blue-500"
                        >
                          <FileText className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/diet-reports/generate/${plan.id}?format=json`)}
                          className="border-purple-300 hover:border-purple-500"
                        >
                          <Code className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📅 {plan.czas_trwania} dni</p>
                      <p>🔥 {plan.kalorie_dzienne} kcal/dzień</p>
                      <p>📊 {plan.aktywny !== false ? 'Aktywny' : 'Nieaktywny'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(DietReportPage);
