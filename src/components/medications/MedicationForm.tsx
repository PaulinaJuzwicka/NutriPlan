import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import { X } from 'lucide-react';

type MedicationFormData = {
  nazwa: string;
  dawka: string;
  czestotnosc: string;
  forma: string;
  data_rozpoczecia?: string;
  data_zakonczenia?: string;
  czas_trwania_dni?: number;
  czy_staly: boolean;
  aktywny: boolean;
  notatki?: string;
  godziny_przyjmowania: string[];
};

interface MedicationFormProps {
  onSubmit: (data: MedicationFormData) => void;
  isLoading?: boolean;
  error?: string | null;
  userId: string;
  initialData?: MedicationFormData;
}

const medicationForms = [
  'tabletki',
  'kapsułki',
  'syrop',
  'maść',
  'krople',
  'zastrzyki',
  'iniekcje',
  'plastry',
  'krem',
  'żel',
  'aerozol',
  'czopki',
  'roztwór',
  'suplement'
];

const frequencies = [
  'raz dziennie',
  '2 razy dziennie',
  '3 razy dziennie',
  '4 razy dziennie',
  'co 6 godzin',
  'co 8 godzin',
  'co 12 godzin',
  'według potrzeb',
  'tylko w razie'
];

const timeOptions = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00'
];

export default function MedicationForm({ 
  onSubmit, 
  isLoading = false, 
  error, 
  userId, 
  initialData 
}: MedicationFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<MedicationFormData>({
    defaultValues: initialData || {
      nazwa: '',
      dawka: '',
      czestotnosc: 'raz dziennie',
      forma: 'tabletki',
      czy_staly: false,
      aktywny: true,
      godziny_przyjmowania: ['08:00']
    }
  });

  const [selectedTimes, setSelectedTimes] = useState<string[]>(initialData?.godziny_przyjmowania || ['08:00']);

  const handleTimeToggle = (time: string) => {
    const newTimes = selectedTimes.includes(time)
      ? selectedTimes.filter(t => t !== time)
      : [...selectedTimes, time];
    setSelectedTimes(newTimes);
    setValue('godziny_przyjmowania', newTimes);
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSelectedTimes(initialData.godziny_przyjmowania || ['08:00']);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nazwa">Nazwa leku *</Label>
          <Input
            id="nazwa"
            {...register('nazwa', { required: true })}
            placeholder="Wpisz nazwę leku"
            className="mt-1"
          />
          {errors.nazwa && (
            <p className="text-red-500 text-sm mt-1">{errors.nazwa.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dawka">Dawka *</Label>
          <Input
            id="dawka"
            {...register('dawka', { required: true })}
            placeholder="np. 500mg"
            className="mt-1"
          />
          {errors.dawka && (
            <p className="text-red-500 text-sm mt-1">{errors.dawka.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="czestotnosc">Częstotliwość *</Label>
          <Select onValueChange={(value) => setValue('czestotnosc', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Wybierz częstotliwość" />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq} value={freq}>
                  {freq}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.czestotnosc && (
            <p className="text-red-500 text-sm mt-1">{errors.czestotnosc.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="forma">Forma *</Label>
          <Select onValueChange={(value) => setValue('forma', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Wybierz formę" />
            </SelectTrigger>
            <SelectContent>
              {medicationForms.map((form) => (
                <SelectItem key={form} value={form}>
                  {form}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.forma && (
            <p className="text-red-500 text-sm mt-1">{errors.forma.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="data_rozpoczecia">Data rozpoczęcia</Label>
          <Input
            id="data_rozpoczecia"
            type="date"
            {...register('data_rozpoczecia')}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="data_zakonczenia">Data zakończenia</Label>
          <Input
            id="data_zakonczenia"
            type="date"
            {...register('data_zakonczenia')}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="czas_trwania_dni">Czas trwania (dni)</Label>
          <Input
            id="czas_trwania_dni"
            type="number"
            {...register('czas_trwania_dni', { valueAsNumber: true, min: 1 })}
            placeholder="np. 30"
            className="mt-1"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="czy_staly"
              checked={watch('czy_staly')}
              onCheckedChange={(checked) => setValue('czy_staly', checked)}
            />
            <Label htmlFor="czy_staly">Lek stały</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="aktywny"
              checked={watch('aktywny')}
              onCheckedChange={(checked) => setValue('aktywny', checked)}
            />
            <Label htmlFor="aktywny">Lek aktywny</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="notatki">Notatki</Label>
          <Textarea
            id="notatki"
            {...register('notatki')}
            placeholder="Dodatkowe informacje o leku..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Godziny przyjmowania</Label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeToggle(time)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectedTimes.includes(time)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <input
            type="hidden"
            {...register('godziny_przyjmowania')}
            value={selectedTimes.join(',')}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isLoading}
        >
          Wyczyść
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Zapisywanie...' : 'Zapisz lek'}
        </Button>
      </div>
    </form>
  );
}
