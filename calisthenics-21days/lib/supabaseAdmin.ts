import { createClient } from '@supabase/supabase-js';

let adminInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (adminInstance) return adminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  adminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminInstance;
}
