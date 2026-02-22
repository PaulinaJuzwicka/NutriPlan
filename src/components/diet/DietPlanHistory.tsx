import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, Trash2, FileText, FileArchive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { deleteDietPlan, getUserDietPlans, DietPlanHistoryItem } from '@/api/diet-plan-history';
import { toast } from 'sonner';

export function DietPlanHistory() {
  const [plans, setPlans] = useState<DietPlanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getUserDietPlans();
      
      if (error) throw error;
      
      setPlans(data || []);
      setError(null);
    } catch (err) {
      setError('Nie udało się załadować historii planów');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten plan z historii?')) return;
    
    try {
      const { error } = await deleteDietPlan(id);
      
      if (error) throw error;
      
      toast.success('Plan został usunięty');
      loadPlans(); // Odśwież listę
    } catch (error) {
      toast.error('Nie udało się usunąć planu');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia planów</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia planów</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            {error}
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={loadPlans}
            >
              Spróbuj ponownie
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Historia planów</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadPlans}
            disabled={isLoading}
          >
            Odśwież
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Brak zapisanych planów</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {plan.file_type === 'pdf' ? (
                    <FileText className="w-6 h-6 text-red-500" />
                  ) : (
                    <FileArchive className="w-6 h-6 text-blue-500" />
                  )}
                  <div>
                    <div className="font-medium">{plan.title}</div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(plan.created_at), { 
                        addSuffix: true, 
                        locale: pl 
                      })} • {formatFileSize(plan.file_size)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a 
                    href={plan.file_path} 
                    download
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Pobierz"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Usuń"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
