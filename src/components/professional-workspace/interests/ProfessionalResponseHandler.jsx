// src/components/professional-workspace/interests/ProfessionalResponseHandler.jsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ArrowLeft, Clock, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Import custom hooks
import { 
  useProfessionalResponseState,
  useProfessionalResponseHandlers
} from '@/primitives/professional'

// Import form components  
import QuoteUpdate from './forms/QuoteUpdate'
import ProvideFinalQuote from './forms/ProvideFinalQuote'
import {
  AcceptForm,
  AssessmentForm,
  DeclineForm
} from './forms'

// Import render components
import {
  ProjectDetails,
  ResponseDeadlineAlert
} from './render'

// Import action components
import {
  FormActions,
  OverviewActions
} from './actions'

export default function ProfessionalResponseHandler({
  interest,
  appointment,
  professional,
  onSuccess,
  onClose,
  open = true
}) {
  // ✅ Assessment state
  const [assessment, setAssessment] = useState(null)
  const [finalQuoteAmount, setFinalQuoteAmount] = useState('')
  const [loadingAssessment, setLoadingAssessment] = useState(false)

  // ✅ NEW: Assessment schedule state for calendar integration
  const [assessmentSchedule, setAssessmentSchedule] = useState({
    proposed_datetime: null,
    proposed_date: '',
    proposed_time: '',
    duration_minutes: 60,
    next_steps: ''
  })

  console.log('🟢 ProfessionalResponseHandler DEBUG:', {
    componentName: 'ProfessionalResponseHandler',
    timestamp: new Date().toISOString(),
    open: open,
    professionalId: professional?.id,
    interest: interest ? {
      id: interest.interest_id,
      status: interest.status,
      assessment: interest.assessment
    } : null,
    assessment: assessment ? {
      id: assessment.assessment_id,
      status: assessment.status,
      final_quote_provided: assessment.final_quote_provided
    } : null
  })

  // ✅ Fetch assessment when interest requires it OR when interest.assessment is undefined
  useEffect(() => {
    if (interest?.interest_id && open && interest?.status === 'selected') {
      fetchAssessment()
    }
  }, [interest?.interest_id, interest?.status, open])

  // ✅ Fetch assessment function
  const fetchAssessment = async () => {
    try {
      setLoadingAssessment(true)
      console.log('🔍 Fetching assessment for interest:', interest.interest_id)
      
      const response = await fetch(`/api/assessments?interest_id=${interest.interest_id}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.assessments && data.assessments.length > 0) {
          setAssessment(data.assessments[0])
          console.log('✅ Assessment loaded:', data.assessments[0])
        } else {
          console.log('ℹ️ No assessment found')
          setAssessment(null)
        }
      } else {
        console.error('❌ Failed to fetch assessment:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching assessment:', error)
    } finally {
      setLoadingAssessment(false)
    }
  }

  // 🔍 Database verification
  useEffect(() => {
    if (interest?.interest_id) {
      console.log('🔍 [ProfessionalResponseHandler] Verifying database status...')
      fetch(`/api/interests/${interest.interest_id}`)
        .then(res => res.json())
        .then(data => {
          console.log('📊 [ProfessionalResponseHandler] Database vs Props:', {
            component: 'ProfessionalResponseHandler',
            databaseStatus: data.interest?.status,
            propsStatus: interest?.status,
            statusMatch: data.interest?.status === interest?.status
          })
        })
        .catch(err => console.error('❌ [ProfessionalResponseHandler] Database check failed:', err))
    }
  }, [interest?.interest_id])
  
  // 🔧 State management (REMOVED old assessment date/time/duration/notes states)
  const {
    currentView,
    setCurrentView,
    loading,
    setLoading,
    responseMessage,
    setResponseMessage,
    declineReason,
    setDeclineReason,
    referralSuggestion,
    setReferralSuggestion,
    // ❌ REMOVED: assessmentDate, setAssessmentDate, assessmentTime, setAssessmentTime, assessmentDuration, setAssessmentDuration, assessmentNotes, setAssessmentNotes
    quoteUpdates,
    setQuoteUpdates,
    deadlineInfo,
    resetFormData
  } = useProfessionalResponseState(interest)

  // 🔧 Response handlers
  const {
    handleAccept,
    handleDecline,
    handleAcceptAssessment,
    handleUpdateQuote,
    handleClose
  } = useProfessionalResponseHandlers({
    interest,
    appointment,
    professional,
    setLoading,
    onClose,
    onSuccess,
    responseMessage,
    declineReason,
    referralSuggestion,
    // ✅ NEW: Pass assessment schedule instead of individual fields
    assessmentSchedule,
    // ❌ REMOVED: assessmentDate, assessmentTime, assessmentDuration, assessmentNotes
    quoteUpdates,
    resetFormData
  })

  // ✅ Handle final quote submission
  const handleSubmitFinalQuote = async () => {
    console.log('💰 handleSubmitFinalQuote called')
    
    // Validation
    if (!finalQuoteAmount || parseFloat(finalQuoteAmount) <= 0) {
      toast.error('Please provide a valid quote amount')
      return
    }
    
    if (!responseMessage || responseMessage.trim().length < 50) {
      toast.error('Please provide detailed quote explanation (minimum 50 characters)')
      return
    }

    if (!assessment) {
      toast.error('Assessment not found')
      return
    }

    setLoading(true)
    
    try {
      console.log('📤 Submitting final quote:', {
        assessment_id: assessment.assessment_id,
        amount: finalQuoteAmount,
        messageLength: responseMessage.length
      })
      
      // Update assessment with final quote
      const response = await fetch(`/api/assessments/${assessment.assessment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_quote_provided: true,
          final_quote_amount: parseFloat(finalQuoteAmount),
          notes: responseMessage.trim()
        })
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit final quote')
      }
      
      console.log('✅ Final quote submitted successfully')
      
      toast.success('Final quote submitted! 🎉', {
        description: 'The customer will review your quote and respond.'
      })
      
      // Refresh assessment data
      await fetchAssessment()
      
      // Reset form and close
      resetFormData()
      setFinalQuoteAmount('')
      setAssessmentSchedule({
        proposed_datetime: null,
        proposed_date: '',
        proposed_time: '',
        duration_minutes: 60,
        next_steps: ''
      })
      onSuccess?.(result)
      onClose()
      
    } catch (error) {
      console.error('❌ Error submitting final quote:', error)
      toast.error('Failed to submit final quote', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper to go back
  const handleBackToOverview = () => {
    console.log('🔙 Returning to overview from:', currentView)
    setCurrentView('overview')
    resetFormData()
    setFinalQuoteAmount('')
    setAssessmentSchedule({
      proposed_datetime: null,
      proposed_date: '',
      proposed_time: '',
      duration_minutes: 60,
      next_steps: ''
    })
  }

  // Check if user can respond
  const canRespond = !deadlineInfo.isExpired && ['selected'].includes(interest?.status)

  // View configuration
  const getViewConfig = () => {
    const baseConfigs = {
      overview: {
        title: getOverviewTitle(),
        description: getOverviewDescription()
      },
      accept: {
        title: '✅ Accept Selection',
        description: 'Confirm your availability and send acceptance message to the customer.'
      },
      decline: {
        title: '❌ Decline Selection',
        description: 'Let the customer know why you\'re unable to take on this project.'
      },
      update_quote: {
        title: '📝 Update Quote & Terms',
        description: 'Modify your quote or project terms based on updated requirements.'
      },
      accept_assessment: {
        title: '📅 Schedule Assessment',
        description: 'Select an available time from your calendar for the on-site assessment.'
      },
      provide_final_quote: {
        title: '💰 Provide Final Quote',
        description: 'Based on your assessment, provide the final project quote.'
      }
    }
    return baseConfigs[currentView] || baseConfigs.overview
  }

  const getOverviewTitle = () => {
    switch (interest?.status) {
      case 'selected':
        return '🎉 Congratulations - You\'ve Been Selected!'
      case 'updated':
        return '⏳ Quote Update Sent'
      case 'confirmed':
        return '✅ Project Confirmed'
      case 'declined_by_professional':
        return '❌ Selection Declined'
      default:
        return '📋 Respond to Selection'
    }
  }

  const getOverviewDescription = () => {
    switch (interest?.status) {
      case 'selected':
        return 'The customer has chosen you for this project. Please respond within 48 hours.'
      case 'updated':
        return 'Your quote update has been sent to the customer and is awaiting their approval.'
      case 'confirmed':
        return 'The project has been confirmed. You can now coordinate next steps with the customer.'
      case 'declined_by_professional':
        return 'You have declined this selection. The appointment has been reopened.'
      default:
        return 'Please review the project details and choose your response.'
    }
  }

  // Submit handler
  const getSubmitHandler = () => {
    switch (currentView) {
      case 'accept': 
        return handleAccept
      case 'decline': 
        return handleDecline
      case 'accept_assessment': 
        return handleAcceptAssessment
      case 'update_quote': 
        return handleUpdateQuote
      case 'provide_final_quote':
        return handleSubmitFinalQuote
      default: 
        return () => console.log('⚠️ No handler for view:', currentView)
    }
  }

  const viewConfig = getViewConfig()

  // Early return if missing required data
  if (!interest || !appointment) {
    console.log('❌ Missing required data:', { interest: !!interest, appointment: !!appointment })
    return null
  }

  // Early return if missing professional data
  if (!professional?.id) {
    console.log('❌ Missing professional ID')
    return null
  }

  // Deadline alert component
  const DeadlineAlert = () => {
    if (!deadlineInfo.deadline || interest?.status !== 'selected') return null

    const alertClass = deadlineInfo.urgencyLevel === 'urgent' ? 'border-red-200 bg-red-50' : 
                     deadlineInfo.urgencyLevel === 'warning' ? 'border-orange-200 bg-orange-50' : 
                     'border-blue-200 bg-blue-50'

    return (
      <Alert className={alertClass}>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Response Required:</strong> {deadlineInfo.timeRemaining}
            </div>
            <Badge variant={deadlineInfo.urgencyLevel === 'urgent' ? 'destructive' : 'secondary'}>
              {deadlineInfo.urgencyLevel === 'urgent' ? 'URGENT' : 'Pending'}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl lg:max-w-2xl flex flex-col overflow-hidden"
        onInteractOutside={(e) => {
          if (loading) {
            e.preventDefault()
          }
        }}
      >
        {/* Header */}
        <SheetHeader className="pb-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {currentView !== 'overview' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToOverview}
                  disabled={loading}
                  className="h-8 w-8 mb-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              
              <div className="flex items-center gap-3 mb-2">
                <SheetTitle className="text-xl font-bold text-left">
                  {viewConfig.title}
                </SheetTitle>
                
                {interest?.status && (
                  <Badge 
                    variant={interest.status === 'selected' ? 'default' : 'secondary'}
                    className={cn(
                      interest.status === 'selected' && 'bg-green-100 text-green-800 border-green-200',
                      interest.status === 'updated' && 'bg-orange-100 text-orange-800 border-orange-200',
                      interest.status === 'confirmed' && 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    )}
                  >
                    {interest.status === 'selected' && 'Selected'}
                    {interest.status === 'updated' && 'Quote Updated'}
                    {interest.status === 'confirmed' && 'Confirmed'}
                    {interest.status === 'declined_by_professional' && 'Declined'}
                  </Badge>
                )}
              </div>
              
              <SheetDescription className="text-left">
                {viewConfig.description}
              </SheetDescription>
            </div>
          </div>

          <DeadlineAlert />
        </SheetHeader>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto py-6">
          
          {/* Overview View */}
          {currentView === 'overview' && (
            <div className="space-y-6">
              <ProjectDetails appointment={appointment} interest={interest} />
              
              {interest?.status === 'updated' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Quote Update Sent:</strong> Your updated quote has been sent to the customer. 
                    They will review and either approve or request changes.
                  </AlertDescription>
                </Alert>
              )}
              
              {interest?.status === 'confirmed' && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertTriangle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Project Confirmed:</strong> The customer has approved your quote. 
                    You can now coordinate project scheduling and next steps.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Accept Form */}
          {currentView === 'accept' && (
            <AcceptForm
              responseMessage={responseMessage}
              setResponseMessage={setResponseMessage}
              loading={loading}
            />
          )}

          {/* Decline Form */}
          {currentView === 'decline' && (
            <DeclineForm
              responseMessage={responseMessage}
              setResponseMessage={setResponseMessage}
              declineReason={declineReason}
              setDeclineReason={setDeclineReason}
              referralSuggestion={referralSuggestion}
              setReferralSuggestion={setReferralSuggestion}
              loading={loading}
            />
          )}

          {/* ✅ UPDATED: Assessment Form with Calendar Integration */}
          {currentView === 'accept_assessment' && (
            <AssessmentForm
              interest={interest}
              professionalId={professional.id}
              responseMessage={responseMessage}
              setResponseMessage={setResponseMessage}
              assessmentSchedule={assessmentSchedule}
              setAssessmentSchedule={setAssessmentSchedule}
              loading={loading}
            />
          )}

          {/* Quote Update Form */}
          {currentView === 'update_quote' && (
            <QuoteUpdate
              interest={interest}
              responseMessage={responseMessage}
              setResponseMessage={setResponseMessage}
              onSubmit={handleUpdateQuote}
              loading={loading}
            />
          )}

          {/* ✅ Provide Final Quote Form */}
          {currentView === 'provide_final_quote' && (
            <ProvideFinalQuote
              assessment={assessment}
              interest={interest}
              finalQuoteAmount={finalQuoteAmount}
              setFinalQuoteAmount={setFinalQuoteAmount}
              responseMessage={responseMessage}
              setResponseMessage={setResponseMessage}
              loading={loading}
            />
          )}
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            
            {/* ✅ FIXED: Pass assessment AND loadingAssessment separately to OverviewActions */}
            {currentView === 'overview' && interest?.status === 'selected' && canRespond && (
              <OverviewActions
                interest={interest}
                assessment={assessment}
                loadingAssessment={loadingAssessment}
                setCurrentView={setCurrentView}
                loading={loading}
              />
            )}

            {/* Form Actions */}
            {currentView !== 'overview' && (
              <FormActions
                currentView={currentView}
                loading={loading}
                onCancel={handleBackToOverview}
                onSubmit={getSubmitHandler()}
                responseMessage={responseMessage}
                assessmentSchedule={assessmentSchedule}
                updatedQuote={{
                  amount: finalQuoteAmount || quoteUpdates?.amount,
                  reason_for_update: quoteUpdates?.reason_for_update
                }}
              />
            )}

            {/* Status messages */}
            {currentView === 'overview' && interest?.status !== 'selected' && (
              <div className="text-center w-full">
                {interest?.status === 'updated' && (
                  <p className="text-sm text-muted-foreground">
                    💬 Your quote update is under customer review.
                  </p>
                )}
                {interest?.status === 'confirmed' && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      🎉 Project confirmed! Time to coordinate with your customer.
                    </p>
                    <Button variant="outline" size="sm">
                      Contact Customer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}