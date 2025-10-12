// src/components/professional-workspace/interests/actions/OverviewActions.jsx
'use client'

import { Button } from '@/components/ui/button'
import { X, Calendar, Edit, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function OverviewActions({
  interest,
  assessment = null,
  setCurrentView,
  loading = false,
  loadingAssessment = false
}) {
  
  // ✅ COMPREHENSIVE DEBUG LOGGING
  console.log('🔍 OverviewActions Render:', {
    timestamp: new Date().toISOString(),
    interest: interest ? {
      id: interest.interest_id,
      status: interest.status,
      assessment: interest.assessment,
      amount: interest.amount
    } : 'NULL',
    assessment: assessment ? {
      id: assessment.assessment_id,
      status: assessment.status,
      final_quote_provided: assessment.final_quote_provided,
      final_quote_amount: assessment.final_quote_amount
    } : 'NULL',
    loadingAssessment
  })
  
  // ✅ Determine if assessment workflow is complete
  // CRITICAL: Check if assessment exists in the interest record, not just if it's true
  const isAssessmentRequired = interest?.assessment === true
  const hasAssessmentRecord = !!assessment
  const isAssessmentComplete = assessment?.status === 'completed' && assessment?.final_quote_provided === true
  
  // If there's an assessment record OR assessment flag is true, require completion
  const canAcceptAsQuoted = !isAssessmentRequired && !hasAssessmentRecord || isAssessmentComplete
  
  // ✅ CRITICAL DEBUG OUTPUT
  console.log('🎯 Button Visibility Logic:', {
    isAssessmentRequired,
    hasAssessment: !!assessment,
    assessmentStatus: assessment?.status || 'NO_ASSESSMENT',
    finalQuoteProvided: assessment?.final_quote_provided || false,
    isAssessmentComplete,
    canAcceptAsQuoted,
    SHOULD_SHOW_ACCEPT: canAcceptAsQuoted,
    SHOULD_SHOW_PROVIDE_QUOTE: isAssessmentRequired && assessment?.status === 'completed' && !assessment?.final_quote_provided
  })
  
  // ✅ Show loading state while fetching assessment
  if (loadingAssessment) {
    return (
      <div className="w-full flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading assessment details...</span>
        </div>
      </div>
    )
  }
  
  // ✅ Get assessment status message
  const getAssessmentStatusMessage = () => {
    if (!isAssessmentRequired) return null
    
    if (!assessment) {
      return 'Assessment needs to be scheduled'
    }
    
    switch (assessment.status) {
      case 'proposed':
        return 'Waiting for customer to accept assessment proposal'
      case 'accepted':
        return 'Assessment accepted - please schedule'
      case 'scheduled':
        return 'Assessment scheduled - please complete and provide final quote'
      case 'active':
        return 'Assessment in progress - please complete and provide final quote'
      case 'completed':
        if (!assessment.final_quote_provided) {
          return 'Assessment complete - please provide final quote'
        }
        return null // Ready to accept
      default:
        return `Assessment status: ${assessment.status}`
    }
  }
  
  const assessmentMessage = getAssessmentStatusMessage()
  
  return (
    <div className="w-full space-y-3">
      {/* ✅ DEBUG PANEL - Remove this after fixing */}
      <Alert className="bg-gray-50 border-gray-300">
        <AlertCircle className="h-4 w-4 text-gray-600" />
        <AlertDescription className="text-gray-800 text-xs font-mono">
          <strong>DEBUG:</strong> 
          Assessment Required: {isAssessmentRequired ? 'YES' : 'NO'} | 
          Assessment Exists: {assessment ? 'YES' : 'NO'} | 
          Can Accept: {canAcceptAsQuoted ? 'YES' : 'NO'}
        </AlertDescription>
      </Alert>
      
      {/* ✅ Show assessment status alert */}
      {isAssessmentRequired && assessmentMessage && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Assessment Required:</strong> {assessmentMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {/* ✅ Show success message when assessment complete */}
      {isAssessmentRequired && isAssessmentComplete && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Assessment Complete!</strong> Final quote provided: ${assessment.final_quote_amount}. Ready to confirm booking.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Primary actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* ✅ FIXED: Only show if no assessment required OR assessment complete */}
        {canAcceptAsQuoted ? (
          <>
            <Button
              onClick={() => {
                console.log('✅ Accept as Quoted clicked')
                setCurrentView('accept')
              }}
              disabled={loading}
              className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white order-last sm:order-none"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isAssessmentComplete ? 'Confirm Final Quote' : 'Accept as Quoted'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                console.log('📝 Accept with Updates clicked')
                setCurrentView('update_quote')
              }}
              disabled={loading}
              className="w-full sm:flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Accept with Updates
            </Button>
          </>
        ) : (
          /* ✅ Show assessment-specific actions when assessment required but not complete */
          <>
            {!assessment && (
              <Button
                onClick={() => {
                  console.log('📅 Propose Assessment clicked')
                  setCurrentView('accept_assessment')
                }}
                disabled={loading}
                className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Propose Assessment
              </Button>
            )}
            
            {assessment && assessment.status === 'completed' && !assessment.final_quote_provided && (
              <Button
                onClick={() => {
                  console.log('💰 Provide Final Quote clicked')
                  setCurrentView('provide_final_quote')
                }}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Provide Final Quote
              </Button>
            )}
            
            {assessment && ['proposed', 'accepted', 'scheduled', 'active'].includes(assessment.status) && (
              <Button
                variant="outline"
                onClick={() => {
                  console.log('📋 Manage Assessment clicked')
                  setCurrentView('manage_assessment')
                }}
                disabled={loading}
                className="w-full sm:flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Manage Assessment
              </Button>
            )}
          </>
        )}
      </div>
      
      {/* Secondary actions - always available */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          variant="outline"
          onClick={() => {
            console.log('❌ Unable to Accept clicked')
            setCurrentView('decline')
          }}
          disabled={loading}
          className="w-full sm:flex-1"
        >
          <X className="h-4 w-4 mr-2" />
          Unable to Accept
        </Button>
      </div>
    </div>
  )
}