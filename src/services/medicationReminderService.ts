import { supabase } from '../lib/supabase';
import { MedicationBase as Medication } from '../types/medications';

export interface MedicationReminder {
  id: string;
  id_leku: string;
  godzina_przypomnienia: string;
  czy_wziety: boolean;
  ostatnio_przyjete?: string;
  utworzono_o: string;
}

class MedicationReminderService {
  // Sprawdza, czy użytkownik może przyjąć dawkę w danym czasie (±1 godzina)
  canTakeDoseNow(medication: Medication): boolean {
    if (!medication.godziny_przyjmowania || medication.godziny_przyjmowania.length === 0) {
      return true; // Jeśli nie ustawiono godzin, można przyjąć zawsze
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Czas w minutach od północy

    return medication.godziny_przyjmowania.some(godzina => {
      if (!godzina) return false;
      
      const [hours, minutes] = godzina.split(':').map(Number);
      const medicationTime = hours * 60 + minutes;
      
      // Sprawdź czy aktualny czas jest w zakresie ±1 godzina od godziny przyjęcia
      const timeDiff = Math.abs(currentTime - medicationTime);
      return timeDiff <= 60; // ±60 minut
    });
  }

  // Pobiera najbliższą godzinę przyjęcia leku
  getNextDoseTime(medication: Medication): string | null {
    if (!medication.godziny_przyjmowania || medication.godziny_przyjmowania.length === 0) {
      return null;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let closestTime: string | null = null;
    let minDiff = Infinity;

    medication.godziny_przyjmowania.forEach(godzina => {
      if (!godzina) return;
      
      const [hours, minutes] = godzina.split(':').map(Number);
      const medicationTime = hours * 60 + minutes;
      
      // Oblicz różnicę czasu (z uwzględnieniem północy)
      let diff = medicationTime - currentTime;
      if (diff < 0) diff += 24 * 60; // Dodaj 24 godziny jeśli czas minął
      
      if (diff < minDiff) {
        minDiff = diff;
        closestTime = godzina;
      }
    });

    return closestTime;
  }

  // Tworzy przypomnienia dla leku
  async createRemindersForMedication(medication: Medication): Promise<void> {
    if (!medication.godziny_przyjmowania || medication.godziny_przyjmowania.length === 0) {
      return;
    }

    // Usuń istniejące przypomnienia dla tego leku
    await this.deleteRemindersForMedication(medication.id);

    // Stwórz nowe przypomnienia
    const reminders = medication.godziny_przyjmowania
      .filter(godzina => godzina) // Filtruj puste godziny
      .map(godzina => ({
        id_leku: medication.id,
        godzina_przypomnienia: godzina,
        czy_wziety: false
      }));

    if (reminders.length > 0) {
      const { error } = await supabase
        .from('przypomnienia_o_lekach')
        .insert(reminders);

      if (error) {
        throw error;
      }
    }
  }

  // Usuwa przypomnienia dla leku
  async deleteRemindersForMedication(medicationId: string): Promise<void> {
    const { error } = await supabase
      .from('przypomnienia_o_lekach')
      .delete()
      .eq('id_leku', medicationId);

    if (error) {
      throw error;
    }
  }

  // Pobiera przypomnienia dla użytkownika
  async getRemindersForUser(userId: string): Promise<MedicationReminder[]> {
    try {
      // Pobierz ID aktywnych leków użytkownika
      const activeMedicationIds = await this.getActiveMedicationIds(userId);
      
      // Jeśli nie ma aktywnych leków, zwróć pustą tablicę
      if (activeMedicationIds.length === 0) {
        console.log('No active medications found for user:', userId);
        return [];
      }

      const { data, error } = await supabase
        .from('przypomnienia_o_lekach')
        .select(`
          *,
          leki (
            id,
            nazwa,
            dawka,
            forma,
            aktywny
          )
        `)
        .in('id_leku', activeMedicationIds)
        .eq('leki.aktywny', true)
        .order('godzina_przypomnienia');

      if (error) {
        console.error('Error getting reminders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error in getRemindersForUser:', error);
      throw error;
    }
  }

  // Pobiera ID aktywnych leków użytkownika
  private async getActiveMedicationIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('leki')
      .select('id')
      .eq('id_uzytkownika', userId)
      .eq('aktywny', true);

    if (error) throw error;
    return data?.map(med => med.id) || [];
  }

  // Sprawdza, czy są przypomnienia na teraz
  async getCurrentReminders(userId: string): Promise<MedicationReminder[]> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const allReminders = await this.getRemindersForUser(userId);
    
    return allReminders.filter(reminder => {
      if (!reminder.godzina_przypomnienia || reminder.czy_wziety) {
        return false;
      }

      const [reminderHours, reminderMinutes] = reminder.godzina_przypomnienia.split(':').map(Number);
      const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
      
      const reminderTime = reminderHours * 60 + reminderMinutes;
      const currentMinutesTotal = currentHours * 60 + currentMinutes;
      
      // Sprawdź czy jesteśmy w zakresie ±5 minut od godziny przypomnienia
      const timeDiff = Math.abs(currentMinutesTotal - reminderTime);
      return timeDiff <= 5;
    });
  }

  // Oznacza przypomnienie jako wzięte
  async markReminderAsTaken(reminderId: string): Promise<void> {
    const { error } = await supabase
      .from('przypomnienia_o_lekach')
      .update({ 
        czy_wziety: true,
        ostatnio_przyjete: new Date().toISOString()
      })
      .eq('id', reminderId);

    if (error) {
      throw error;
    }
  }

  // Resetuje dzienne przypomnienia (wywoływane o północy)
  async resetDailyReminders(userId: string): Promise<void> {
    try {
      // Pobierz ID aktywnych leków użytkownika
      const activeMedicationIds = await this.getActiveMedicationIds(userId);
      
      // Jeśli nie ma aktywnych leków, nie rób nic
      if (activeMedicationIds.length === 0) {
        console.log('No active medications to reset reminders for user:', userId);
        return;
      }

      const { error } = await supabase
        .from('przypomnienia_o_lekach')
        .update({ 
          czy_wziety: false,
          ostatnio_przyjete: null
        })
        .in('id_leku', activeMedicationIds);

      if (error) {
        console.error('Error resetting reminders:', error);
        throw error;
      }
    } catch (error) {
      console.error('Unexpected error in resetDailyReminders:', error);
      throw error;
    }
  }
}

export const medicationReminderService = new MedicationReminderService();
export default medicationReminderService;
