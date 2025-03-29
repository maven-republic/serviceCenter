'use server'

//import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { useLoaderStore } from '@/store/loaderStore'
import { createClient } from '../../../../utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()
  const { startLoading, stopLoading } = useLoaderStore.getState()

  startLoading();
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
    console.log(error.message);
    //Displaying Superbass error message
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  //revalidate path and redirect to homepage
  stopLoading();
  redirect('/dashboard')
}


 
