import React from 'react';
import { Activity, Plus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface HealthResult {
  id: string;
  type: string;
  value: number | string;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

interface RecentHealthResultsProps {
  results: HealthResult[];
}

const RecentHealthResults = ({ results }: RecentHealthResultsProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-success-500';
      case 'warning':
        return 'bg-warning-500';
      case 'critical':
        return 'bg-error-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'normal':
        return 'W normie';
      case 'warning':
        return 'Wymaga uwagi';
      case 'critical':
        return 'Wymaga interwencji';
      default:
        return '';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blood-pressure':
        return 'Ciśnienie krwi';
      case 'blood-sugar':
        return 'Poziom cukru';
      case 'pulse':
        return 'Tętno';
      case 'temperature':
        return 'Temperatura';
      default:
        return type;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Dzisiejsze wyniki zdrowotne
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/health')}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Dodaj nowy
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="space-y-1">
                  <p className="text-lg font-medium leading-none">{getTypeLabel(result.type)}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.value} {result.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(result.timestamp), 'HH:mm', { locale: pl })}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(result.status)}`} />
                  <span className="text-sm font-medium">{getStatusMessage(result.status)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Brak wyników zdrowotnych na dzisiaj</p>
              <Button variant="link" className="mt-2" onClick={() => navigate('/health')}>
                Dodaj pierwszy wynik
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentHealthResults;
