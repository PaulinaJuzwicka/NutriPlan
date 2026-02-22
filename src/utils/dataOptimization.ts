import { supabase } from '../lib/supabase';

// Cache dla danych użytkownika - globalny singleton
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live w milisekundach
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>();
  private static instance: DataCache;
  
  // Singleton pattern - jedna instancja cache dla całej aplikacji
  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }
  
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // domyślnie 5 minut
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    
    // Sprawdź, czy cache nie wygasł (timestamp + ttl > now)
    if (Date.now() > (item.timestamp + item.ttl)) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Prefetch - pobierz dane w tle
  async prefetch<T>(key: string, fetchFn: () => Promise<T>, ttl: number = 5 * 60 * 1000): Promise<void> {
    if (this.get(key)) {
      return; // już w cache
    }
    
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
    } catch (error) {
      // Prefetch failed silently
    }
  }
}

export const dataCache = new DataCache();

// Optymalizowane zapytania do Supabase
export const optimizedQueries = {
  // Pobierz tylko potrzebne pola dla leków
  async getMedicationsOptimized(userId: string) {
    
    // BEZ CACHE - prosty test
    try {
      const { data, error } = await supabase
        .from('leki')
        .select('*') // Zmienione: pobierz wszystkie pola, nie tylko id i nazwa
        .eq('id_uzytkownika', userId)
        .limit(3);

      if (error) {
        return [];
      }
      
      return data || [];
    } catch (err) {
      return [];
    }
  },

  // Pobierz tylko potrzebne pola dla planów dietetycznych
  async getDietPlansOptimized(userId: string) {
    const cacheKey = `diet_plans_${userId}`;
    const cached = dataCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    try {
      // Bez timeout - zamiast tego lepsza obsługa błędów
      const { data, error } = await supabase
        .from('plany_dietetyczne')
        .select('*')
        .eq('id_uzytkownika', userId)
        .order('utworzono_o', { ascending: false });
      
      if (error) {
        return [];
      }
      
      dataCache.set(cacheKey, data, 5 * 60 * 1000); // 5 minut
      return data || [];
    } catch (error) {
      return [];
      return []; // Fallback do pustej tablicy
    }
  },

  // Pobierz statystyki użytkownika (optymalizowane)
  async getUserStats(userId: string) {
    const cacheKey = `stats_${userId}`;
    const cached = dataCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    try {
      // Parallel queries dla lepszej wydajności
      const [medicationsData, healthData] = await Promise.all([
        optimizedQueries.getMedicationsOptimized(userId),
        optimizedQueries.getHealthMetricsOptimized(userId)
      ]);
      
      const stats = {
        medicationsCount: medicationsData?.length || 0,
        healthMetricsCount: healthData?.length || 0,
        lastUpdated: new Date()
      };
      
      dataCache.set(cacheKey, stats, 5 * 60 * 1000); // 5 minut
      return stats;
    } catch (error) {
      return {
        medicationsCount: 0,
        healthMetricsCount: 0,
        lastUpdated: null
      };
    }
  }
};

// Funkcja do czyszczenia cache po operacjach zapisu
export const invalidateCache = {
  medications: (userId: string) => {
    dataCache.invalidate(`medications_${userId}`);
    dataCache.invalidate(`stats_${userId}`);
  },
  
  dietPlans: (userId: string) => {
    dataCache.invalidate(`diet_plans_${userId}`);
    dataCache.invalidate(`stats_${userId}`);
  },
  
  all: (userId: string) => {
    dataCache.invalidate(userId);
  }
};
