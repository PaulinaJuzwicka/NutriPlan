export interface ReportConfig {
  type: 'medications' | 'health' | 'diet' | 'comprehensive';
  dateRange: {
    start: Date;
    end: Date;
  };
  format: 'pdf' | 'json';
  includeCharts?: boolean;
  language: 'pl' | 'en';
  userId: string;
  categories?: Record<string, boolean>;
}

export interface MedicationReport {
  medications: MedicationSummary[];
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  period: string;
  generatedAt: string;
}

export interface MedicationSummary {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  form: string;
  dosesPerDay: number;
  startDate: string;
  endDate?: string | null;
  durationDays?: number | null;
  isPermanent: boolean;
  notes: string;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  doses: Array<{
    date: string;
    taken: boolean;
    plannedTime?: string;
  }>;
}

export interface HealthReport {
  measurements: MeasurementSummary[];
  trends: HealthTrend[];
  averages: HealthAverages;
  period: string;
}

export interface MeasurementSummary {
  type: string;
  unit: string;
  readings: number[];
  average: number;
  min: number;
  max: number;
  trend: 'improving' | 'stable' | 'declining';
  lastReading: {
    value: number;
    date: string;
  };
}

export interface HealthTrend {
  type: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  period: string;
}

export interface HealthAverages {
  weight?: number;
  temperature?: number;
  systolic?: number;
  diastolic?: number;
  bloodSugar?: number;
  heartRate?: number;
}

export interface DietReport {
  mealPlans: DietPlanSummary[];
  nutritionalStats: NutritionalStats;
  adherenceRate: number;
  period: string;
}

export interface DietPlanSummary {
  id: string;
  name: string;
  daysCompleted: number;
  totalDays: number;
  adherenceRate: number;
  averageCalories: number;
  mealsCompleted: number;
  totalMeals: number;
}

export interface NutritionalStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageFiber: number;
  totalMeals: number;
}

export interface ComprehensiveReport {
  medication: MedicationReport;
  health: HealthReport;
  diet: DietReport;
  overallScore: number;
  recommendations: string[];
  period: string;
  generatedAt: string;
}

export interface ReportExport {
  data: Blob;
  filename: string;
  mimeType: string;
  blob: Blob;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<ReportConfig>;
  isDefault: boolean;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  nextRun: Date;
  lastRun?: Date;
  isActive: boolean;
}
