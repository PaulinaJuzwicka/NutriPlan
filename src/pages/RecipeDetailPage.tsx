import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Clock, Flame, BookOpen } from 'lucide-react';
import { recipeService, type Przepis } from '../services/recipeService';
import { useToast } from '../hooks/use-toast';
import { usePageState } from '../hooks/usePageState';
import { usePreventReload } from '../hooks/usePreventReload';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Przepis | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false - work in background
  const [isInitialized, setIsInitialized] = useState(false); // Start with false - work in background
  const { addToast } = useToast();
  const { isRestored, saveState } = usePageState(`recipe-detail-${id}`);
  const { isPreventingReload } = usePreventReload(true);


  // Load fresh recipe data when component mounts
  const loadRecipeData = async () => {
    setIsLoading(true);
    
    try {
      const recipeData = await recipeService.getRecipeById(parseInt(id));
      
      setRecipe(recipeData);
      setIsInitialized(true);
    } catch (error) {
      addToast({
        title: "Błąd",
        description: "Nie udało się załadować przepisu",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitialized) {
      return;
    }
    
    if (!id) return;
      
    loadRecipeData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Ładowanie przepisu...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nie znaleziono przepisu
          </h3>
          <p className="text-gray-600 mb-4">
            Przepis o podanym ID nie istnieje.
          </p>
          <Button onClick={() => navigate('/recipes')}>
            Wróć do listy przepisów
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Wróć do listy przepisów
        </Button>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden">
        <Card className="border-0 shadow-none">
          <CardContent className="p-8">
            {/* Nagłówek z kaloriami i kategorią */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{recipe.tytul}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  {recipe.kategorie && (
                    <div className="flex items-center text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {recipe.kategorie.nazwa}
                    </div>
                  )}
                  {recipe.kalorie && (
                    <div className="flex items-center text-sm bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-medium">
                      <Flame className="w-4 h-4 mr-2" />
                      {recipe.kalorie} kcal
                    </div>
                  )}
                  {recipe.utworzono_o && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(recipe.utworzono_o).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Opis przepisu */}
            {recipe.opis && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Opis przepisu
                  </span>
                </h2>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg text-gray-700 text-lg leading-relaxed">
                  {recipe.opis}
                </div>
              </div>
            )}

            {/* Sposób przygotowania */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Sposób przygotowania
                </span>
              </h2>
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                {recipe.instrukcje ? (
                  <div className="space-y-6">
                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {recipe.instrukcje}
                      </div>
                    </div>
                    
                    {recipe.zrodlo && (
                      <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-700 mb-2">📖 Źródło: {recipe.zrodlo}</h3>
                        <p className="text-sm text-gray-600">
                          Ten przepis pochodzi z książki kucharskiej "{recipe.zrodlo}".
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Brak szczegółowych instrukcji przygotowania</p>
                    <p className="text-sm mt-2">
                      Dodaj instrukcje przygotowania, aby uzyskać pełne informacje o przygotowaniu.
                    </p>
                    {recipe.zrodlo && (
                      <p className="text-sm mt-4 text-gray-600">
                        📖 Możesz znaleźć szczegóły w książce: "{recipe.zrodlo}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Składniki */}
            {recipe.skladniki_przepisow && recipe.skladniki_przepisow.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Składniki
                  </span>
                  <span className="ml-3 bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
                    {recipe.skladniki_przepisow.length} sztuk
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipe.skladniki_przepisow.map((skladnik, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-xl hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-purple-900 text-lg">
                          {skladnik.ilosc}
                        </span>
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-gray-700 font-medium">
                        {skladnik.skladnik?.nazwa}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Przyciski akcji */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => navigate('/recipes')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do listy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(RecipeDetailPage);
