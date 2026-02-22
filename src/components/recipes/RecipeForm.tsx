import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { recipeService } from '../../services/recipeService';

type Skladnik = {
  id_skladnika: number;
  ilosc: string;
  jednostka: string;
};

type PrzepisFormData = {
  tytul: string;
  opis: string;
  id_kategorii?: number;
  zrodlo?: string;
  kalorie?: number;
  skladniki?: Skladnik[];
};

const schema = yup.object().shape({
  tytul: yup.string().required('Tytuł jest wymagany'),
  opis: yup.string(),
  id_kategorii: yup.number(),
  zrodlo: yup.string(),
  kalorie: yup.number().min(0, 'Kalorie nie mogą być ujemne'),
  skladniki: yup.array().of(
    yup.object().shape({
      id_skladnika: yup.number().required('Wybierz składnik'),
      ilosc: yup.string().required('Podaj ilość'),
      jednostka: yup.string().required('Wybierz jednostkę'),
    })
  ),
});

const units = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'szklanka', label: 'szklanka' },
  { value: 'łyżka', label: 'łyżka' },
  { value: 'łyżeczka', label: 'łyżeczka' },
  { value: 'szczypta', label: 'szczypta' },
];

interface RecipeFormProps {
  initialData?: Partial<PrzepisFormData>;
  onSubmit: (data: PrzepisFormData) => void;
  isSubmitting?: boolean;
}

export function RecipeForm({ initialData, onSubmit, isSubmitting = false }: RecipeFormProps) {
  const [categories, setCategories] = useState<unknown[]>([]);
  const [ingredients, setIngredients] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PrzepisFormData>({
    resolver: yupResolver(schema) as Resolver<PrzepisFormData>,
    defaultValues: initialData || {
      skladniki: [],
    },
  });

  const handleFormSubmit = (data: PrzepisFormData) => {
    console.log('🍳 RECIPE FORM - Form submitted with data:', data);
    console.log('🍳 RECIPE FORM - Calling onSubmit prop...');
    
    // Test alert
    alert('Formularz został wysłany! Sprawdź konsolę.');
    
    onSubmit(data);
  };

  const watchedIngredients = watch('skladniki') || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, ingredientsData] = await Promise.all([
          recipeService.getCategories(),
          recipeService.getIngredients(),
        ]);
        setCategories(categoriesData);
        setIngredients(ingredientsData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addIngredient = () => {
    const currentIngredients = watch('skladniki') || [];
    setValue('skladniki', [...currentIngredients, { id_skladnika: 0, ilosc: '', jednostka: 'g' }]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = watch('skladniki') || [];
    setValue('skladniki', currentIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Skladnik, value: unknown) => {
    const currentIngredients = watch('skladniki') || [];
    const updatedIngredients = [...currentIngredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setValue('skladniki', updatedIngredients);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Podstawowe informacje */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Podstawowe informacje</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tytuł *
            </label>
            <Input
              {...register('tytul')}
              placeholder="Wpisz tytuł przepisu"
              error={errors.tytul?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategoria
            </label>
            <Select
              value={watch('id_kategorii')?.toString()}
              onValueChange={(value) => setValue('id_kategorii', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.nazwa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis
          </label>
          <Textarea
            {...register('opis')}
            placeholder="Krótki opis przepisu"
            rows={3}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Źródło (książka)
          </label>
          <Input
            {...register('zrodlo')}
            placeholder="np. Kuchnia Polska - Maria Kępka"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kalorie (kcal)
          </label>
          <Input
            type="number"
            {...register('kalorie', { valueAsNumber: true })}
            placeholder="450"
            error={errors.kalorie?.message}
          />
        </div>
      </div>

      {/* Składniki */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Składniki</h2>
          <Button
            type="button"
            onClick={addIngredient}
            variant="outline"
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj składnik
          </Button>
        </div>

        <div className="space-y-3">
          {watchedIngredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <Select
                  value={ingredient.id_skladnika?.toString()}
                  onValueChange={(value) => updateIngredient(index, 'id_skladnika', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz składnik" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ing) => (
                      <SelectItem key={ing.id} value={ing.id.toString()}>
                        {ing.nazwa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Input
                  placeholder="Ilość"
                  value={ingredient.ilosc}
                  onChange={(e) => updateIngredient(index, 'ilosc', e.target.value)}
                />
              </div>

              <div className="w-32">
                <Select
                  value={ingredient.jednostka}
                  onValueChange={(value) => updateIngredient(index, 'jednostka', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeIngredient(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {watchedIngredients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Brak składników. Kliknij "Dodaj składnik" aby rozpocząć.
            </div>
          )}
        </div>
      </div>

      {/* Przyciski */}
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
  );
}
