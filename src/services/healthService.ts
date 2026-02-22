import { supabase } from '../lib/supabase';

export type HealthEntryType = 'blood-sugar' | 'blood-pressure' | 'pulse' | 'temperature';

export interface HealthEntry {
  id: string;
  id_uzytkownika: string;
  typ: HealthEntryType;
  wartosc: number | string;
  notatki?: string;
  zmierzono_o: string;
  utworzono_o: string;
}

interface GetHealthEntriesOptions {
  userId: string;
  type?: HealthEntryType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const healthService = {
  async createHealthEntry(entry: Omit<HealthEntry, 'id' | 'utworzono_o'>): Promise<HealthEntry> {
    try {
      const { data, error } = await supabase
        .from('wpisy_zdrowotne')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from create operation');
      
      
      // Sprawdź surowe dane w bazie
      const { data: rawData, error: rawError } = await supabase
        .from('wpisy_zdrowotne')
        .select('*')
        .eq('id_uzytkownika', entry.id_uzytkownika)
        .order('zmierzono_o', { ascending: false })
        .limit(5);
      
      if (rawError) {
      } else {
      }
      
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create health entry');
    }
  },

  async getHealthEntries({
    userId,
    type,
    startDate,
    endDate,
    limit,
  }: GetHealthEntriesOptions): Promise<HealthEntry[]> {
    try {
      let query = supabase
        .from('wpisy_zdrowotne')
        .select('*')
        .eq('id_uzytkownika', userId)
        .order('zmierzono_o', { ascending: false });

      if (type) {
        query = query.eq('typ', type);
      }
      if (startDate) {
        query = query.gte('zmierzono_o', startDate);
      }
      if (endDate) {
        query = query.lte('zmierzono_o', endDate);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch health entries');
    }
  },

  async getLatestHealthEntries(userId: string, limit = 5): Promise<HealthEntry[]> {
    try {
      const { data, error } = await supabase
        .from('wpisy_zdrowotne')
        .select('*')
        .eq('id_uzytkownika', userId)
        .order('zmierzono_o', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch latest health entries'
      );
    }
  },

  async updateHealthEntry(
    id: string,
    updates: Partial<Omit<HealthEntry, 'id' | 'id_uzytkownika' | 'utworzono_o'>>
  ): Promise<HealthEntry> {
    try {
      const { data, error } = await supabase
        .from('wpisy_zdrowotne')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update operation');

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update health entry');
    }
  },

  async deleteHealthEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('wpisy_zdrowotne').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete health entry');
    }
  },
};
