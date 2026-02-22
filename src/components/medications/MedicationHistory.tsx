import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar, Clock, Check, X, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface MedicationHistoryProps {
  userId: string;
  onClose: () => void;
}

interface MedicationHistoryEntry {
  id: string;
  medicationName: string;
  dose: string;
  scheduledTime: string;
  actualTime?: string;
  taken: boolean;
  date: string;
  notes?: string;
  adherenceRate?: number;
  missedReason?: string;
}

interface MedicationStats {
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  adherenceTrend: 'up' | 'down' | 'stable';
  bestDay: string;
  worstDay: string;
}

export default function MedicationHistory({ userId, onClose }: MedicationHistoryProps) {
  const [historyData, setHistoryData] = useState<MedicationHistoryEntry[]>([]);
  const [stats, setStats] = useState<MedicationStats>({
    totalDoses: 0,
    takenDoses: 0,
    missedDoses: 0,
    adherenceRate: 0,
    adherenceTrend: 'stable',
    bestDay: '',
    worstDay: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('30days');
  const [filterMedication, setFilterMedication] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetails, setShowDetails] = useState(false);

  const medications = [
    'Aspirin',
    'Ibuprofen',
    'Witamina C',
    'Witamina D',
    'Omega-3',
    'Magnez',
    'Cynk',
    'Probiotyk'
  ];

  useEffect(() => {
    loadHistoryData();
  }, [filterPeriod, filterMedication, filterStatus]);

  const loadHistoryData = async () => {
    setIsLoading(true);
    
    // Symulacja pobierania danych historii
    setTimeout(() => {
      const mockData: MedicationHistoryEntry[] = [
        {
          id: '1',
          medicationName: 'Aspirin',
          dose: '100mg',
          scheduledTime: '08:00',
          actualTime: '08:05',
          taken: true,
          date: '2024-01-15',
          notes: 'Przyjęto z wodą'
        },
        {
          id: '2',
          medicationName: 'Aspirin',
          dose: '100mg',
          scheduledTime: '20:00',
          taken: false,
          date: '2024-01-15',
          missedReason: 'Zapomniano'
        },
        {
          id: '3',
          medicationName: 'Ibuprofen',
          dose: '200mg',
          scheduledTime: '08:00',
          actualTime: '08:10',
          taken: true,
          date: '2024-01-15',
          notes: 'Przyjęto z jedzeniem'
        },
        {
          id: '4',
          medicationName: 'Witamina C',
          dose: '500mg',
          scheduledTime: '09:00',
          actualTime: '09:15',
          taken: true,
          date: '2024-01-15'
        },
        {
          id: '5',
          medicationName: 'Aspirin',
          dose: '100mg',
          scheduledTime: '08:00',
          actualTime: '08:02',
          taken: true,
          date: '2024-01-14',
          notes: 'Przyjęto na czas'
        },
        {
          id: '6',
          medicationName: 'Ibuprofen',
          dose: '200mg',
          scheduledTime: '08:00',
          taken: false,
          date: '2024-01-14',
          missedReason: 'Brak w domu'
        },
        {
          id: '7',
          medicationName: 'Witamina C',
          dose: '500mg',
          scheduledTime: '09:00',
          actualTime: '09:30',
          taken: true,
          date: '2024-01-14',
          notes: 'Późno ale przyjęto'
        },
        {
          id: '8',
          medicationName: 'Aspirin',
          dose: '100mg',
          scheduledTime: '08:00',
          actualTime: '08:01',
          taken: true,
          date: '2024-01-13',
          notes: 'Idealnie na czas'
        },
        {
          id: '9',
          medicationName: 'Ibuprofen',
          dose: '200mg',
          scheduledTime: '08:00',
          actualTime: '08:05',
          taken: true,
          date: '2024-01-13'
        },
        {
          id: '10',
          medicationName: 'Witamina C',
          dose: '500mg',
          scheduledTime: '09:00',
          actualTime: '09:00',
          taken: true,
          date: '2024-01-13',
          notes: 'Dokładnie na czas'
        }
      ];

      // Filtrowanie danych
      let filteredData = mockData;

      if (filterMedication !== 'all') {
        filteredData = filteredData.filter(entry => entry.medicationName === filterMedication);
      }

      if (filterStatus !== 'all') {
        filteredData = filteredData.filter(entry => 
          filterStatus === 'taken' ? entry.taken : !entry.taken
        );
      }

      // Sortowanie po dacie i czasie
      filteredData.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.scheduledTime.localeCompare(a.scheduledTime);
      });

      setHistoryData(filteredData);

      // Obliczanie statystyk
      const totalDoses = filteredData.length;
      const takenDoses = filteredData.filter(entry => entry.taken).length;
      const missedDoses = totalDoses - takenDoses;
      const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

      // Obliczanie trendu
      const recentData = filteredData.slice(0, 10);
      const olderData = filteredData.slice(10, 20);
      const recentRate = recentData.length > 0 ? Math.round((recentData.filter(e => e.taken).length / recentData.length) * 100) : 0;
      const olderRate = olderData.length > 0 ? Math.round((olderData.filter(e => e.taken).length / olderData.length) * 100) : 0;
      
      let adherenceTrend: 'up' | 'down' | 'stable' = 'stable';
      if (recentRate > olderRate + 5) adherenceTrend = 'up';
      else if (recentRate < olderRate - 5) adherenceTrend = 'down';

      // Najlepszy i najgorszy dzień
      const dailyStats = filteredData.reduce((acc, entry) => {
        if (!acc[entry.date]) {
          acc[entry.date] = { total: 0, taken: 0 };
        }
        acc[entry.date].total++;
        if (entry.taken) acc[entry.date].taken++;
        return acc;
      }, {} as Record<string, { total: number; taken: number }>);

      let bestDay = '';
      let worstDay = '';
      let bestRate = 0;
      let worstRate = 100;

      Object.entries(dailyStats).forEach(([date, stats]) => {
        const rate = Math.round((stats.taken / stats.total) * 100);
        if (rate > bestRate) {
          bestRate = rate;
          bestDay = date;
        }
        if (rate < worstRate) {
          worstRate = rate;
          worstDay = date;
        }
      });

      setStats({
        totalDoses,
        takenDoses,
        missedDoses,
        adherenceRate,
        adherenceTrend,
        bestDay,
        worstDay
      });

      setIsLoading(false);
    }, 1000);
  };

  const downloadHistory = () => {
    const content = generateHistoryReport();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medication-history-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHistoryReport = () => {
    return `
HISTORIA PRZYPOMINANIA LEKÓW - ${new Date().toLocaleDateString('pl-PL')}
===================================================

STATYSTYKA
===================================================
Łączna liczba dawek: ${stats.totalDoses}
Przyjęte dawki: ${stats.takenDoses}
Pominięte dawki: ${stats.missedDoses}
Stopień przestrzegani: ${stats.adherenceRate}%
Trend: ${stats.adherenceTrend === 'up' ? 'Wzrost' : stats.adherenceTrend === 'down' ? 'Spadek' : 'Stabilny'}
Najlepszy dzień: ${stats.bestDay}
Najgorszy dzień: ${stats.worstDay}

SZCZEGÓŁY HISTORII
===================================================

${historyData.map(entry => `
${entry.date} - ${entry.scheduledTime}
Lek: ${entry.medicationName} (${entry.dose})
Status: ${entry.taken ? 'Przyjęto' : 'Pominięto'}
${entry.actualTime ? `Godzina przyjęcia: ${entry.actualTime}` : ''}
${entry.notes ? `Notatki: ${entry.notes}` : ''}
${entry.missedReason ? `Powód pominięcia: ${entry.missedReason}` : ''}
`).join('\n\n')}
===================================================
    `;
  };

  const getTrendIcon = () => {
    switch (stats.adherenceTrend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Historia przyjmowania leków</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filtry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filterPeriod">Okres</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Ostatnie 7 dni</SelectItem>
                  <SelectItem value="30days">Ostatnie 30 dni</SelectItem>
                  <SelectItem value="90days">Ostatnie 90 dni</SelectItem>
                  <SelectItem value="all">Cały okres</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterMedication">Lek</Label>
              <Select value={filterMedication} onValueChange={setFilterMedication}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {medications.map((med) => (
                    <SelectItem key={med} value={med}>
                      {med}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterStatus">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="taken">Przyjęte</SelectItem>
                  <SelectItem value="missed">Pominięte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statystyki */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Łączne dawki</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDoses}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Przyjęte</p>
                    <p className="text-2xl font-bold text-green-600">{stats.takenDoses}</p>
                  </div>
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pominięte</p>
                    <p className="text-2xl font-bold text-red-600">{stats.missedDoses}</p>
                  </div>
                  <X className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stopień przestrzegani</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.adherenceRate}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dodatkowe statystyki */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Najlepszy dzień</p>
                    <p className="text-lg font-bold text-green-600">
                      {stats.bestDay ? new Date(stats.bestDay).toLocaleDateString('pl-PL') : 'Brak'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Najgorszy dzień</p>
                    <p className="text-lg font-bold text-red-600">
                      {stats.worstDay ? new Date(stats.worstDay).toLocaleDateString('pl-PL') : 'Brak'}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historia */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Szczegóły historii</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowDetails(!showDetails)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {showDetails ? 'Ukryj' : 'Pokaż'} szczegóły
                  </Button>
                  <Button
                    onClick={downloadHistory}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Pobierz
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">Ładowanie historii...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historyData.map((entry) => (
                    <div
                      key={entry.id}
                      className={`border-l-4 p-4 rounded-lg ${
                        entry.taken
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {entry.medicationName}
                            </span>
                            <span className="text-sm text-gray-600">
                              ({entry.dose})
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.taken
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {entry.taken ? 'Przyjęto' : 'Pominięto'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {new Date(entry.date).toLocaleDateString('pl-PL')}
                            </span>
                            <span className="text-sm text-gray-600">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {entry.scheduledTime}
                            </span>
                            {entry.actualTime && (
                              <span className="text-sm text-green-600">
                                <Check className="w-3 h-3 inline mr-1" />
                                {entry.actualTime}
                              </span>
                            )}
                          </div>
                          {showDetails && (
                            <div className="mt-2 space-y-1">
                              {entry.notes && (
                                <p className="text-sm text-gray-600">
                                  <strong>Notatki:</strong> {entry.notes}
                                </p>
                              )}
                              {entry.missedReason && (
                                <p className="text-sm text-red-600">
                                  <strong>Powód pominięcia:</strong> {entry.missedReason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Zamknij
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
