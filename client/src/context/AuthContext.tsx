'use client'

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import {jwtDecode} from 'jwt-decode';
import { AuthService } from '@/services/auth.service';
import { AuthState, UserType } from '@/types/auth';

// Define the initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null, 
};

// Define action types
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserType; token: string } }
  | { type: 'REGISTER_SUCCESS'; payload: { user: UserType; token: string } }
  | { type: 'USER_LOADED'; payload: UserType }
  | { type: 'AUTH_ERROR' }
  | { type: 'LOGIN_FAIL'; payload: string }
  | { type: 'REGISTER_FAIL'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Create the reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      // Store token in localStorage
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Authentication error',
      };
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      // Remove token from localStorage
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create the context
type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { ...context, user: context.state.user };
};

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'AUTH_ERROR' });
        return;
      }

      try {
        // Check if token is expired
        const decoded: any = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          dispatch({ type: 'AUTH_ERROR' });
          return;
        }

        // Get user data
        const response = await AuthService.getCurrentUser();
        dispatch({ type: 'USER_LOADED', payload: response.user });
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAIL', payload: message });
    }
  };

  // Register function
  const register = async (fullName: string, email: string, password: string) => {
    try {
      const response = await AuthService.register({ fullName, email, password });
      dispatch({ type: 'REGISTER_SUCCESS', payload: response });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAIL', payload: message });
    }
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};