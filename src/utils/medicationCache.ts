import { MedicationBase } from '../types/medications';


const CACHE_TTL = 5 * 60 * 1000;

type MedicationCache = {
  [key: string]: {
    data: MedicationBase[];
    timestamp: number;
    promise: Promise<MedicationBase[]> | null;
  };
};

const medicationCache: MedicationCache = {};

export const clearMedicationCache = (userId?: string) => {
  if (userId) {
    delete medicationCache[`user_${userId}`];
  } else {
    Object.keys(medicationCache).forEach(key => {
      delete medicationCache[key];
    });
  }
};

export const getCachedMedications = (userId: string): MedicationBase[] | null => {
  const cacheKey = `user_${userId}`;
  const cached = medicationCache[cacheKey];
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  return null;
};

export const getCachedPromise = (userId: string): Promise<MedicationBase[]> | null => {
  const cacheKey = `user_${userId}`;
  return medicationCache[cacheKey]?.promise || null;
};

export const setCache = (userId: string, data: MedicationBase[], promise: Promise<MedicationBase[]> | null = null) => {
  const cacheKey = `user_${userId}`;
  medicationCache[cacheKey] = {
    data,
    timestamp: Date.now(),
    promise
  };
};

export const clearPromise = (userId: string) => {
  const cacheKey = `user_${userId}`;
  if (medicationCache[cacheKey]) {
    medicationCache[cacheKey].promise = null;
  }
};
