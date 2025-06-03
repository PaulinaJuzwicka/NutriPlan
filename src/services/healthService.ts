import { supabase } from '../lib/supabaseClient';

export type HealthEntryType = 'blood-sugar' | 'blood-pressure' | 'pulse' | 'temperature';

export interface HealthEntry {
  id: string;
  user_id: string;
  type: HealthEntryType;
  value: number | string;
  notes?: string;
  measured_at: string;
  created_at: string;
}

interface HealthServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

interface GetHealthEntriesOptions {
  userId: string;
  type?: HealthEntryType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const healthService = {
  async createHealthEntry(entry: Omit<HealthEntry, 'id' | 'created_at'>): Promise<HealthEntry> {
    try {
      const { data, error } = await supabase
        .from('health_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from create operation');
      
      return data;
    } catch (error) {
      console.error('Error creating health entry:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create health entry');
    }
  },

  async getHealthEntries({
    userId,
    type,
    startDate,
    endDate,
    limit
  }: GetHealthEntriesOptions): Promise<HealthEntry[]> {
    try {
      let query = supabase
        .from('health_entries')
        .select('*')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }
      if (startDate) {
        query = query.gte('measured_at', startDate);
      }
      if (endDate) {
        query = query.lte('measured_at', endDate);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching health entries:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch health entries');
    }
  },

  async getLatestHealthEntries(userId: string, limit = 5): Promise<HealthEntry[]> {
    try {
      const { data, error } = await supabase
        .from('health_entries')
        .select('*')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching latest health entries:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch latest health entries');
    }
  },

  async updateHealthEntry(id: string, updates: Partial<Omit<HealthEntry, 'id' | 'user_id' | 'created_at'>>): Promise<HealthEntry> {
    try {
      const { data, error } = await supabase
        .from('health_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update operation');
      
      return data;
    } catch (error) {
      console.error('Error updating health entry:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update health entry');
    }
  },

  async deleteHealthEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('health_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting health entry:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete health entry');
    }
  }
};