import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

let client: SupabaseClient;

if (isSupabaseConfigured) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });
} else {
  // Graceful Local Fallback Client when Supabase keys are pending in .env
  const mockStorageKey = 'travel_copilot_supabase_session';
  const getStoredUser = () => {
    try {
      const item = localStorage.getItem(mockStorageKey);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  };

  const setStoredUser = (user: any) => {
    if (user) {
      localStorage.setItem(mockStorageKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(mockStorageKey);
    }
  };

  // Mock implementation with standard Supabase interface
  client = {
    auth: {
      getUser: async () => {
        const u = getStoredUser();
        return { data: { user: u }, error: null };
      },
      getSession: async () => {
        const u = getStoredUser();
        return { data: { session: u ? { user: u, access_token: 'mock-token' } : null }, error: null };
      },
      signInAnonymously: async () => {
        const anonymousUser = {
          id: `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          email: null,
          is_anonymous: true,
          user_metadata: {
            display_name: 'Traveler',
            travel_style: 'Balanced',
            preferred_currency: 'INR'
          },
          created_at: new Date().toISOString()
        };
        setStoredUser(anonymousUser);
        return { data: { user: anonymousUser, session: { user: anonymousUser, access_token: 'anon-token' } }, error: null };
      },
      signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
        const user = {
          id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email,
          is_anonymous: false,
          user_metadata: {
            display_name: email.split('@')[0],
            travel_style: 'Balanced',
            preferred_currency: 'INR'
          },
          created_at: new Date().toISOString()
        };
        setStoredUser(user);
        return { data: { user, session: { user, access_token: 'auth-token' } }, error: null };
      },
      signUp: async ({ email, password, options }: { email: string; password?: string; options?: any }) => {
        const user = {
          id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email,
          is_anonymous: false,
          user_metadata: {
            display_name: options?.data?.display_name || email.split('@')[0],
            travel_style: options?.data?.travel_style || 'Balanced',
            preferred_currency: 'INR'
          },
          created_at: new Date().toISOString()
        };
        setStoredUser(user);
        return { data: { user, session: { user, access_token: 'auth-token' } }, error: null };
      },
      signOut: async () => {
        setStoredUser(null);
        return { error: null };
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        const u = getStoredUser();
        callback('INITIAL_SESSION', u ? { user: u } : null);
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      }
    },
    from: (table: string) => {
      // Local storage backed simple repository for trips/profiles/saved data
      const storagePrefix = `tc_table_${table}_`;
      return {
        select: (columns = '*') => ({
          eq: (column: string, value: any) => ({
            single: async () => {
              const item = localStorage.getItem(`${storagePrefix}${column}_${value}`);
              return { data: item ? JSON.parse(item) : null, error: null };
            },
            data: async () => {
              const item = localStorage.getItem(`${storagePrefix}${column}_${value}`);
              return { data: item ? [JSON.parse(item)] : [], error: null };
            }
          }),
          order: () => ({
            data: async () => ({ data: [], error: null })
          })
        }),
        insert: (rows: any | any[]) => ({
          select: () => ({
            single: async () => {
              const row = Array.isArray(rows) ? rows[0] : rows;
              const id = row.id || `rec_${Date.now()}`;
              const fullRow = { ...row, id, created_at: new Date().toISOString() };
              localStorage.setItem(`${storagePrefix}id_${id}`, JSON.stringify(fullRow));
              return { data: fullRow, error: null };
            }
          })
        }),
        upsert: (rows: any | any[]) => ({
          select: () => ({
            single: async () => {
              const row = Array.isArray(rows) ? rows[0] : rows;
              const id = row.id || `rec_${Date.now()}`;
              const fullRow = { ...row, id, updated_at: new Date().toISOString() };
              localStorage.setItem(`${storagePrefix}id_${id}`, JSON.stringify(fullRow));
              return { data: fullRow, error: null };
            }
          })
        })
      };
    }
  } as unknown as SupabaseClient;
}

export const supabase = client;
export default supabase;
