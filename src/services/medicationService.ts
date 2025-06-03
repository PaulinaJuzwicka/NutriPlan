import { supabase } from '../lib/supabase';
import type { 
  MedicationBase, 
  MedicationUpdate, 
  MedicationCreate, 
  MedicationStatus,
  MedicationStats,
  MedicationForm
} from '../types/medications';
import { 
  getCachedMedications, 
  setCache, 
  clearMedicationCache 
} from '../utils/medicationCache';


class MedicationService {
  

    private async checkMedicationPermission(medicationId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('medications')
      .select('user_id')
      .eq('id', medicationId)
      .single();

    if (error) {
      console.error('Error checking medication permission:', error);
      return false;
    }

    return data?.user_id === userId;
  }

    clearMedicationCache(userId?: string): void {
    clearMedicationCache(userId);
  }

    async createMedication(medication: MedicationCreate): Promise<MedicationBase> {
    try {
      console.log('Received form data:', JSON.stringify(medication, null, 2));
      
      
      const medicationData = {
        ...medication,
        
        form: (medication.form || 'tablet') as MedicationForm,
        daily_doses: medication.daily_doses || 1,
        times_per_day: Array.isArray(medication.times_per_day) ? medication.times_per_day : [],
        is_active: true,
        
        is_permanent: medication.is_permanent || false,
        
        duration_days: medication.duration_days || null
      };

      
      let endDate: string | null = null;
      if (medicationData.duration_days && 
          medicationData.start_date && 
          !medicationData.is_permanent) {
        const start = new Date(medicationData.start_date);
        start.setDate(start.getDate() + medicationData.duration_days);
        endDate = start.toISOString();
      }

      
      const dbData = {
        name: medicationData.name,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        start_date: medicationData.start_date,
        end_date: endDate,
        is_permanent: medicationData.is_permanent,
        notes: medicationData.notes,
        form: medicationData.form,
        daily_doses: medicationData.daily_doses,
        times_per_day: medicationData.times_per_day,
        is_active: medicationData.is_active,
        user_id: medicationData.user_id,
        duration_days: medicationData.duration_days
      };

      const { data, error } = await supabase
        .from('medications')
        .insert([dbData])
        .select('*');

      if (error) {
        console.error('Error creating medication:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to create medication');
      }

      const createdMedication = data[0];

      
      this.clearMedicationCache(createdMedication.user_id);

      
      return {
        ...createdMedication,
        status: 'active' as const,
        taken_today: {
          count: 0,
          total: createdMedication.daily_doses || 1,
          remaining: createdMedication.daily_doses || 1
        }
      };
    } catch (error) {
      console.error('Error in createMedication method:', error);
      throw error;
    }
  }

