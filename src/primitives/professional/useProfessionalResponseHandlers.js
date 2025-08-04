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

  // Helper function to validate required data
  const validateRequiredData = () => {
    console.log('🔍 Validating required data:', {
      appointment: appointment ? {
        id: appointment.appointment_id || appointment.id,
        hasId: !!(appointment.appointment_id || appointment.id)
      } : null,
      professional: professional ? {
        id: professional.professional_id || professional.id,
        hasId: !!(professional.professional_id || professional.id)
      } : null,
      interest: interest ? {
        id: interest.interest_id,
        hasId: !!interest.interest_id
      } : null
    })

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

    if (!appointmentId) {
      throw new Error('Appointment ID is missing')
    }

    if (!professionalId) {
      throw new Error('Professional ID is missing')
    }

    return { appointmentId, professionalId }
  }

  const handleAccept = async () => {
    if (!responseMessage.trim()) {
      toast.error('Please provide a message to the customer')
      return
    }

    setLoading(true)
    
    try {
      const { appointmentId, professionalId } = validateRequiredData()

      console.log('🔄 Accepting selection:', {
        appointmentId,
        professionalId,
        messageLength: responseMessage.length
      })

      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: professionalId,
          action: 'accept_selection',
          response_message: responseMessage.trim(),
          confirmed_at: new Date().toISOString()
        })
      })

      const result = await response.json()
      console.log('📤 Accept API response:', result)

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

  const handleDecline = async () => {
    if (!declineReason) {
      toast.error('Please select a reason for declining')
      return
    }

    if (!responseMessage.trim()) {
      toast.error('Please provide a message to the customer')
      return
    }

    if (responseMessage.trim().length < 20) {
      toast.error('Please provide a more detailed message (at least 20 characters)')
      return
    }

    setLoading(true)
    
    try {
      const { appointmentId, professionalId } = validateRequiredData()

      // Convert single referral suggestion to array format for API
      const referralSuggestions = referralSuggestion?.trim() ? [referralSuggestion.trim()] : []

      console.log('🔄 Declining selection:', {
        appointmentId,
        professionalId,
        reason: declineReason,
        messageLength: responseMessage.length,
        hasReferrals: referralSuggestions.length > 0
      })

      const requestBody = {
        professional_id: professionalId,
        action: 'decline_selection',
        decline_reason: declineReason,
        decline_message: responseMessage.trim(),
        referral_suggestions: referralSuggestions,
        declined_at: new Date().toISOString()
      }

      console.log('📤 Decline request body:', requestBody)

      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Decline response status:', response.status, response.ok)

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
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      toast.error('Failed to decline selection', {
        description: error.message || 'Please try again or contact support if the issue persists.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptAssessment = async () => {
    if (!assessmentDate) {
      toast.error('Please select an assessment date')
      return
    }

    if (!assessmentTime) {
      toast.error('Please select an assessment time')
      return
    }

    if (!responseMessage.trim()) {
      toast.error('Please provide a message to the customer')
      return
    }

    setLoading(true)
    
    try {
      const { appointmentId, professionalId } = validateRequiredData()
      const proposedDateTime = new Date(`${assessmentDate}T${assessmentTime}`)

      console.log('🔄 Scheduling assessment:', {
        appointmentId,
        professionalId,
        proposedDateTime: proposedDateTime.toISOString()
      })
      
      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: professionalId,
          action: 'accept_selection',
          response_message: responseMessage.trim(),
          schedule_assessment: true,
          assessment_details: {
            proposed_date: proposedDateTime.toISOString(),
            duration_minutes: parseInt(assessmentDuration),
            type: 'local',
            message: assessmentNotes.trim(),
            address_id: appointment.address_id
          },
          confirmed_at: new Date().toISOString()
        })
      })

      const result = await response.json()
      console.log('📤 Assessment API response:', result)

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

  const handleUpdateQuote = async () => {
    if (!quoteUpdates.amount && !quoteUpdates.scope && !quoteUpdates.timeline) {
      toast.error('Please provide at least one update to the quote')
      return
    }

    if (!responseMessage.trim()) {
      toast.error('Please provide a message explaining the quote updates')
      return
    }

    setLoading(true)
    
    try {
      const { appointmentId, professionalId } = validateRequiredData()

      console.log('🔄 Updating quote:', {
        appointmentId,
        professionalId,
        updates: quoteUpdates
      })

      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: professionalId,
          action: 'accept_selection',
          response_message: responseMessage.trim(),
          updated_quote: {
            amount: quoteUpdates.amount ? parseFloat(quoteUpdates.amount) : null,
            scope: quoteUpdates.scope,
            timeline: quoteUpdates.timeline,
            notes: quoteUpdates.notes
          },
          confirmed_at: new Date().toISOString()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to update quote')
      }

      if (!result.success) {
        throw new Error(result.error || 'API returned success: false')
      }
      
      toast.success('Quote updated successfully!', {
        description: 'The customer has been notified of your updated quote.'
      })
      
      resetFormData()
      onSuccess?.(result)
      onClose()
      
    } catch (error) {
      console.error('❌ Error updating quote:', error)
      toast.error('Failed to update quote', {
        description: error.message || 'Please try again or contact support if the issue persists.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetFormData()
    onClose()
  }

  return {
    handleAccept,
    handleDecline,
    handleAcceptAssessment,
    handleUpdateQuote,
    handleClose
  }
}