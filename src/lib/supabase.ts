import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const STORAGE_KEY_URL = 'supabase_project_url';
const STORAGE_KEY_ANON = 'supabase_anon_key';

// Default project or environment variables
const ENV_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
const ENV_ANON = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localAnon = localStorage.getItem(STORAGE_KEY_ANON) || '';

  return {
    url: localUrl || ENV_URL,
    anonKey: localAnon || ENV_ANON,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();

  if (cleanUrl) {
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (cleanKey) {
    localStorage.setItem(STORAGE_KEY_ANON, cleanKey);
  } else {
    localStorage.removeItem(STORAGE_KEY_ANON);
  }

  // Reset client instance
  cachedClient = null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

export function mapSupabaseUserToProfile(
  sbUser: SupabaseUser,
  preferredCurrency = 'QAR'
): UserProfile {
  const meta = sbUser.user_metadata || {};
  const fullName =
    meta.full_name ||
    meta.name ||
    (sbUser.email ? sbUser.email.split('@')[0] : 'User');
  const initials = fullName.substring(0, 2).toUpperCase();

  return {
    id: sbUser.id,
    name: fullName,
    email: sbUser.email || '',
    role: 'premium',
    tier: 'pro',
    avatarInitials: initials,
    joinedDate: sbUser.created_at
      ? sbUser.created_at.split('T')[0]
      : new Date().toISOString().split('T')[0],
    preferredCurrency: meta.preferred_currency || preferredCurrency,
    isFreeTrialActive: false,
    complimentaryConsultations: 5,
  };
}

// Sign in with Email & Password
export async function signInWithSupabase(email: string, password: string): Promise<UserProfile> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('No user returned from Supabase');
  }

  return mapSupabaseUserToProfile(data.user);
}

// Sign up with Email & Password
export async function signUpWithSupabase(
  name: string,
  email: string,
  password: string,
  preferredCurrency = 'QAR'
): Promise<UserProfile> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        preferred_currency: preferredCurrency,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Registration failed: no user returned');
  }

  return mapSupabaseUserToProfile(data.user, preferredCurrency);
}

// Sign in with GitHub OAuth via Supabase
export async function signInWithSupabaseGitHub(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const redirectUrl = window.location.origin;

  const { error } = await client.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }
}

// Sign in with Google OAuth via Supabase
export async function signInWithSupabaseGoogle(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const redirectUrl = window.location.origin;

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }
}

// Sign out from Supabase
export async function signOutFromSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut warning:', e);
    }
  }
}

// Check current session
export async function getCurrentSupabaseUser(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session?.user) return null;
    return mapSupabaseUserToProfile(session.user);
  } catch {
    return null;
  }
}

// Setup Auth State Change Listener
export function onSupabaseAuthStateChange(
  callback: (user: UserProfile | null) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  const { data: { subscription } } = client.auth.onAuthStateChange(
    (_event, session) => {
      if (session?.user) {
        callback(mapSupabaseUserToProfile(session.user));
      } else {
        callback(null);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}
