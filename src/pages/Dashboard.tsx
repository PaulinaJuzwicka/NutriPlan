import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';
import { useUserData } from '../context/UserDataContext';
import { usePageState } from '../hooks/usePageState';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Pill,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { MedicationBase } from '../types/medications';
import TodaysMedications from '../components/dashboard/TodaysMedications';
import { supabase } from '../lib/supabase';
import { dataCache } from '../utils/dataOptimization';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const { data: userData, refreshData } = useUserData();
  const user = state.user;
  const navigate = useNavigate();
  const { isRestored, saveState } = usePageState('dashboard');
  const medications = userData.medications;

  // Restore and save page state
  useEffect(() => {
    if (isRestored) {
      // Page state restored
    }
  }, [isRestored]);

  // Save scroll position
  useEffect(() => {
    saveState({
      scrollPosition: window.scrollY,
      formData: {
        lastVisit: new Date().toISOString()
      }
    });
  }, [userData.lastUpdated, saveState]);

  // Prefetch wyłączony - dane są teraz ładowane przez UserDataProvider
  // useEffect(() => {
  //   if (user) {
  //     console.log('🏠 DASHBOARD - Starting prefetch for user:', user.id);
  //     // Prefetch leków i planów dietetycznych w tle
  //     dataCache.prefetch(
  //       `medications_${user.id}`,
  //       () => medicationService.getMedications(user.id),
  //       2 * 60 * 1000 // 2 minuty cache
  //     );
  //     console.log('🏠 DASHBOARD - Prefetch initiated');
  //   }
  // }, [user?.id]);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      return;
    }

    // Check if we already have recent data
    const dataAge = userData.lastUpdated ? Date.now() - userData.lastUpdated.getTime() : Infinity;
    const hasData = userData.medications && userData.medications.length > 0;
    
    if (hasData && dataAge < 5 * 60 * 1000) { // 5 minutes
      return;
    }

    // Dane są teraz zarządzane przez UserDataProvider - nie wywołuj refreshData tutaj
    // UserDataProvider już zarządza odświeżaniem danych
  }, [user?.id]); // Usuń zależności od userData i refreshData

  useEffect(() => {
    if (user) {
      // Tylko sprawdzamy stan - nie wywołujemy fetchUserData
      // UserDataProvider zarządza odświeżaniem danych
    }
  }, [user?.id]); // Proste zależności

  if (userData.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Witaj, {user?.name || 'Użytkowniku'}! 👋
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            {new Date().toLocaleDateString('pl-PL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/medications/add"
              className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Dodaj lek</span>
            </Link>

            <Link
              to="/health"
              className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Panel zdrowia</span>
            </Link>

            <Link
              to="/recipes/new"
              className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Dodaj przepis</span>
            </Link>

            <Link
              to="/diet-plans/new"
              className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Stwórz plan</span>
            </Link>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-4xl mx-auto">
          {/* Medication Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Przypomnienia o lekach</CardTitle>
              <p className="text-sm text-gray-600">Zarządzaj swoimi lekami i przypomnieniami</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                      Masz {medications.length} {medications.length === 1 ? 'lek' : medications.length >= 2 && medications.length <= 4 ? 'leki' : 'leków'} na dzisiaj
                    </h4>
                      <p className="text-sm text-blue-700">Sprawdź szczegóły i zarządzaj przyjmowaniem</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/medications')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Zarządzaj lekami
                  </button>
                </div>
                
                {medications.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medications.slice(0, 4).map((medication) => (
                      <div key={medication.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{medication.nazwa}</h5>
                            <p className="text-sm text-gray-600">{medication.dawka}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {medication.godziny_przyjmowania && medication.godziny_przyjmowania.length > 0
                                ? `Godziny: ${medication.godziny_przyjmowania.join(', ')}`
                                : 'Brak ustawionych godzin'}
                            </p>
                          </div>
                          <Pill className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
