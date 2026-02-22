import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  dietaryRestrictions: string[];
  healthConditions: string[];
  createdAt: string;
}

export const userService = {
  async createProfile(userId: string, data: { name?: string; email?: string }) {
    try {
      
      // Sprawdź czy userId to poprawny UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error('Invalid user ID format');
      }

      const insertData = {
        id: userId,
        nazwa: data.name || '',
        email: data.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: profileData, error } = await supabase
        .from('uzytkownicy')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(`Profile creation error: ${error.message}`);
      }

      return profileData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Profile creation error: ${errorMessage}`);
    }
  },

  async updateProfile(userId: string, data: Partial<User>) {
    try {
      // Mapowanie pól do rzeczywistej struktury tabeli
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(), // zaktualizowano_o -> updated_at
        ...(data.name && { nazwa: data.name }), // name -> nazwa
        ...(data.email && { email: data.email }),
        ...(data.dietaryRestrictions && { allergies: data.dietaryRestrictions }), // dietaryRestrictions -> allergies
        ...(data.healthConditions && { medications: data.healthConditions }), // healthConditions -> medications
      };

      const { data: updatedProfile, error: updateError } = await supabase
        .from('uzytkownicy')
        .update(updateData)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (updateError && updateError.code !== 'PGRST116') {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      // If update failed because record doesn't exist, try to create it
      if (updateError && updateError.code === 'PGRST116') {
        return await this.createProfile(userId, {
          name: data.name,
          email: data.email
        });
      }
      
      return updatedProfile;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update profile: ${errorMessage}`);
    }
  },

  async getProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('uzytkownicy')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return null;
      }
      
      return profile;
    } catch (error: unknown) {
      return null;
    }
  },

  async saveHealthData(userId: string, healthData: { chronicDiseases: string[], allergies: string[] }) {
    try {
      const upsertData = {
          id: userId,
          chronic_diseases: healthData.chronicDiseases,
          allergies: healthData.allergies,
          updated_at: new Date().toISOString()
        };

      const { data: savedHealthData, error } = await supabase
        .from('uzytkownicy')
        .upsert(upsertData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save health data: ${error.message}`);
      }

      return savedHealthData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save health data: ${errorMessage}`);
    }
  },

  async getHealthData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('uzytkownicy')
        .select('chronic_diseases, allergies')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch health data: ${error.message}`);
      }

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch health data: ${errorMessage}`);
    }
  }
};
