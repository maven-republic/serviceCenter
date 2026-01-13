// src/primitives/professional/useProfessionalAuth.js
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUserStore } from '@/store/userStore';

export const useProfessionalAuth = () => {
  const [authState, setAuthState] = useState({
    loading: true,
    hasValidSession: false,
    sessionError: null,
    professionalInformation: null
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

      console.log('🔍 Professional Session check:', { 
        hasSession: !!session, 
        sessionError,
        userStoreEmail: user?.email,
        sessionUserEmail: session?.user?.email
      });

      if (session?.user?.id) {
        console.log('✅ Valid session found for professional:', session.user.email);
        
        // Get professional data
        const { data: professionalInformation, error: professionalError } = await supabase
          .from('individual_professional')
          .select('*')
          .eq('account_id', session.user.id)
          .single();

        console.log('💼 Professional lookup result:', { professionalInformation, professionalError });

        if (professionalInformation) {
          setAuthState({
            loading: false,
            hasValidSession: true,
            sessionError: null,
            professionalInformation
          });
        } else {
          console.log('❌ No professional profile found for this user');
          setAuthState({
            loading: false,
            hasValidSession: false,
            sessionError: 'Professional profile not found. This might be a customer account.',
            professionalInformation: null
          });
        }
      } else {
        console.log('❌ No valid session found');
        setAuthState({
          loading: false,
          hasValidSession: false,
          sessionError: sessionError?.message || 'No active session',
          professionalInformation: null
        });

        // Clear the user store since the session is invalid
        if (user && clearUser) {
          console.log('🗑️ Clearing stale user store data');
          clearUser();
        }
      }
    } catch (error) {
      console.error('💥 Professional auth check error:', error);
      setAuthState({
        loading: false,
        hasValidSession: false,
        sessionError: error.message,
        professionalInformation: null
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