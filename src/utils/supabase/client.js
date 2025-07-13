'use client';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

let supabaseClient = null;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createPagesBrowserClient();
  }
  return supabaseClient;
}

export async function getSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
