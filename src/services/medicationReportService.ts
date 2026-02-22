import { supabase } from '../lib/supabase';
import { MedicationBase } from '../types/medications';
import { medicationHistoryService } from './medicationHistoryService';

export interface MedicationReport {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  form: string;
  startDate: string;
  endDate?: string | null;
  durationDays?: number;
  isPermanent: boolean;
  dosesPerDay: number;
  notes?: string;
  administrationHours: string[];
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  // Tylko pola, które faktycznie istnieją w bazie
  aktywny: boolean;
  czy_staly: boolean;
  czas_trwania_dni?: number;
  utworzono_o: string;
  zaktualizowano_o: string;
}

export interface MedicationReportData {
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  overallAdherence: number;
  medications: MedicationReport[];
}

export const generateMedicationReport = async (userId: string, dateRange: { start: Date; end: Date }): Promise<MedicationReportData> => {
  try {
    
    // Pobierz wszystkie aktywne leki użytkownika
    const { data: medicationsData, error: medError } = await supabase
      .from('leki')
      .select('*')
      .eq('id_uzytkownika', userId)
      .eq('aktywny', true)
      .order('utworzono_o', { ascending: false });

    if (medError) {
      throw medError;
    }

    // Pobierz historię przyjmowania dla każdego leku
    const medicationMap = new Map<string, MedicationReport>();
    
    // Najpierw dodaj wszystkie leki z ich podstawowymi informacjami
    medicationsData?.forEach(med => {
      medicationMap.set(med.id, {
        id: med.id,
        name: med.nazwa,
        dosage: med.dawka,
        frequency: med.czestotnosc,
        form: med.forma,
        startDate: med.rozpoczeto_od,
        endDate: med.data_zakonczenia,
        durationDays: med.czas_trwania_dni,
        isPermanent: med.czy_staly,
        dosesPerDay: med.dawki_dziennie || 1,
        notes: med.notatki,
        administrationHours: med.godziny_przyjmowania || [],
        totalDoses: 0,
        takenDoses: 0,
        missedDoses: 0,
        adherenceRate: 0,
        // Tylko pola, które faktycznie istnieją w bazie
        aktywny: med.aktywny || false,
        czy_staly: med.czy_staly || false,
        czas_trwania_dni: med.czas_trwania_dni,
        utworzono_o: med.utworzono_o,
        zaktualizowano_o: med.zaktualizowano_o
      });
    });

    // Oblicz oczekiwaną liczbę dawek dla każdego leku w okresie raportu
    medicationMap.forEach(med => {
      const medStartDateTime = new Date(med.startDate);
      const medEndDate = med.endDate ? new Date(med.endDate) : null;
      
      // Oblicz rzeczywisty okres dla tego leku w zakresie raportu
      const effectiveStart = new Date(Math.max(medStartDateTime.getTime(), dateRange.start.getTime()));
      const effectiveEnd = medEndDate ? new Date(Math.min(medEndDate.getTime(), dateRange.end.getTime())) : dateRange.end;
      
      // Jeśli lek nie był aktywny w okresie raportu, pomiń
      if (effectiveStart > effectiveEnd) {
        med.totalDoses = 0;
        return;
      }
      
      // Oblicz liczbę dni w efektywnym okresie
      const daysInPeriod = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Sprawdź czy pierwszy dzień jest częściowy (lek rozpoczęty w trakcie dnia)
      let firstDayPartial = false;
      let expectedDosesFirstDay = 0;
      
      if (medStartDateTime > dateRange.start) {
        // Lek rozpoczął się w trakcie pierwszego dnia
        const startHour = medStartDateTime.getHours();
        const startMinute = medStartDateTime.getMinutes();
        const startTotalMinutes = startHour * 60 + startMinute;
        
        // Pobierz godziny przyjmowania leku
        const adminHours = med.administrationHours || [];
        
        if (adminHours.length > 0) {
          // Licz tylko dawki po godzinie rozpoczęcia leku
          expectedDosesFirstDay = adminHours.filter(hour => {
            const [hourStr, minuteStr] = hour.split(':');
            const doseHour = parseInt(hourStr);
            const doseMinute = parseInt(minuteStr) || 0;
            const doseTotalMinutes = doseHour * 60 + doseMinute;
            return doseTotalMinutes >= startTotalMinutes;
          }).length;
        } else {
          // Jeśli nie ma zdefiniowanych godzin, przyjmij standardowe godziny
          if (med.frequency.includes('dziennie')) {
            const standardHours = [8, 12, 18, 20]; // Standardowe godziny przyjmowania
            expectedDosesFirstDay = standardHours.filter(hour => hour * 60 >= startTotalMinutes).length;
          } else if (med.frequency.includes('tygodniowo')) {
            // Dla leków tygodniowych, jeśli rozpoczęto przed 12:00, liczymy jedną dawkę
            expectedDosesFirstDay = startTotalMinutes <= 720 ? 1 : 0; // 12:00 = 720 minut
          } else {
            expectedDosesFirstDay = startTotalMinutes <= 720 ? 1 : 0; // Domyślnie jedna dawka jeśli przed południem
          }
        }
        
        if (expectedDosesFirstDay === 0) {
          firstDayPartial = true;
        }
      }
      
      // Oblicz oczekiwaną liczbę dawek na podstawie częstotliwości
      let expectedDoses = 0;
      const remainingDays = firstDayPartial ? daysInPeriod - 1 : daysInPeriod;
      
      switch (med.frequency) {
        case 'codziennie':
        case 'raz_dziennie':
          expectedDoses = (remainingDays * med.dosesPerDay) + expectedDosesFirstDay;
          break;
        case 'dwa_razy_dziennie':
          expectedDoses = (remainingDays * 2) + expectedDosesFirstDay;
          break;
        case 'trzy_razy_dziennie':
          expectedDoses = (remainingDays * 3) + expectedDosesFirstDay;
          break;
        case 'cztery_razy_dziennie':
          expectedDoses = (remainingDays * 4) + expectedDosesFirstDay;
          break;
        case 'raz_tygodniowo':
          expectedDoses = Math.ceil(remainingDays / 7) + expectedDosesFirstDay;
          break;
        case 'dwa_razy_tygodniowo':
          expectedDoses = Math.ceil(remainingDays / 7) * 2 + expectedDosesFirstDay;
          break;
        case 'raz_miesiecznie':
          expectedDoses = Math.ceil(remainingDays / 30) + expectedDosesFirstDay;
          break;
        case 'wedlug_zalecen':
          expectedDoses = (remainingDays * med.dosesPerDay) + expectedDosesFirstDay;
          break;
        default:
          expectedDoses = (remainingDays * med.dosesPerDay) + expectedDosesFirstDay;
      }
      
      med.totalDoses = Math.max(0, expectedDoses);
    });

    // Pobierz historię przyjmowania leków
    const historyData = await medicationHistoryService.getMedicationHistory(userId, dateRange.start, dateRange.end);
    
    // Przetwarzaj historię przyjmowania - zlicz faktycznie przyjęte i pominięte dawki
    historyData?.forEach(record => {
      if (record.status === 'taken') {
        const med = medicationMap.get(record.id_leku);
        if (med) {
          med.takenDoses++;
        }
      } else if (record.status === 'missed') {
        const med = medicationMap.get(record.id_leku);
        if (med) {
          med.missedDoses++;
        }
      }
    });

    // Oblicz przestrzeganie dla każdego leku
    medicationMap.forEach(med => {
      if (med.totalDoses > 0) {
        med.adherenceRate = Math.round((med.takenDoses / med.totalDoses) * 100);
      } else {
        med.adherenceRate = 0;
      }
      
      // Oblicz pominięte dawki (różnica między oczekiwanymi a przyjętymi)
      med.missedDoses = med.totalDoses - med.takenDoses;
    });

    const reportData: MedicationReportData = {
      userId,
      generatedAt: new Date().toISOString(),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      overallAdherence: 0,
      medications: Array.from(medicationMap.values()).filter(med => med.totalDoses > 0) // Tylko leki aktywne w okresie raportu
    };

    // Oblicz ogólną przestrzeganie
    const totalExpectedDoses = reportData.medications.reduce((sum, med) => sum + med.totalDoses, 0);
    const totalTakenDoses = reportData.medications.reduce((sum, med) => sum + med.takenDoses, 0);
    
    if (totalExpectedDoses > 0) {
      reportData.overallAdherence = Math.round((totalTakenDoses / totalExpectedDoses) * 100);
    }

    return reportData;
  } catch (error) {
    console.error('📊 REPORT - Error generating medication report:', error);
    throw error;
  }
};

