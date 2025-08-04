// src/primitives/customer/useCustomerAuth.js
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUserStore } from '@/store/userStore';

export const useCustomerAuth = () => {
  const [authState, setAuthState] = useState({
    loading: true,
    hasValidSession: false,
    sessionError: null,
    customerInformation: null
  });
  
  const { user, clearUser } = useUserStore();

  const checkAuthenticationState = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const supabase = createClient();
      
      // Check for valid Supabase session
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult.data?.session;
      const sessionError = sessionResult.error;

      console.log('🔐 Session check:', { 
        hasSession: !!session, 
        sessionError,
        userStoreEmail: user?.email,
        sessionUserEmail: session?.user?.email
      });

      if (session?.user?.id) {
        console.log('✅ Valid session found for user:', session.user.email);
        
        // Get customer data
        const { data: customerInformation, error: customerError } = await supabase
          .from('individual_customer')
          .select('*')
          .eq('account_id', session.user.id)
          .single();

        console.log('🏠 Customer lookup result:', { customerInformation, customerError });

        if (customerInformation) {
          setAuthState({
            loading: false,
            hasValidSession: true,
            sessionError: null,
            customerInformation
          });
        } else {
          console.log('❌ No customer profile found for this user');
          setAuthState({
            loading: false,
            hasValidSession: false,
            sessionError: 'Customer profile not found. This might be a professional account.',
            customerInformation: null
          });
        }
      } else {
        console.log('❌ No valid session found');
        setAuthState({
          loading: false,
          hasValidSession: false,
          sessionError: sessionError?.message || 'No active session',
          customerInformation: null
        });

        // Clear the user store since the session is invalid
        if (user && clearUser) {
          console.log('🗑️ Clearing stale user store data');
          clearUser();
        }
      }
    } catch (error) {
      console.error('💥 Auth check error:', error);
      setAuthState({
        loading: false,
        hasValidSession: false,
        sessionError: error.message,
        customerInformation: null
      });
    }
  };

  useEffect(() => {
    checkAuthenticationState();
  }, []);

  return {
    ...authState,
    refreshAuth: checkAuthenticationState,
    user
  };
};