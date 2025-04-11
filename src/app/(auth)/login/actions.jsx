'use server'

//import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { useLoaderStore } from '@/store/loaderStore'
// import { useUserStore } from '@/store/userStore'
import { createClient } from '../../../../utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()
  // const { fetchUser } = useUserStore()

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
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: userPassword,
  })
  // console.log("data: ", data);
  // useEffect(() => {
  //   fetchUser(userId)
  // }, [userId])
  
  //debug purposes
  console.log('Supabase signIn error:', error)

 //Handle Error
  if (error) {
    console.log(error.message);
    //Displaying Superbass error message
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Add email verification synchronization here
  const user = data.user
  if (user.email_confirmed_at) {
    // Update account table to match authentication status
    const { error: syncError } = await supabase
      .from('account')
      .update({ email_verified: true })
      .eq('account_id', user.id)
    
    if (syncError) {
      console.error('Failed to sync email verification status:', syncError)
    }
  }

  //revalidate path and redirect to homepage
  stopLoading();
  redirect('/dashboard')
}


 
