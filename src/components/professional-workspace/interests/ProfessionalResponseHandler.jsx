// src/components/professional-workspace/interests/ProfessionalResponseHandler.jsx
'use client'

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

// Import custom hooks
import { 
  useProfessionalResponseState,
  useProfessionalResponseHandlers
} from '@/primitives/professional'

// Import form components  
import QuoteUpdate from './forms/QuoteUpdate'
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
  console.log('🏢 ProfessionalResponseHandler props:', {
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

  // 🔧 FIXED: Proper state management
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
    deadlineInfo,
    resetFormData
  } = useProfessionalResponseState(interest)

  // 🔧 FIXED: Proper handlers with all required props
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
    assessmentDate,
    assessmentTime,
    assessmentDuration,
    assessmentNotes,
    quoteUpdates,
    resetFormData
  })

  // Helper function to go back to overview
  const handleBackToOverview = () => {
    console.log('🔙 Returning to overview from:', currentView);
    setCurrentView('overview')
    resetFormData()
  }

  // Check if user can respond (not expired and correct status)
  const canRespond = !deadlineInfo.isExpired && ['selected'].includes(interest?.status)

  // 🔧 FIXED: Better view configuration with proper status checking
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
        description: 'Propose a time for the on-site assessment you mentioned in your quote.'
      }
    }
    return baseConfigs[currentView] || baseConfigs.overview
  }

  // 🔧 FIXED: Dynamic overview title based on status
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

  // 🔧 FIXED: Dynamic overview description
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

  // 🔧 FIXED: Proper submit handler based on view
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
      default: 
        return () => console.log('⚠️ No handler for view:', currentView)
    }
  }

  const viewConfig = getViewConfig()

  // Early return if missing required data
  if (!interest || !appointment) {
    console.log('❌ Missing required data:', { interest: !!interest, appointment: !!appointment });
    return null
  }

  // 🔧 FIXED: Enhanced deadline display
  const DeadlineAlert = () => {
    if (!deadlineInfo.deadline || interest?.status !== 'selected') return null

    const alertVariant = deadlineInfo.urgencyLevel === 'urgent' ? 'destructive' : 'default'
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
          {deadlineInfo.isExpired && (
            <p className="text-sm mt-1">Deadline passed. Contact customer directly if still interested.</p>
          )}
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
        {/* 🔧 FIXED: Enhanced Header */}
        <SheetHeader className="pb-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Back Button */}
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
              
              {/* Title with Status Badge */}
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

          {/* Deadline Warning */}
          <DeadlineAlert />
        </SheetHeader>

        {/* 🔧 FIXED: Enhanced Content Section */}
        <div className="flex-1 overflow-y-auto py-6">
          
          {/* Overview View */}
          {currentView === 'overview' && (
            <div className="space-y-6">
              {/* Project Details */}
              <ProjectDetails appointment={appointment} interest={interest} />
              
              {/* Status-specific messages */}
              {interest?.status === 'updated' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Quote Update Sent:</strong> Your updated quote has been sent to the customer. 
                    They will review and either approve or request changes. You'll be notified of their decision.
                  </AlertDescription>
                </Alert>
              )}
              
              {interest?.status === 'confirmed' && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertTriangle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Project Confirmed:</strong> The customer has approved your quote. 
                    You can now coordinate project scheduling and next steps directly with them.
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

          {/* Assessment Form */}
          {currentView === 'accept_assessment' && (
            <AssessmentForm
              interest={interest}
              responseMessage={responseMessage}
              setResponseMessage={setResponseMessage}
              assessmentDate={assessmentDate}
              setAssessmentDate={setAssessmentDate}
              assessmentTime={assessmentTime}
              setAssessmentTime={setAssessmentTime}
              assessmentDuration={assessmentDuration}
              setAssessmentDuration={setAssessmentDuration}
              assessmentNotes={assessmentNotes}
              setAssessmentNotes={setAssessmentNotes}
              loading={loading}
            />
          )}

          {/* 🔧 FIXED: Quote Update Form with proper handler connection */}
          {currentView === 'update_quote' && (
            <QuoteUpdate
              interest={interest}
              responseMessage={responseMessage}
              setResponseMessage={setResponseMessage}
              onSubmit={handleUpdateQuote}
              loading={loading}
            />
          )}
        </div>

        {/* 🔧 FIXED: Enhanced Footer Actions */}
        <SheetFooter className="border-t pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            
            {/* Overview Actions - only show for selected status */}
            {currentView === 'overview' && interest?.status === 'selected' && canRespond && (
              <OverviewActions
                interest={interest}
                setCurrentView={setCurrentView}
                loading={loading}
              />
            )}

            {/* Form Actions for all form views */}
            {currentView !== 'overview' && (
              <FormActions
                currentView={currentView}
                loading={loading}
                onCancel={handleBackToOverview}
                onSubmit={getSubmitHandler()}
                responseMessage={responseMessage}
                declineReason={declineReason}
                assessmentDate={assessmentDate}
                assessmentTime={assessmentTime}
              />
            )}

            {/* Status-specific footer messages */}
            {currentView === 'overview' && interest?.status !== 'selected' && (
              <div className="text-center w-full">
                {interest?.status === 'updated' && (
                  <p className="text-sm text-muted-foreground">
                    💬 Your quote update is under customer review. You'll be notified of their decision.
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
                {deadlineInfo.isExpired && interest?.status === 'selected' && (
                  <p className="text-sm text-muted-foreground italic text-red-600">
                    ⏰ Response deadline has passed. Contact customer directly if still interested.
                  </p>
                )}
              </div>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}