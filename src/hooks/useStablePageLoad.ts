import { useEffect, useState } from 'react';

/**
 * Uniwersalny hook do zapobiegania podwójnemu ładowaniu - BEZ CACHE
 * Używany tylko w krytycznych miejscach, ale bez zapisywania stanu
 */
export const useStablePageLoad = (pageKey: string, dependencies: any[] = []) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Bez resetowania przy F5 - zawsze świeży start
  useEffect(() => {
    
    // Cache nie jest już używany - aplikacja działa bez cache
  }, []);

  // Główna logika ładowania - BEZ CACHE
  useEffect(() => {
    
    setIsInitialized(false);
    
    // Zapobiegaj podwójnemu ładowaniu w React Strict Mode
  }, [pageKey, ...dependencies]);

  return {
    isInitialized,
    shouldLoadData: !isInitialized,
    markAsLoaded: () => setIsInitialized(true),
    resetInitialization: () => {
      
      setIsInitialized(false);
    }
  };
};
