// Auth Hook - The Inner Library
// Custom hook to access auth context from any component

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a safe default if used outside AuthProvider
    // This allows the app to work without the provider wrapped
    return {
      user: null,
      loading: false,
      error: null,
      signUp: async () => ({ user: null, error: 'Auth not configured' }),
      signIn: async () => ({ user: null, error: 'Auth not configured' }),
      signOut: async () => {},
      resetPassword: async () => ({ error: 'Auth not configured' }),
      hasRole: () => false,
      isAdmin: false,
      isConfigured: false,
    };
  }
  return context;
};
