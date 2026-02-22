import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Download, FileText, Calendar, TrendingUp, Users, Target, BarChart3, PieChart } from 'lucide-react';

interface DietReportGeneratorProps {
  onReportGenerated: () => void;
}

interface DietPlan {
  id: string;
  name: string;
  description?: string;
  duration: number;
  calories: number;
  mealPlanType: string;
  startDate?: string;
  endDate?: string;
  meals?: Meal[];
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  time: string;
  type: string;
}

interface ReportOptions {
  planId: string;
  includeDetails: boolean;
  includeMeals: boolean;
  includeIngredients: boolean;
  includeNutrition: boolean;
  includeProgress: boolean;
  format: 'pdf' | 'json' | 'csv';
  dateRange: '7days' | '30days' | '90days' | 'all';
}

export default function DietReportGenerator({ onReportGenerated }: DietReportGeneratorProps) {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    planId: '',
    includeDetails: true,
    includeMeals: true,
    includeIngredients: true,
    includeNutrition: true,
    includeProgress: true,
    format: 'pdf',
    dateRange: '30days'
  });
  const [generatedReport, setGeneratedReport] = useState<string>('');

  useEffect(() => {
    loadDietPlans();
  }, []);

  const loadDietPlans = async () => {
    // Symulacja pobierania planów dietetycznych
    const mockPlans: DietPlan[] = [
      {
        id: '1',
        name: 'Plan odchudzający - 1500 kcal',
        description: 'Zbilansowany plan redukcyjny',
        duration: 30,
        calories: 1500,
        mealPlanType: 'weight_loss',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        meals: [
          {
            id: '1',
            name: 'Śniadanie',
            calories: 400,
            protein: 25,
            carbs: 45,
            fat: 15,
            fiber: 8,
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: '2',
            name: 'Obiad',
            calories: 600,
            protein: 35,
            carbs: 60,
            fat: 20,
            fiber: 12,
            time: '13:00',
            type: 'lunch'
          },
          {
            id: '3',
            name: 'Kolacja',
            calories: 500,
            protein: 30,
            carbs: 50,
            fat: 18,
            fiber: 10,
            time: '19:00',
            type: 'dinner'
          }
        ]
      },
      {
        id: '2',
        name: 'Plan masowy - 2500 kcal',
        description: 'Plan budowania masy mięśniowej',
        duration: 60,
        calories: 2500,
        mealPlanType: 'muscle_gain',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        meals: [
          {
            id: '1',
            name: 'Śniadanie',
            calories: 600,
            protein: 40,
            carbs: 70,
            fat: 20,
            fiber: 10,
            time: '07:30',
            type: 'breakfast'
          },
          {
            id: '2',
            name: 'Drugie śniadanie',
            calories: 400,
            protein: 25,
            carbs: 45,
            fat: 15,
            fiber: 8,
            time: '10:30',
            type: 'snack'
          },
          {
            id: '3',
            name: 'Obiad',
            calories: 800,
            protein: 50,
            carbs: 80,
            fat: 25,
            fiber: 15,
            time: '13:00',
            type: 'lunch'
          },
          {
            id: '4',
            name: 'Podwieczorek',
            calories: 300,
            protein: 20,
            carbs: 35,
            fat: 10,
            fiber: 6,
            time: '16:00',
            type: 'snack'
          },
          {
            id: '5',
            name: 'Kolacja',
            calories: 400,
            protein: 30,
            carbs: 40,
            fat: 15,
            fiber: 8,
            time: '19:30',
            type: 'dinner'
          }
        ]
      },
      {
        id: '3',
        name: 'Plan zrównoważony - 2000 kcal',
        description: 'Utrzymanie wagi i zdrowia',
        duration: 90,
        calories: 2000,
        mealPlanType: 'balanced',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        meals: [
          {
            id: '1',
            name: 'Śniadanie',
            calories: 500,
            protein: 30,
            carbs: 55,
            fat: 18,
            fiber: 9,
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: '2',
            name: 'Obiad',
            calories: 700,
            protein: 40,
            carbs: 70,
            fat: 22,
            fiber: 13,
            time: '13:00',
            type: 'lunch'
          },
          {
            id: '3',
            name: 'Kolacja',
            calories: 600,
            protein: 35,
            carbs: 60,
            fat: 20,
            fiber: 11,
            time: '19:00',
            type: 'dinner'
          },
          {
            id: '4',
            name: 'Przekąska',
            calories: 200,
            protein: 15,
            carbs: 25,
            fat: 8,
            fiber: 5,
            time: '15:30',
            type: 'snack'
          }
        ]
      }
    ];

    setDietPlans(mockPlans);
  };

  const handleGenerateReport = async () => {
    if (!selectedPlan) {
      alert('Wybierz plan dietetyczny');
      return;
    }

    setIsGenerating(true);
    setReportOptions({ ...reportOptions, planId: selectedPlan });

    // Symulacja generowania raportu
    setTimeout(() => {
      const plan = dietPlans.find(p => p.id === selectedPlan);
      if (plan) {
        const report = generateReportContent(plan, reportOptions);
        setGeneratedReport(report);
        onReportGenerated();
      }
      setIsGenerating(false);
    }, 2000);
  };

  const generateReportContent = (plan: DietPlan, options: ReportOptions): string => {
    let content = '';

    content += `RAPORT DIETETYCZNY\n`;
    content += `========================\n`;
    content += `Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}\n`;
    content += `Plan: ${plan.name}\n`;
    content += `Opis: ${plan.description || 'Brak'}\n`;
    content += `Czas trwania: ${plan.duration} dni\n`;
    content += `Kalorie dziennie: ${plan.calories} kcal\n`;
    content += `Typ planu: ${plan.mealPlanType}\n`;
    content += `Okres: ${options.dateRange}\n\n`;

    if (options.includeDetails) {
      content += `SZCZEGÓŁY PLANU\n`;
      content += `========================\n`;
      content += `Data rozpoczęcia: ${plan.startDate || 'Brak'}\n`;
      content += `Data zakończenia: ${plan.endDate || 'Brak'}\n`;
      content += `Liczba posiłków dziennie: ${plan.meals?.length || 0}\n\n`;
    }

    if (options.includeMeals && plan.meals) {
      content += `POSIŁKI\n`;
      content += `========================\n`;
      plan.meals.forEach((meal, index) => {
        content += `${index + 1}. ${meal.name} (${meal.time})\n`;
        content += `   Kalorie: ${meal.calories} kcal\n`;
        content += `   Białko: ${meal.protein}g\n`;
        content += `   Węglowodany: ${meal.carbs}g\n`;
        content += `   Tłuszcz: ${meal.fat}g\n`;
        content += `   Błonnik: ${meal.fiber}g\n\n`;
      });
    }

    if (options.includeNutrition && plan.meals) {
      const totalProtein = plan.meals.reduce((sum, meal) => sum + meal.protein, 0);
      const totalCarbs = plan.meals.reduce((sum, meal) => sum + meal.carbs, 0);
      const totalFat = plan.meals.reduce((sum, meal) => sum + meal.fat, 0);
      const totalFiber = plan.meals.reduce((sum, meal) => sum + meal.fiber, 0);

      content += `PODSUMOWANIE SKŁADNIKÓW ODŻYWCZYCH\n`;
      content += `========================\n`;
      content += `Białko: ${totalProtein}g (${Math.round((totalProtein * 4 / plan.calories) * 100)}%)\n`;
      content += `Węglowodany: ${totalCarbs}g (${Math.round((totalCarbs * 4 / plan.calories) * 100)}%)\n`;
      content += `Tłuszcz: ${totalFat}g (${Math.round((totalFat * 9 / plan.calories) * 100)}%)\n`;
      content += `Błonnik: ${totalFiber}g\n\n`;
    }

    if (options.includeProgress) {
      content += `POSTĘP\n`;
      content += `========================\n`;
      content += `Przestrzeganie planu: 85%\n`;
      content += `Średnia utrata wagi: 2.5 kg\n`;
      content += `Poziom energii: Wysoki\n`;
      content += `Jakość snu: Dobra\n`;
      content += `Poziom stresu: Średni\n\n`;
    }

    if (options.includeIngredients) {
      content += `SKŁADNIKI\n`;
      content += `========================\n`;
      content += `Zalecane produkty:\n`;
      content += `- Chude białko (kurczak, ryby, tofu)\n`;
      content += `- Pełnoziarniste produkty (brązowy ryż, quinoa)\n`;
      content += `- Warzywa (szpinak, brokuły, marchew)\n`;
      content += `- Owoce (jabłka, jagody, cytrusy)\n`;
      content += `- Zdrowe tłuszcze (oliwa, awokado, orzechy)\n`;
      content += `- Produkty mleczne (jogurt naturalny, serek)\n\n`;
    }

    content += `========================\n`;
    content += `RAPORT WYGENEROWANY PRZEZ NUTRIPLAN\n`;

    return content;
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diet-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPlanTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      weight_loss: 'Odchudzanie',
      muscle_gain: 'Budowa masy',
      balanced: 'Zrównoważony',
      vegetarian: 'Wegetariański',
      vegan: 'Wegański',
      keto: 'Keto',
      other: 'Inny'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="planSelect">Wybierz plan dietetyczny</Label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz plan" />
            </SelectTrigger>
            <SelectContent>
              {dietPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="format">Format raportu</Label>
          <Select value={reportOptions.format} onValueChange={(value) => setReportOptions({...reportOptions, format: value as 'pdf' | 'json' | 'csv'})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dateRange">Okres raportu</Label>
          <Select value={reportOptions.dateRange} onValueChange={(value) => setReportOptions({...reportOptions, dateRange: value as '7days' | '30days' | '90days' | 'all'})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Ostatnie 7 dni</SelectItem>
              <SelectItem value="30days">Ostatnie 30 dni</SelectItem>
              <SelectItem value="90days">Ostatnie 90 dni</SelectItem>
              <SelectItem value="all">Cały okres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Opcje raportu</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDetails"
              checked={reportOptions.includeDetails}
              onCheckedChange={(checked) => setReportOptions({...reportOptions, includeDetails: checked})}
            />
            <Label htmlFor="includeDetails">Szczegóły planu</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeMeals"
              checked={reportOptions.includeMeals}
              onCheckedChange={(checked) => setReportOptions({...reportOptions, includeMeals: checked})}
            />
            <Label htmlFor="includeMeals">Posiłki</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeIngredients"
              checked={reportOptions.includeIngredients}
              onCheckedChange={(checked) => setReportOptions({...reportOptions, includeIngredients: checked})}
            />
            <Label htmlFor="includeIngredients">Składniki</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeNutrition"
              checked={reportOptions.includeNutrition}
              onCheckedChange={(checked) => setReportOptions({...reportOptions, includeNutrition: checked})}
            />
            <Label htmlFor="includeNutrition">Analiza składników odżywczych</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeProgress"
              checked={reportOptions.includeProgress}
              onCheckedChange={(checked) => setReportOptions({...reportOptions, includeProgress: checked})}
            />
            <Label htmlFor="includeProgress">Postępy</Label>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Podgląd planu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const plan = dietPlans.find(p => p.id === selectedPlan);
              if (!plan) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Kalorie</p>
                      <p className="text-lg font-semibold">{plan.calories} kcal</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Czas trwania</p>
                      <p className="text-lg font-semibold">{plan.duration} dni</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Typ</p>
                      <p className="text-lg font-semibold">{getPlanTypeLabel(plan.mealPlanType)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Posiłki</p>
                      <p className="text-lg font-semibold">{plan.meals?.length || 0}</p>
                    </div>
                  </div>
                  
                  {plan.description && (
                    <div>
                      <p className="text-sm text-gray-600">Opis</p>
                      <p className="text-gray-900">{plan.description}</p>
                    </div>
                  )}
                  
                  {plan.meals && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Posiłki</p>
                      <div className="space-y-2">
                        {plan.meals.map((meal) => (
                          <div key={meal.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{meal.name}</span>
                            <span className="text-sm text-gray-600">
                              {meal.time} - {meal.calories} kcal
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating || !selectedPlan}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {isGenerating ? 'Generowanie...' : 'Generuj raport'}
        </Button>
        
        {generatedReport && (
          <Button
            onClick={downloadReport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Pobierz raport
          </Button>
        )}
      </div>

      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Podgląd raportu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedReport}
              readOnly
              rows={20}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
