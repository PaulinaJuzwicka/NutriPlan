import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';

export interface HealthMeasurementReportData {
  measurements: HealthMeasurementReport[];
  overallStats: {
    totalMeasurements: number;
    averageFrequency: number;
    mostMeasuredType: string;
    period: string;
    generatedAt: string;
  };
}

export interface HealthMeasurementReport {
  id: string;
  type: 'blood-pressure' | 'blood-sugar' | 'pulse' | 'temperature';
  typeName: string;
  unit: string;
  readings: HealthReading[];
  totalReadings: number;
  average: number;
  min: number;
  max: number;
  lastReading: {
    value: number | string;
    date: string;
    notes?: string;
  };
  frequency: number; // średnia liczba pomiarów dziennie
}

export interface HealthReading {
  id: string;
  value: number | string;
  measuredAt: string;
  notes?: string;
}

class HealthMeasurementReportService {
  async generateMeasurementReport(
    userId: string, 
    dateRange: { start: Date; end: Date },
    measurementType?: 'blood-pressure' | 'blood-sugar' | 'pulse' | 'temperature',
    categories?: { [key: string]: boolean }
  ): Promise<HealthMeasurementReportData> {
    try {
      // Upewnij się, że data końcowa obejmuje cały dzień
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      // Pobierz dane pomiarów
      let query = supabase
        .from('wpisy_zdrowotne')
        .select('*')
        .eq('id_uzytkownika', userId)
        .gte('zmierzono_o', dateRange.start.toISOString())
        .lte('zmierzono_o', endDate.toISOString())
        .order('zmierzono_o', { ascending: true });

      // Filtruj po typie jeśli podany
      if (measurementType) {
        query = query.eq('typ', measurementType);
      } else if (categories) {
        // Filtruj po wybranych kategoriach
        const selectedTypes = Object.keys(categories).filter(type => categories[type]);
        if (selectedTypes.length > 0) {
          query = query.in('typ', selectedTypes);
        }
      }

      const { data: measurements, error } = await query;

      if (error) {
        throw error;
      }

      if (!measurements || measurements.length === 0) {
        return {
          measurements: [],
          overallStats: {
            totalMeasurements: 0,
            averageFrequency: 0,
            mostMeasuredType: 'Brak danych',
            period: `${dateRange.start.toLocaleDateString('pl-PL')} - ${dateRange.end.toLocaleDateString('pl-PL')}`,
            generatedAt: new Date().toISOString()
          }
        };
      }

      // Grupuj pomiary według typu
      const measurementMap = new Map<string, HealthMeasurementReport>();
      
      measurements.forEach(reading => {
        if (!measurementMap.has(reading.typ)) {
          measurementMap.set(reading.typ, {
            id: reading.typ,
            type: reading.typ as any,
            typeName: this.getTypeName(reading.typ),
            unit: this.getUnitForType(reading.typ),
            readings: [],
            totalReadings: 0,
            average: 0,
            min: Infinity,
            max: -Infinity,
            lastReading: {
              value: reading.wartosc,
              date: reading.zmierzono_o,
              notes: reading.notatki
            },
            frequency: 0
          });
        }

        const report = measurementMap.get(reading.typ)!;
        report.readings.push({
          id: reading.id,
          value: reading.wartosc,
          measuredAt: reading.zmierzono_o,
          notes: reading.notatki
        });
      });

      // Oblicz statystyki dla każdego typu
      const reportsArray = Array.from(measurementMap.values());
      let totalMeasurements = 0;
      let mostMeasuredType = '';
      let maxCount = 0;

      reportsArray.forEach(report => {
        // Konwertuj wartości na liczby do obliczeń
        const numericValues = report.readings.map(r => {
          if (typeof r.value === 'string' && r.value.includes('/')) {
            // Dla ciśnienia weź średnią z skurczowego i rozkurczowego
            const [systolic, diastolic] = r.value.split('/').map(v => parseFloat(v.trim()));
            return (!isNaN(systolic) && !isNaN(diastolic)) ? (systolic + diastolic) / 2 : 0;
          }
          return typeof r.value === 'number' ? r.value : parseFloat(r.value);
        }).filter(v => !isNaN(v));

        report.totalReadings = numericValues.length;
        totalMeasurements += report.totalReadings;

        if (report.totalReadings > maxCount) {
          maxCount = report.totalReadings;
          mostMeasuredType = report.typeName;
        }

        if (numericValues.length > 0) {
          report.average = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
          report.min = Math.min(...numericValues);
          report.max = Math.max(...numericValues);

          // Oblicz częstotliwość (pomiarów dziennie)
          const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
          report.frequency = daysDiff > 0 ? report.totalReadings / daysDiff : 0;
        }
      });

      // Oblicz ogólne statystyki
      const averageFrequency = reportsArray.length > 0 
        ? reportsArray.reduce((sum, r) => sum + r.frequency, 0) / reportsArray.length 
        : 0;

      return {
        measurements: reportsArray,
        overallStats: {
          totalMeasurements,
          averageFrequency: Math.round(averageFrequency * 10) / 10,
          mostMeasuredType,
          period: `${dateRange.start.toLocaleDateString('pl-PL')} - ${dateRange.end.toLocaleDateString('pl-PL')}`,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      throw error;
    }
  }

  async generateMeasurementPDF(data: HealthMeasurementReportData): Promise<Blob> {
    const pdf = new jsPDF();
    
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const lineHeight = 7;

    // Nagłówek raportu z tłem
    pdf.setFillColor(59, 130, 246); // Niebieski tło
    pdf.rect(0, 0, pdf.internal.pageSize.width, 40, 'F');
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255); // Biały tekst
    pdf.text('RAPORT POMIAROW ZDROWOTNYCH', 105, yPosition, { align: 'center' });
    yPosition += lineHeight * 4;

    // Informacje o raporcie
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0); // Czarny tekst
    pdf.text(`Okres: ${data.overallStats.period}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Laczna liczba pomiarow: ${data.overallStats.totalMeasurements}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`, 20, yPosition);
    yPosition += lineHeight * 3;

    if (data.measurements.length === 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brak pomiarow w wybranym okresie', 105, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;
    } else {
      // Dla każdej kategorii wyświetl wszystkie pomiary
      for (const measurement of data.measurements) {
        // Zawsze zaczynaj od nowej strony dla każdej kategorii
        pdf.addPage();
        yPosition = 20;
        
        // Nagłówek kategorii
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(15, yPosition, 190, 35, 5, 5, 'F');
        pdf.setFillColor(0, 0, 0);
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${measurement.typeName} (${measurement.unit})`, 25, yPosition + 15);
        yPosition += 45;

        // Nagłówki tabeli dla tej kategorii
        pdf.setFillColor(245, 245, 245);
        pdf.rect(15, yPosition, 190, 10, 'F');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        const headers = ['Data pomiaru', 'Wartosc', 'Notatki'];
        const columnWidths = [60, 40, 90];
        let xPos = 20;
        
        headers.forEach((header, index) => {
          pdf.text(header, xPos, yPosition + 7);
          xPos += columnWidths[index];
        });
        yPosition += 10;
        
        // Linia pod nagłówkami
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 3;

        // Wszystkie pomiary dla tej kategorii
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        // Sortuj pomiary po dacie (od najnowszego)
        const sortedReadings = measurement.readings.sort((a, b) => 
          new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
        );

        sortedReadings.forEach((reading, index) => {
          // Sprawdź czy mieścimy się na stronie
          if (yPosition > pageHeight - 25) {
            pdf.addPage();
            yPosition = 20;
            
            // Nagłówki tabeli na nowej stronie
            pdf.setFillColor(245, 245, 245);
            pdf.rect(15, yPosition, 190, 10, 'F');
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            let xPos = 20;
            headers.forEach((header, index) => {
              pdf.text(header, xPos, yPosition + 7);
              xPos += columnWidths[index];
            });
            yPosition += 10;
            pdf.setDrawColor(200, 200, 200);
            pdf.line(20, yPosition, 190, yPosition);
            yPosition += 3;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
          }
          
          // Alternujące tło wierszy dla lepszej czytelności
          if (index % 2 === 0) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(15, yPosition - 2, 190, 12, 'F');
          }
          
          xPos = 20;
          const rowData = [
            new Date(reading.measuredAt).toLocaleDateString('pl-PL') + ' ' + 
            new Date(reading.measuredAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            reading.value.toString(),
            (reading.notes || '').substring(0, 30) + (reading.notes && reading.notes.length > 30 ? '...' : '')
          ];
          
          pdf.setTextColor(0, 0, 0);
          rowData.forEach((cell, index) => {
            pdf.text(cell, xPos, yPosition + 5);
            xPos += columnWidths[index];
          });
          yPosition += 12;
        });
      }
    }

    // Podsumowanie na końcu
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Piękne podsumowanie statystyczne - tylko niebieskie tło
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, pageHeight - 50, pdf.internal.pageSize.width, 50, 'F');
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('PODSUMOWANIE STATYSTYCZNE', 105, pageHeight - 35, { align: 'center' });
    yPosition = pageHeight - 25;
    
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    data.measurements.forEach((measurement, index) => {
      const summaryText = `${measurement.typeName}: ${measurement.totalReadings} pomiarow, srednia ${measurement.average.toFixed(2)}, zakres ${measurement.min.toFixed(2)}-${measurement.max.toFixed(2)}`;
      pdf.text(summaryText, 20, yPosition + (index * 8));
    });
    
    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  async generateMeasurementJSON(data: HealthMeasurementReportData): Promise<Blob> {
    const jsonData = {
      generatedAt: data.overallStats.generatedAt,
      period: data.overallStats.period,
      totalMeasurements: data.overallStats.totalMeasurements,
      averageFrequency: data.overallStats.averageFrequency,
      mostMeasuredType: data.overallStats.mostMeasuredType,
      measurements: data.measurements.map(measurement => ({
        type: measurement.type,
        typeName: measurement.typeName,
        unit: measurement.unit,
        totalReadings: measurement.totalReadings,
        average: measurement.average,
        min: measurement.min,
        max: measurement.max,
        frequency: measurement.frequency,
        lastReading: measurement.lastReading,
        readings: measurement.readings.map(reading => ({
          id: reading.id,
          value: reading.value,
          measuredAt: reading.measuredAt,
          notes: reading.notes
        }))
      }))
    };
    
    return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  }

  async generateMeasurementCSV(data: HealthMeasurementReportData): Promise<Blob> {
    let csvContent = '';
    
    // Nagłówki CSV
    csvContent = 'Typ Pomiaru,Jednostka,Liczba Pomiarow,Srednia,Minimum,Maksimum,Czestotliwosc,Ostatni Wartosc,Ostatnia Data,Notatki\n';
    
    // Dodaj każdy typ pomiaru jako osobny wiersz podsumowania
    data.measurements.forEach(measurement => {
      const lastValue = typeof measurement.lastReading.value === 'string' 
        ? measurement.lastReading.value 
        : measurement.lastReading.value.toFixed(2);
      
      const row = [
        measurement.typeName,
        measurement.unit,
        measurement.totalReadings,
        measurement.average.toFixed(2),
        measurement.min.toFixed(2),
        measurement.max.toFixed(2),
        `${measurement.frequency.toFixed(1)}/dzień`,
        `${lastValue} ${measurement.unit}`,
        new Date(measurement.lastReading.date).toLocaleDateString('pl-PL'),
        measurement.lastReading.notes || ''
      ].map(field => `"${field}"`).join(',');
      
      csvContent += row + '\n';
    });
    
    // Dodaj ogólne statystyki
    csvContent += '\nPODSUMOWANIE GLOBALNE\n';
    csvContent += `Okres,"${data.overallStats.period}"\n`;
    csvContent += `Laczna liczba pomiarow,${data.overallStats.totalMeasurements}\n`;
    csvContent += `Srednia czestotliwosc,"${data.overallStats.averageFrequency} pomiarow/dzien"\n`;
    csvContent += `Najczesciej mierzony parametr,"${data.overallStats.mostMeasuredType}"\n`;
    csvContent += `Wygenerowano,"${new Date().toLocaleString('pl-PL')}"\n`;
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  // Funkcje pomocnicze
  private getTypeName(type: string): string {
    switch (type) {
      case 'blood-pressure': return 'Cisnienie krwi';
      case 'blood-sugar': return 'Cukier we krwi';
      case 'pulse': return 'Tetno';
      case 'temperature': return 'Temperatura ciala';
      default: return type;
    }
  }

  private getUnitForType(type: string): string {
    switch (type) {
      case 'blood-pressure': return 'mmHg';
      case 'blood-sugar': return 'mg/dL';
      case 'pulse': return 'bpm';
      case 'temperature': return '°C';
      default: return '';
    }
  }
}

const healthMeasurementReportService = new HealthMeasurementReportService();
export default healthMeasurementReportService;
