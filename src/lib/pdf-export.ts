import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DietPlan } from '@/api/types/diet-plan';
import { generateHTMLContent } from '@/api/save-diet-plan';

export const exportToPdf = async (element: HTMLElement, filename: string) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Lepsza jakość
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: 'Nie udało się wyeksportować do PDF' 
    };
  }
};

export const generatePdfFromPlan = async (plan: DietPlan, filename: string) => {
  try {
    // Tworzymy tymczasowy element do renderowania
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm';
    tempDiv.style.padding = '20mm';
    tempDiv.style.background = 'white';
    
    // Generujemy zawartość HTML
    const htmlContent = generateHTMLContent(plan, {
      styles: `
        body { 
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          padding: 0;
          margin: 0;
        }
        h1 { font-size: 20px; margin-bottom: 15px; }
        h2 { font-size: 16px; margin: 10px 0; }
        .day-plan { margin-bottom: 10px; page-break-inside: avoid; }
        .meal { 
          margin-bottom: 10px; 
          padding: 10px;
          border-left: 4px solid #3b82f6;
          background: #f8f9fa;
        }
        .nutrients {
          margin-top: 5px;
          padding: 5px;
          background: #e8f4fc;
          font-size: 11px;
        }
      `
    });
    
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    // Eksportujemy do PDF
    const result = await exportToPdf(tempDiv, filename);
    
    // Sprzątanie
    document.body.removeChild(tempDiv);
    
    return result;
  } catch (error) {
    return { 
      success: false, 
      error: 'Wystąpił błąd podczas generowania pliku PDF' 
    };
  }
};
