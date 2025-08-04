// src/components/professional-workspace/interests/hooks/useProfessionalResponseState.js
'use client'

import { useState, useMemo } from 'react'

export const useProfessionalResponseState = (interest) => {
  const [currentView, setCurrentView] = useState('overview')
  const [loading, setLoading] = useState(false)
  
  // Form state for different response types
  const [responseMessage, setResponseMessage] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [referralSuggestion, setReferralSuggestion] = useState('') // NEW
  const [assessmentDate, setAssessmentDate] = useState('')
  const [assessmentTime, setAssessmentTime] = useState('')
  const [assessmentDuration, setAssessmentDuration] = useState('60')
  const [assessmentNotes, setAssessmentNotes] = useState('')
  const [quoteUpdates, setQuoteUpdates] = useState({
    amount: interest?.amount || '',
    scope: '',
    timeline: '',
    notes: ''
  })

  // Calculate deadline information
  const deadlineInfo = useMemo(() => {
    if (!interest?.customer_selected_at) {
      return {
        deadline: null,
        timeRemaining: '',
        hoursRemaining: 0,
        urgencyLevel: 'normal',
        isExpired: false
      }
    }

    const selectedAt = new Date(interest.customer_selected_at)
    const deadline = new Date(selectedAt.getTime() + (48 * 60 * 60 * 1000)) // 48 hours
    const now = new Date()
    const msRemaining = deadline.getTime() - now.getTime()
    const hoursRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)))
    const minutesRemaining = Math.max(0, Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60)))

    let urgencyLevel = 'normal'
    if (hoursRemaining === 0 && minutesRemaining === 0) urgencyLevel = 'expired'
    else if (hoursRemaining < 6) urgencyLevel = 'urgent'
    else if (hoursRemaining < 24) urgencyLevel = 'warning'
    else if (hoursRemaining < 48) urgencyLevel = 'info'

    const formatTime = () => {
      if (hoursRemaining === 0 && minutesRemaining === 0) return 'Expired'
      if (hoursRemaining === 0) return `${minutesRemaining}m remaining`
      if (minutesRemaining === 0) return `${hoursRemaining}h remaining`
      return `${hoursRemaining}h ${minutesRemaining}m remaining`
    }

    return {
      deadline,
      timeRemaining: formatTime(),
      hoursRemaining,
      urgencyLevel,
      isExpired: msRemaining <= 0
    }
  }, [interest?.customer_selected_at])

  // Reset form data when view changes
  const resetFormData = () => {
    setResponseMessage('')
    setDeclineReason('')
    setReferralSuggestion('') // NEW
    setAssessmentDate('')
    setAssessmentTime('')
    setAssessmentDuration('60')
    setAssessmentNotes('')
  }

  return {
    // View state
    currentView,
    setCurrentView,
    loading,
    setLoading,
    
    // Form state
    responseMessage,
    setResponseMessage,
    declineReason,
    setDeclineReason,
    referralSuggestion,      // NEW
    setReferralSuggestion,   // NEW
    assessmentDate,
    setAssessmentDate,
    assessmentTime,
    setAssessmentTime,
    assessmentDuration,
    setAssessmentDuration,
    assessmentNotes,
    setAssessmentNotes,
    quoteUpdates,
    setQuoteUpdates,
    
    // Utility
    deadlineInfo,
    resetFormData
  }
}