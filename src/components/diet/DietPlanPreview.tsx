import { useState, useMemo, useEffect } from 'react';
import { DietPlan } from '@/api/types/diet-plan';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { generateHTMLContent } from '@/api/save-diet-plan';
import { ExportDietPlanButton } from './ExportDietPlanButton';
import { RefreshCw } from 'lucide-react';

interface DietPlanPreviewProps {
  plan: DietPlan;
  className?: string;
}

export function DietPlanPreview({ plan, className = '' }: DietPlanPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  
  // Generowanie podglądu HTML
  const generatePreview = useMemo(() => {
    return async () => {
      if (!plan) return '';
      
      setIsGenerating(true);
      try {
        // Używamy funkcji generateHTMLContent z naszego modułu
        const html = generateHTMLContent(plan, {
          styles: `
            body { 
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 100%;
              padding: 0;
              margin: 0;
              font-size: 14px;
            }
            h1, h2, h3, h4 { 
              color: #2c3e50;
              margin-top: 0.5em;
              margin-bottom: 0.5em;
            }
            .day-plan { 
              margin-bottom: 2em;
              page-break-inside: avoid;
              padding: 10px;
              border: 1px solid #eee;
              border-radius: 4px;
            }
            .meal { 
              margin-bottom: 1.5em;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 4px;
              border-left: 4px solid #3b82f6;
              background: #f9f9f9;
              border-radius: 5px;
              border-left: 4px solid #3b82f6;
            }
            .ingredients, .instructions { 
              margin: 10px 0;
            }
            .nutrients {
              margin-top: 10px;
              padding: 10px;
              background: #e8f4fc;
              border-radius: 3px;
              font-size: 0.9em;
            }
            ul, ol {
              padding-left: 1.5em;
              margin: 0.5em 0;
            }
            li {
              margin-bottom: 0.25em;
            }
          `
        });
        setPreviewContent(html);
        return html;
      } catch (error) {
        return '';
      } finally {
        setIsGenerating(false);
      }
    };
  }, [plan]);

  // Automatyczne generowanie podglądu przy załadowaniu komponentu
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Podgląd planu żywieniowego</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generatePreview}
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
          <ExportDietPlanButton plan={plan} />
        </div>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : previewContent ? (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: previewContent }} 
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nie udało się wygenerować podglądu planu.</p>
            <Button 
              variant="ghost" 
              className="mt-2"
              onClick={generatePreview}
            >
              Spróbuj ponownie
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
