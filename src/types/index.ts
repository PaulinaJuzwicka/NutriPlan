

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  dietaryRestrictions?: string[];
  healthConditions?: string[];
  
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
  
  app_metadata?: {
    provider?: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

export interface HealthRecord {
  id: string;
  userId: string;
  date: string;
  type: 'blood-sugar' | 'blood-pressure';
  value: number | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthMetric {
  id: string;
  userId: string;
  type: 'weight' | 'blood-pressure' | 'blood-sugar' | 'heart-rate';
  value: number;
  unit: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type HealthEntryType =
  | 'weight'
  | 'blood-pressure'
  | 'blood-sugar'
  | 'heart-rate'
  | 'cholesterol'
  | 'oxygen-level';

export interface MedicationDose {
  id: string;
  medicationId: string;
  userId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  userId: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaterIntake {
  id: string;
  userId: string;
  amount: number;
  unit: 'ml' | 'oz';
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepRecord {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoodRecord {
  id: string;
  userId: string;
  mood: 'very-bad' | 'bad' | 'neutral' | 'good' | 'very-good';
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'weight' | 'exercise' | 'nutrition' | 'sleep' | 'water' | 'medication';
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id?: string;
  userId?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  height?: number | null;
  weight?: number | null;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  goal?: 'lose' | 'maintain' | 'gain' | null;
  createdAt?: string;
  updatedAt?: string;
  dietaryRestrictions?: string[];
  healthConditions?: string[];
  healthMetrics?: {
    weight?: number;
    height?: number;
    bloodPressure?: string;
    bloodSugar?: number;
  };
  preferences?: {
    cuisine?: string[];
    mealTypes?: string[];
    cookingTime?: number;
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  goals?: {
    weightLoss?: boolean;
    muscleGain?: boolean;
    healthyEating?: boolean;
    targetWeight?: number;
    dailyCalories?: number;
  };
  cuisine?: string[];
  mealTypes?: string[];
  cookingTime?: number;
  notifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  weightLoss?: boolean;
  muscleGain?: boolean;
  healthyEating?: boolean;
  targetWeight?: number;
  dailyCalories?: number;
  bloodPressure?: string;
  bloodSugar?: number;
}


export type UserProfile = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & 
  Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'email'> & {
    id: string;
    email?: string; 
    userId: string;
    createdAt?: string;
    updatedAt?: string;
    
    name?: string;
    
    dietaryRestrictions: string[];
    healthConditions: string[];
    healthMetrics: Record<string, any>;
    preferences: Record<string, any>;
    goals: Record<string, any>;
  };

declare module '@radix-ui/react-tabs' {
  interface TabsProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  }
}

declare module '@radix-ui/react-dialog' {
  interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
}