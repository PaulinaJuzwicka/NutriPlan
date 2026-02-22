import { supabase } from '../lib/supabase';
import { MedicationBase } from '../types/medications';
import { optimizedQueries, invalidateCache } from '../utils/dataOptimization';

export type Medication = MedicationBase;

export interface MedicationReminder {
  id: string;
  id_leku: string;
  godzina_przypomnienia: string;
  czy_wziety: boolean;
  ostatnio_przyjete?: string;
  utworzono_o: string;
}

class MedicationService {
  async getMedications(id_uzytkownika: string): Promise<Medication[]> {
    const result = await optimizedQueries.getMedicationsOptimized(id_uzytkownika);
    
    // Konwertuj godziny_przyjmowania z JSON string na array
    const processedResult = result.map((med: any) => {
      // Zabezpieczenia przed undefined
      const safeMedication = {
        ...med,
        aktywny: med.aktywny !== undefined ? med.aktywny : false,
        czy_staly: med.czy_staly !== undefined ? med.czy_staly : false,
        godziny_przyjmowania: Array.isArray(med.godziny_przyjmowania) 
          ? med.godziny_przyjmowania 
          : (typeof med.godziny_przyjmowania === 'string' 
            ? JSON.parse(med.godziny_przyjmowania) 
            : [])
      };
      
      return safeMedication;
    });
    
    return processedResult as Medication[];
  }

