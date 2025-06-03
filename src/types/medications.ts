export type MedicationStatus = 'active' | 'inactive' | 'completed' | 'missed' | 'upcoming' | 'expired';

export type MedicationForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'ointment' | 'drops' | 'inhalation' | 'other';

export interface MedicationBase {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  dosage: string;
  form: MedicationForm;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  is_permanent: boolean;
  daily_doses: number;
  duration_days?: number;
  times_per_day: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  status?: MedicationStatus;
  taken_today?: {
    count: number;
    total: number;
    remaining: number;
  };
  last_taken?: string | null;
  medication_doses?: MedicationDose[];
}

export interface MedicationDose {
  id: string;
  medication_id: string;
  date: string;
  taken: boolean;
  taken_at: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationCreate extends Omit<MedicationBase, 
  'id' | 'created_at' | 'updated_at' | 'status' | 
  'taken_today' | 'last_taken' | 'medication_doses' | 'is_active'
> {}

export interface MedicationUpdate extends Partial<Omit<MedicationBase, 
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 
  'last_taken' | 'medication_doses'
>> {
  taken_today?: {
    count: number;
    total: number;
    remaining: number;
  };
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
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
