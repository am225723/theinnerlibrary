// Supabase Client Configuration - The Inner Library
// Environment variables are used to configure the Supabase connection.
// Create a .env file in the project root with:
//   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
//   REACT_APP_SUPABASE_ANON_KEY=your-anon-key

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Only create the client if both values are provided
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export const isSupabaseConfigured = () => {
  return supabase !== null;
};

export default supabase;
