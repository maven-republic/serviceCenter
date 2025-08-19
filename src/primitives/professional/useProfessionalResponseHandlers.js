// src/primitives/professional/useProfessionalResponseHandlers.js
'use client'

import { toast } from 'sonner'

export const useProfessionalResponseHandlers = ({
  interest,
  appointment,
  professional,
  setLoading,
  onClose,
  onSuccess,
  // Form state
  responseMessage,
  declineReason,
  referralSuggestion,
  assessmentDate,
  assessmentTime,
  assessmentDuration,
  assessmentNotes,
  quoteUpdates,
  resetFormData
}) => {

  console.log('🔧 useProfessionalResponseHandlers initialized with:', {
    interest: interest ? {
      id: interest.interest_id,
      status: interest.status,
      amount: interest.amount
    } : null,
    appointment: appointment ? {
      id: appointment.appointment_id || appointment.id,
      status: appointment.status
    } : null,
    professional: professional ? {
      id: professional.professional_id || professional.id
    } : null
  });

  // 🔧 ENHANCED: Better data validation with detailed logging
  const validateRequiredData = () => {
    console.log('🔍 Validating required data...');
    
    const validationData = {
      appointment: appointment ? {
        id: appointment.appointment_id || appointment.id,
        hasId: !!(appointment.appointment_id || appointment.id),
        status: appointment.status
      } : null,
      professional: professional ? {
        id: professional.professional_id || professional.id,
        hasId: !!(professional.professional_id || professional.id)
      } : null,
      interest: interest ? {
        id: interest.interest_id,
        hasId: !!interest.interest_id,
        status: interest.status
      } : null
    };
    
    console.log('📋 Validation data:', validationData);

    if (!appointment) {
      throw new Error('Appointment data is missing')
    }

    if (!professional) {
      throw new Error('Professional data is missing')
    }

    if (!interest) {
      throw new Error('Interest data is missing')
    }

    const appointmentId = appointment.appointment_id || appointment.id
    const professionalId = professional.professional_id || professional.id
    const interestId = interest.interest_id

    if (!appointmentId) {
      throw new Error('Appointment ID is missing')
    }

    if (!professionalId) {
      throw new Error('Professional ID is missing')
    }

    if (!interestId) {
      throw new Error('Interest ID is missing')
    }

    console.log('✅ Validation passed:', { appointmentId, professionalId, interestId });
    return { appointmentId, professionalId, interestId }
  }

  // 🚨 FIXED: Accept selection handler - Use correct API endpoint
  const handleAccept = async () => {
    console.log('🎯 handleAccept called');
    
    if (!responseMessage?.trim()) {
      toast.error('Please provide a message to the customer')
      return
    }

    setLoading(true)
    
    try {
      const { appointmentId, professionalId, interestId } = validateRequiredData()

      console.log('📤 Accepting selection:', {
        appointmentId,
        professionalId,
        interestId,
        messageLength: responseMessage.length
      })

      // 🚨 CRITICAL FIX: Use the individual interest endpoint
      const apiUrl = `/api/interests/${interestId}`
      
      const requestBody = {
        status: 'confirmed',  // ✅ Direct status update 
        message: responseMessage.trim(),
        confirmed_at: new Date().toISOString()
      }

      console.log('🌐 Calling API:', apiUrl);
      console.log('📤 Accept request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'PATCH',  // ✅ Use PATCH for updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Accept response status:', response.status);
      const result = await response.json()
      console.log('📥 Accept API response:', result)

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to accept selection')
      }

      if (!result.success) {
        throw new Error(result.error || 'API returned success: false')
      }
      
      toast.success('Selection accepted successfully!', {
        description: 'The customer has been notified. You can now coordinate project details.'
      })
      
      resetFormData()
      onSuccess?.(result)
      onClose()
      
    } catch (error) {
      console.error('❌ Error accepting selection:', error)
      toast.error('Failed to accept selection', {
        description: error.message || 'Please try again or contact support if the issue persists.'
      })
    } finally {
      setLoading(false)
    }
  }

  // 🚨 FIXED: Decline selection handler - Use correct API endpoint  
  const handleDecline = async () => {
    console.log('🎯 handleDecline called');
    
    if (!declineReason) {
      toast.error('Please select a reason for declining')
      return
    }

    if (!responseMessage?.trim()) {
      toast.error('Please provide a message to the customer')
      return
    }

    if (responseMessage.trim().length < 20) {
      toast.error('Please provide a more detailed message (at least 20 characters)')
      return
    }

    setLoading(true)
    
    try {
      const { appointmentId, professionalId, interestId } = validateRequiredData()

      console.log('📤 Declining selection:', {
        appointmentId,
        professionalId,
        interestId,
        reason: declineReason,
        messageLength: responseMessage.length,
        hasReferrals: !!referralSuggestion?.trim()
      })

      // 🚨 CRITICAL FIX: Use the individual interest endpoint
      const apiUrl = `/api/interests/${interestId}`

      const requestBody = {
        status: 'declined',  // ✅ Direct status update
        message: responseMessage.trim(),
        decline_reason_category: declineReason,
        referral_suggestion: referralSuggestion?.trim() || null,
        declined_at: new Date().toISOString()
      }

      console.log('🌐 Calling API:', apiUrl);
      console.log('📤 Decline request body:', requestBody)

      const response = await fetch(apiUrl, {
        method: 'PATCH',  // ✅ Use PATCH for updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Decline response status:', response.status)
      const result = await response.json()
      console.log('📥 Decline API response:', result)

      if (!response.ok) {
        console.error('❌ API Error Response:', result)
        throw new Error(result.error || result.details || `HTTP ${response.status}: Failed to decline selection`)
      }

      if (!result.success) {
        console.error('❌ API returned success: false:', result)
        throw new Error(result.error || 'API returned success: false')
      }
      
      toast.success('Selection declined successfully', {
        description: 'The customer has been notified of your decision.'
      })
      
      resetFormData()
      onSuccess?.(result)
      onClose()
      
    } catch (error) {
      console.error('❌ Complete error details:', error)
      toast.error('Failed to decline selection', {
        description: error.message || 'Please try again or contact support if the issue persists.'
      })
    } finally {
      setLoading(false)
    }
  }

  // 🔧 ENHANCED: Assessment scheduling handler
  const handleAcceptAssessment = async () => {
    console.log('🎯 handleAcceptAssessment called');
    
    if (!assessmentDate) {
      toast.error('Please select an assessment date')
      return
    }

    if (!assessmentTime) {
      toast.error('Please select an assessment time')
      return
    }

    if (!responseMessage?.trim()) {
      toast.error('Please provide a message to the customer')
      return
    }

    setLoading(true)
    
    try {
      const { appointmentId, professionalId, interestId } = validateRequiredData()
      const proposedDateTime = new Date(`${assessmentDate}T${assessmentTime}`)

      console.log('📤 Scheduling assessment:', {
        appointmentId,
        professionalId,
        interestId,
        proposedDateTime: proposedDateTime.toISOString()
      })

      // 🚨 CRITICAL FIX: Use the individual interest endpoint
      const apiUrl = `/api/interests/${interestId}`

      const requestBody = {
        status: 'confirmed',  // ✅ Accept the selection
        message: responseMessage.trim(),
        // Assessment details in notes for now - your schema may vary
        notes: `Assessment scheduled for ${proposedDateTime.toISOString()}. Duration: ${assessmentDuration} minutes. ${assessmentNotes.trim()}`,
        confirmed_at: new Date().toISOString()
      }

      console.log('🌐 Calling API:', apiUrl);
      console.log('📤 Assessment request body:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',  // ✅ Use PATCH for updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Assessment response status:', response.status);
      const result = await response.json()
      console.log('📥 Assessment API response:', result)

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to schedule assessment')
      }

      if (!result.success) {
        throw new Error(result.error || 'API returned success: false')
      }
      
      toast.success('Assessment scheduled successfully!', {
        description: 'The customer will be notified of your proposed assessment time.'
      })
      
      resetFormData()
      onSuccess?.(result)
      onClose()
      
    } catch (error) {
      console.error('❌ Error scheduling assessment:', error)
      toast.error('Failed to schedule assessment', {
        description: error.message || 'Please try again or contact support if the issue persists.'
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ UNCHANGED: Quote update handler (this one was already correct)
  const handleUpdateQuote = async (submissionData) => {
    console.log('🎯 handleUpdateQuote called with submission data:', submissionData);
    
    const updatedQuote = submissionData?.updated_quote;
    const updateReason = submissionData?.quote_update_reason;
    const message = submissionData?.response_message;

    console.log('🔍 Extracted data:', {
      updatedQuote,
      updateReason,
      message
    });

    if (!updatedQuote?.amount) {
      console.log('❌ Validation failed: Missing quote amount');
      toast.error('Please provide an updated quote amount');
      return;
    }

    if (!updateReason?.trim()) {
      console.log('❌ Validation failed: Missing update reason');
      toast.error('Please provide a reason for the quote update');
      return;
    }

    if (!message?.trim()) {
      console.log('❌ Validation failed: Missing customer message');
      toast.error('Please provide a message to the customer');
      return;
    }

    const originalAmount = parseFloat(interest?.amount) || 0;
    const newAmount = parseFloat(updatedQuote.amount);
    const changePercent = originalAmount > 0 ? ((newAmount - originalAmount) / originalAmount) * 100 : 0;

    console.log('💰 Quote change analysis:', {
      originalAmount,
      newAmount,
      changeAmount: newAmount - originalAmount,
      changePercent: changePercent.toFixed(1) + '%'
    });

    if (changePercent > 50) {
      toast.error('Quote increases over 50% require direct customer contact', {
        description: 'Please reach out to the customer directly for significant changes.'
      });
      return;
    }

    setLoading(true);
    
    try {
      const { appointmentId, interestId } = validateRequiredData();
      
      const apiUrl = `/api/appointments/${appointmentId}/interests/${interestId}`;
      console.log('🌐 Calling quote update API:', apiUrl);
      
      const requestBody = {
        updated_quote: {
          amount: parseFloat(updatedQuote.amount),
          duration_hours: updatedQuote.duration_hours ? parseFloat(updatedQuote.duration_hours) : null,
          scope_changes: updatedQuote.scope_changes || null,
          timeline_changes: updatedQuote.timeline_changes || null
        },
        quote_update_reason: updateReason.trim(),
        response_message: message.trim()
      };
      
      console.log('📤 Quote update request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Quote update response status:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('📥 Quote update response body:', result);
      } catch (jsonError) {
        console.error('❌ Failed to parse response JSON:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('❌ API Error - Status:', response.status);
        console.error('❌ API Error - Response:', result);
        
        if (response.status === 400 && result.error?.includes('Cannot update quote when status is')) {
          throw new Error(`Quote cannot be updated: ${result.error}`);
        }
        
        throw new Error(result.error || result.details || `HTTP ${response.status}: Failed to update quote`);
      }

      if (!result.success) {
        console.error('❌ API returned success: false:', result);
        throw new Error(result.error || 'Quote update was not successful');
      }
      
      console.log('✅ Quote update successful!');
      console.log('📊 Updated interest status should be: "updated"');
      console.log('📊 Updated appointment status should be: "reviewing"');
      
      toast.success('Quote updated successfully! 🎉', {
        description: 'Customer will review your updated quote and respond with approval or feedback.'
      });
      
      resetFormData();
      onSuccess?.(result);
      onClose();
      
    } catch (error) {
      console.error('❌ Complete quote update error:', error);
      
      let errorMessage = 'Failed to update quote';
      let errorDescription = error.message || 'Please try again or contact support if the issue persists.';
      
      if (error.message?.includes('Cannot update quote when status is')) {
        errorMessage = 'Quote Update Not Allowed';
        errorDescription = 'This quote cannot be updated in its current state. Please contact support if you believe this is an error.';
      } else if (error.message?.includes('Interest ID is missing')) {
        errorMessage = 'System Error';
        errorDescription = 'Missing required information. Please refresh the page and try again.';
      }
      
      toast.error(errorMessage, {
        description: errorDescription
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 ENHANCED: Close handler with cleanup
  const handleClose = () => {
    console.log('📄 Closing professional response handler');
    resetFormData()
    onClose()
  }

  // Return all handlers
  return {
    handleAccept,
    handleDecline,
    handleAcceptAssessment,
    handleUpdateQuote,
    handleClose
  }
}