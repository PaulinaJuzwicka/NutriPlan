import { DietPlan } from '@/api/types/diet-plan';

export const exportToCsv = (plan: DietPlan, filename: string) => {
  try {
    // Nagłówki kolumn
    const headers = ['Dzień', 'Posiłek', 'Godzina', 'Nazwa', 'Składniki', 'Instrukcje', 'Kalorie', 'Białko (g)', 'Węglowodany (g)', 'Tłuszcze (g)'];
    
    // Przygotowanie danych
    const rows = plan.days.flatMap(day => 
      day.meals.map(meal => {
        const nutrients = Array.isArray(meal.nutrients) 
          ? meal.nutrients.reduce((acc, n) => ({ ...acc, [n.name.toLowerCase()]: n.amount }), {})
          : meal.nutrients || {};
          
        return [
          `Dzień ${day.dayNumber}`,
          meal.name,
          meal.time,
          meal.description || '',
          meal.ingredients.map(i => `${i.name} (${i.amount} ${i.unit})`).join('; '),
          meal.instructions?.replace(/\n/g, ' ') || '',
          meal.calories || nutrients.calories || '',
          nutrients.protein || '',
          nutrients.carbs || '',
          nutrients.fat || ''
        ];
      })
    );

    // Konwersja do formatu CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(field => 
          `"${String(field || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    // Tworzenie pliku do pobrania
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: 'Nie udało się wyeksportować planu do CSV' 
    };
  }
};

export const saveCsvToHistory = async (
  plan: DietPlan,
  filePath: string,
  fileSize: number
) => {
  try {
    const { saveDietPlanToHistory } = await import('@/api/diet-plan-history');
    return await saveDietPlanToHistory(
      plan,
      filePath,
      'csv',
      fileSize
    );
  } catch (error) {
    return { data: null, error };
  }
};
