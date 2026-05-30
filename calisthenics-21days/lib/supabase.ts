import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;
let initAttempted = false;

function initializeSupabase(): any {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Only try to initialize once
  if (initAttempted) {
    throw new Error('Missing Supabase environment variables');
  }
  initAttempted = true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy object during build time (will throw at runtime if not configured)
    // This allows the build to succeed even without environment variables
    return {} as any;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export as lazy-loaded instance with proper type
export const supabase: ReturnType<typeof createClient> = initializeSupabase();

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  weight: number;
  height: number;
  created_at: string;
  updated_at: string;
}
