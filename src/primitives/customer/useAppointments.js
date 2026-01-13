// src/primitives/customer/useAppointments.js
import { useState, useEffect } from 'react';

export const useAppointments = (customerId) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async (customerIdToFetch) => {
    if (!customerIdToFetch) {
      console.log('❌ No customer ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Loading appointments for customer:', customerIdToFetch);
      
      const url = `/api/customers/${customerIdToFetch}/appointments`;
      console.log('📡 Fetching URL:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Error response body:', errorData);
        } catch (parseError) {
          console.error('❌ Could not parse error response as JSON:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = await response.json();
        console.log('✅ Response data structure:', {
          success: data.success,
          appointmentsCount: data.appointments?.length,
          hasError: !!data.error,
          keys: Object.keys(data)
        });
      } catch (parseError) {
        console.error('❌ Could not parse success response as JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      if (data.success) {
        const appointmentsArray = data.appointments || [];
        
        // ✅ FIX: Validate each appointment has required fields
        const validatedAppointments = appointmentsArray.map((apt, index) => {
          if (!apt.appointment_id) {
            console.error(`❌ Appointment at index ${index} missing appointment_id:`, apt);
          }
          return {
            ...apt,
            // Ensure appointment_id is present
            appointment_id: apt.appointment_id || `missing-id-${index}`,
          };
        });
        
        setAppointments(validatedAppointments);
        console.log(`✅ Successfully loaded ${validatedAppointments.length} appointments`);
        
        // Log first appointment structure for debugging
        if (validatedAppointments.length > 0) {
          console.log('📋 First appointment structure:', {
            appointment_id: validatedAppointments[0].appointment_id,
            hasAppointmentId: !!validatedAppointments[0].appointment_id,
            keys: Object.keys(validatedAppointments[0])
          });
        }
      } else {
        const errorMessage = data.error || data.details || 'Unknown error from API';
        console.error('❌ API returned success: false:', {
          error: data.error,
          details: data.details,
          hint: data.hint
        });
        setError(errorMessage);
      }
      
    } catch (error) {
      console.error('💥 Fetch error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage;
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out after 30 seconds';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error - check your connection';
      } else {
        errorMessage = `Failed to load appointments: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      console.log('🔄 useEffect triggered with customerId:', customerId);
      fetchAppointments(customerId);
    } else {
      console.log('⏭️ Skipping fetch - no customerId provided');
    }
  }, [customerId]);

  return {
    appointments,
    loading,
    error,
    refetch: () => {
      console.log('🔄 Manual refetch triggered');
      return fetchAppointments(customerId);
    }
  };
};