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
 
 
  // Sign up the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    password: password
  });

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message || 'Signup failed.'));
  }

  // Get the user's ID from the response
  const userId = data?.user?.id;

  

  // Begin transaction to create related records
  const { error: accountError } = await supabase
    .from('account')
    .insert([{
      account_id: userId, // Use auth user ID as account ID
      email: userEmail,
      password_hash: 'MANAGED_BY_SUPABASE', // Password is managed by Supabase Auth
      first_name: firstName,
      last_name: lastName,
      account_status: 'pending',
      email_verified: false
    }]);

  if (accountError) {
    redirect('/register?error=' + encodeURIComponent('Failed to create account.'));
  }

  // Create account role
  const { error: roleError } = await supabase
    .from('account_role')
    .insert([{
      account_id: userId,
      role_type: role, // Will directly be either 'professional' or 'customer'    ,
      is_primary: true
    }]);

  if (roleError) {
    redirect('/register?error=' + encodeURIComponent('Failed to assign role.'));
  }

  // Create phone number record
  const { error: phoneError } = await supabase
    .from('phone')
    .insert([{
      account_id: userId,
      phone_type: 'mobile',
      phone_number: phoneNumber,
      is_primary: true
    }]);

  if (phoneError) {
    redirect('/register?error=' + encodeURIComponent('Failed to save phone number.'));
  }

  // Create profile based on role
  if (role === 'customer') {
    const { error: customerError } = await supabase
      .from('individual_customer')
      .insert([{
        account_id: userId,
        gender: gender
      }]);
    
    if (customerError) {
      redirect('/register?error=' + encodeURIComponent('Failed to create customer profile.'));
    }
  } else if (role === 'service_provider') {
    const { error: professionalError } = await supabase
      .from('individual_professional')
      .insert([{
        account_id: userId,
        verification_status: 'pending'
      }]);
    
    if (professionalError) {
      redirect('/register?error=' + encodeURIComponent('Failed to create professional profile.'));
    }
  }

  stopLoading()
  redirect('/login');
}