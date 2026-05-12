// Profile operations for The Inner Library
// Interacts with til_profiles table

import supabase from '../auth/supabaseClient';
import { ROLES } from '../auth/AuthContext';

/**
 * Get current user's profile
 */
export const getCurrentProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { profile: null, error: null };

    const { data, error } = await supabase
      .from('til_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { profile: data, error };
  } catch (error) {
    return { profile: null, error };
  }
};

/**
 * Get profile by ID
 */
export const getProfileById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('til_profiles')
      .select('*')
      .eq('id', id)
      .single();

    return { profile: data, error };
  } catch (error) {
    return { profile: null, error };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { profile: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('til_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    return { profile: data, error };
  } catch (error) {
    return { profile: null, error };
  }
};

/**
 * Set user's preferred name
 */
export const setPreferredName = async (preferredName) => {
  return updateProfile({ preferred_name: preferredName });
};

/**
 * Set user's avatar URL
 */
export const setAvatarUrl = async (avatarUrl) => {
  return updateProfile({ avatar_url: avatarUrl });
};

/**
 * Mark onboarding as complete
 */
export const setOnboardingComplete = async () => {
  return updateProfile({
    onboarding_complete: true,
    updated_at: new Date().toISOString(),
  });
};

/**
 * Acknowledge crisis disclaimer
 */
export const acknowledgeCrisisDisclaimer = async () => {
  return updateProfile({
    crisis_acknowledged_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
};

/**
 * Get therapist's clients (for therapists)
 */
export const getTherapistClients = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { clients: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('til_profiles')
      .select('*')
      .eq('therapist_id', user.id)
      .eq('role', ROLES.CLIENT);

    return { clients: data || [], error };
  } catch (error) {
    return { clients: [], error };
  }
};

/**
 * Get therapist's client summary view
 */
export const getTherapistClientSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('til_therapist_client_summary')
      .select('*');

    return { summary: data || [], error };
  } catch (error) {
    return { summary: [], error };
  }
};

/**
 * Upload avatar image
 */
export const uploadAvatar = async (file) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { url: null, error: 'Not authenticated' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('til_avatars')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('til_avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { error: updateError } = await setAvatarUrl(publicUrl);

    return { url: publicUrl, error: updateError };
  } catch (error) {
    return { url: null, error };
  }
};