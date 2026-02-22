import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import medicationService from '../services/medicationService';
import dietPlanService from '../services/dietPlanService';
import { healthService } from '../services/healthService';

export const useData = () => {
  const { state } = useAuth();
  const user = state.user;
  
  const [medications, setMedications] = useState<any[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async () => {
    if (!user) return;
    
    try {
      
      const data = await medicationService.getMedications(user.id);
      setMedications(data);
      
    } catch (err) {
      
      setError('Nie udało się załadować leków');
    }
  }, [user]);

  const fetchDietPlans = useCallback(async () => {
    if (!user) return;
    
    try {
      
      const data = await dietPlanService.getMealPlans(user.id);
      setDietPlans(Array.isArray(data) ? data : []);
       ? data.length : 0);
    } catch (err) {
      
      setError('Nie udało się załadować planów dietetycznych');
      setDietPlans([]);
    }
  }, [user]);

  const fetchHealthData = useCallback(async () => {
    if (!user) return;
    
    try {
      
      const data = await healthService.getLatestHealthEntries(user.id);
      setHealthData(data);
      
    } catch (err) {
      
      setError('Nie udało się załadować danych zdrowotnych');
    }
  }, [user]);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    
    try {
      
      const stats = await Promise.all([
        fetchMedications(),
        fetchDietPlans(),
        fetchHealthData()
      ]);
      
      setUserStats({
        medicationsCount: medications.length,
        dietPlansCount: dietPlans.length,
        healthDataCount: healthData.length,
        lastUpdated: new Date()
      });
      
      
    } catch (err) {
      
      setError('Nie udało się załadować statystyk');
    }
  }, [user, medications.length, dietPlans.length, healthData.length]);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      
      
      await Promise.all([
        fetchMedications(),
        fetchDietPlans(),
        fetchHealthData()
      ]);
      
      await fetchUserStats();
      
      
    } catch (err) {
      
      setError('Nie udało się załadować danych');
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchMedications, fetchDietPlans, fetchHealthData, fetchUserStats]);

  const refreshData = useCallback(() => {
    
    loadAllData();
  }, [loadAllData]);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setMedications([]);
      setDietPlans([]);
      setHealthData([]);
      setUserStats(null);
    }
  }, [user, loadAllData]);

  return {
    medications,
    dietPlans,
    healthData,
    userStats,
    isLoading,
    error,
    refreshData,
    fetchMedications,
    fetchDietPlans,
    fetchHealthData,
    fetchUserStats
  };
};
