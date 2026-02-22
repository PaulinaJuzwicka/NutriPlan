import React, { useState, useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContextOptimized';


import { useStablePageLoad } from '../hooks/useStablePageLoad';

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

  Calendar,

  CheckCircle,

  X,

  Filter,

  BarChart3,

  PieChart

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

  dateRange?: {

    start: Date;

    end: Date;

  };

}



const DietReportGeneratePage: React.FC = () => {

  const { state } = useAuth();

  const user = state.user;

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();


  const { isInitialized, shouldLoadData, markAsLoaded } = useStablePageLoad('diet-report-generate', [user, searchParams]);

  const [dietPlans, setDietPlans] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const [isGenerating, setIsGenerating] = useState(false);



  // Pobierz planId z URL params

  const planId = searchParams.get('planId');

  const format = (searchParams.get('format') as 'pdf' | 'json') || 'pdf';



  const [reportConfig, setReportConfig] = useState<DietReportConfig>({

    planId: planId || '',

    format: format,

    includeDetails: true,

    includeMeals: true,

    includeIngredients: false,

    includeNutritionSummary: true,

    includeProgress: false,

    dateRange: {

      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),

      end: new Date()

    }

  });



  // Pobierz plany dietetyczne użytkownika

  const fetchDietPlans = async () => {

    if (!user) return;

    

    try {

      setIsLoading(true);

      

      const plans = await dietPlanService.getUserDietPlansSimple(user.id);
      
      
      
      setDietPlans(plans);
      

      // Jeśli jest planId w URL, ustaw go jako wybrany

      if (planId) {

        const plan = plans.find(p => p.id === planId);

        setSelectedPlan(plan || null);

        

      }

    } catch (error) {

      

      // Ustaw pustą tablicę przy błędzie

      setDietPlans([]);


    } finally {

      setIsLoading(false);

    }

  };



  // Load data - tymczasowo bez useStablePageLoad do testów
  useEffect(() => {
    if (!user) return;
    fetchDietPlans();
  }, [user, planId]);



  const handleReportGenerated = (config: DietReportConfig) => {

    const plan = dietPlans.find(p => p.id === config.planId);


    

    // Można przekierować lub pokazać opcje

    if (config.format === 'json') {


    }

  };



  const handleQuickGenerate = (planId: string, format: 'pdf' | 'json') => {

    navigate(`/diet-reports/generate/${planId}?format=${format}`);

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

                onClick={() => navigate('/diet-reports')}

                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"

              >

                <ArrowLeft className="w-5 h-5 mr-2" />

                Raporty

              </Button>

            </div>

            <div className="flex items-center space-x-4">

              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">

                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">

                  <span className="text-white text-2xl">📊</span>

                </div>

                Generator Zaawansowany

              </h1>

            </div>

          </div>

        </div>

      </div>



      {/* Main Content */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {selectedPlan ? (

          // Widok generowania dla wybranego planu

          <DietReportGenerator 

            planId={selectedPlan.id}

            onReportGenerated={handleReportGenerated}

          />

        ) : (

          // Widok wyboru planu

          <div className="space-y-8">

            {/* Plan Selection */}

            <Card className="shadow-xl">

              <CardHeader>

                <CardTitle className="flex items-center gap-3">

                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">

                    <Target className="w-5 h-5 text-white" />

                  </div>

                  Wybierz plan do raportu

                </CardTitle>

              </CardHeader>

              <CardContent>

                {dietPlans.length === 0 ? (

                  <div className="text-center py-8">

                    <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Brak planów dietetycznych</h3>

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

                    {dietPlans.map((plan) => (

                      <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"

                           onClick={() => setSelectedPlan(plan)}>

                        <div className="flex justify-between items-start mb-3">

                          <h4 className="font-semibold text-gray-900 truncate">{plan.nazwa}</h4>

                          <div className="flex gap-2">

                            <Button

                              size="sm"

                              variant="outline"

                              onClick={(e: React.MouseEvent) => {

                                e.stopPropagation();

                                handleQuickGenerate(plan.id, 'pdf');

                              }}

                              className="border-blue-300 hover:border-blue-500"

                            >

                              <FileText className="w-3 h-3" />

                            </Button>

                            <Button

                              size="sm"

                              variant="outline"

                              onClick={(e: React.MouseEvent) => {

                                e.stopPropagation();

                                handleQuickGenerate(plan.id, 'json');

                              }}

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

                          <p>📅 Utworzono: {new Date(plan.utworzono_o).toLocaleDateString('pl-PL')}</p>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>



            {/* Quick Stats */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

              <Card className="shadow-lg">

                <CardContent className="p-6">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-gray-600">Łączne plany</p>

                      <p className="text-2xl font-bold text-gray-900">{dietPlans.length}</p>

                    </div>

                    <div className="p-3 bg-blue-100 rounded-lg">

                      <Target className="w-6 h-6 text-blue-600" />

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

          </div>

        )}

      </div>

    </div>

  );

};



export default React.memo(DietReportGeneratePage);

