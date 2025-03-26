'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../../utils/supabase/server'
import { getDisplayName } from 'next/dist/shared/lib/utils'

export async function signup(formData) {
  const supabase = await createClient()

 const userEmail = formData.get('email')
 const userPassword = formData.get('password')
 const role = formData.get('role') || 'customer' //default role is customer
 
  // Validate email and password
 if (!userEmail || !userPassword) {
  redirect('/register?error=' + encodeURIComponent('Email and password are required.'))
 }

//  const data = {
//   email: userEmail,
//   password: userPassword,
//   role: role,
//  }


//Attempt to sign up the user and collect metadata as well
  const { error } = await supabase.auth.signUp({
    email: userEmail,
    password: userPassword,
    options: {
      data: {
        role: role,
        getDisplayName: formData.get('displayName'),
        username : formData.get('username')
      }
    }
  })

  // If there is an error, redirect back to the register page with the error message
  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message || 'Signup failed'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}