    async getMedicationStats(userId: string): Promise<MedicationStats> {
    try {
      
      const { data: medications, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (!medications || medications.length === 0) {
        return {
          active: 0,
          completed: 0,
          upcoming: 0,
          expired: 0,
          total: 0,
          adherenceRate: 0,
          activeCount: 0,
          completedCount: 0,
          upcomingCount: 0,
          expiredCount: 0,
          count: 0,
          taken: 0,
          missed: 0,
          nextDose: null,
          lastTaken: null
        };
      }

      const now = new Date();
      
      
      let activeCount = 0;
      let completedCount = 0;
      let upcomingCount = 0;
      let expiredCount = 0;
      let totalDoses = 0;
      let takenDoses = 0;
      let missedCount = 0;
      let lastTaken: Date | null = null;
      let nextDose: Date | null = null;

      medications.forEach(med => {
        const startDate = new Date(med.start_date);
        const endDate = med.end_date ? new Date(med.end_date) : null;
        
        
        if (startDate > now) {
          upcomingCount++;
        } else if (endDate && endDate < now) {
          
          
          if (!med.is_permanent) {
            expiredCount++;
          }
          completedCount++;
        } else {
          activeCount++;
        }

        
        if (med.medication_doses && med.medication_doses.length > 0) {
          const doseStats = {
            total: 0,
            taken: 0,
            missed: 0,
            lastTaken: null as Date | null,
            nextDose: null as Date | null
          };

          med.medication_doses.forEach((dose: any) => {
            doseStats.total++;
            const doseTime = new Date(dose.scheduled_time);
            
            if (dose.taken) {
              doseStats.taken++;
              if (!doseStats.lastTaken || doseTime > doseStats.lastTaken) {
                doseStats.lastTaken = doseTime;
              }
            } else {
              const now = new Date();
              if (doseTime < now && (!doseStats.lastTaken || doseTime > doseStats.lastTaken)) {
                doseStats.missed++;
              }
            }
            
            
            const now = new Date();
            if (doseTime > now && (!doseStats.nextDose || doseTime < doseStats.nextDose)) {
              doseStats.nextDose = doseTime;
            }
          });

          totalDoses += doseStats.total;
          takenDoses += doseStats.taken;
          missedCount += doseStats.missed;
          
          
          if (doseStats.lastTaken && (!lastTaken || doseStats.lastTaken > lastTaken)) {
            lastTaken = doseStats.lastTaken;
          }
          
          
          if (doseStats.nextDose && (!nextDose || doseStats.nextDose < nextDose)) {
            nextDose = doseStats.nextDose;
          }
        }
      });

      
      const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

      const stats: MedicationStats = {
        active: activeCount,
        completed: completedCount,
        upcoming: upcomingCount,
        expired: expiredCount,
        total: medications.length,
        adherenceRate,
        activeCount,
        completedCount,
        upcomingCount,
        expiredCount: expiredCount,
        count: medications.length,
        taken: takenDoses,
        missed: missedCount,
        nextDose: nextDose || null,
        lastTaken: lastTaken || null
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting medication stats:', error);
      throw error;
    }
  }

    async getMedications(
    userId: string,
    options: {
      status?: MedicationStatus[];
      includeDoses?: boolean;
      startDate?: Date;
      endDate?: Date;
      forceRefresh?: boolean;
    } = {}
  ): Promise<MedicationBase[]> {
    const { status, includeDoses, startDate, endDate, forceRefresh } = options;
    try {
      if (!forceRefresh) {
        const cached = getCachedMedications(userId);
        if (cached) {
          return cached;
        }
      }

      let query = supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId);

      if (status?.length) {
        query = query.in('status', status);
      }
      if (startDate) {
        query = query.gte('start_date', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('end_date', endDate.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching medications: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      const processedMedications = await Promise.all(data.map(async (med: any) => {
        const dailyDoses = med.daily_doses || 1;
        const takenToday = med.taken_today?.count || 0;
        const startDate = new Date(med.start_date);
        const now = new Date();
        let status: MedicationStatus = 'active';

        if (startDate > now) {
          status = 'upcoming';
        } else if (!med.is_permanent && med.end_date) {
          const endDate = new Date(med.end_date);
          if (endDate < now) {
            status = 'expired';
          }
        }

        const result: MedicationBase = {
          ...med,
          status,
          taken_today: {
            count: takenToday,
            total: dailyDoses,
            remaining: Math.max(0, dailyDoses - takenToday)
          },
          last_taken: med.updated_at || null,
          is_permanent: med.is_permanent || false,
          end_date: med.is_permanent ? null : med.end_date,
          duration_days: med.is_permanent ? null : med.duration_days
        };

        if (!includeDoses) {
          const { medication_doses, ...resultWithoutDoses } = result;
          return resultWithoutDoses;
        }

        return result;
      }));

      setCache(userId, processedMedications);
      return processedMedications;
    } catch (error) {
      console.error('Error in getMedications:', error);
      throw error;
    }
  }

    async cleanupExpiredMedications(): Promise<{ count: number }> {
    try {
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      
      const { data: expiredMedications, error: fetchError } = await supabase
        .from('medications')
        .select('id, name, end_date')
        .lt('end_date', oneWeekAgo.toISOString()) 
        .eq('is_permanent', false) 
        .not('end_date', 'is', null); 

      if (fetchError) {
        console.error('Error while searching for expired medications:', fetchError);
        return { count: 0 };
      }

      if (!expiredMedications || expiredMedications.length === 0) {
        console.log('No medications to automatically delete');
        return { count: 0 };
      }

      console.log(`Found ${expiredMedications.length} medications to delete`);

      
      const deletePromises = expiredMedications.map(med =>
        this.deleteMedication(med.id)
          .then(() => {
            console.log(`Deleted expired medication: ${med.name} (ID: ${med.id}, end date: ${med.end_date})`);
            return true;
          })
          .catch(error => {
            console.error(`Error while deleting medication ${med.id}:`, error);
            return false;
          })
      );

      const results = await Promise.all(deletePromises);
      const successfulDeletions = results.filter(Boolean).length;

      console.log(`Successfully deleted ${successfulDeletions} out of ${expiredMedications.length} expired medications`);
      return { count: successfulDeletions };
    } catch (error) {
      console.error('Error in cleanupExpiredMedications:', error);
      throw error;
    }
  }

    async deleteMedication(medicationId: string, userId?: string): Promise<void> {
    try {
      
      if (userId) {
        const hasPermission = await this.checkMedicationPermission(medicationId, userId);
        if (!hasPermission) {
          throw new Error('You do not have permission to delete this medication');
        }
      }

      
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId);

      if (error) {
        throw new Error(`Failed to delete medication: ${error.message}`);
      }

      
      if (userId) {
        this.clearMedicationCache(userId);
      } else {
        
        this.clearMedicationCache();
      }
    } catch (error) {
      console.error('Error in deleteMedication:', error);
      throw error;
    }
  }

    async updateMedication(
    medicationId: string,
    updates: MedicationUpdate,
    userId?: string
  ): Promise<MedicationBase> {
    try {
      
      if (userId) {
        const hasPermission = await this.checkMedicationPermission(medicationId, userId);
        if (!hasPermission) {
          throw new Error('You do not have permission to update this medication');
        }
      }

      
      const cleanedUpdates = this.cleanUpdateData(updates);
      
      
      const { taken_today, ...updatesWithoutTakenToday } = cleanedUpdates;
      
      
      const updateData = {
        ...updatesWithoutTakenToday,
        updated_at: new Date().toISOString()
      };

      
      const { data, error } = await supabase.rpc('update_medication_with_dose', {
        p_medication_id: medicationId,
        p_updates: updateData,
        p_taken_today: taken_today
      }).select().single();

      if (error) {
        throw new Error(`Failed to update medication: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after update');
      }

      
      if (userId) {
        this.clearMedicationCache(userId);
      } else {
        
        this.clearMedicationCache();
      }

      
      const typedMed = data as MedicationBase;
      return {
        ...typedMed,
        taken_today: typedMed.taken_today || {
          count: 0,
          total: typedMed.daily_doses || 1,
          remaining: Math.max(0, typedMed.daily_doses - 0)
        }
      };
    } catch (error) {
      console.error('Error in updateMedication:', error);
      throw error;
    }
  }

    private cleanUpdateData(updateData: MedicationUpdate): Omit<MedicationUpdate, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'last_taken' | 'medication_doses'> {
    
    const {
      name,
      description,
      dosage,
      form,
      frequency,
      start_date,
      end_date,
      is_active,
      is_permanent,
      daily_doses,
      duration_days,
      times_per_day,
      notes,
      taken_today
    } = updateData;

    return {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(dosage !== undefined && { dosage }),
      ...(form !== undefined && { form }),
      ...(frequency !== undefined && { frequency }),
      ...(start_date !== undefined && { start_date }),
      ...(end_date !== undefined && { end_date }),
      ...(is_active !== undefined && { is_active }),
      ...(is_permanent !== undefined && { is_permanent }),
      ...(daily_doses !== undefined && { daily_doses }),
      ...(duration_days !== undefined && { duration_days }),
      ...(times_per_day !== undefined && { times_per_day }),
      ...(notes !== undefined && { notes }),
      ...(taken_today !== undefined && { taken_today })
    };
  }

    async markDoseAsTaken(medicationId: string, userId: string): Promise<MedicationBase> {
    console.log(`[${new Date().toISOString()}] Marking dose for medication ${medicationId} as taken`);

    if (!userId) {
      throw new Error('Invalid user ID');
    }

    try {
      const now = new Date();
      
      
      const { data: medication, error: fetchError } = await supabase
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .single();

      if (fetchError || !medication) {
        throw new Error('Medication not found');
      }

      
      const currentTaken = medication.taken_today?.count || 0;
      const maxDoses = medication.daily_doses || 1;
      const newTakenCount = Math.min(currentTaken + 1, maxDoses);

      
      const { error: doseError } = await supabase
        .from('medication_doses')
        .insert([{
          medication_id: medicationId,
          date: now.toISOString().split('T')[0], 
          taken: true,
          taken_at: now.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }]);

      if (doseError) {
        console.error('Error creating dose record:', doseError);
        throw new Error('Failed to record dose');
      }

      
      const { error: updateError } = await supabase
        .from('medications')
        .update({ 
          updated_at: now.toISOString(),
          taken_today: {
            count: newTakenCount,
            total: maxDoses,
            remaining: Math.max(0, maxDoses - newTakenCount)
          }
        })
        .eq('id', medicationId);

      if (updateError) {
        throw updateError;
      }

      
      this.clearMedicationCache(userId);

      
      const updatedMeds = await this.getMedications(userId, { forceRefresh: true });
      const updatedMed = updatedMeds.find(m => m.id === medicationId);

      if (!updatedMed) {
        throw new Error('Failed to fetch updated medication');
      }

      return updatedMed;
    } catch (error) {
      console.error('Error marking dose as taken:', error);
      throw error;
    }
  }
}

export default new MedicationService();