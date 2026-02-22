import { supabase } from '../lib/supabase';

export interface MedicationHistoryRecord {
  id: string;
  id_leku: string;
  id_uzytkownika: string;
  data: string;
  zaplanowana_godzina?: string;
  przyjeto_o?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  czy_przyjete: boolean;
  notatki?: string;
  utworzono_o: string;
  zaktualizowano_o: string;
}

export const medicationHistoryService = {
  // Pobierz historię przyjmowania leków dla użytkownika
  async getMedicationHistory(userId: string, startDate?: Date, endDate?: Date): Promise<MedicationHistoryRecord[]> {
    let query = supabase
      .from('historia_przyjmowania_lekow')
      .select('*')
      .eq('id_uzytkownika', userId)
      .order('data', { ascending: true });

    if (startDate) {
      query = query.gte('data', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('data', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  },

  // Dodaj rekord do historii przyjmowania
  async addMedicationHistory(record: Omit<MedicationHistoryRecord, 'id' | 'utworzono_o' | 'zaktualizowano_o'>): Promise<MedicationHistoryRecord> {
    const { data, error } = await supabase
      .from('historia_przyjmowania_lekow')
      .insert(record)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Nie udało się dodać rekordu do historii');
    }

    return data;
  },

  // Zaktualizuj rekord w historii
  async updateMedicationHistory(id: string, updates: Partial<MedicationHistoryRecord>): Promise<MedicationHistoryRecord> {
    const { data, error } = await supabase
      .from('historia_przyjmowania_lekow')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Nie udało się zaktualizować rekordu w historii');
    }

    return data;
  },

  // Oznacz lek jako przyjęty
  async markMedicationAsTaken(id: string): Promise<MedicationHistoryRecord> {
    return this.updateMedicationHistory(id, {
      czy_przyjete: true,
      status: 'taken',
      przyjeto_o: new Date().toISOString(),
      zaktualizowano_o: new Date().toISOString()
    });
  },

  // Oznacz lek jako pominięty
  async markMedicationAsMissed(id: string): Promise<MedicationHistoryRecord> {
    return this.updateMedicationHistory(id, {
      czy_przyjete: false,
      status: 'missed',
      zaktualizowano_o: new Date().toISOString()
    });
  },

  // Usuń rekord z historii
  async deleteMedicationHistory(id: string): Promise<void> {
    const { error } = await supabase
      .from('historia_przyjmowania_lekow')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  // Pobierz dzisiejsze leki do przyjęcia
  async getTodaysMedications(userId: string): Promise<MedicationHistoryRecord[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('historia_przyjmowania_lekow')
      .select('*')
      .eq('id_uzytkownika', userId)
      .eq('data', today)
      .order('zaplanowana_godzina', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }
};

export default medicationHistoryService;
