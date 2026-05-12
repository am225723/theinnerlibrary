// Auth Context Provider - The Inner Library
// Provides authentication state management with Supabase
// Supports client and admin/therapist roles

import React, { createContext, useState, useEffect, useCallback } from 'react';
import supabase, { isSupabaseConfigured } from './supabaseClient';

export const AuthContext = createContext(null);

// Role constants
export const ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
  THERAPIST: 'therapist',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await getUserProfile(session.user);
          setUser(userProfile);
        }
      } catch (err) {
        console.error('Error getting session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await getUserProfile(session.user);
          setUser(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Get user profile with role from til_profiles table
  const getUserProfile = async (authUser) => {
    try {
      // Try to fetch profile from til_profiles table
      const { data: profile, error } = await supabase
        .from('til_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.warn('Profile fetch error, using metadata:', error);
        // Fallback to user metadata
        const role = authUser.app_metadata?.role || authUser.user_metadata?.role || ROLES.CLIENT;
        return {
          id: authUser.id,
          email: authUser.email,
          role: role,
          createdAt: authUser.created_at,
          lastSignIn: authUser.last_sign_in_at,
          metadata: authUser.user_metadata || {},
        };
      }

      // Use profile from database
      return {
        id: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        preferredName: profile.preferred_name,
        therapistId: profile.therapist_id,
        onboardingComplete: profile.onboarding_complete,
        createdAt: profile.created_at,
        lastSignIn: profile.last_sign_in_at,
        metadata: authUser.user_metadata || {},
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to user metadata
      const role = authUser.app_metadata?.role || authUser.user_metadata?.role || ROLES.CLIENT;
      return {
        id: authUser.id,
        email: authUser.email,
        role: role,
        createdAt: authUser.created_at,
        lastSignIn: authUser.last_sign_in_at,
        metadata: authUser.user_metadata || {},
      };
    }
  };

  // Sign up with email and password
  const signUp = useCallback(async (email, password, displayName = '') => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Please set up Supabase environment variables.');
      return { user: null, error: 'not_configured' };
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: ROLES.CLIENT, // Default role is client
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { user: null, error: signUpError.message };
      }

      // If email confirmation is not required, user is signed in immediately
      if (data.user && !data.session) {
        setError('Please check your email to confirm your account.');
        return { user: null, error: null, needsConfirmation: true };
      }

      return { user: data.user, error: null };
    } catch (err) {
      const message = err.message || 'An error occurred during sign up';
      setError(message);
      return { user: null, error: message };
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Please set up Supabase environment variables.');
      return { user: null, error: 'not_configured' };
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { user: null, error: signInError.message };
      }

      return { user: data.user, error: null };
    } catch (err) {
      const message = err.message || 'An error occurred during sign in';
      setError(message);
      return { user: null, error: message };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setUser(null);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured.');
      return { error: 'not_configured' };
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/login`,
      });

      if (resetError) {
        setError(resetError.message);
        return { error: resetError.message };
      }

      return { error: null };
    } catch (err) {
      const message = err.message || 'An error occurred';
      setError(message);
      return { error: message };
    }
  }, []);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user is admin/therapist
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.THERAPIST;

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    hasRole,
    isAdmin,
    isConfigured: isSupabaseConfigured(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
