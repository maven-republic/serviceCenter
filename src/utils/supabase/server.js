import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies() // ✅ Await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}