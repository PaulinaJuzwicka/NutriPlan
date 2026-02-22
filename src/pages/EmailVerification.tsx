import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EmailVerification: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Sprawdź czy użytkownik jest zweryfikowany
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email_confirmed_at) {
          setIsVerified(true);
        } else if (user && !user.email_confirmed_at) {
          setIsVerified(false);
        } else {
          // Brak użytkownika - przekieruj do logowania
          window.location.href = '/login';
        }
      } catch (err) {
        setError('Nie udało się sprawdzić status weryfikacji');
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, []);

  const handleResendEmail = async () => {
    setIsResending(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email!,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) {
          setError('Nie udało się wysłać emaila weryfikacyjnego');
        } else {
          setError(null);
        }
      }
    } catch (err) {
      setError('Wystąpił błąd podczas wysyłania emaila');
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Sprawdzanie statusu weryfikacji...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Email zweryfikowany!</h2>
            <p className="text-gray-600 mb-6">
              Twoje konto zostało pomyślnie zweryfikowane. Możesz teraz się zalogować.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Przejdź do logowania
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Weryfikacja emaila</h2>
          <p className="text-gray-600 mb-6">
            Sprawdź swoją skrzynkę email i kliknij w link weryfikacyjny, aby aktywować konto.
          </p>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Wyślij ponownie
              </>
            )}
          </button>
          
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Wróć do logowania
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
