import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Plus, Filter, Flame, Utensils, Eye } from 'lucide-react';
import { recipeService } from '../services/recipeService';

interface Recipe {
  id: number;
  tytul: string;
  opis: string;
  kalorie?: number;
  id_kategorii?: number;
  zrodlo?: string;
  kategorie?: {
    id: number;
    nazwa: string;
    opis?: string;
  };
  skladniki_przepisow?: Array<{
    id: number;
    id_przepisu: number;
    id_skladnika: number;
    ilosc: string;
    skladnik?: {
      id: number;
      nazwa: string;
    };
  }>;
}

interface Category {
  id: number;
  nazwa: string;
  opis?: string;
}

const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [przepisy, setPrzepisy] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitialized) {
      return;
    }

    // Always load fresh data on page refresh
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [recipesData, categoriesData] = await Promise.all([
          recipeService.searchRecipes({}),
          recipeService.getCategories(),
        ]);
        
        setPrzepisy(recipesData as Recipe[] || []);
        setCategories(categoriesData as Category[] || []);
        
        // Wyciągnij wszystkie unikalne składniki
        const ingredients = new Set<string>();
        recipesData?.forEach((recipe: any) => {
          recipe.skladniki_przepisow?.forEach((skladnik: any) => {
            if (skladnik.skladnik?.nazwa) {
              ingredients.add(skladnik.skladnik.nazwa);
            }
          });
        });
        const ingredientsArray = Array.from(ingredients).sort();
        setAvailableIngredients(ingredientsArray);
        
        setIsInitialized(true);
        
      } catch (error) {
        addToast({
          title: "Błąd",
          description: "Nie udało się załadować przepisów",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isInitialized]);

  // Filtrowanie przepisów
  const filteredRecipes = useMemo(() => {
    let filtered = przepisy;

    // Filtrowanie po nazwie
    if (searchQuery.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.tytul.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrowanie po kategorii
    if (selectedCategory) {
      filtered = filtered.filter(recipe =>
        recipe.id_kategorii === selectedCategory
      );
    }

    // Filtrowanie po wykluczonych składnikach
    if (excludeIngredients.length > 0) {
      filtered = filtered.filter(recipe => {
        if (!recipe.skladniki_przepisow || recipe.skladniki_przepisow.length === 0) {
          return true;
        }

        const recipeIngredientNames = recipe.skladniki_przepisow
          .map(s => s.skladnik?.nazwa?.toLowerCase() || '')
          .filter(name => name.length > 0);

        const shouldExclude = excludeIngredients.some(excludedIngredient =>
          recipeIngredientNames.includes(excludedIngredient.toLowerCase())
        );

        return !shouldExclude;
      });
    }

    return filtered;
  }, [przepisy, searchQuery, selectedCategory, excludeIngredients]);

  // Filtrowanie składników do wykluczenia
  const availableIngredientsFiltered = useMemo(() => {
    return availableIngredients.filter(ingredient => 
      ingredient.toLowerCase().includes(ingredientSearchQuery.toLowerCase()) &&
      !excludeIngredients.includes(ingredient)
    );
  }, [availableIngredients, ingredientSearchQuery, excludeIngredients]);

  // Toggle składnika do wykluczenia
  const toggleIngredient = (ingredient: string) => {
    const newExcluded = excludeIngredients.includes(ingredient) 
      ? excludeIngredients.filter(i => i !== ingredient)
      : [...excludeIngredients, ingredient];
    setExcludeIngredients(newExcluded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie przepisów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Lista Przepisów</h1>
            <p className="text-gray-600">Przeglądaj i zarządzaj swoimi przepisami</p>
          </div>
          <Button 
            onClick={() => navigate('/recipes/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj przepis
          </Button>
        </div>

        {/* Wyszukiwarka i filtry */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Szukaj przepisu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wszystkie kategorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nazwa}
                </option>
              ))}
            </select>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtry
              {excludeIngredients.length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2">
                  {excludeIngredients.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Rozwinięte filtry */}
        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Wyklucz składniki:</h3>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Szukaj składnika..."
                  value={ingredientSearchQuery}
                  onChange={(e) => setIngredientSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                {availableIngredientsFiltered.map(ingredient => (
                  <div key={ingredient} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={excludeIngredients.includes(ingredient)}
                      onChange={() => toggleIngredient(ingredient)}
                      className="rounded"
                    />
                    <label className="text-sm cursor-pointer">{ingredient}</label>
                  </div>
                ))}
              </div>
              
              {excludeIngredients.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Wykluczone:</p>
                  <div className="flex flex-wrap gap-1">
                    {excludeIngredients.map(ingredient => (
                      <span
                        key={ingredient}
                        className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded cursor-pointer hover:bg-red-200"
                        onClick={() => setExcludeIngredients(prev => prev.filter(i => i !== ingredient))}
                      >
                        {ingredient} ×
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista przepisów */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {recipe.tytul}
                </h3>
                {recipe.kalorie && (
                  <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <Flame className="w-3 h-3 mr-1" />
                    {recipe.kalorie} kcal
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {recipe.opis}
              </p>

              
              {/* Kategoria */}
              {recipe.kategorie && (
                <div className="mb-4">
                  <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {recipe.kategorie.nazwa}
                  </span>
                </div>
              )}

              {/* Przycisk akcji */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center gap-2"
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  <Eye className="w-4 h-4" />
                  Szczegóły
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <Utensils className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nie znaleziono przepisów
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory || excludeIngredients.length > 0
              ? "Spróbuj zmienić filtry wyszukiwania"
              : "Dodaj swój pierwszy przepis, aby rozpocząć"}
          </p>
          <Button onClick={() => navigate('/recipes/new')}>
            Dodaj pierwszy przepis
          </Button>
        </div>
      )}
    </div>
  );
};

export default React.memo(RecipesPage);
