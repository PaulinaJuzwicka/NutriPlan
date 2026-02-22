import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Plus, Trash2, Calendar, Target, Users, Clock } from 'lucide-react';

interface CreateDietPlanFormSimpleProps {
  initialData?: DietPlanFormData;
  isEditMode?: boolean;
  onSuccess: (data: DietPlanFormData) => void;
  onCancel: () => void;
}

interface DietPlanFormData {
  name: string;
  description?: string;
  duration: number;
  calories: number;
  mealPlanType: 'custom' | 'standard' | 'mixed';
  startDate?: string;
  endDate?: string;
  targetWeight?: number;
  currentWeight?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryRestrictions: string[];
  preferences: string[];
  mealsPerDay: number;
  snackTimes: string[];
  waterIntake: number;
  supplements: string[];
  notes?: string;
}

const mealPlanTypes = [
  { value: 'custom', label: 'Niestandardowy' },
  { value: 'standard', label: 'Standardowy' },
  { value: 'mixed', label: 'Mieszany' }
];

const activityLevels = [
  { value: 'sedentary', label: 'Siedzący tryb życia' },
  { value: 'light', label: 'Lekka aktywność' },
  { value: 'moderate', label: 'Umiarkowana aktywność' },
  { value: 'active', label: 'Aktywny tryb życia' },
  { value: 'very_active', label: 'Bardzo aktywny' }
];

const dietaryRestrictions = [
  'Bez glutenu',
  'Bez laktozy',
  'Wegetariański',
  'Wegański',
  'Bez orzechów',
  'Bez soi',
  'Niskowęglowodanowy',
  'Niskotłuszczowy',
  'Bez cukru',
  'Halal',
  'Koszer'
];

const preferences = [
  'Niskokaloryczne',
  'Wysokobiałkowe',
  'Wysokowęglowodanowe',
  'Niskotłuszczowe',
  'Bogate w błonnik',
  'Organiczne',
  'Sezonowe',
  'Lokalne produkty',
  'Szybkie przygotowanie',
  'Bez gotowania'
];

const supplementOptions = [
  'Witamina D',
  'Witamina B12',
  'Witamina C',
  'Omega-3',
  'Magnez',
  'Cynk',
  'Żelazo',
  'Wapń',
  'Probiotyki',
  'Koenzym Q10',
  'Kurkuma',
  'Imbir'
];

