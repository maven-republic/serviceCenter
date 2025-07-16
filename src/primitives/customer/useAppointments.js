// src/primitives/customer/useAppointments.js
import { useState, useEffect } from 'react';

export const useAppointments = (customerId) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async (customerIdToFetch) => {
    if (!customerIdToFetch) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Loading appointments for customer:', customerIdToFetch);
      
      const response = await fetch(`/api/customers/${customerIdToFetch}/appointments`);
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments || []);
        console.log(`✅ Loaded ${data.appointments?.length || 0} appointments`);
      } else {
        setError(data.error || 'Failed to load appointments');
        console.error('❌ Failed to load appointments:', data.error);
      }
    } catch (error) {
      setError(`Failed to load appointments: ${error.message}`);
      console.error('💥 Appointments fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchAppointments(customerId);
    }
  }, [customerId]);

  return {
    appointments,
    loading,
    error,
    refetch: () => fetchAppointments(customerId)
  };
};