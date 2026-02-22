import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { createRecipe, PrzepisFormData } from '../lib/actions/recipes';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContextOptimized';

const NewRecipePage = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { user, isAuthenticated, isLoading: authLoading } = authState;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PrzepisFormData>({
    tytul: '',
    opis: '',
    kalorie: 0,
    id_kategorii: undefined,
    zrodlo: '',
    instrukcje: '',
    skladniki: []
  });
  const [availableIngredients, setAvailableIngredients] = useState<Array<{id: number, nazwa: string, jednostka?: string}>>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Array<{id: number, nazwa: string, jednostka?: string}>>([]);
  const [categories, setCategories] = useState<Array<{id: number, nazwa: string}>>([]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('g');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');

  // Load ingredients on mount
  React.useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !isAuthenticated) {
      toast.error('Musisz być zalogowany, aby dodać przepis');
      navigate('/login');
      return;
    }

    // Only load ingredients if user is authenticated
    if (!authLoading && isAuthenticated) {
      const loadIngredients = async () => {
        try {
          const { data, error } = await supabase
            .from('skladniki')
            .select('id, nazwa, jednostka')
            .order('nazwa');
          
          if (error) throw error;
          setAvailableIngredients(data || []);
          setFilteredIngredients(data || []);
        } catch (error) {
          toast.error('Nie udało się załadować składników');
        }
      };

      const loadCategories = async () => {
        try {
          const { data, error } = await supabase
            .from('kategorie')
            .select('id, nazwa')
            .order('nazwa');
          
          if (error) throw error;
          setCategories(data || []);
        } catch (error) {
          toast.error('Nie udało się załadować kategorii');
        }
      };
      
      loadIngredients();
      loadCategories();
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Filter ingredients based on search term
  React.useEffect(() => {
    if (!ingredientSearchTerm.trim()) {
      setFilteredIngredients(availableIngredients);
    } else {
      const filtered = availableIngredients.filter(ingredient =>
        ingredient.nazwa.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  }, [ingredientSearchTerm, availableIngredients]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tytul.trim()) {
      toast.error('Tytuł jest wymagany');
      return;
    }

    if (!formData.skladniki || formData.skladniki.length === 0) {
      toast.error('Dodaj co najmniej jeden składnik');
      return;
    }

    if (!formData.id_kategorii) {
      toast.error('Wybierz kategorię');
      return;
    }

    if (!user) {
      toast.error('Użytkownik nie jest zalogowany');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await createRecipe(formData, user.id);
      
      if (result) {
        toast.success('Przepis został dodany pomyślnie!');
        navigate('/recipes');
      } else {
        toast.error('Nie udało się dodać przepisu - brak odpowiedzi z serwera');
      }
    } catch (error) {
      toast.error(`Wystąpił błąd podczas dodawania przepisu: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kalorie' || name === 'id_kategorii' ? Number(value) || 0 : value
    }));
  };

  const addNewIngredient = async () => {
    if (!newIngredientName.trim()) {
      toast.error('Nazwa składnika jest wymagana');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('skladniki')
        .insert({ 
          nazwa: newIngredientName.trim(),
          jednostka: newIngredientUnit
        })
        .select()
        .single();

      if (error) throw error;
      
      setAvailableIngredients(prev => [...prev, data]);
      setFilteredIngredients(prev => [...prev, data]);
      setNewIngredientName('');
      setNewIngredientUnit('g');
      setShowAddIngredient(false);
      toast.success('Składnik został dodany');
    } catch (error) {
      toast.error('Nie udało się dodać składnika');
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredientToRecipe = (ingredientId: number) => {
    const ingredient = availableIngredients.find(ing => ing.id === ingredientId);
    const defaultUnit = ingredient?.jednostka || 'g';
    
    setFormData(prev => ({
      ...prev,
      skladniki: [...(prev.skladniki || []), {
        id_skladnika: ingredientId,
        ilosc: '',
        jednostka: defaultUnit
      }]
    }));
  };

  const updateIngredient = (index: number, field: 'id_skladnika' | 'ilosc', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      skladniki: prev.skladniki?.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      ) || []
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skladniki: prev.skladniki?.filter((_, i) => i !== index) || []
    }));
  };

  const units = ['g', 'kg', 'ml', 'l', 'szklanka', 'łyżka', 'łyżeczka', 'szczypta'];

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sprawdzanie uwierzytelnienia...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Dostęp zabroniony</h2>
          <p className="text-gray-600 mb-4">Musisz być zalogowany, aby dodać przepis</p>
          <Button onClick={() => navigate('/login')}>
            Zaloguj się
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Wróć do listy przepisów
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900">Dodaj nowy przepis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Wypełnij poniższy formularz, aby dodać nowy przepis do swojej kolekcji.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Podstawowe informacje</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tytuł *
              </label>
              <input
                type="text"
                name="tytul"
                value={formData.tytul}
                onChange={handleChange}
                placeholder="Wpisz tytuł przepisu"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis
              </label>
              <textarea
                name="opis"
                value={formData.opis}
                onChange={handleChange}
                placeholder="Krótki opis przepisu"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kalorie (kcal)
              </label>
              <input
                type="number"
                name="kalorie"
                value={formData.kalorie}
                onChange={handleChange}
                placeholder="np. 450"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategoria *
              </label>
              <select
                name="id_kategorii"
                value={formData.id_kategorii}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Wybierz kategorię</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nazwa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Źródło
              </label>
              <input
                type="text"
                name="zrodlo"
                value={formData.zrodlo}
                onChange={handleChange}
                placeholder="np. Książka kucharska, babcia, internet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrukcje przygotowania
              </label>
              <textarea
                name="instrukcje"
                value={formData.instrukcje}
                onChange={handleChange}
                placeholder="Krok po kroku opisz jak przygotować przepis..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Składniki</h2>
            <Button
              type="button"
              onClick={() => setShowAddIngredient(true)}
              variant="outline"
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj składnik
            </Button>
          </div>

          {/* Modal for adding new ingredient */}
          {showAddIngredient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Dodaj nowy składnik</h3>
                <input
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  placeholder="Nazwa składnika"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  autoFocus
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domyślna jednostka
                  </label>
                  <select
                    value={newIngredientUnit}
                    onChange={(e) => setNewIngredientUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddIngredient(false);
                      setNewIngredientName('');
                      setNewIngredientUnit('g');
                    }}
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="button"
                    onClick={addNewIngredient}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Dodaję...' : 'Dodaj'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add existing ingredients with search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dodaj istniejący składnik
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={ingredientSearchTerm}
                onChange={(e) => setIngredientSearchTerm(e.target.value)}
                placeholder="Wpisz nazwę składnika..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Show filtered results */}
              {ingredientSearchTerm && filteredIngredients.length > 0 && (
                <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
                  {filteredIngredients.map(ingredient => (
                    <div
                      key={ingredient.id}
                      onClick={() => {
                        addIngredientToRecipe(ingredient.id);
                        setIngredientSearchTerm('');
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      {ingredient.nazwa}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Show no results message */}
              {ingredientSearchTerm && filteredIngredients.length === 0 && (
                <div className="text-gray-500 text-sm p-2">
                  Nie znaleziono składników. 
                  <button
                    type="button"
                    onClick={() => {
                      setNewIngredientName(ingredientSearchTerm);
                      setShowAddIngredient(true);
                      setIngredientSearchTerm('');
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Dodaj "{ingredientSearchTerm}"
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* List of ingredients */}
          <div className="space-y-2">
            {formData.skladniki?.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <select
                  value={ingredient.id_skladnika}
                  onChange={(e) => updateIngredient(index, 'id_skladnika', parseInt(e.target.value))}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {availableIngredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nazwa}
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  value={ingredient.ilosc}
                  onChange={(e) => updateIngredient(index, 'ilosc', e.target.value)}
                  placeholder="Ilość"
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                  step="0.1"
                />
                
                <div className="w-24 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50">
                  {ingredient.jednostka || 'g'}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {(!formData.skladniki || formData.skladniki.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Brak składników. Dodaj składniki powyżej.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz przepis'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(NewRecipePage);
