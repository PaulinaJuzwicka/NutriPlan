import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContextOptimized';
import medicationService from '../services/medicationService';
import { HealthMetric } from '../types';
import { MedicationBase } from '../types/medications';
import { healthService, HealthEntry } from '../services/healthService';
import dietPlanService from '../services/dietPlanService';

export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  meals: any[];
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  medications: MedicationBase[];
  dietPlans: any[];
  healthMetrics: HealthEntry[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UserDataContextType {
  data: UserData;
  refreshData: () => Promise<void>;
  refreshMedications: () => Promise<void>;
  refreshDietPlans: () => Promise<void>;
  refreshHealthMetrics: () => Promise<void>;
  clearError: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const { user, isAuthenticated } = authState;
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Prosty stan - zawsze świeże dane
  const [data, setData] = useState<UserData>({
    medications: [],
    dietPlans: [],
    healthMetrics: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const clearError = useCallback(() => {
    setData(prev => ({ ...prev, error: null }));
  }, []);

  const refreshMedications = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('📊 USER_DATA - Refreshing medications for user:', user.id);
      const medications = await medicationService.getMedications(user.id);
      setData(prev => ({ 
        ...prev, 
        medications, 
        error: null,
        lastUpdated: new Date()
      }));
      console.log('✅ USER_DATA - Medications refreshed:', medications?.length || 0);
    } catch (error) {
      console.error('❌ USER_DATA - Error refreshing medications:', error);
      setData(prev => ({ 
        ...prev, 
        error: 'Błąd podczas ładowania leków',
        lastUpdated: new Date()
      }));
    }
  }, [user?.id]);

  const refreshDietPlans = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('📊 USER_DATA - Refreshing diet plans for user:', user.id);
      const dietPlansResult = await dietPlanService.getMealPlans(user.id);
      const dietPlans = (dietPlansResult as any[]) || [];
      setData((prev: UserData) => ({ 
        ...prev, 
        dietPlans: dietPlans as any[], 
        error: null,
        lastUpdated: new Date()
      }));
      console.log('✅ USER_DATA - Diet plans refreshed:', dietPlans?.length || 0);
    } catch (error) {
      console.error('❌ USER_DATA - Error refreshing diet plans:', error);
      setData(prev => ({ 
        ...prev, 
        error: 'Błąd podczas ładowania planów dietetycznych',
        lastUpdated: new Date()
      }));
    }
  }, [user?.id]);

  const refreshHealthMetrics = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('📊 USER_DATA - Refreshing health metrics for user:', user.id);
      const healthMetrics = await healthService.getHealthEntries({ userId: user.id });
      setData(prev => ({ 
        ...prev, 
        healthMetrics: healthMetrics || [], 
        error: null,
        lastUpdated: new Date()
      }));
      console.log('✅ USER_DATA - Health metrics refreshed:', healthMetrics?.length || 0);
    } catch (error) {
      console.error('❌ USER_DATA - Error refreshing health metrics:', error);
      setData(prev => ({ 
        ...prev, 
        error: 'Błąd podczas ładowania danych zdrowotnych',
        lastUpdated: new Date()
      }));
    }
  }, [user?.id]);

  const refreshData = useCallback(async () => {
    if (!user || !isAuthenticated) {
      console.log('📊 USER_DATA - No user or not authenticated, skipping refresh');
      return;
    }

    // Prevent multiple simultaneous refreshes
    if (data.isLoading) {
      console.log('📊 USER_DATA - Already loading, skipping refresh');
      return;
    }

    console.log('📊 USER_DATA - Starting fresh data refresh for user:', user.id);
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Direct function calls to avoid dependency issues
      await Promise.all([
        medicationService.getMedications(user.id).then(medications => {
          setData(prev => ({ ...prev, medications: medications || [] }));
        }),
        dietPlanService.getMealPlans(user.id).then(dietPlansResult => {
          const dietPlans = (dietPlansResult as any[]) || [];
          setData(prev => ({ ...prev, dietPlans }));
        }),
        healthService.getHealthEntries({ userId: user.id }).then(healthMetrics => {
          setData(prev => ({ ...prev, healthMetrics: healthMetrics || [] }));
        })
      ]);
      
      setData(prev => ({ 
        ...prev, 
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      }));
      
      console.log('✅ USER_DATA - All data refreshed successfully');
    } catch (error) {
      console.error('❌ USER_DATA - Error during fresh data refresh:', error);
      setData(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Błąd podczas ładowania danych',
        lastUpdated: new Date()
      }));
    }
  }, [user?.id, isAuthenticated, data.isLoading]); // Simplified dependencies

  // Load data when user authenticates (simple and clean)
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      console.log('📊 USER_DATA - User authenticated, loading fresh data');
      setIsInitialized(true);
      refreshData();
    } else if (!isAuthenticated) {
      // Clear data when user logs out
      console.log('📊 USER_DATA - User not authenticated, clearing data');
      setIsInitialized(false);
      setData({
        medications: [],
        dietPlans: [],
        healthMetrics: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
      });
    }
  }, [isAuthenticated, user?.id, isInitialized]);

  const value: UserDataContextType = {
    data,
    refreshData,
    refreshMedications,
    refreshDietPlans,
    refreshHealthMetrics,
    clearError,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
