import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DietTemplate, CreateTemplateData } from '@/api/types/diet-templates';
import { createTemplate, updateTemplate, TEMPLATE_CATEGORIES, DIFFICULTY_LEVELS } from '@/api/diet-templates';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner, Star, Eye, Plus, Trash2, Edit2, X } from '@/components/ui/Icons';

const templateFormSchema = z.object({
  name: z.string().min(3, 'Nazwa jest wymagana (min. 3 znaki)'),
  description: z.string().min(10, 'Opis jest wymagany (min. 10 znaków)'),
  category: z.enum(['weight_loss', 'muscle_gain', 'balanced', 'vegetarian', 'vegan', 'keto', 'other']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  isPublic: z.boolean().default(false),
  tags: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  template?: DietTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function TemplateForm({ template, onSuccess, onCancel, className }: TemplateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      category: template?.category || 'balanced',
      difficulty: template?.difficulty || 'intermediate',
      isPublic: template?.isPublic || false,
      tags: template?.tags?.join(', ') || '',
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty,
        isPublic: template.isPublic,
        tags: template.tags?.join(', ') || '',
      });
    }
  }, [template, reset]);

  const onSubmit = async (data: TemplateFormValues) => {
    try {
      setIsLoading(true);
      
      const templateData: Omit<CreateTemplateData, 'plan_data'> = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };

      if (template) {
        // Aktualizacja istniejącego szablonu
        const { error } = await updateTemplate(template.id, templateData);
        
        if (error) throw error;
        
        toast({
          title: 'Sukces',
          description: 'Szablon został zaktualizowany.',
        });
      } else {
        // Tworzenie nowego szablonu
        const { error } = await createTemplate({
          ...templateData,
          plan_data: {}, // Tutaj należy dodać dane planu
        });
        
        if (error) throw error;
        
        toast({
          title: 'Sukces',
          description: 'Szablon został utworzony.',
        });
        
        reset();
      }
      
      onSuccess?.();
    } catch (error) {
      
      toast({
        title: 'Błąd',
        description: 'Wystąpił błąd podczas zapisywania szablonu. Spróbuj ponownie później.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nazwa szablonu</Label>
            <Input
              id="name"
              placeholder="Np. Dieta na redukcję, Plan budowania masy"
              {...register('name')}
              error={errors.name?.message}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              placeholder="Opisz krótko cel i charakterystykę szablonu"
              {...register('description')}
              error={errors.description?.message}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategoria</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value as CreateTemplateData['category'])}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="difficulty">Poziom trudności</Label>
              <Select
                value={watch('difficulty')}
                onValueChange={(value) => setValue('difficulty', value as CreateTemplateData['difficulty'])}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz poziom trudności" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.difficulty.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tagi (oddzielone przecinkami)</Label>
            <Input
              id="tags"
              placeholder="Np. wegetariańska, wysokobiałkowa, szybkie posiłki"
              {...register('tags')}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Pomóż użytkownikom znaleźć Twój szablon poprzez odpowiednie tagi.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={watch('isPublic')}
              onCheckedChange={(checked) => setValue('isPublic', checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="isPublic">Udostępnij publicznie</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Anuluj
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {template ? 'Zapisz zmiany' : 'Utwórz szablon'}
          </Button>
        </div>
      </form>
    </div>
  );
}
