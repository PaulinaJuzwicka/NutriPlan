export type MedicationStatus =
  | 'active'
  | 'inactive'
  | 'completed'
  | 'missed'
  | 'upcoming'
  | 'expired';

export type MedicationForm =
  | 'tabletka'
  | 'kapsulka'
  | 'syrop'
  | 'iniekcja'
  | 'masc'
  | 'krople'
  | 'inhalacja'
  | 'inne';

export interface MedicationBase {
  id: string;
  id_uzytkownika: string;
  nazwa: string;
  dawka: string;
  forma: MedicationForm;
  czestotnosc: string;
  rozpoczeto_od: string;
  data_zakonczenia?: string | null;
  aktywny: boolean;
  czy_staly: boolean;
  dawki_dziennie: number;
  czas_trwania_dni?: number;
  godziny_przyjmowania: string[];
  notatki?: string;
  utworzono_o: string;
  zaktualizowano_o: string;
  status?: MedicationStatus;
}

export interface MedicationDose {
  id: string;
  id_leku: string;
  data: string;
  czy_przyjety: boolean;
  przyjeto_o: string | null;
  notatki?: string;
  utworzono_o: string;
  zaktualizowano_o: string;
}

export interface MedicationReminder {
  id: string;
  id_leku: string;
  godzina_przypomnienia: string;
  czy_wziety: boolean;
  ostatnio_przyjete?: string;
  utworzono_o: string;
}

export interface MedicationCreate
  extends Omit<
    MedicationBase,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'status'
    | 'taken_today'
    | 'last_taken'
    | 'medication_doses'
    | 'is_active'
  > {
  user_id: string;
}

export interface MedicationUpdate
  extends Partial<
    Omit<
      MedicationBase,
      'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'last_taken' | 'medication_doses'
    >
  > {
  taken_today?: {
    count: number;
    total: number;
    remaining: number;
  };
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: unknown;
  status: number;
  statusText: string;
  count?: number;
}

export interface MedicationStats {
  active: number;
  completed: number;
  upcoming: number;
  expired: number;
  total: number;
  adherenceRate: number;
  activeCount?: number;
  completedCount?: number;
  upcomingCount?: number;
  expiredCount?: number;
  count?: number;
  taken?: number;
  missed?: number;
  nextDose?: Date | null;
  lastTaken?: Date | null;
}
