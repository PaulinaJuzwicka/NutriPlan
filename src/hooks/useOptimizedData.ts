import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextOptimized';
import { optimizedQueries, invalidateCache } from '../utils/dataOptimization';

// Hook dla optymalizowanego ładowania danych
export const useOptimizedData = () => {
  const { state } = useAuth();
  const user = state.user;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optymalizowane pobieranie leków
  const fetchMedications = useCallback(async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await optimizedQueries.getMedicationsOptimized(user.id);
      return result;
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError('Nie udało się pobrać leków');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Optymalizowane pobieranie planów dietetycznych
  const fetchDietPlans = useCallback(async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await optimizedQueries.getDietPlansOptimized(user.id);
      return result;
    } catch (err) {
      console.error('Error fetching diet plans:', err);
      setError('Nie udało się pobrać planów dietetycznych');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Optymalizowane pobieranie statystyk
  const fetchStats = useCallback(async () => {
    if (!user) return null;
    
    try {
      const result = await optimizedQueries.getUserStats(user.id);
      return result;
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Nie udało się pobrać statystyk');
      return null;
    }
  }, [user]);

  // Prefetch danych w tle
  const prefetchData = useCallback(async () => {
    if (!user) return;
    
    console.log('🚀 PREFETCHING DATA...');
    
    // Parallel prefetch dla lepszej wydajności
    Promise.allSettled([
      optimizedQueries.getMedicationsOptimized(user.id),
      optimizedQueries.getDietPlansOptimized(user.id),
      optimizedQueries.getUserStats(user.id)
    ]).then(results => {
      console.log('✅ PREFETCH COMPLETE:', results);
    });
  }, [user]);

  // Auto-invalidate cache przy zmianie użytkownika
  useEffect(() => {
    if (user) {
      prefetchData();
    }
  }, [user, prefetchData]);

  // Invalidate cache po operacjach
  const invalidateData = useCallback((type: 'medications' | 'dietPlans' | 'all') => {
    if (!user) return;
    
    switch (type) {
      case 'medications':
        invalidateCache.medications(user.id);
        break;
      case 'dietPlans':
        invalidateCache.dietPlans(user.id);
        break;
      case 'all':
        invalidateCache.all(user.id);
        break;
    }
  }, [user]);

  return {
    isLoading,
    error,
    fetchMedications,
    fetchDietPlans,
    fetchStats,
    prefetchData,
    invalidateData,
    user
  };
};
