import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile?: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = async (email: string, password: string) => {
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      
      
      if (error) {
        
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Nieprawidłowy email lub hasło. Spróbuj ponownie.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Konto nie zostało potwierdzone. Sprawdź swoją skrzynkę email.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut.';
        }
        
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return;
      }
      
      if (data.user) {
        
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || email.split('@')[0],
        };
        
        
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        
        
        // Create profile
        try {
          
          const { data: profileData, error: profileError } = await supabase
            .from('uzytkownicy')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          
          
          if (profileError || !profileData) {
            
            // Create profile if it doesn't exist
            const { data: newProfile, error: insertError } = await supabase
              .from('uzytkownicy')
              .insert({
                id: data.user.id,
                nazwa: user.name,
                email: user.email,
              })
              .select()
              .single();

            if (insertError) {
              
            } else {
              
            }
          } else {
            
          }
        } catch (error) {

        }
      }
    } catch (error) {
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
      }));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        return;
      }

      if (data.user && !data.session) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Konto zostało utworzone. Sprawdź email i kliknij w link potwierdzający.',
        }));
        return;
      }

      if (data.user && data.session) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || name,
        };

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        
        
        // Create profile
        try {
          
          if (!data.user?.id) {
            
            return;
          }

          const { data: profileInsert, error: insertError } = await supabase
            .from('uzytkownicy')
            .insert({
              id: data.user.id,
              nazwa: name,
              email: email,
            })
            .select()
            .single();

          if (insertError) {
            
            
          } else {
            
          }
        } catch (error) {

        }
      }
    } catch (error) {
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Wystąpił nieoczekiwany błąd podczas rejestracji.',
      }));
    }
  };

  const logout = async () => {
    
    
    try {
      // First update local state to prevent UI flicker
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      ...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        
        // Don't fail logout if Supabase fails, local state is already cleared
      } else {
        
      }
    } catch (error) {
      
      // Don't fail logout if exception occurs, local state is already cleared
    }
    
    
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const updateProfile = async (data: any) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { error } = await supabase
        .from('uzytkownicy')
        .update(data)
        .eq('id', state.user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Nie udało się zaktualizować profilu.',
      }));
    }
  };

  // Check for existing session on mount
  React.useEffect(() => {
    let isMounted = true;
    let hasCheckedSession = false;

    const checkSession = async () => {
      if (hasCheckedSession || !isMounted) return;
      hasCheckedSession = true;
      
      
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error && !error.message.includes('Invalid session')) {
          
        }
        
        if (session?.user && isMounted) {
          
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
          };

          // Check if profile exists
          try {
            const { data: profile, error: profileError } = await supabase
              .from('uzytkownicy')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileError || !profile) {
              
              await supabase
                .from('uzytkownicy')
                .insert({
                  id: session.user.id,
                  nazwa: user.name,
                  email: user.email,
                });
              
            } else {
              
            }
          } catch (profileErr) {
            
          }

          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          
          if (isMounted) {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        
        if (isMounted) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
        };

        // Check if profile exists
        try {
          const { data: profile, error: profileError } = await supabase
            .from('uzytkownicy')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError || !profile) {
            
            await supabase
              .from('uzytkownicy')
              .insert({
                id: session.user.id,
                nazwa: user.name,
                email: user.email,
              });
          }
        } catch (profileErr) {
          
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
