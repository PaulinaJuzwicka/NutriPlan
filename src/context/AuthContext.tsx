import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types';
import { userService } from '../services/userService';
import { supabase } from '../lib/supabase';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'UPDATE_PROFILE_SUCCESS'; payload: Partial<User> }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SESSION_CHECKED' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isInitializing: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        isInitializing: false,
        error: action.payload,
      };
    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isInitializing: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SESSION_CHECKED':
      return {
        ...state,
        isInitializing: false,
      };
    default:
      return state;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000) 
      );

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise])
        .catch(err => {
          console.error('Login timeout or error:', err);
          throw new Error('Connection timeout. Please check your internet connection.');
        }) as { data: any, error: any };

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data?.user) {
        const profile = await userService.getProfile(data.user.id);
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: {
            id: data.user.id,
            email: data.user.email!,
            name: profile.name,
            dietaryRestrictions: profile.dietary_restrictions || [],
            healthConditions: profile.health_conditions || [],
            createdAt: data.user.created_at,
          }
        });
      } else {
        throw new Error('No user data returned from authentication');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login failed:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      dispatch({ type: 'REGISTER_START' });
      
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (user) {
        await userService.updateProfile(user.id, { name });
        dispatch({ 
          type: 'REGISTER_SUCCESS', 
          payload: {
            id: user.id,
            email: user.email!,
            name,
            dietaryRestrictions: [],
            healthConditions: [],
            createdAt: user.created_at!,
          }
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) return;

    try {
      
      await userService.updateProfile(state.user.id, data);
      
      
      const updatedUser = await userService.getProfile(state.user.id);

      
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: updatedUser });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          if (mounted) {
            dispatch({ type: 'SESSION_CHECKED' });
          }
          return;
        }

        if (session?.user && mounted) {
          try {
            const profile = await userService.getProfile(session.user.id);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                dietaryRestrictions: profile.dietary_restrictions || [],
                healthConditions: profile.health_conditions || [],
                createdAt: session.user.created_at,
              },
            });
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error('Unexpected error during session check:', error);
      } finally {
        if (mounted) {
          dispatch({ type: 'SESSION_CHECKED' });
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        updateProfile,
        logout,
        clearError,
        isInitializing: state.isInitializing ?? true,
      }}
    >
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