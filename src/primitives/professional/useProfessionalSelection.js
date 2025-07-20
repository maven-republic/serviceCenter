'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export const useProfessionalSelection = (appointmentId, professionalId, onRefresh) => {
  const [loading, setLoading] = useState(false)

  const handleConfirmSelection = useCallback(async ({ message, action }) => {
    if (!message?.trim()) {
      return { success: false, error: 'Response message is required' }
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: professionalId,
          status: 'confirmed',
          notes: message.trim(),
          action: 'confirm_selection',
          confirmed_at: new Date().toISOString(),
          response_type: 'accept'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm selection')
      }

      // Success notifications
      toast.success('Selection confirmed!', {
        description: 'Customer has been notified that you\'re ready to proceed.',
        duration: 5000
      })

      // Refresh the data
      if (onRefresh) {
        await onRefresh()
      }

      return { success: true, data }

    } catch (error) {
      console.error('Confirm selection error:', error)
      
      toast.error('Failed to confirm selection', {
        description: error.message || 'Please try again or contact support.',
        duration: 5000
      })

      return { 
        success: false, 
        error: error.message || 'Network error occurred' 
      }
    } finally {
      setLoading(false)
    }
  }, [appointmentId, professionalId, onRefresh])

  const handleDeclineSelection = useCallback(async ({ message, reason, action }) => {
    if (!message?.trim()) {
      return { success: false, error: 'Decline reason is required' }
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: professionalId,
          status: 'declined',
          notes: message.trim(),
          rejection_reason: reason || 'scheduling_conflict',
          action: 'decline_selection',
          declined_at: new Date().toISOString(),
          response_type: 'decline'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline selection')
      }

      // Success notification
      toast.success('Selection declined', {
        description: 'Customer has been notified and can select another professional.',
        duration: 5000
      })

      // Refresh the data
      if (onRefresh) {
        await onRefresh()
      }

      return { success: true, data }

    } catch (error) {
      console.error('Decline selection error:', error)
      
      toast.error('Failed to decline selection', {
        description: error.message || 'Please try again or contact support.',
        duration: 5000
      })

      return { 
        success: false, 
        error: error.message || 'Network error occurred' 
      }
    } finally {
      setLoading(false)
    }
  }, [appointmentId, professionalId, onRefresh])

  const handleUpdateResponse = useCallback(async ({ message, updates = {} }) => {
    if (!message?.trim()) {
      return { success: false, error: 'Update message is required' }
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: professionalId,
          notes: message.trim(),
          action: 'update_response',
          updated_at: new Date().toISOString(),
          ...updates
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update response')
      }

      toast.success('Response updated', {
        description: 'Your message has been sent to the customer.',
        duration: 3000
      })

      if (onRefresh) {
        await onRefresh()
      }

      return { success: true, data }

    } catch (error) {
      console.error('Update response error:', error)
      
      toast.error('Failed to update response', {
        description: error.message || 'Please try again.',
        duration: 5000
      })

      return { 
        success: false, 
        error: error.message || 'Network error occurred' 
      }
    } finally {
      setLoading(false)
    }
  }, [appointmentId, professionalId, onRefresh])

  return {
    handleConfirmSelection,
    handleDeclineSelection,
    handleUpdateResponse,
    loading
  }
}

// Helper function for status validation
export const canRespondToSelection = (interest) => {
  if (!interest) return false
  
  // Must be selected by customer
  if (interest.status !== 'selected') return false
  
  // Must have customer_selected_at timestamp
  if (!interest.customer_selected_at) return false
  
  // Check if response deadline has passed (48 hours)
  const selectedAt = new Date(interest.customer_selected_at)
  const deadline = new Date(selectedAt.getTime() + (48 * 60 * 60 * 1000)) // 48 hours
  const now = new Date()
  
  return now < deadline
}

// Helper function to get response deadline info
export const getResponseDeadlineInfo = (interest) => {
  if (!interest?.customer_selected_at) return null
  
  const selectedAt = new Date(interest.customer_selected_at)
  const deadline = new Date(selectedAt.getTime() + (48 * 60 * 60 * 1000))
  const now = new Date()
  const timeRemaining = deadline.getTime() - now.getTime()
  
  if (timeRemaining <= 0) {
    return {
      hasExpired: true,
      timeRemaining: 0,
      deadlineText: 'Response deadline has passed',
      urgencyLevel: 'expired'
    }
  }
  
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  
  let urgencyLevel = 'normal'
  if (hoursRemaining < 6) urgencyLevel = 'urgent'
  else if (hoursRemaining < 12) urgencyLevel = 'warning'
  
  let deadlineText = ''
  if (hoursRemaining > 0) {
    deadlineText = `${hoursRemaining}h ${minutesRemaining}m remaining`
  } else {
    deadlineText = `${minutesRemaining} minutes remaining`
  }
  
  return {
    hasExpired: false,
    timeRemaining,
    hoursRemaining,
    minutesRemaining,
    deadlineText,
    urgencyLevel,
    deadline
  }
}