import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { healthService, HealthEntry } from '../../services/healthService';
import { useAuth } from '../../context/AuthContext';
import HealthEntryForm from './HealthEntryForm';

const HealthDashboard: React.FC = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'blood-sugar' | 'blood-pressure'>('blood-sugar');

  useEffect(() => {
    if (!user) return;

    const fetchHealthData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await healthService.getHealthEntries(user.id);
        setHealthData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load health data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthData();
  }, [user]);

  const handleHealthEntry = async (data: any) => {
    if (!user) return;

    try {
      const newEntry = await healthService.createHealthEntry({
        user_id: user.id,
        type: selectedType,
        value: selectedType === 'blood-pressure' 
          ? `${data.systolic}/${data.diastolic}`
          : data.value,
        notes: data.notes,
        measured_at: new Date().toISOString(),
      });

      setHealthData(prev => [newEntry, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save health entry');
    }
  };

  const getChartData = () => {
    return healthData
      .filter(entry => entry.type === selectedType)
      .map(entry => ({
        date: format(new Date(entry.measured_at), 'MMM d'),
        value: selectedType === 'blood-pressure'
          ? parseInt((entry.value as string).split('/')[0])
          : entry.value as number,
        ...(selectedType === 'blood-pressure' && {
          diastolic: parseInt((entry.value as string).split('/')[1])
        })
      }))
      .reverse();
  };

  const getLatestValue = () => {
    const latest = healthData.find(entry => entry.type === selectedType);
    return latest ? latest.value : 'No data';
  };

  const getValueStatus = (value: string | number): 'normal' | 'warning' | 'critical' => {
    if (selectedType === 'blood-sugar') {
      const numValue = typeof value === 'number' ? value : parseInt(value);
      if (numValue < 70) return 'critical';
      if (numValue > 180) return 'critical';
      if (numValue < 80 || numValue > 140) return 'warning';
      return 'normal';
    } else {
      const [systolic, diastolic] = (value as string).split('/').map(Number);
      if (systolic >= 180 || diastolic >= 120) return 'critical';
      if (systolic >= 140 || diastolic >= 90) return 'warning';
      return 'normal';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" /> Health Tracking
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedType('blood-sugar')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedType === 'blood-sugar'
                    ? 'bg-white text-primary-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Blood Sugar
              </button>
              <button
                onClick={() => setSelectedType('blood-pressure')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedType === 'blood-pressure'
                    ? 'bg-white text-primary-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Blood Pressure
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={selectedType === 'blood-sugar' ? 'Blood Sugar' : 'Systolic'}
                      stroke="#0EA5E9"
                      strokeWidth={2}
                    />
                    {selectedType === 'blood-pressure' && (
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        name="Diastolic"
                        stroke="#14B8A6"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Latest Reading</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{getLatestValue()}</p>
                    <p className="text-sm text-gray-500">
                      {selectedType === 'blood-sugar' ? 'mg/dL' : 'mmHg'}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    getValueStatus(getLatestValue()) === 'normal'
                      ? 'bg-green-100'
                      : getValueStatus(getLatestValue()) === 'warning'
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}>
                    <TrendingUp className={`h-6 w-6 ${
                      getValueStatus(getLatestValue()) === 'normal'
                        ? 'text-green-600'
                        : getValueStatus(getLatestValue()) === 'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <HealthEntryForm
                  type={selectedType}
                  onSubmit={handleHealthEntry}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;