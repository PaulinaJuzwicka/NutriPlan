import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextOptimized';
import { useUserData } from '../context/UserDataContext';
import HealthIndicatorsTable from '../components/health/HealthIndicatorsTable';
import HealthParametersForm from '../components/health/HealthParametersForm';
import HealthRangesInfo from '../components/health/HealthRangesInfo';
import { healthService, HealthEntry as ServiceHealthEntry, HealthEntryType } from '../services/healthService';
import healthMeasurementReportService from '../services/healthMeasurementReportService';
import { Download, X, Heart, Activity, Thermometer, Droplets, TrendingUp, Calendar, Filter } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { pl } from 'date-fns/locale';

interface HealthIndicator {
  id: string;
  id_uzytkownika: string;
  typ: HealthEntryType;
  wartosc: number | string;
  notatki?: string;
  zmierzono_o: string;
  utworzono_o: string;
  jednostka: string;
  status: 'normal' | 'warning' | 'critical' | 'low';
  zakres_referencyjny: { min: number; max: number };
  mozliwe_choroby?: string[];
}

const HealthPage: React.FC = () => {
  const { state } = useAuth();
  const { data: userData, refreshHealthMetrics } = useUserData();
  const user = state.user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [reportConfig, setReportConfig] = useState({
    format: 'pdf' as 'pdf' | 'json',
    dateRange: {
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    },
    categories: {
      'blood-pressure': false,
      'blood-sugar': false,
      'pulse': false,
      'temperature': false
    }
  });
  const [tableFilter, setTableFilter] = useState<'all' | 'blood-pressure' | 'blood-sugar' | 'pulse' | 'temperature'>('all');

  // Używamy danych z UserDataContext
  const healthData = userData.healthMetrics;

  const handleFilterChange = (filter: string) => {
    setTableFilter(filter as 'all' | 'blood-pressure' | 'blood-sugar' | 'pulse' | 'temperature');
  };

  useEffect(() => {
    if (!user) return;
    // Dane są ładowane przez UserDataContext, więc nie musimy fetchować tutaj
  }, [user]);

  const fetchHealthData = async () => {
    if (!user?.id) return;
    
    // Check if we already have recent data
    const dataAge = userData.lastUpdated ? Date.now() - userData.lastUpdated.getTime() : Infinity;
    const hasData = userData.healthMetrics && userData.healthMetrics.length > 0;
    
    if (hasData && dataAge < 5 * 60 * 1000) { // 5 minutes
      return;
    }
    
    // Data is stale or missing, fetching for user
    try {
      // Odśwież dane przez UserDataContext
      await refreshHealthMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać danych zdrowotnych');
    }
  };

  const handleSubmit = async (data: unknown) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    try {
      const formData = data as any;
      
      // Sprawdź czy typ jest wybrany
      if (!formData.typ) {
        setError('Proszę wybrać typ pomiaru');
        setIsSubmitting(false);
        return;
      }

      const entryData: Record<string, unknown> = {
        id_uzytkownika: user.id,
        typ: formData.typ,
        wartosc: formData.wartosc,
        notatki: formData.notatki,
        zmierzono_o: formData.zmierzono_o,
      };

      await healthService.createHealthEntry(entryData as Omit<ServiceHealthEntry, 'id' | 'utworzono_o'>);
      
      // Nie pokazuj sukces po każdym wpisie - tylko po ostatnim
      // setShowSuccess(true);
      await refreshHealthMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać pomiaru');
    } finally {
      setIsSubmitting(false);
      // Pokaż sukces po zakończeniu wszystkich operacji
      if (!error) {
        setShowSuccess(true);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    try {
      await healthService.deleteHealthEntry(id);
      await refreshHealthMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć wpisu zdrowotnego');
    }
  };

  const handleGenerateReport = async () => {
    if (!user?.id) return;
    
    setIsGeneratingReport(true);
    try {
      const dateRange = {
        start: new Date(reportConfig.dateRange.start),
        end: new Date(reportConfig.dateRange.end)
      };

      const reportData = await healthMeasurementReportService.generateMeasurementReport(
        user.id, 
        dateRange,
        undefined, // Nie przekazujemy pojedynczego typu
        reportConfig.categories // Przekazujemy wybrane kategorie
      );
      
      let blob: Blob;
      let filename: string;
      
      if (reportConfig.format === 'pdf') {
        blob = await healthMeasurementReportService.generateMeasurementPDF(reportData);
        filename = `raport-pomiarow-zdrowotnych-${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        blob = await healthMeasurementReportService.generateMeasurementJSON(reportData);
        filename = `raport-pomiarow-zdrowotnych-${new Date().toISOString().split('T')[0]}.json`;
      }
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowReportModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wygenerować raportu');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getFilteredChartData = () => {
    const filteredData = healthData.filter(entry => {
      const entryDate = new Date(entry.zmierzono_o);
      const cutoffDate = subDays(new Date(), 30); // Ostatnie 30 dni
      return entryDate >= cutoffDate;
    });

    const groupedData: Record<string, any> = {};
    
    filteredData.forEach(entry => {
      const dateKey = format(new Date(entry.zmierzono_o), 'dd.MM.yyyy', { locale: pl });
      
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          fullDate: new Date(entry.zmierzono_o)
        };
      }
      
      if (entry.typ === 'blood-pressure' && typeof entry.wartosc === 'string') {
        const [systolic, diastolic] = entry.wartosc.split('/').map(Number);
        groupedData[dateKey].bloodPressureSystolic = systolic;
        groupedData[dateKey].bloodPressureDiastolic = diastolic;
      } else {
        groupedData[dateKey][entry.typ.replace('-', '')] = entry.wartosc;
      }
    });

    return Object.values(groupedData)
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
      .slice(-20); // Ostatnie 20 punktów
  };

  const getLatestMeasurements = () => {
    const latest: Record<string, any> = {};
    
    healthData.forEach(entry => {
      if (!latest[entry.typ] || new Date(entry.zmierzono_o) > new Date(latest[entry.typ].zmierzono_o)) {
        latest[entry.typ] = entry;
      }
    });
    
    return latest;
  };

  const getMeasurementIcon = (type: string) => {
    switch (type) {
      case 'blood-pressure': return <Heart className="w-5 h-5 text-red-500" />;
      case 'blood-sugar': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'pulse': return <Activity className="w-5 h-5 text-pink-500" />;
      case 'temperature': return <Thermometer className="w-5 h-5 text-orange-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMeasurementUnit = (type: string) => {
    switch (type) {
      case 'blood-pressure': return 'mmHg';
      case 'blood-sugar': return 'mg/dL';
      case 'pulse': return 'bpm';
      case 'temperature': return '°C';
      default: return '';
    }
  };

  const formatMeasurementValue = (type: string, value: number | string) => {
    if (type === 'blood-pressure' && typeof value === 'string') {
      return value;
    }
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  const getHealthIndicators = (): HealthIndicator[] => {
    return healthData.map((entry) => {
      let jednostka = '';
      let zakres_referencyjny = { min: 0, max: 0 };

      switch (entry.typ) {
        case 'blood-sugar':
          jednostka = 'mg/dL';
          zakres_referencyjny = { min: 0, max: 0 };
          break;
          
        case 'blood-pressure':
          jednostka = 'mmHg';
          zakres_referencyjny = { min: 0, max: 0 };
          break;
          
        case 'pulse':
          jednostka = 'bpm';
          zakres_referencyjny = { min: 0, max: 0 };
          break;
          
        case 'temperature':
          jednostka = '°C';
          zakres_referencyjny = { min: 0, max: 0 };
          break;
      }

      return {
        id: entry.id,
        id_uzytkownika: entry.id_uzytkownika,
        typ: entry.typ,
        wartosc: entry.wartosc,
        notatki: entry.notatki,
        zmierzono_o: entry.zmierzono_o,
        utworzono_o: entry.utworzono_o,
        jednostka,
        status: 'normal' as const,
        zakres_referencyjny,
        mozliwe_choroby: [],
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dane zdrowotne</h1>
              <p className="text-gray-600 mt-1">Śledź swoje parametry zdrowotne i analizuj trendy</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Pobierz raport
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 7.293a1 1 0 00-1.414 0l-5.414 5.414a1 1 0 001.414 1.414L10.586 10l1.414-1.414a1 1 0 001.414 1.414L12 12.586a1 1 0 001.414-1.414l-5.414-5.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Błąd</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 7.293a1 1 0 00-1.414 0l-5.414 5.414a1 1 0 001.414 1.414L10.586 10l1.414-1.414a1 1 0 001.414 1.414L12 12.586a1 1 0 001.414-1.414l-5.414-5.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Sukces</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Dane zdrowotne zostały pomyślnie zapisane!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reference Ranges - PROMINENT PLACEMENT */}
        <div className="mb-8">
          <HealthRangesInfo />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Form and Quick Actions */}
          <div className="xl:col-span-1 space-y-6">
            <HealthParametersForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>

          {/* Right Column - Table with Filters */}
          <div className="xl:col-span-2 space-y-6">
            {/* History Table */}
            <HealthIndicatorsTable
              indicators={getHealthIndicators()}
              onDelete={handleDelete}
              onFilterChange={handleFilterChange}
              currentFilter={tableFilter}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pobierz raport zdrowotny</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Categories */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Wybierz dane:</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReportConfig(prev => ({
                        ...prev,
                        categories: {
                          'blood-pressure': true,
                          'blood-sugar': true,
                          'pulse': true,
                          'temperature': true
                        }
                      }))}
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ✅ Wszystkie
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportConfig(prev => ({
                        ...prev,
                        categories: {
                          'blood-pressure': false,
                          'blood-sugar': false,
                          'pulse': false,
                          'temperature': false
                        }
                      }))}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Żaden
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={reportConfig.categories['blood-pressure']}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          'blood-pressure': e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">❤️ Ciśnienie krwi</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={reportConfig.categories['blood-sugar']}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          'blood-sugar': e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">🩸 Cukier we krwi</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={reportConfig.categories['pulse']}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          'pulse': e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">💓 Tętno</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={reportConfig.categories['temperature']}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          'temperature': e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">🌡️ Temperatura</span>
                  </label>
                </div>
              </div>
              
              {/* Date Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Zakres dat:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Od:</label>
                    <input
                      type="date"
                      value={reportConfig.dateRange.start}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Do:</label>
                    <input
                      type="date"
                      value={reportConfig.dateRange.end}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
              
              {/* Format */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Format:</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="json"
                      checked={reportConfig.format === 'json'}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        format: e.target.value as 'pdf' | 'json'
                      }))}
                      className="mr-2"
                    />
                    <span>JSON (dane strukturalne)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pdf"
                      checked={reportConfig.format === 'pdf'}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        format: e.target.value as 'pdf' | 'json'
                      }))}
                      className="mr-2"
                    />
                    <span>PDF (dokument)</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isGeneratingReport ? 'Generowanie...' : 'Pobierz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthPage;
