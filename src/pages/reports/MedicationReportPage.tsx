import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Download, FileText, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContextOptimized';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import medicationReportService from '../../services/medicationReportService';

const MedicationReportPage: React.FC = () => {
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dni temu
    end: new Date()
  });
  const [format, setFormat] = useState<'pdf' | 'json'>('pdf');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerateReport = useCallback(async () => {
    if (!authState.user) return;

    setIsGenerating(true);
    
    try {
      const reportData = await medicationReportService.generateMedicationReport(
        authState.user.id, 
        dateRange
      );
      
      let blob: Blob;
      let filename: string;
      
      if (format === 'pdf') {
        blob = await medicationReportService.generateMedicationPDF(reportData);
        filename = `raport-stosowania-lekow-${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        blob = await medicationReportService.generateMedicationJSON(reportData);
        filename = `raport-stosowania-lekow-${new Date().toISOString().split('T')[0]}.json`;
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

    } catch (error) {
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  }, [authState.user, dateRange, format]);

  const quickDateRanges = [
    { label: 'Ostatnie 7 dni', days: 7 },
    { label: 'Ostatnie 30 dni', days: 30 },
    { label: 'Ostatnie 3 miesiące', days: 90 },
    { label: 'Ostatnie 6 miesięcy', days: 180 },
    { label: 'Ostatni rok', days: 365 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Raport Stosowania Leków</h1>
              <p className="mt-2 text-gray-600">
                Generuj szczegółowy raport o stosowaniu leków w wybranym okresie
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
            >
              Wróć do panelu
            </Button>
          </div>
        </div>

        {/* Date Range Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Zakres dat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickDateRanges.map((range) => (
                <button
                  key={range.days}
                  onClick={() => setDateRange({
                    start: new Date(Date.now() - range.days * 24 * 60 * 60 * 1000),
                    end: new Date()
                  })}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Data początkowa
                </label>
                <input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    start: new Date(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Data końcowa
                </label>
                <input
                  type="date"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    end: new Date(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Format Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Format eksportu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'pdf', label: 'PDF', description: 'Dokument do druku' },
                { value: 'json', label: 'JSON', description: 'Dane programistyczne' }
              ].map((formatOption) => (
                <button
                  key={formatOption.value}
                  onClick={() => setFormat(formatOption.value as 'pdf' | 'json')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    format === formatOption.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {formatOption.value === 'pdf' ? <FileText className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="font-medium text-gray-900">{formatOption.label}</div>
                  <div className="text-xs text-gray-500">{formatOption.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Opcje zaawansowane
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Język raportu
                </label>
                <select
                  value="pl"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="pl">Polski</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={true}
                  disabled
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="includeCharts" className="ml-2 text-sm text-gray-700">
                  Dołącz wykresy i analizy wizualne
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || !authState.user}
            className="min-w-[200px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generowanie...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generuj raport
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {isGenerating && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
            <span className="text-blue-800">Trwa generowanie raportu...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationReportPage;