  async getTodaysMedications(id_uzytkownika: string): Promise<Medication[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('leki')
      .select('*')
      .eq('id_uzytkownika', id_uzytkownika)
      .eq('aktywny', true)
      .or(`rozpoczeto_od.lte.${today}`)
      .order('utworzono_o', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addMedication(lek: Omit<Medication, 'id' | 'utworzono_o' | 'zaktualizowano_o'>): Promise<Medication> {
    
    // Sprawdź wymagane pola
    if (!lek.nazwa || !lek.dawka || !lek.czestotnosc || !(lek as any).data_rozpoczecia || !lek.id_uzytkownika) {
      throw new Error('Brak wymaganych pól leku');
    }
    
    // Upewnij się, że wszystkie wymagane pola mają wartości domyślne
    const rozpoczetoOdValue = (lek as any).data_rozpoczecia || lek.rozpoczeto_od;
    
    const medicationData = {
      nazwa: lek.nazwa,
      dawka: lek.dawka,
      czestotnosc: lek.czestotnosc,
      forma: lek.forma,
      aktywny: lek.aktywny !== undefined ? lek.aktywny : true,
      czy_staly: lek.czy_staly !== undefined ? lek.czy_staly : false,
      godziny_przyjmowania: lek.godziny_przyjmowania || [],
      notatki: lek.notatki || null,
      data_zakonczenia: lek.data_zakonczenia || null,
      rozpoczeto_od: rozpoczetoOdValue,
      id_uzytkownika: lek.id_uzytkownika,
      dawki_dziennie: lek.dawki_dziennie || 1,
      data_rozpoczecia: undefined
    };
    
    try {
      const { data, error } = await supabase
        .from('leki')
        .insert(medicationData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Nie udało się zapisać leku - brak danych zwrotnych');
      }
      
      // Invalidate cache po dodaniu
      invalidateCache.medications(lek.id_uzytkownika);
      
      return data;
    } catch (err) {
      throw err;
    }
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    const { data, error } = await supabase
      .from('leki')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMedication(id: string): Promise<void> {
    const { error } = await supabase
      .from('leki')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getMedicationReminders(id_leku: string): Promise<MedicationReminder[]> {
    const { data, error } = await supabase
      .from('przypomnienia_o_lekach')
      .select('*')
      .eq('id_leku', id_leku)
      .order('godzina_przypomnienia');

    if (error) throw error;
    return data || [];
  }

  async markMedicationTaken(id_leku: string, id_uzytkownika: string, godzina: string): Promise<void> {
    
    const insertData = { 
      id_leku,
      id_uzytkownika,
      przyjeto_o: new Date().toISOString(),
      zaplanowana_godzina: godzina, // Użyj planowanej godziny, nie aktualnej
      status: 'taken',
      czy_przyjete: true,
      data: new Date().toISOString().split('T')[0] // Dodaj dzisiejszą datę
    };
    
    const { error } = await supabase
      .from('historia_przyjmowania_lekow')
      .insert(insertData);

    if (error) {
      throw error;
    }
    // alert(`Lek ${id_leku} został przyjęty o ${insertData.zaplanowana_godzina}!`);
  }  

  async markMedicationMissed(id_leku: string, id_uzytkownika: string, zaplanowana_godzina: string): Promise<void> {
    
    const insertData = { 
      id_leku,
      id_uzytkownika,
      przyjeto_o: new Date().toISOString(),
      zaplanowana_godzina,
      status: 'missed',
      czy_przyjete: false,
      data: new Date().toISOString().split('T')[0]
    };
    
    const { error } = await supabase
      .from('historia_przyjmowania_lekow')
      .insert(insertData);

    if (error) {
      throw error;
    }
  }

  async getMedicationHistory(id_uzytkownika: string, id_leku?: string): Promise<unknown[]> {
    let query = supabase
      .from('historia_przyjmowania_lekow')
      .select(`
        *,
        leki (
          nazwa,
          dawka,
          czestotnosc
        )
      `)
      .eq('id_uzytkownika', id_uzytkownika)
      .order('przyjeto_o', { ascending: false });

    if (id_leku) {
      query = query.eq('id_leku', id_leku);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Sprawdź czy dana dawka została już przyjęta dzisiaj
  async isMedicationTakenToday(id_leku: string, id_uzytkownika: string, godzina: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('historia_przyjmowania_lekow')
      .select('*')
      .eq('id_leku', id_leku)
      .eq('id_uzytkownika', id_uzytkownika)
      .eq('data', today)
      .eq('status', 'taken');

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return false;
    }

    const scheduledHour = godzina.split(':')[0];
    
    const isTaken = data.some((entry: any) => {
      const takenHour = entry.zaplanowana_godzina?.split(':')[0];
      return takenHour === scheduledHour;
    });

    return isTaken;
  }

  // Pobierz szczegółowe informacje o przyjętych dawkach w okresie do raportu
  async getMedicationReport(id_uzytkownika: string, startDate: string, endDate: string): Promise<{
    medications: any[];
    summary: {
      totalDays: number;
      totalDoses: number;
      takenDoses: number;
      missedDoses: number;
      adherenceRate: number;
      mostMissedMedication: string;
      bestAdherenceMedication: string;
    };
    dailyBreakdown: Array<{
      date: string;
      total: number;
      taken: number;
      missed: number;
      adherence: number;
    }>;
  }> {
    // Pobierz wszystkie leki użytkownika
    const { data: medications, error: medError } = await supabase
      .from('leki')
      .select('*')
      .eq('id_uzytkownika', id_uzytkownika);

    if (medError) throw medError;

    // Pobierz historię przyjęć w okresie
    const { data: history, error: histError } = await supabase
      .from('historia_przyjmowania_lekow')
      .select('*')
      .eq('id_uzytkownika', id_uzytkownika)
      .gte('data', startDate)
      .lte('data', endDate)
      .order('data', { ascending: true });

    if (histError) throw histError;

    // Oblicz statystyki dla każdego leku
    const medicationStats = new Map();
    
    medications.forEach((med: any) => {
      medicationStats.set(med.id, {
        medication: med,
        totalScheduled: 0,
        totalTaken: 0,
        totalMissed: 0,
        adherenceRate: 0,
        missedDates: []
      });
    });

    // Przetwórz historię
    history.forEach((entry: any) => {
      const stats = medicationStats.get(entry.id_leku);
      if (stats) {
        if (entry.status === 'taken') {
          stats.totalTaken++;
        } else if (entry.status === 'missed') {
          stats.totalMissed++;
          stats.missedDates.push(entry.data);
        }
      }
    });

    // Oblicz zaplanowane dawki (każdy dzień x liczba dawek dziennie)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let totalScheduled = 0;
    let totalTaken = 0;
    let totalMissed = 0;

    medicationStats.forEach((stats) => {
      const med = stats.medication;
      const dosesPerDay = med.dawki_dziennie || 1;
      stats.totalScheduled = totalDays * dosesPerDay;
      stats.adherenceRate = stats.totalScheduled > 0 ? Math.round((stats.totalTaken / stats.totalScheduled) * 100) : 0;
      
      totalScheduled += stats.totalScheduled;
      totalTaken += stats.totalTaken;
      totalMissed += stats.totalMissed;
    });

    // Znajdź leki z najlepszym/najgorszym przestrzeganiem
    let mostMissedMedication = '';
    let bestAdherenceMedication = '';
    let lowestAdherence = 100;
    let highestAdherence = 0;

    medicationStats.forEach((stats, medId) => {
      if (stats.adherenceRate < lowestAdherence && stats.totalScheduled > 0) {
        lowestAdherence = stats.adherenceRate;
        mostMissedMedication = stats.medication.nazwa;
      }
      if (stats.adherenceRate > highestAdherence && stats.totalScheduled > 0) {
        highestAdherence = stats.adherenceRate;
        bestAdherenceMedication = stats.medication.nazwa;
      }
    });

    // Generuj podział dzienny
    const dailyBreakdown: Array<{
      date: string;
      total: number;
      taken: number;
      missed: number;
      adherence: number;
    }> = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayHistory = history.filter((h: any) => h.data === dateStr);
      
      const dayTaken = dayHistory.filter((h: any) => h.status === 'taken').length;
      const dayMissed = dayHistory.filter((h: any) => h.status === 'missed').length;
      const dayTotal = dayTaken + dayMissed;
      const dayAdherence = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 0;

      dailyBreakdown.push({
        date: dateStr,
        total: dayTotal,
        taken: dayTaken,
        missed: dayMissed,
        adherence: dayAdherence
      });
    }

    return {
      medications: Array.from(medicationStats.values()),
      summary: {
        totalDays,
        totalDoses: totalScheduled,
        takenDoses: totalTaken,
        missedDoses: totalMissed,
        adherenceRate: totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0,
        mostMissedMedication,
        bestAdherenceMedication
      },
      dailyBreakdown
    };
  }

  // Sprawdź dzisiejsze przyjęcia i pominięte dawki
  async getTodayMedicationStatus(id_uzytkownika: string): Promise<{
    taken: any[];
    missed: any[];
    pending: any[];
    summary: {
      totalScheduled: number;
      totalTaken: number;
      totalMissed: number;
      totalPending: number;
      completionRate: number;
    };
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Pobierz aktywne leki użytkownika
    const { data: medications, error: medError } = await supabase
      .from('leki')
      .select('*')
      .eq('id_uzytkownika', id_uzytkownika)
      .eq('aktywny', true);

    if (medError) throw medError;

    // Pobierz dzisiejszą historię przyjęć
    const { data: history, error: histError } = await supabase
      .from('historia_przyjmowania_lekow')
      .select('*')
      .eq('id_uzytkownika', id_uzytkownika)
      .eq('data', today);

    if (histError) throw histError;

    const taken: any[] = [];
    const missed: any[] = [];
    const pending: any[] = [];

    // Przetwórz każdy lek i jego godziny
    medications.forEach((med: any) => {
      if (med.godziny_przyjmowania && Array.isArray(med.godziny_przyjmowania)) {
        med.godziny_przyjmowania.forEach((godzina: string) => {
          const historyEntry = history.find((h: any) => 
            h.id_leku === med.id && 
            h.zaplanowana_godzina.startsWith(godzina.split(':')[0])
          );

          if (historyEntry) {
            if (historyEntry.status === 'taken') {
              taken.push({
                medication: med,
                time: godzina,
                takenAt: historyEntry.przyjeto_o,
                status: 'taken'
              });
            } else if (historyEntry.status === 'missed') {
              missed.push({
                medication: med,
                time: godzina,
                missedAt: historyEntry.przyjeto_o,
                status: 'missed'
              });
            }
          } else {
            // Sprawdź czy godzina już minęła
            const currentTime = new Date();
            const [hours, minutes] = godzina.split(':').map(Number);
            const scheduledTime = new Date();
            scheduledTime.setHours(hours, minutes, 0, 0);

            if (currentTime > scheduledTime) {
              missed.push({
                medication: med,
                time: godzina,
                status: 'missed',
                reason: 'time_passed'
              });
            } else {
              pending.push({
                medication: med,
                time: godzina,
                status: 'pending'
              });
            }
          }
        });
      }
    });

    const totalScheduled = taken.length + missed.length + pending.length;
    const totalTaken = taken.length;
    const totalMissed = missed.length;
    const totalPending = pending.length;
    const completionRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

    return {
      taken,
      missed,
      pending,
      summary: {
        totalScheduled,
        totalTaken,
        totalMissed,
        totalPending,
        completionRate
      }
    };
  }
}

export const medicationService = new MedicationService();
export default medicationService;