const timeOptions = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function CreateDietPlanFormSimple({
  initialData,
  isEditMode = false,
  onSuccess,
  onCancel
}: CreateDietPlanFormSimpleProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DietPlanFormData>({
    defaultValues: initialData || {
      name: '',
      description: '',
      duration: 30,
      calories: 2000,
      mealPlanType: 'standard',
      activityLevel: 'moderate',
      dietaryRestrictions: [],
      preferences: [],
      mealsPerDay: 3,
      snackTimes: ['10:00', '15:00'],
      waterIntake: 2000,
      supplements: []
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(initialData?.dietaryRestrictions || []);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(initialData?.preferences || []);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>(initialData?.supplements || []);
  const [selectedSnackTimes, setSelectedSnackTimes] = useState<string[]>(initialData?.snackTimes || ['10:00', '15:00']);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSelectedRestrictions(initialData.dietaryRestrictions || []);
      setSelectedPreferences(initialData.preferences || []);
      setSelectedSupplements(initialData.supplements || []);
      setSelectedSnackTimes(initialData.snackTimes || ['10:00', '15:00']);
    }
  }, [initialData, reset]);

  const handleToggleRestriction = (restriction: string) => {
    const updated = selectedRestrictions.includes(restriction)
      ? selectedRestrictions.filter(r => r !== restriction)
      : [...selectedRestrictions, restriction];
    setSelectedRestrictions(updated);
    setValue('dietaryRestrictions', updated);
  };

  const handleTogglePreference = (preference: string) => {
    const updated = selectedPreferences.includes(preference)
      ? selectedPreferences.filter(p => p !== preference)
      : [...selectedPreferences, preference];
    setSelectedPreferences(updated);
    setValue('preferences', updated);
  };

  const handleToggleSupplement = (supplement: string) => {
    const updated = selectedSupplements.includes(supplement)
      ? selectedSupplements.filter(s => s !== supplement)
      : [...selectedSupplements, supplement];
    setSelectedSupplements(updated);
    setValue('supplements', updated);
  };

  const handleToggleSnackTime = (time: string) => {
    const updated = selectedSnackTimes.includes(time)
      ? selectedSnackTimes.filter(t => t !== time)
      : [...selectedSnackTimes, time];
    setSelectedSnackTimes(updated);
    setValue('snackTimes', updated);
  };

  const calculateRecommendedCalories = () => {
    const weight = watch('currentWeight');
    const activityLevel = watch('activityLevel');
    const targetWeight = watch('targetWeight');
    
    if (!weight) return 2000;

    let baseCalories = weight * 22; // podstawowa kaloryzacja
    
    // Modyfikacja w zależności od aktywności
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    baseCalories *= activityMultipliers[activityLevel];
    
    // Modyfikacja w zależności od celu
    if (targetWeight && targetWeight < weight) {
      baseCalories -= 500; // deficyt dla utraty wagi
    } else if (targetWeight && targetWeight > weight) {
      baseCalories += 500; // nadwyżka dla przybrania wagi
    }
    
    return Math.round(baseCalories);
  };

  const onSubmit = async (data: DietPlanFormData) => {
    setIsLoading(true);
    
    try {
      // Symulacja zapisu planu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess(data);
    } catch (error) {
      console.error('Error saving diet plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nazwa planu *</Label>
          <Input
            id="name"
            {...register('name', { required: true })}
            placeholder="np. Plan odchudzający na lato"
            className="mt-1"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="duration">Czas trwania (dni) *</Label>
          <Input
            id="duration"
            type="number"
            {...register('duration', { valueAsNumber: true, required: true, min: 1 })}
            placeholder="np. 30"
            className="mt-1"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="calories">Kalorie dziennie *</Label>
          <div className="flex gap-2">
            <Input
              id="calories"
              type="number"
              {...register('calories', { valueAsNumber: true, required: true, min: 800 })}
              placeholder="np. 2000"
              className="mt-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setValue('calories', calculateRecommendedCalories())}
              className="mt-1"
            >
              Oblicz
            </Button>
          </div>
          {errors.calories && (
            <p className="text-red-500 text-sm mt-1">{errors.calories.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="mealPlanType">Typ planu *</Label>
          <Select onValueChange={(value) => setValue('mealPlanType', value as 'custom' | 'standard' | 'mixed')}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Wybierz typ planu" />
            </SelectTrigger>
            <SelectContent>
              {mealPlanTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="currentWeight">Waga początkowa (kg)</Label>
          <Input
            id="currentWeight"
            type="number"
            {...register('currentWeight', { valueAsNumber: true, min: 30 })}
            placeholder="np. 70"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="targetWeight">Waga docelowa (kg)</Label>
          <Input
            id="targetWeight"
            type="number"
            {...register('targetWeight', { valueAsNumber: true, min: 30 })}
            placeholder="np. 65"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="activityLevel">Poziom aktywności *</Label>
          <Select onValueChange={(value) => setValue('activityLevel', value as any)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Wybierz poziom aktywności" />
            </SelectTrigger>
            <SelectContent>
              {activityLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="waterIntake">Dzienne spożycie wody (ml)</Label>
          <Input
            id="waterIntake"
            type="number"
            {...register('waterIntake', { valueAsNumber: true, min: 500 })}
            placeholder="np. 2000"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="mealsPerDay">Liczba posiłków dziennie</Label>
          <Input
            id="mealsPerDay"
            type="number"
            {...register('mealsPerDay', { valueAsNumber: true, min: 1, max: 8 })}
            placeholder="np. 3"
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Opis planu</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Opisz szczegóły planu dietetycznego..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Dodatkowe notatki</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Dodatkowe informacje, uwagi, zalecenia..."
            rows={2}
            className="mt-1"
          />
        </div>
      </div>

      {/* Ograniczenia dietetyczne */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Ograniczenia dietetyczne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietaryRestrictions.map((restriction) => (
              <div key={restriction} className="flex items-center space-x-2">
                <Checkbox
                  id={`restriction-${restriction}`}
                  checked={selectedRestrictions.includes(restriction)}
                  onCheckedChange={() => handleToggleRestriction(restriction)}
                />
                <Label htmlFor={`restriction-${restriction}`} className="text-sm">
                  {restriction}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferencje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Preferencje żywieniowe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {preferences.map((preference) => (
              <div key={preference} className="flex items-center space-x-2">
                <Checkbox
                  id={`preference-${preference}`}
                  checked={selectedPreferences.includes(preference)}
                  onCheckedChange={() => handleTogglePreference(preference)}
                />
                <Label htmlFor={`preference-${preference}`} className="text-sm">
                  {preference}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suplementy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Zalecane suplementy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {supplementOptions.map((supplement) => (
              <div key={supplement} className="flex items-center space-x-2">
                <Checkbox
                  id={`supplement-${supplement}`}
                  checked={selectedSupplements.includes(supplement)}
                  onCheckedChange={() => handleToggleSupplement(supplement)}
                />
                <Label htmlFor={`supplement-${supplement}`} className="text-sm">
                  {supplement}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Czas przekąsek */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Czas przekąsek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleToggleSnackTime(time)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectedSnackTimes.includes(time)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Anuluj
        </Button>
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? 'Zapisywanie...' : isEditMode ? 'Zapisz zmiany' : 'Utwórz plan'}
        </Button>
      </div>
    </div>
  );
}
