'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../../../utils/supabase/server'
import { useLoaderStore } from '@/store/loaderStore'
export async function signup(formData) {
  const supabase = await createClient();
 const { startLoading, stopLoading } = useLoaderStore.getState()

  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName'); 
  const userEmail = formData.get('email');
  const phoneNumber = formData.get('phone');
  const gender = formData.get('gender');
  const role = formData.get('role');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  startLoading()
  // Validate required fields
  if (!userEmail || !password) {
    redirect('/register?error=' + encodeURIComponent('Email and password are required.'));
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    redirect('/register?error=' + encodeURIComponent('Passwords do not match.'));
  }

  // Check if user already exists
  const { data: existingUsers, error: userCheckError } = await supabase.auth.admin.listUsers()
 
  const existingUser = existingUsers.users.find((user) => {
        console.log(user.email, userEmail);
        return userEmail === user.email
    })
    console.log(existingUser);
  if (userCheckError && userCheckError.code !== 'PGRST116') { 
    // Ignore 'PGRST116' (no records found), but handle any other errors
    redirect('/register?error=' + encodeURIComponent('Error checking user existence.'));
  }
// console.log(existingUser);
  if (existingUser) {
    redirect('/register?error=' + encodeURIComponent('Email is already registered. Please log in.'));
  }

  const { data: existingUserDetails, error: fetchError } = await supabase
  .from('user_details')
  .select('id')
  .eq('phone', phoneNumber)
  .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking phone number:', fetchError);
  }
  
  if (existingUserDetails) {
    console.error('Phone number already in use:', phoneNumber); 
    redirect('/register?error=' + encodeURIComponent("This phone number is already registered."));
  }
  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    password: password,  
    options: {
        data: {
            phone: phoneNumber
        }
      }
  });

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message || 'Signup failed.'));
  }

  // Get the user's ID from the response
  const userId = data?.user?.id;

  const { error: detailsError } = await supabase
  .from('user_details')
  .insert([
    {
        id: userId, // Ensure the ID matches auth.users.id
        role: role,
        full_name: firstName+" "+lastName,
        gender: gender,
        profile_img: "",
        phone: phoneNumber,
        created_at: new Date(),
        updated_at: new Date(),
    }
  ]);
  console.log("detailsError: ", detailsError);

  stopLoading()
  // Redirect on successful signup
  redirect('/login'); // Change to your success page
}
