import { supabase } from '../lib/supabase';
import { User } from '../types';

export const userService = {
  async updateProfile(userId: string, data: Partial<User>) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.firstName !== undefined && data.lastName !== undefined) {
        updateData.name = `${data.firstName} ${data.lastName}`.trim();
      } else if (data.firstName !== undefined) {
        updateData.name = data.firstName;
      } else if (data.lastName !== undefined) {
        updateData.name = data.lastName;
      }

      console.log('Attempting to update profile for userId:', userId, 'with data:', updateData);

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      if (!updatedProfile) {
        console.log('No existing profile found for userId:', userId, 'attempting insert');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userId, ...updateData }])
          .select()
          .single();

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
        console.log('Profile successfully created:', newProfile);
        return newProfile;
      } else {
        console.log('Profile successfully updated:', updatedProfile);
      }

      return updatedProfile;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  },

  async getProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
    return profile;
  }
};