// src/components/professional-workspace/appointments/DirectBookingActions.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * DirectBookingActions Component
 * 
 * Handles accept/decline actions for direct booking requests (PATH A).
 * Features:
 * - 24-hour response window with countdown
 * - Loading states for each action
 * - Success/error notifications
 * - Expired request handling
 */
export function DirectBookingActions({ appointment, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [actionType, setActionType] = useState(null)
  
  /**
   * Check if the booking request has expired (older than 24 hours)
   */
  const isExpired = () => {
    const createdAt = new Date(appointment.created_at)
    const now = new Date()
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60)
    return hoursDiff > 24
  }
  
  /**
   * Calculate hours remaining before expiration
   */
  const getTimeRemaining = () => {
    const createdAt = new Date(appointment.created_at)
    const expiresAt = new Date(createdAt.getTime() + (24 * 60 * 60 * 1000))
    const now = new Date()
    const hoursLeft = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60)))
    return hoursLeft
  }
  
  /**
   * Handle accepting the direct booking request
   * Creates a booking and updates appointment status to 'scheduled'
   */
  const handleAccept = async () => {
    if (isExpired()) {
      toast.error('Request Expired', {
        description: 'This booking request has expired after 24 hours'
      })
      return
    }
    
    setLoading(true)
    setActionType('accept')
    
    try {
      console.log('🔄 Accepting appointment:', appointment.appointment_id)
      console.log('📋 Full appointment object:', appointment)
      
      const response = await fetch(`/api/appointments/${appointment.appointment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      console.log('📡 Response headers:', response.headers.get('content-type'))
      
      // Get the response text first to see what we're actually receiving
      const responseText = await response.text()
      console.log('📄 Raw response text:', responseText)
      
      // Try to parse as JSON
      let result
      try {
        result = JSON.parse(responseText)
        console.log('📦 Parsed response data:', result)
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError)
        console.error('📄 Response was:', responseText.substring(0, 500))
        throw new Error('Server returned invalid response. Check console for details.')
      }
      
      // Log detailed error if it exists
      if (result.error) {
        console.error('🚨 API Error:', result.error)
        console.error('🚨 API Error Details:', result.details)
      }
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to accept booking')
      }
      
      toast.success('Booking Confirmed! 🎉', {
        description: 'The customer has been notified of your acceptance.'
      })
      
      onSuccess?.()
    } catch (error) {
      console.error('❌ Accept booking error:', error)
      console.error('Error details:', {
        message: error.message,
        appointmentId: appointment.appointment_id,
        status: appointment.status
      })
      toast.error('Failed to Accept', {
        description: error.message || 'An unexpected error occurred'
      })
    } finally {
      setLoading(false)
      setActionType(null)
    }
  }
  
  /**
   * Handle declining the direct booking request
   * Updates appointment status to 'cancelled'
   */
  const handleDecline = async () => {
    setLoading(true)
    setActionType('decline')
    
    try {
      console.log('🔄 Declining appointment:', appointment.appointment_id)
      
      const response = await fetch(`/api/appointments/${appointment.appointment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' })
      })
      
      console.log('📡 Response status:', response.status)
      
      const result = await response.json()
      console.log('📦 Response data:', result)
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to decline booking')
      }
      
      toast.success('Request Declined', {
        description: 'The customer has been notified.'
      })
      
      onSuccess?.()
    } catch (error) {
      console.error('❌ Decline booking error:', error)
      console.error('Error details:', {
        message: error.message,
        appointmentId: appointment.appointment_id,
        status: appointment.status
      })
      toast.error('Failed to Decline', {
        description: error.message || 'An unexpected error occurred'
      })
    } finally {
      setLoading(false)
      setActionType(null)
    }
  }
  
  const expired = isExpired()
  const hoursLeft = getTimeRemaining()
  
  // Show expired state
  if (expired) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This booking request expired after 24 hours
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="space-y-2">
      {/* Action buttons - More prominent */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={handleAccept}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          size="lg"
        >
          {loading && actionType === 'accept' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Accepting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              ACCEPT
            </>
          )}
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleDecline}
          disabled={loading}
          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
          size="lg"
        >
          {loading && actionType === 'decline' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Declining...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              DECLINE
            </>
          )}
        </Button>
      </div>
      
      {/* Help text removed to save space */}
    </div>
  )
}