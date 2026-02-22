import { getSafeSupabaseInstance } from '../lib/supabase';

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

export const healthServiceFixed = {
  async getHealthEntries(options: GetHealthEntriesOptions): Promise<HealthEntry[]> {
    
    
    
    try {
      const supabase = await getSafeSupabaseInstance();
      let query = supabase
        .from('wpisy_zdrowotne')
        .select('*')
        .eq('id_uzytkownika', options.userId)
        .order('zmierzono_o', { ascending: false });

      // Apply filters
      if (options.type) {
        query = query.eq('typ', options.type);
      }
      
      if (options.startDate) {
        query = query.gte('zmierzono_o', options.startDate);
      }
      
      if (options.endDate) {
        query = query.lte('zmierzono_o', options.endDate);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }

      
      const { data, error } = await query;

      if (error) {
        
        return [];
      }

      
      return data || [];
    } catch (error) {
      
      return [];
    }
  }
};

export default healthServiceFixed;
