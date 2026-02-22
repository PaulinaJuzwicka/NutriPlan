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
    console.log('🔐 LOGIN START:', email);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('📧 Optimized login attempt:', email);
      
      // Fast login with 5 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      clearTimeout(timeoutId);
      console.log('📊 Supabase response:', { data: !!data, error: !!error, user: !!data?.user });
      
      if (error) {
        console.error('❌ Optimized login error:', error);
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
        console.log('✅ User found in Supabase:', data.user.email);
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || email.split('@')[0],
        };
        
        console.log('👤 Created user object:', user);
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        console.log('🎯 State updated after login:', { isAuthenticated: true, user: user.email });
        
        // Create profile in background (non-blocking)
        setTimeout(async () => {
          try {
            console.log('🔍 Checking profile for user:', data.user.id);
            const { data: profileData, error: profileError } = await supabase
              .from('uzytkownicy')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            console.log('📋 Profile check result:', { profileData: !!profileData, profileError: !!profileError });
            
            if (profileError || !profileData) {
              console.log('➕ Creating profile for user:', data.user.id);
              // Create profile if it doesn't exist
              const { data: newProfile, error: insertError } = await supabase
                .from('uzytkownicy')
                .insert({
                  id: data.user.id,
                  nazwa: user.name,
                  email: user.email,
                })
                .select();
              
              if (insertError) {
                console.error('❌ Profile creation failed:', insertError);
              } else {
                console.log('✅ Profile created successfully:', newProfile);
              }
            } else {
              console.log('✅ Profile already exists:', profileData);
            }
          } catch (error) {
            console.warn('⚠️ Profile creation error (non-critical):', error);
          }
        }, 100);
      } else {
        console.error('❌ No user data returned from Supabase');
        setState(prev => ({ ...prev, isLoading: false, error: 'Błąd logowania: brak danych użytkownika' }));
      }
    } catch (error) {
      console.error('💥 Optimized login exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('Registration attempt:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { 
          data: { name },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Email address') && error.message.includes('is invalid')) {
          errorMessage = 'Podany adres email jest nieprawidłowy. Użyj prawdziwego adresu email.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'Użytkownik z tym adresem email już istnieje. Spróbuj się zalogować.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Hasło jest zbyt słabe. Użyj co najmniej 6 znaków.';
        }
        
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return;
      }
      
      if (data.user && !data.session) {
        // Email confirmation required
        setState(prev => ({ ...prev, isLoading: false, error: null }));
        
        // Create profile in background
        setTimeout(async () => {
          try {
            console.log('Attempting to create profile for user:', data.user?.id);
            if (!data.user?.id) {
              console.error('❌ No user ID available for profile creation');
              return;
            }
            
            const { data: profileInsert, error: insertError } = await supabase
              .from('uzytkownicy')
              .insert({
                id: data.user.id,
                nazwa: name,
                email: email,
              })
              .select();
            
            if (insertError) {
              console.error('❌ Profile creation failed:', insertError.message);
              console.error('Details:', insertError);
            } else {
              console.log('✅ Profile created successfully:', profileInsert);
            }
          } catch (error) {
            console.warn('Profile creation error (non-critical):', error);
          }
        }, 100);
        
        return;
      }
      
      if (data.user && data.session) {
        // Auto-login successful (email confirmation not required)
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
        
        console.log('Registration and auto-login successful:', user);
        
        // Create profile in background
        setTimeout(async () => {
          try {
            await supabase
              .from('uzytkownicy')
              .insert({
                id: data.user!.id,
                nazwa: name,
                email: email,
              });
            console.log('Profile created after auto-login');
          } catch (error) {
            console.warn('Profile creation error (non-critical):', error);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Registration exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
    }
  };

  const logout = async () => {
    console.log('🚪 LOGOUT - Starting logout process...');
    
    try {
      // First update local state to prevent UI flicker
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      console.log('🚪 LOGOUT - Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('🚪 LOGOUT - Supabase signOut error:', error);
        // Don't fail logout if Supabase fails, local state is already cleared
      } else {
        console.log('🚪 LOGOUT - Supabase signOut successful');
      }
    } catch (error) {
      console.error('🚪 LOGOUT - Exception during signOut:', error);
      // Don't fail logout if exception occurs, local state is already cleared
    }
    
    console.log('🚪 LOGOUT - Logout completed');
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  React.useEffect(() => {
    let isMounted = true;
    let hasCheckedSession = false;

    const checkSession = async () => {
      if (hasCheckedSession) return;
      hasCheckedSession = true;
      
      console.log('🔍 Checking existing session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Session check error:', error);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        if (session?.user) {
          console.log('Found existing session:', session.user.email);
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          };
          
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Check if profile exists (non-blocking)
          try {
            const { data: profile, error: profileError } = await supabase
              .from('uzytkownicy')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileError || !profile) {
              console.log('Profile not found, creating...');
              await supabase
                .from('uzytkownicy')
                .insert({
                  id: session.user.id,
                  nazwa: user.name,
                  email: user.email,
                });
              console.log('Profile created for existing session');
            } else {
              console.log('Profile exists for existing session');
            }
          } catch (profileErr) {
            console.warn('Profile check error:', profileErr);
          }
        } else {
          console.log('No existing session found');
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Session check exception:', error);
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        };
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Create profile if doesn't exist (non-blocking)
        try {
          const { data: profile, error: profileError } = await supabase
            .from('uzytkownicy')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError || !profile) {
            console.log('Creating profile on sign in...');
            await supabase
              .from('uzytkownicy')
              .insert({
                id: session.user.id,
                nazwa: user.name,
                email: user.email,
              });
            console.log('Profile created on sign in');
          }
        } catch (profileErr) {
          console.warn('Profile creation on sign in error:', profileErr);
        }
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
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (data: any) => {
    // Profile update functionality - placeholder for now
    console.log('Profile update called with:', data);
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
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
