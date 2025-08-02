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
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

// Import custom hooks
import { 
  useProfessionalResponseState,
  useProfessionalResponseHandlers
} from '@/primitives/professional'

import QuoteUpdateForm from './forms/QuoteUpdate'

// Import render components
import {
  ProjectDetails,
  ResponseDeadlineAlert
} from './render'

// Import form components
import {
  AcceptForm,
  AssessmentForm,
  DeclineForm
} from './forms'

// Import action components
import {
  FormActions,
  OverviewActions
} from './actions'

export default function ProfessionalResponseHandler({
  interest,
  appointment,
  professional, // Add this prop
  onSuccess,    // Add this prop
  onClose,
  open = true
}) {
  // Custom hooks for state - FIXED to match your actual hook
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

  // Custom hooks for handlers - FIXED to match your actual hook
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
    setCurrentView('overview')
    resetFormData()
  }

  // Check if user can respond (not expired)
  const canRespond = !deadlineInfo.isExpired

  // Get appropriate submit handler based on current view
  const getSubmitHandler = () => {
    switch (currentView) {
      case 'accept': return handleAccept
      case 'decline': return handleDecline
      case 'accept_assessment': return handleAcceptAssessment
      case 'update_quote': return handleUpdateQuote
      default: return () => {}
    }
  }

  // Get title and description based on current view
  const getViewConfig = () => {
    const configs = {
      overview: {
        title: '🎉 You\'ve Been Selected!',
        description: 'Customer chose you for this project. Please respond within 48 hours.'
      },
      accept: {
        title: '✅ Accept Selection',
        description: 'Confirm your availability and next steps with the customer.'
      },
      decline: {
        title: '❌ Decline Selection',
        description: 'Let the customer know why you\'re unable to take on this project.'
      },
      update_quote: {
        title: '📝 Update Quote & Terms',
        description: 'Modify your quote or terms based on customer requirements.'
      },
      accept_assessment: {
        title: '📅 Schedule Assessment',
        description: 'Schedule the on-site assessment you proposed.'
      }
    }
    return configs[currentView] || configs.overview
  }

  const viewConfig = getViewConfig()

  if (!interest || !appointment) return null

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
              
              <SheetTitle className="text-xl font-bold text-left">
                {viewConfig.title}
              </SheetTitle>
              
              <SheetDescription className="text-left">
                {viewConfig.description}
              </SheetDescription>
            </div>
          </div>

          {/* Deadline Warning */}
          <ResponseDeadlineAlert deadlineInfo={deadlineInfo} />
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6">
          
          {/* Overview View */}
          {currentView === 'overview' && (
            <div className="space-y-6">
              <ProjectDetails appointment={appointment} interest={interest} />
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

         {/* Update Quote Form - TODO: Create QuoteUpdateForm component */}
{/* Quote Update Form */}
{currentView === 'update_quote' && (
  <QuoteUpdateForm
    interest={interest}
    responseMessage={responseMessage}
    setResponseMessage={setResponseMessage}
    onSubmit={handleUpdateQuote}
    loading={loading}
  />
)}
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            
            {/* Overview Actions */}
            {currentView === 'overview' && canRespond && (
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

            {/* Expired state */}
            {deadlineInfo.isExpired && (
              <div className="text-sm text-muted-foreground italic">
                Response deadline has passed. Contact customer directly if still interested.
              </div>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}