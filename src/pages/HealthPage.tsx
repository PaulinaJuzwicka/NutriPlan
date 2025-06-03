import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HealthIndicatorsTable from '../components/health/HealthIndicatorsTable';
import HealthParametersForm from '../components/health/HealthParametersForm';
import HealthChart from '../components/health/HealthChart';
import { healthService } from '../services/healthService';

const HealthPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchHealthData();
  }, [user]);

  const fetchHealthData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthService.getHealthEntries({ userId: user.id });
      const processedData = data.map(entry => ({
        id: entry.id,
        type: entry.type,
        value: entry.value,
        unit: getUnitForType(entry.type),
        timestamp: entry.measured_at,
        status: getStatusForValue(entry.type, entry.value),
        referenceRange: getReferenceRangeForType(entry.type)
      }));
      setHealthData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      await healthService.deleteHealthEntry(id);
      await fetchHealthData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete health entry');
    } finally {
      setIsLoading(false);
    }
  };

  const getUnitForType = (type: string): string => {
    switch (type) {
      case 'blood-pressure':
        return 'mmHg';
      case 'blood-sugar':
        return 'mg/dL';
      case 'pulse':
        return 'bpm';
      case 'temperature':
        return '°C';
      default:
        return '';
    }
  };

  const getReferenceRangeForType = (type: string) => {
    switch (type) {
      case 'blood-pressure':
        return { min: 90, max: 140 }; 
      case 'blood-sugar':
        return { min: 70, max: 140 };
      case 'pulse':
        return { min: 60, max: 100 };
      case 'temperature':
        return { min: 36.1, max: 37.2 };
      default:
        return { min: 0, max: 0 };
    }
  };

  const getStatusForValue = (type: string, value: any): 'normal' | 'warning' | 'critical' => {
    const range = getReferenceRangeForType(type);
    const numValue = typeof value === 'number' ? value : parseFloat(value);

    if (type === 'blood-pressure') {
      const [systolic, diastolic] = value.split('/').map(Number);
      if (systolic >= 180 || diastolic >= 120) return 'critical';
      if (systolic >= 140 || diastolic >= 90) return 'warning';
      return 'normal';
    }

    if (numValue < range.min * 0.8 || numValue > range.max * 1.2) return 'critical';
    if (numValue < range.min || numValue > range.max) return 'warning';
    return 'normal';
  };

  const handleSubmit = async (data: any) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const entries = [];

      if (data.bloodPressure?.systolic && data.bloodPressure?.diastolic) {
        entries.push({
          user_id: user.id,
          type: 'blood-pressure' as const,
          value: `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}`,
          notes: data.notes,
          measured_at: data.measuredAt,
        });
      }

      if (data.pulse) {
        entries.push({
          user_id: user.id,
          type: 'pulse' as const,
          value: data.pulse,
          notes: data.notes,
          measured_at: data.measuredAt,
        });
      }

      if (data.bloodSugar) {
        entries.push({
          user_id: user.id,
          type: 'blood-sugar' as const,
          value: data.bloodSugar,
          notes: data.notes,
          measured_at: data.measuredAt,
        });
      }

      if (data.temperature) {
        entries.push({
          user_id: user.id,
          type: 'temperature' as const,
          value: data.temperature,
          notes: data.notes,
          measured_at: data.measuredAt,
        });
      }

      for (const entry of entries) {
        await healthService.createHealthEntry(entry);
      }

      await fetchHealthData();
      
      const form = document.querySelector('form');
      if (form) {
        form.reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save health data');
    } finally {
      setIsLoading(false);
    }
  };

  const getEntriesByType = (type: string) => {
    return healthData.filter(entry => entry.type === type);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Health Monitoring</h1>
      
      <div className="space-y-6">
        <HealthIndicatorsTable 
          indicators={healthData} 
          onDelete={handleDelete}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getEntriesByType('blood-pressure').length > 0 && (
            <HealthChart
              entries={getEntriesByType('blood-pressure')}
              type="blood-pressure"
            />
          )}
          {getEntriesByType('blood-sugar').length > 0 && (
            <HealthChart
              entries={getEntriesByType('blood-sugar')}
              type="blood-sugar"
            />
          )}
          {getEntriesByType('pulse').length > 0 && (
            <HealthChart
              entries={getEntriesByType('pulse')}
              type="pulse"
            />
          )}
          {getEntriesByType('temperature').length > 0 && (
            <HealthChart
              entries={getEntriesByType('temperature')}
              type="temperature"
            />
          )}
        </div>

        <HealthParametersForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default HealthPage; 