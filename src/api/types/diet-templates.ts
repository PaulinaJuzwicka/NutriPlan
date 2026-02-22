import { DietPlan } from './diet-plan';

export interface DietTemplate extends Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'> {
  id: string;
  name: string;
  description: string;
  category: 'weight_loss' | 'muscle_gain' | 'balanced' | 'vegetarian' | 'vegan' | 'keto' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  averageRating?: number;
  usageCount: number;
}

export interface CreateTemplateData extends Omit<DietTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'averageRating'> {
  usageCount?: number;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {}

export interface TemplateFilterOptions {
  category?: string[];
  difficulty?: string[];
  search?: string;
  minRating?: number;
  onlyPublic?: boolean;
  tags?: string[];
}

export interface TemplateUsageStats {
  templateId: string;
  usageCount: number;
  lastUsedAt: string | null;
  averageRating: number | null;
  ratingsCount: number;
}

export interface TemplateRating {
  id: string;
  templateId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
