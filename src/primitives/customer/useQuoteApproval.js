// src/primitives/customer/useQuoteApproval.js
"use client";

import { useState, useCallback } from 'react';

export const useQuoteApproval = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear any previous errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Approve quote update
  const approveQuoteUpdate = useCallback(async (appointmentId, interestId, customerNotes = '') => {
    if (!appointmentId || !interestId) {
      throw new Error('Appointment ID and Interest ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🟢 Approving quote update:', { appointmentId, interestId, hasNotes: !!customerNotes });

      const response = await fetch(
        `/api/appointments/${appointmentId}/interests/${interestId}/quote-approval`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'approve',
            customer_notes: customerNotes.trim() || null
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to approve quote`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Quote approval failed');
      }

      console.log('✅ Quote approved successfully:', result);

      return {
        success: true,
        data: result,
        interest: result.interest,
        message: result.message || 'Quote approved successfully'
      };

    } catch (error) {
      console.error('❌ Error approving quote:', error);
      const errorMessage = error.message || 'Failed to approve quote update';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Decline quote update
  const declineQuoteUpdate = useCallback(async (appointmentId, interestId, customerNotes = '') => {
    if (!appointmentId || !interestId) {
      throw new Error('Appointment ID and Interest ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔴 Declining quote update:', { appointmentId, interestId, hasNotes: !!customerNotes });

      const response = await fetch(
        `/api/appointments/${appointmentId}/interests/${interestId}/quote-approval`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'decline',
            customer_notes: customerNotes.trim() || null
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to decline quote`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Quote decline failed');
      }

      console.log('✅ Quote declined successfully:', result);

      return {
        success: true,
        data: result,
        interest: result.interest,
        message: result.message || 'Quote declined successfully'
      };

    } catch (error) {
      console.error('❌ Error declining quote:', error);
      const errorMessage = error.message || 'Failed to decline quote update';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get quote update history
  const getQuoteHistory = useCallback(async (appointmentId, interestId) => {
    if (!appointmentId || !interestId) {
      throw new Error('Appointment ID and Interest ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📋 Fetching quote history:', { appointmentId, interestId });

      const response = await fetch(
        `/api/appointments/${appointmentId}/interests/${interestId}/quote-approval`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to fetch quote history`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch quote history');
      }

      console.log('✅ Quote history fetched:', result.quote_history?.length || 0, 'records');

      return {
        success: true,
        history: result.quote_history || []
      };

    } catch (error) {
      console.error('❌ Error fetching quote history:', error);
      const errorMessage = error.message || 'Failed to fetch quote history';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        history: []
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to handle quote approval with feedback
  const handleQuoteApproval = useCallback(async (
    appointmentId, 
    interestId, 
    action, 
    notes = '',
    options = {}
  ) => {
    const { 
      onSuccess, 
      onError, 
      showSuccessMessage = true,
      showErrorMessage = true 
    } = options;

    try {
      let result;
      
      if (action === 'approve') {
        result = await approveQuoteUpdate(appointmentId, interestId, notes);
      } else if (action === 'decline') {
        result = await declineQuoteUpdate(appointmentId, interestId, notes);
      } else {
        throw new Error('Action must be "approve" or "decline"');
      }

      if (result.success) {
        if (showSuccessMessage) {
          // You can integrate with your toast/notification system here
          console.log('🎉 Success:', result.message);
        }
        
        if (onSuccess) {
          await onSuccess(result);
        }
        
        return result;
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      const errorMessage = error.message || `Failed to ${action} quote`;
      
      if (showErrorMessage) {
        // You can integrate with your toast/notification system here
        console.error('❌ Error:', errorMessage);
      }
      
      if (onError) {
        onError(error);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [approveQuoteUpdate, declineQuoteUpdate]);

  return {
    // Main functions
    approveQuoteUpdate,
    declineQuoteUpdate,
    getQuoteHistory,
    handleQuoteApproval,
    
    // State
    loading,
    error,
    
    // Utilities
    clearError
  };
};

export default useQuoteApproval;