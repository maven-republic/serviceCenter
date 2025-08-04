// app/(auth)/logout/actions.jsx
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut({
    scope: 'global' // This ensures all sessions are cleared
  })
  
  if (error) {
    console.error('Logout error:', error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}