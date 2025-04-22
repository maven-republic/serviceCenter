import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function getSession() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}

// // utils/supabase/client.js
// import { createClient } from '@supabase/supabase-js';

// // Create a single supabase client for interacting with your database
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );

// export default supabase;