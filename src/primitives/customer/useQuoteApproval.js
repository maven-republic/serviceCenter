// src/primitives/customer/useQuoteApproval.js - Enhanced with Status Validation
"use client";

import { useState, useCallback } from 'react';

export const useQuoteApproval = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear any previous errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Validate status transitions according to DB schema
  const validateStatusTransition = useCallback((currentStatus, newStatus) => {
    const validTransitions = {
      'updated': ['approved', 'rejected'], // Quote updates can be approved/rejected
      'selected': ['approved', 'rejected'], // Selected can be approved/rejected
      'quoted': ['selected', 'rejected'],   // Quotes can be selected/rejected
      'interested': ['selected', 'rejected', 'quoted'] // Interest can progress
    };

    const allowed = validTransitions[currentStatus];
    if (!allowed) {
      console.warn(`⚠️ No defined transitions for status: ${currentStatus}`);
      return true; // Allow if not defined (graceful fallback)
    }

    const isValid = allowed.includes(newStatus);
    if (!isValid) {
      console.error(`❌ Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(', ')}`);
    }

    return isValid;
  }, []);

  // Approve quote update
  const approveQuoteUpdate = useCallback(async (appointmentId, interestId, customerNotes = '') => {
    if (!appointmentId || !interestId) {
      throw new Error('Appointment ID and Interest ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🟢 Approving quote update:', { 
        appointmentId, 
        interestId, 
        hasNotes: !!customerNotes,
        expectedTransition: 'updated → approved'
      });

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

      // ✅ Validate the status transition happened correctly
      if (result.interest?.status) {
        console.log('✅ Quote approved - Status transition:', {
          newStatus: result.interest.status,
          expectedStatus: 'approved',
          isCorrect: result.interest.status === 'approved'
        });

        if (result.interest.status !== 'approved') {
          console.warn('⚠️ Unexpected status after approval:', result.interest.status);
        }
      }

      console.log('✅ Quote approved successfully:', result);

      return {
        success: true,
        data: result,
        interest: result.interest,
        message: result.message || 'Quote approved successfully',
        statusTransition: {
          from: 'updated',
          to: result.interest?.status || 'approved'
        }
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
      console.log('🔴 Declining quote update:', { 
        appointmentId, 
        interestId, 
        hasNotes: !!customerNotes,
        expectedTransition: 'updated → rejected OR interest removed'
      });

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

      // ✅ Log the status transition for debugging
      if (result.interest?.status) {
        console.log('✅ Quote declined - Status transition:', {
          newStatus: result.interest.status,
          possibleStatuses: ['rejected', 'withdrawn'],
          action: 'declined'
        });
      }

      console.log('✅ Quote declined successfully:', result);

      return {
        success: true,
        data: result,
        interest: result.interest,
        message: result.message || 'Quote declined successfully',
        statusTransition: {
          from: 'updated', 
          to: result.interest?.status || 'rejected'
        }
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

  // Helper function to handle quote approval with feedback and validation
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
      showErrorMessage = true,
      validateTransition = true 
    } = options;

    try {
      // ✅ Validate action parameter
      if (!['approve', 'decline'].includes(action)) {
        throw new Error(`Invalid action: ${action}. Must be "approve" or "decline"`);
      }

      console.log('🎯 Handling quote approval:', {
        appointmentId,
        interestId,
        action,
        hasNotes: !!notes,
        timestamp: new Date().toISOString()
      });

      let result;
      
      if (action === 'approve') {
        result = await approveQuoteUpdate(appointmentId, interestId, notes);
      } else if (action === 'decline') {
        result = await declineQuoteUpdate(appointmentId, interestId, notes);
      }

      if (result.success) {
        // ✅ Enhanced success logging with status validation
        const statusInfo = {
          action,
          finalStatus: result.interest?.status,
          expectedStatus: action === 'approve' ? 'approved' : 'rejected',
          transitionValid: validateTransition ? 
            validateStatusTransition('updated', result.interest?.status) : true
        };

        console.log('🎉 Quote approval successful:', statusInfo);

        if (showSuccessMessage) {
          const messages = {
            approve: 'Quote approved! The professional has been notified and the project is ready to proceed.',
            decline: 'Quote declined. The professional will need to provide a new response.'
          };
          console.log('🎉 Success:', messages[action]);
        }
        
        if (onSuccess) {
          await onSuccess({
            ...result,
            statusInfo
          });
        }
        
        return {
          ...result,
          statusInfo
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      const errorMessage = error.message || `Failed to ${action} quote`;
      
      console.error('❌ Quote approval error:', {
        action,
        appointmentId,
        interestId,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      if (showErrorMessage) {
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
  }, [approveQuoteUpdate, declineQuoteUpdate, validateStatusTransition]);

  // ✅ NEW: Helper to check if an interest can be approved/declined
  const canProcessQuoteUpdate = useCallback((interest) => {
    if (!interest) return false;

    const validStatuses = ['updated', 'selected'];
    const canProcess = validStatuses.includes(interest.status);

    console.log('🔍 Can process quote update:', {
      interestId: interest.interest_id,
      currentStatus: interest.status,
      canProcess,
      validStatuses
    });

    return canProcess;
  }, []);

  // ✅ NEW: Helper to get expected next status
  const getExpectedNextStatus = useCallback((currentStatus, action) => {
    const transitions = {
      'updated': {
        'approve': 'approved',
        'decline': 'rejected'
      },
      'selected': {
        'approve': 'approved', 
        'decline': 'rejected'
      }
    };

    return transitions[currentStatus]?.[action] || 'unknown';
  }, []);

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
    clearError,
    validateStatusTransition,
    canProcessQuoteUpdate,
    getExpectedNextStatus
  };
};

export default useQuoteApproval;