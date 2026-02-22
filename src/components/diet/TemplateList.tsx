import { useState, useEffect } from 'react';
import { DietTemplate, TemplateFilterOptions } from '@/api/types/diet-templates';
import { getTemplates, TEMPLATE_CATEGORIES, DIFFICULTY_LEVELS } from '@/api/diet-templates';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/use-toast';

type TemplateListProps = {
  onSelectTemplate?: (template: DietTemplate) => void;
  showActions?: boolean;
};

export function TemplateList({ onSelectTemplate, showActions = true }: TemplateListProps) {
  const [templates, setTemplates] = useState<DietTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TemplateFilterOptions>({
    category: [],
    difficulty: [],
    search: '',
    onlyPublic: true,
  });
  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await getTemplates(filters);
      
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się załadować szablonów. Spróbuj ponownie później.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (values: string[]) => {
    setFilters(prev => ({ ...prev, category: values }));
  };

  const handleDifficultyChange = (values: string[]) => {
    setFilters(prev => ({ ...prev, difficulty: values }));
  };

  const handlePublicToggle = (checked: boolean) => {
    setFilters(prev => ({ ...prev, onlyPublic: checked }));
  };

  const getCategoryName = (categoryId: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  const getDifficultyName = (difficultyId: string) => {
    return DIFFICULTY_LEVELS.find(d => d.id === difficultyId)?.name || difficultyId;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
        <span className="sr-only">Ładowanie...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Wyszukaj szablony..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="public-only" 
              checked={filters.onlyPublic} 
              onCheckedChange={handlePublicToggle}
            />
            <Label htmlFor="public-only">Tylko publiczne</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Kategorie</Label>
            <div className="space-y-2">
              {TEMPLATE_CATEGORIES.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={filters.category?.includes(category.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleCategoryChange([...(filters.category || []), category.id]);
                      } else {
                        handleCategoryChange((filters.category || []).filter(id => id !== category.id));
                      }
                    }}
                  />
                  <Label htmlFor={`cat-${category.id}`}>{category.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Poziom trudności</Label>
            <div className="space-y-2">
              {DIFFICULTY_LEVELS.map(level => (
                <div key={level.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diff-${level.id}`}
                    checked={filters.difficulty?.includes(level.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleDifficultyChange([...(filters.difficulty || []), level.id]);
                      } else {
                        handleDifficultyChange((filters.difficulty || []).filter(id => id !== level.id));
                      }
                    }}
                  />
                  <Label htmlFor={`diff-${level.id}`}>{level.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Brak dostępnych szablonów spełniających kryteria wyszukiwania.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <Card key={template.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description?.substring(0, 100)}
                          {template.description && template.description.length > 100 ? '...' : ''}
                        </CardDescription>
                      </div>
                      {template.averageRating !== undefined && template.averageRating > 0 && (
                        <div className="flex items-center bg-primary/10 px-2 py-1 rounded-md">
                          <Icons.star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-sm font-medium">
                            {template.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">
                        {getCategoryName(template.category)}
                      </Badge>
                      <Badge variant="outline">
                        {getDifficultyName(template.difficulty)}
                      </Badge>
                      {template.tags?.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-sm text-muted-foreground">
                      <p>Dni: {template.duration}</p>
                      <p>Posiłków dziennie: {template.days[0]?.meals.length || 0}</p>
                      <p>Użycia: {template.usageCount || 0}</p>
                    </div>
                  </CardContent>
                  {showActions && (
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectTemplate?.(template)}
                      >
                        Wybierz
                      </Button>
                      <Button variant="ghost" size="sm" className="text-primary">
                        <Icons.eye className="h-4 w-4 mr-2" />
                        Podgląd
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
