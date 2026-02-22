import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Download, FileText, Calendar, TrendingUp, Users, Pill, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface MedicationReportProps {
  userId: string;
  onClose: () => void;
}

interface MedicationData {
  id: string;
  nazwa: string;
  dawka: string;
  czestotnosc: string;
  forma: string;
  aktywny: boolean;
  data_rozpoczecia?: string;
  data_zakonczenia?: string;
  notatki?: string;
  godziny_przyjmowania: string[];
  created_at: string;
}

interface ReportStats {
  totalMedications: number;
  activeMedications: number;
  inactiveMedications: number;
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
}

export default function MedicationReport({ userId, onClose }: MedicationReportProps) {
  const [reportData, setReportData] = useState<MedicationData[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalMedications: 0,
    activeMedications: 0,
    inactiveMedications: 0,
    adherenceRate: 0,
    totalDoses: 0,
    takenDoses: 0,
    missedDoses: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('30days');

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Symulacja generowania raportu
    setTimeout(() => {
      const mockData: MedicationData[] = [
        {
          id: '1',
          nazwa: 'Aspirin',
          dawka: '100mg',
          czestotnosc: 'raz dziennie',
          forma: 'tabletki',
          aktywny: true,
          data_rozpoczecia: '2024-01-01',
          notatki: 'Przyjmować po posiłku',
          godziny_przyjmowania: ['08:00'],
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          nazwa: 'Ibuprofen',
          dawka: '200mg',
          czestotnosc: '2 razy dziennie',
          forma: 'kapsułki',
          aktywny: true,
          data_rozpoczecia: '2024-01-15',
          notatki: 'Przyjmować z jedzeniem',
          godziny_przyjmowania: ['08:00', '20:00'],
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '3',
          nazwa: 'Witamina C',
          dawka: '500mg',
          czestotnosc: 'raz dziennie',
          forma: 'tabletki',
          aktywny: false,
          data_rozpoczecia: '2024-01-01',
          data_zakonczenia: '2024-01-31',
          notatki: 'Zakończono',
          godziny_przyjmowania: ['09:00'],
          created_at: '2024-01-01T10:00:00Z'
        }
      ];

      const mockStats: ReportStats = {
        totalMedications: 3,
        activeMedications: 2,
        inactiveMedications: 1,
        adherenceRate: 85.5,
        totalDoses: 180,
        takenDoses: 154,
        missedDoses: 26
      };

      setReportData(mockData);
      setStats(mockStats);
      setIsGenerating(false);
    }, 2000);
  };

  const downloadPDF = () => {
    // Symulacja pobierania PDF
    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medication-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    return `
RAPORT LEKÓW - ${new Date().toLocaleDateString('pl-PL')}

========================================
STATYSTYKA
========================================
Liczba leków: ${stats.totalMedications}
Leki aktywne: ${stats.activeMedications}
Leki nieaktywne: ${stats.inactiveMedications}
Stopień przestrzegani: ${stats.adherenceRate}%

Łączna liczba dawek: ${stats.totalDoses}
Przyjęte dawki: ${stats.takenDoses}
Pominięte dawki: ${stats.missedDoses}

========================================
LISTA LEKÓW
========================================

${reportData.map(med => `
${med.nazwa}
- Dawka: ${med.dawka}
- Częstotliwość: ${med.czestotnosc}
- Forma: ${med.forma}
- Status: ${med.aktywny ? 'Aktywny' : 'Nieaktywny'}
- Data rozpoczęcia: ${med.data_rozpoczecia || 'Brak'}
- Data zakończenia: ${med.data_zakonczenia || 'Brak'}
- Godziny przyjmowania: ${med.godziny_przyjmowania.join(', ')}
- Notatki: ${med.notatki || 'Brak'}
- Dodano: ${new Date(med.created_at).toLocaleDateString('pl-PL')}
`).join('\n\n')}
========================================
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Raport Leków</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Okres raportu</h3>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="7days">Ostatnie 7 dni</option>
                <option value="30days">Ostatnie 30 dni</option>
                <option value="90days">Ostatnie 90 dni</option>
                <option value="all">Cały okres</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {isGenerating ? 'Generowanie...' : 'Generuj raport'}
              </Button>
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="flex items-center gap-2"
                disabled={reportData.length === 0}
              >
                <Download className="w-4 h-4" />
                Pobierz PDF
              </Button>
            </div>
          </div>

          {reportData.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Liczba leków</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalMedications}</p>
                      </div>
                      <Pill className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Aktywne</p>
                        <p className="text-2xl font-bold text-green-600">{stats.activeMedications}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Nieaktywne</p>
                        <p className="text-2xl font-bold text-red-600">{stats.inactiveMedications}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-600" />
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
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Łączne dawki</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalDoses}</p>
                      </div>
                      <Clock className="w-8 h-8 text-gray-600" />
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
                      <FileText className="w-8 h-8 text-green-600" />
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
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Szczegóły leków</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.map((medication) => (
                      <div key={medication.id} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{medication.nazwa}</h4>
                            <p className="text-sm text-gray-600">{medication.dawka} - {medication.forma}</p>
                            <p className="text-sm text-gray-600">{medication.czestotnosc}</p>
                            <p className="text-sm text-gray-600">
                              Godziny: {medication.godziny_przyjmowania.join(', ')}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            medication.aktywny ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {medication.aktywny ? 'Aktywny' : 'Nieaktywny'}
                          </div>
                        </div>
                        {medication.notatki && (
                          <p className="text-sm text-gray-500 mt-2">
                            Notatki: {medication.notatki}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {reportData.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Kliknij "Generuj raport", aby wygenerować raport leków</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
          <Button onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </div>
    </div>
  );
}
