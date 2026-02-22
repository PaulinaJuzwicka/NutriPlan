import { useState } from 'react';
import { Button } from '../ui/Button';
import { saveDietPlan } from '@/api/save-diet-plan';
import { generatePdfFromPlan } from '@/lib/pdf-export';
import { saveDietPlanToHistory } from '@/api/diet-plan-history';
import { DietPlan } from '@/api/types/diet-plan';
import { toast } from 'sonner';
import { Download, FileText, FileDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';

interface ExportDietPlanButtonProps {
  plan: DietPlan;
  className?: string;
}

export function ExportDietPlanButton({ plan, className = '' }: ExportDietPlanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleExportDocx = async () => {
    if (!plan) return;
    
    setIsLoading(true);
    
    try {
      const result = await saveDietPlan({
        plan,
        filename: `plan-zywieniowy-${new Date().toISOString().slice(0, 10)}.docx`
      });
      
      if (result.success) {
        // Zapisz w historii
        await saveDietPlanToHistory(
          plan,
          result.filePath || '',
          'docx',
          // Symulacja rozmiaru pliku - w rzeczywistości powinniśmy pobrać rozmiar pliku
          JSON.stringify(plan).length
        );
        
        toast.success('Plan żywieniowy został wyeksportowany do DOCX');
      } else {
        throw new Error(result.error || 'Nie udało się wyeksportować planu');
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas eksportu planu');
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleExportPdf = async () => {
    if (!plan) return;
    
    setIsLoading(true);
    
    try {
      const result = await generatePdfFromPlan(
        plan,
        `plan-zywieniowy-${new Date().toISOString().slice(0, 10)}`
      );
      
      if (result.success) {
        // Zapisz w historii
        await saveDietPlanToHistory(
          plan,
          `plan-zywieniowy-${new Date().toISOString().slice(0, 10)}.pdf`,
          'pdf',
          // Symulacja rozmiaru pliku
          JSON.stringify(plan).length
        );
        
        toast.success('Plan żywieniowy został wyeksportowany do PDF');
      } else {
        throw new Error(result.error || 'Nie udało się wyeksportować planu do PDF');
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas eksportu planu do PDF');
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          disabled={isLoading}
          className={`flex items-center gap-2 ${className}`}
          variant="outline"
        >
          <Download className="w-4 h-4" />
          {isLoading ? 'Eksportowanie...' : 'Eksportuj'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={handleExportDocx}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4 text-blue-500" />
          <span>Eksportuj do DOCX</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleExportPdf}
          className="cursor-pointer"
        >
          <FileDown className="mr-2 h-4 w-4 text-red-500" />
          <span>Eksportuj do PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
