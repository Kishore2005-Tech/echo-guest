import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EchoMessage, MoodType, NewEchoInput, ConnectionInfo } from '../types/echo';

const STORAGE_KEY_URL = 'echo_custom_supabase_url';
const STORAGE_KEY_KEY = 'echo_custom_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getEffectiveCredentials(): { url: string; key: string; isCustom: boolean } {
  // 1. First check environment variables
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // 2. Next check in-browser user overrides (stored so user can test live immediately)
  let customUrl = '';
  let customKey = '';
  if (typeof window !== 'undefined') {
    customUrl = (localStorage.getItem(STORAGE_KEY_URL) || '').trim();
    customKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();
  }

  if (customUrl && customKey) {
    return { url: customUrl, key: customKey, isCustom: true };
  }

  return { url: envUrl, key: envKey, isCustom: false };
}

export function saveCustomCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  }
  // Reset cached client
  cachedClient = null;
}

export function clearCustomCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getEffectiveCredentials();

  // Validate format basic check
  if (!url || !key || url.includes('your-project') || key.includes('your-anon')) {
    return null;
  }

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getEffectiveCredentials();
  return Boolean(
    url &&
    key &&
    !url.includes('your-project') &&
    !key.includes('your-anon') &&
    url.startsWith('https://')
  );
}

/**
 * Diagnostic test to verify real connection and table readiness
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are not configured yet.',
    };
  }

  try {
    const { count, error } = await client
      .from('echo_messages')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.echo_messages" does not exist')) {
        return {
          success: false,
          message: 'Connected to Supabase, but the "echo_messages" table has not been created yet. Please execute the SQL schema in your Supabase SQL editor.',
        };
      }
      return {
        success: false,
        message: `Database error (${error.code || 'RLS'}): ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully connected to Supabase PostgreSQL! ${count ?? 0} echoes found.`,
      count: count ?? 0,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      success: false,
      message: `Failed to connect: ${message}`,
    };
  }
}

/**
 * Fetch messages with pagination and optional mood filter
 */
export async function fetchMessages(
  page: number = 0,
  pageSize: number = 9,
  moodFilter?: MoodType | 'All',
  searchQuery?: string
): Promise<{ data: EchoMessage[]; count: number; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: [],
      count: 0,
      error: 'SUPABASE_NOT_CONFIGURED',
    };
  }

  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = client
      .from('echo_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (moodFilter && moodFilter !== 'All') {
      query = query.eq('mood', moodFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim();
      query = query.or(`name.ilike.%${q}%,message.ilike.%${q}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      return {
        data: [],
        count: 0,
        error: error.message,
      };
    }

    return {
      data: (data as EchoMessage[]) || [],
      count: count || 0,
      error: null,
    };
  } catch (err: unknown) {
    return {
      data: [],
      count: 0,
      error: err instanceof Error ? err.message : 'Failed to query database',
    };
  }
}

/**
 * Insert a new message into the Supabase PostgreSQL echo_messages table
 */
export async function insertMessage(
  input: NewEchoInput
): Promise<{ data: EchoMessage | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: null,
      error: 'Supabase credentials are not configured. Please add your credentials in the Database Setup panel to save messages to the real database.',
    };
  }

  // Client-side validation matching database constraints
  const trimmedName = input.name.trim();
  const trimmedMessage = input.message.trim();

  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return {
      data: null,
      error: 'Name must be between 2 and 50 characters.',
    };
  }

  if (trimmedMessage.length < 3 || trimmedMessage.length > 500) {
    return {
      data: null,
      error: 'Message must be between 3 and 500 characters.',
    };
  }

  try {
    const { data, error } = await client
      .from('echo_messages')
      .insert([
        {
          name: trimmedName,
          message: trimmedMessage,
          mood: input.mood,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        return {
          data: null,
          error: 'Table "echo_messages" does not exist in your Supabase project. Please run the SQL schema script provided in the Database Setup panel.',
        };
      }
      return {
        data: null,
        error: error.message || 'Failed to submit echo to database.',
      };
    }

    return {
      data: data as EchoMessage,
      error: null,
    };
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error during insertion.',
    };
  }
}

/**
 * Seed 5 sample echoes into public.echo_messages table
 */
export async function seedSampleEchoes(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials are not configured yet.',
    };
  }

  const samples = [
    {
      name: 'Astrid Vance',
      message: 'Every word we whisper into this digital ocean finds an ear somewhere across the dark.',
      mood: 'Inspired' as MoodType,
    },
    {
      name: 'Marcus Chen',
      message: 'Grateful for quiet mornings, warm tea, and the unexpected kindness of strangers.',
      mood: 'Grateful' as MoodType,
    },
    {
      name: 'Lyra Sol',
      message: 'Is time just memory moving in a circle, or are we constantly making new ground?',
      mood: 'Curious' as MoodType,
    },
    {
      name: 'Soren K.',
      message: 'Finding calm in the spaces between thoughts today. May this stillness reach you.',
      mood: 'Peaceful' as MoodType,
    },
    {
      name: 'Amara Diop',
      message: 'We built something beautiful together today. Celebrating the small victories.',
      mood: 'Happy' as MoodType,
    },
  ];

  try {
    const { data, error } = await client
      .from('echo_messages')
      .insert(samples)
      .select();

    if (error) {
      return {
        success: false,
        message: `Failed to seed: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully seeded ${data?.length || 5} starter echoes into public.echo_messages!`,
      count: data?.length || 5,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to seed sample echoes',
    };
  }
}

