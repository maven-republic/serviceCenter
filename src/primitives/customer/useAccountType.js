// src/primitives/customer/useAccountType.js
import { createClient } from '@/utils/supabase/client';

export const useAccountType = () => {
  const checkAccountType = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        return { error: 'No active session found' };
      }

      console.log('🔍 Checking account type for:', session.user.email);
      
      // Check if this is a customer account
      const { data: customerInformation } = await supabase
        .from('individual_customer')
        .select('*')
        .eq('account_id', session.user.id)
        .single();
      
      // Check if this is a professional account
      const { data: professionalData } = await supabase
        .from('individual_professional')
        .select('*')
        .eq('account_id', session.user.id)
        .single();
      
      console.log('👥 Account type check results:');
      console.log('  Customer:', customerInformation ? '✅ Yes' : '❌ No');
      console.log('  Professional:', professionalData ? '✅ Yes' : '❌ No');
      
      return {
        email: session.user.email,
        isCustomer: !!customerInformation,
        isProfessional: !!professionalData,
        customerData: customerInformation,
        professionalData: professionalData
      };
    } catch (error) {
      console.error('Account check error:', error);
      return { error: error.message };
    }
  };

  const restoreSession = async (userEmail) => {
    try {
      console.log('🔄 Attempting to restore Supabase session...');
      
      const supabase = createClient();
      
      if (userEmail) {
        console.log('👤 Found user email in store:', userEmail);
        
        // Try to refresh any existing tokens
        const { data, error } = await supabase.auth.refreshSession();
        console.log('🔄 Refresh attempt result:', { data, error });
        
        if (data?.session) {
          console.log('✅ Session restored!');
          return { success: true, message: 'Session restored!' };
        }
        
        console.log('❌ Cannot restore session automatically');
        return { 
          success: false, 
          message: `Session expired for ${userEmail}. Please log in again.`,
          redirectToLogin: true,
          email: userEmail
        };
      } else {
        console.log('❌ No user email found in store');
        return { 
          success: false, 
          message: 'No user data found. Please log in.',
          redirectToLogin: true
        };
      }
    } catch (error) {
      console.error('💥 Session restoration error:', error);
      return { 
        success: false, 
        message: `Error restoring session: ${error.message}` 
      };
    }
  };

  return {
    checkAccountType,
    restoreSession
  };
}; 