export const generateMedicationJSON = (data: MedicationReportData): Blob => {
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
};

export const generateMedicationPDF = async (data: MedicationReportData): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.height;
  let yPosition = 20;
  const lineHeight = 8;
  const margin = 20;

  // Funkcja do usuwania polskich znaków
  const removePolishChars = (text: string): string => {
    return text
      .replace(/Ą/g, 'A').replace(/ą/g, 'a')
      .replace(/Ć/g, 'C').replace(/ć/g, 'c')
      .replace(/Ę/g, 'E').replace(/ę/g, 'e')
      .replace(/Ł/g, 'L').replace(/ł/g, 'l')
      .replace(/Ń/g, 'N').replace(/ń/g, 'n')
      .replace(/Ó/g, 'O').replace(/ó/g, 'o')
      .replace(/Ś/g, 'S').replace(/ś/g, 's')
      .replace(/Ź/g, 'Z').replace(/ź/g, 'z')
      .replace(/Ż/g, 'Z').replace(/ż/g, 'z');
  };

  // Funkcja do rysowania ramki
  const drawBox = (x: number, y: number, width: number, height: number) => {
    pdf.rect(x, y, width, height);
  };

  // Funkcja do rysowania nagłówka
  const drawHeader = (text: string, y: number, fontSize: number = 16) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'bold');
    const cleanText = removePolishChars(text);
    pdf.text(cleanText, pageWidth / 2, y, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
  };

  // Nagłówek z ramką
  drawBox(margin - 5, yPosition - 10, pageWidth - 2 * margin + 10, 25);
  drawHeader('RAPORT LEKOW', yPosition + 5, 20);
  yPosition += 25;

  // Okres raportu
  pdf.setFontSize(12);
  const periodText = `Okres: ${new Date(data.period.start).toLocaleDateString('pl-PL')} - ${new Date(data.period.end).toLocaleDateString('pl-PL')}`;
  pdf.text(removePolishChars(periodText), margin, yPosition);
  yPosition += 10;

  // Data wygenerowania
  const generatedText = `Wygenerowano: ${new Date(data.generatedAt).toLocaleDateString('pl-PL')} ${new Date(data.generatedAt).toLocaleTimeString('pl-PL')}`;
  pdf.text(removePolishChars(generatedText), margin, yPosition);
  yPosition += 15;

  // Podsumowanie w ramce
  const summaryBoxHeight = 40;
  drawBox(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, summaryBoxHeight);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(removePolishChars('PODSUMOWANIE'), margin, yPosition + 5);
  pdf.setFont('helvetica', 'normal');
  
  pdf.setFontSize(12);
  const adherenceColor = data.overallAdherence >= 80 ? [0, 128, 0] : data.overallAdherence >= 60 ? [255, 165, 0] : [255, 0, 0];
  pdf.setTextColor(adherenceColor[0], adherenceColor[1], adherenceColor[2]);
  pdf.text(`Laczne przestrzeganie terapii: ${data.overallAdherence}%`, margin, yPosition + 15);
  pdf.setTextColor(0, 0, 0);
  
  pdf.text(`Liczba lekow w okresie: ${data.medications.length}`, margin, yPosition + 25);
  yPosition += summaryBoxHeight + 10;

  // Szczegóły leków
  if (data.medications.length === 0) {
    drawHeader('BRAK LEKOW W WYBRANYM OKRESIE', yPosition, 14);
  } else {
    drawHeader('SZCZEGOLY LEKOW', yPosition, 16);
    yPosition += 15;

    data.medications.forEach((med, index) => {
      // Sprawdź czy mieści się na stronie
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      // Ramka dla leku
      const medicationBoxHeight = 90; // Dostosowana wysokość
      drawBox(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, medicationBoxHeight);

      // Numer i nazwa leku
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${removePolishChars(med.name)}`, margin, yPosition + 5);
      pdf.setFont('helvetica', 'normal');

      // Informacje o leku w dwóch kolumnach - tylko pola z bazy
      const leftColumn = margin;
      const rightColumn = pageWidth / 2 + 10;
      let currentY = yPosition + 15;
      const lineHeightSmall = 6;

      // Lewa kolumna - podstawowe informacje
      pdf.setFontSize(10);
      pdf.text(`Dawkowanie: ${removePolishChars(med.dosage)}`, leftColumn, currentY);
      currentY += lineHeightSmall;
      pdf.text(`Czestotliwosc: ${removePolishChars(formatFrequency(med.frequency))}`, leftColumn, currentY);
      currentY += lineHeightSmall;
      pdf.text(`Forma: ${removePolishChars(med.form)}`, leftColumn, currentY);
      currentY += lineHeightSmall;
      pdf.text(`Rozpoczeto: ${new Date(med.startDate).toLocaleDateString('pl-PL')}`, leftColumn, currentY);
      currentY += lineHeightSmall;
      
      if (med.endDate) {
        pdf.text(`Zakonczono: ${new Date(med.endDate).toLocaleDateString('pl-PL')}`, leftColumn, currentY);
      } else {
        pdf.text('Status: Lek staly', leftColumn, currentY);
      }
      currentY += lineHeightSmall;

      // Prawa kolumna - statystyki i status
      currentY = yPosition + 15;
      pdf.text(`Przyjete dawki: ${med.takenDoses}/${med.totalDoses}`, rightColumn, currentY);
      currentY += lineHeightSmall;
      
      // Przestrzeganie z kolorem
      const medAdherenceColor = med.adherenceRate >= 80 ? [0, 128, 0] : med.adherenceRate >= 60 ? [255, 165, 0] : [255, 0, 0];
      pdf.setTextColor(medAdherenceColor[0], medAdherenceColor[1], medAdherenceColor[2]);
      pdf.text(`Przestrzeganie: ${med.adherenceRate}%`, rightColumn, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += lineHeightSmall;
      
      pdf.text(`Status: ${med.aktywny ? 'Aktywny' : 'Nieaktywny'}`, rightColumn, currentY);
      currentY += lineHeightSmall;
      
      if (med.czas_trwania_dni) {
        pdf.text(`Czas trwania: ${med.czas_trwania_dni} dni`, rightColumn, currentY);
        currentY += lineHeightSmall;
      }

      // Dodatkowe informacje - jeśli istnieją
      if (med.administrationHours && med.administrationHours.length > 0) {
        currentY += lineHeightSmall;
        pdf.setFont('helvetica', 'bold');
        pdf.text(removePolishChars('Godziny przyjmowania:'), leftColumn, currentY);
        pdf.setFont('helvetica', 'normal');
        currentY += lineHeightSmall;
        
        const hoursText = med.administrationHours.slice(0, 4).join(', ');
        pdf.text(`${removePolishChars(hoursText)}${med.administrationHours.length > 4 ? '...' : ''}`, leftColumn, currentY);
        currentY += lineHeightSmall;
      }

      // Notatki jeśli istnieją
      if (med.notes) {
        currentY += lineHeightSmall;
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(9);
        pdf.text(removePolishChars(`Notatki: ${med.notes}`), leftColumn, currentY);
        pdf.setFont('helvetica', 'normal');
      }

      yPosition += medicationBoxHeight + 10;
    });
  }

  // Stopka
  yPosition = pageHeight - 20;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text(removePolishChars('Wygenerowano przez NutriPlan - System Zarzadzania Zdrowiem'), pageWidth / 2, yPosition, { align: 'center' });
  pdf.setFont('helvetica', 'normal');

  return pdf.output('blob');
};

const formatFrequency = (frequency: string): string => {
  const frequencyMap: { [key: string]: string } = {
    'codziennie': 'Codziennie',
    'raz_dziennie': 'Raz dziennie',
    'dwa_razy_dziennie': 'Dwa razy dziennie',
    'trzy_razy_dziennie': 'Trzy razy dziennie',
    'cztery_razy_dziennie': 'Cztery razy dziennie',
    'raz_tygodniowo': 'Raz tygodniowo',
    'dwa_razy_tygodniowo': 'Dwa razy tygodniowo',
    'raz_miesiecznie': 'Raz miesięcznie',
    'wedlug_zalecen': 'Według zaleceń lekarza'
  };

  return frequencyMap[frequency] || frequency;
};

class MedicationReportService {
  async generateReport(userId: string, dateRange: { start: Date; end: Date }): Promise<MedicationReportData> {
    return generateMedicationReport(userId, dateRange);
  }

  async generateJSON(data: MedicationReportData): Promise<Blob> {
    return generateMedicationJSON(data);
  }

  async generatePDF(data: MedicationReportData): Promise<Blob> {
    return generateMedicationPDF(data);
  }
}

export default new MedicationReportService();
