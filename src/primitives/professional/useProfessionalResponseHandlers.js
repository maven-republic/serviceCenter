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

  console.log('🔧 useProfessionalResponseHandlers initialized');

  const validateRequiredData = () => {
    if (!appointment) throw new Error('Appointment data is missing')
    if (!professional) throw new Error('Professional data is missing')
    if (!interest) throw new Error('Interest data is missing')

    const appointmentId = appointment.appointment_id || appointment.id
    const professionalId = professional.professional_id || professional.id
    const interestId = interest.interest_id || interest.id

    if (!appointmentId) throw new Error('Appointment ID is missing')
    if (!professionalId) throw new Error('Professional ID is missing')
    if (!interestId) throw new Error('Interest ID is missing')

    return { appointmentId, professionalId, interestId }
  }

  // ✅ Accept - Update interest to 'confirmed'
  const handleAccept = async () => {
    if (!responseMessage?.trim()) {
      toast.error('Please provide a message to the customer')
      return
    }

    setLoading(true)
    
    try {
      const { interestId } = validateRequiredData()

      // ✅ Use existing interest PATCH endpoint
      const apiUrl = `/api/interests/${interestId}`
      
      const requestBody = {
        status: 'confirmed',
        message: responseMessage.trim(),
        professional_responded_at: new Date().toISOString()
      }

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to accept selection')
      }

      toast.success('Selection accepted successfully! 🎉', {
        description: 'The customer has been notified.'
      })
      
      resetFormData()
      onSuccess?.(result)
      onClose()
      
    } catch (error) {
      console.error('❌ Error accepting selection:', error)
      toast.error('Failed to accept selection', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ Decline - Update interest to 'declined'
  const handleDecline = async () => {
    if (!declineReason) {
      toast.error('Please select a reason for declining')
      return
    }

    if (!responseMessage?.trim() || responseMessage.trim().length < 20) {
      toast.error('Please provide a detailed message (at least 20 characters)')
      return
    }

    setLoading(true)
    
    try {
      const { interestId } = validateRequiredData()

      // ✅ Use existing interest PATCH endpoint
      const apiUrl = `/api/interests/${interestId}`

      const requestBody = {
        status: 'declined',
        message: responseMessage.trim(),
        notes: `Decline reason: ${declineReason}${referralSuggestion?.trim() ? `\n\nReferral suggestions: ${referralSuggestion.trim()}` : ''}`,
        professional_responded_at: new Date().toISOString()
      }

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to decline selection')
      }
      
      toast.success('Selection declined successfully', {
        description: 'The customer has been notified.'
      })
      
      resetFormData()
      onSuccess?.(result)
      onClose()
      
    } catch (error) {
      console.error('❌ Error declining selection:', error)
      toast.error('Failed to decline selection', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ Assessment - Update interest and create assessment
  const handleAcceptAssessment = async () => {
    if (!assessmentDate || !assessmentTime) {
      toast.error('Please select assessment date and time')
      return
    }

    if (!responseMessage?.trim()) {
      toast.error('Please provide a message to the customer')
      return
    }

    setLoading(true)
    
    try {
      const { interestId } = validateRequiredData()
      const proposedDateTime = new Date(`${assessmentDate}T${assessmentTime}`)

      // First, update interest to confirmed
      const interestUrl = `/api/interests/${interestId}`
      
      const interestBody = {
        status: 'confirmed',
        message: responseMessage.trim(),
        professional_responded_at: new Date().toISOString()
      }

      const interestResponse = await fetch(interestUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interestBody)
      })

      const interestResult = await interestResponse.json()

      if (!interestResponse.ok || !interestResult.success) {
        throw new Error(interestResult.error || 'Failed to confirm interest')
      }

      // Then create/update assessment
      const assessmentUrl = `/api/assessments`
      
      const assessmentBody = {
        interest_id: interestId,
        appointment_id: appointment.appointment_id || appointment.id,
        professional_id: professional.professional_id || professional.id,
        proposed_date: proposedDateTime.toISOString(),
        proposed_duration_minutes: parseInt(assessmentDuration) || 60,
        proposed_fee: 0,
        assessment_type: 'local',
        proposal_message: assessmentNotes?.trim() || null,
        status: 'proposed'
      }

      const assessmentResponse = await fetch(assessmentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentBody)
      })

      const assessmentResult = await assessmentResponse.json()

      if (!assessmentResponse.ok || !assessmentResult.success) {
        // Assessment creation failed, but interest was confirmed
        console.warn('Assessment creation failed:', assessmentResult.error)
      }
      
      toast.success('Assessment scheduled successfully!', {
        description: 'The customer will be notified of your proposed time.'
      })
      
      resetFormData()
      onSuccess?.(interestResult)
      onClose()
      
    } catch (error) {
      console.error('❌ Error scheduling assessment:', error)
      toast.error('Failed to schedule assessment', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ Quote update - Use existing PATCH on appointment interest endpoint
  const handleUpdateQuote = async (submissionData) => {
    const updatedQuote = submissionData?.updated_quote
    const updateReason = submissionData?.quote_update_reason
    const message = submissionData?.response_message

    if (!updatedQuote?.amount || !updateReason?.trim() || !message?.trim()) {
      toast.error('Please provide quote amount, reason, and message')
      return
    }

    const originalAmount = parseFloat(interest?.amount) || 0
    const newAmount = parseFloat(updatedQuote.amount)
    const changePercent = originalAmount > 0 ? ((newAmount - originalAmount) / originalAmount) * 100 : 0

    if (changePercent > 50) {
      toast.error('Quote increases over 50% require direct customer contact')
      return
    }

    setLoading(true)
    
    try {
      const { appointmentId, interestId } = validateRequiredData()
      
      // Use the appointment interest endpoint for quote updates
      const apiUrl = `/api/appointments/${appointmentId}/interests/${interestId}`
      
      const requestBody = {
        updated_quote: {
          amount: parseFloat(updatedQuote.amount),
          duration_hours: updatedQuote.duration_hours ? parseFloat(updatedQuote.duration_hours) : null,
          scope_changes: updatedQuote.scope_changes || null,
          timeline_changes: updatedQuote.timeline_changes || null
        },
        quote_update_reason: updateReason.trim(),
        response_message: message.trim()
      }
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update quote')
      }
      
      toast.success('Quote updated successfully! 🎉', {
        description: 'Customer will review your updated quote.'
      })
      
      resetFormData()
      onSuccess?.(result)
      onClose()
      
    } catch (error) {
      console.error('❌ Quote update error:', error)
      toast.error('Failed to update quote', {
        description: error.message
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