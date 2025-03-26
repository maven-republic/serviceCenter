'use server'

//import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../../utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  //Extract email and password from form data
  const userEmail = formData.get('email')
  const userPassword = formData.get('password')


  // Validate email and password
  if (!userEmail || !userPassword) {
   // redirect('/error')
    redirect ('/login?error=' +encodeURIComponent ('Email and password are required.' ))
  }


  //Sign in user with email and password
  const { error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: userPassword,
  })

  //debug purposes
  console.log('Supabase signIn error:', error)

 //Handle Error
  if (error) {
    //Displaying Superbass error message
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  //revalidate path and redirect to homepage
  // revalidatePath('/')
  // return redirect('/')
  redirect('/dashboard')

  // return {success: true}

}


 
