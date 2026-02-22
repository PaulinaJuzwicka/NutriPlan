import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContextOptimized';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Code,
  Calendar,
  Settings,
  Loader2,
} from 'lucide-react';
import dietPlanService from '../../services/dietPlanService';
import { ReportConfig } from '../../types/reports';

interface ReportGeneratorProps {
  className?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ className = '' }) => {
  const { state: authState } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>({
    type: 'comprehensive',
    format: 'pdf',
    includeCharts: true,
    language: 'pl',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerateReport = useCallback(async () => {
    if (!authState.user) return;

    setIsGenerating(true);
    
    try {
      const config: ReportConfig = {
        ...reportConfig,
        type: reportConfig.type || 'comprehensive',
        format: reportConfig.format || 'pdf',
        includeCharts: reportConfig.includeCharts || true,
        language: reportConfig.language || 'pl',
        dateRange: reportConfig.dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        userId: authState.user?.id || ''
      };

      const plans = await dietPlanService.getMealPlans(authState.user?.id || '');
      const reportExport = await dietPlanService.generateReport(config);
      
      // Download the file
      const url = URL.createObjectURL(reportExport.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = reportExport.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  }, [authState.user, reportConfig]);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'json': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getReportTypeDescription = (type: string) => {
    const descriptions = {
      medications: 'Szczegółowy raport o przyjmowanych lekach i adherencji',
      health: 'Analiza pomiarów zdrowotnych i trendów',
      diet: 'Podsumowanie planów dietetycznych i odżywiania',
      comprehensive: 'Pełny raport łączący wszystkie dane zdrowotne'
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  const quickDateRanges = [
    { label: 'Ostatnie 7 dni', days: 7 },
    { label: 'Ostatnie 30 dni', days: 30 },
    { label: 'Ostatnie 3 miesiące', days: 90 },
    { label: 'Ostatnie 6 miesięcy', days: 180 },
    { label: 'Ostatni rok', days: 365 }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Generator Raportów
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Typ raportu
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'medications', label: 'Leki', icon: '💊' },
                { value: 'health', label: 'Zdrowie', icon: '❤️' },
                { value: 'diet', label: 'Dieta', icon: '🥗' },
                { value: 'comprehensive', label: 'Kompleksowy', icon: '📊' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportConfig(prev => ({ ...prev, type: type.value as ReportConfig['type'] }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    reportConfig.type === type.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getReportTypeDescription(type.value)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Zakres dat
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickDateRanges.map((range) => (
                <button
                  key={range.days}
                  onClick={() => setReportConfig(prev => ({
                    ...prev,
                    dateRange: {
                      start: new Date(Date.now() - range.days * 24 * 60 * 60 * 1000),
                      end: new Date()
                    }
                  }))}
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
                  value={reportConfig.dateRange?.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange!,
                      start: new Date(e.target.value)
                    }
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
                  value={reportConfig.dateRange?.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange!,
                      end: new Date(e.target.value)
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Format eksportu
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'pdf', label: 'PDF', description: 'Dokument do druku' },
                { value: 'json', label: 'JSON', description: 'Dane programistyczne' }
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setReportConfig(prev => ({ ...prev, format: format.value as ReportConfig['format'] }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    reportConfig.format === format.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {getFormatIcon(format.value)}
                  </div>
                  <div className="font-medium text-gray-900">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <Settings className="w-4 h-4 mr-1" />
              {showAdvanced ? 'Ukryj' : 'Pokaż'} zaawansowane opcje
            </button>
            
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Język raportu
                  </label>
                  <select
                    value={reportConfig.language}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, language: e.target.value as ReportConfig['language'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="pl">Polski</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeCharts"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeCharts" className="ml-2 text-sm text-gray-700">
                    Dołącz wykresy i analizy wizualne
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !user}
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
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Szybkie szablony
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                name: 'Miesięczny raport zdrowotny',
                description: 'Kompleksowy podsumowanie ostatniego miesiąca',
                type: 'comprehensive',
                days: 30,
                format: 'pdf'
              },
              {
                name: 'Raport dla lekarza',
                description: 'Leki i pomiary z ostatnich 3 miesięcy',
                type: 'medications',
                days: 90,
                format: 'pdf'
              },
              {
                name: 'Analiza diety',
                description: 'Szczegółowe dane o planach żywieniowych',
                type: 'diet',
                days: 60,
                format: 'pdf'
              }
            ].map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  setReportConfig({
                    type: template.type as ReportConfig['type'],
                    format: template.format as ReportConfig['format'],
                    dateRange: {
                      start: new Date(Date.now() - template.days * 24 * 60 * 60 * 1000),
                      end: new Date()
                    },
                    includeCharts: true,
                    language: 'pl'
                  });
                  setTimeout(handleGenerateReport, 100);
                }}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                <div className="text-xs text-gray-500">{template.description}</div>
                <div className="flex items-center mt-2 text-xs text-primary-600">
                  <Download className="w-3 h-3 mr-1" />
                  {template.format.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
