// src/components/professional-workspace/interests/InterestSuccessView.jsx
'use client'

import { CheckCircle, DollarSign, Calendar, Clock, Info, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function InterestSuccessView({ 
  submittedData,
  appointment,
  isInvited = false,
  onViewInterests,
  onClose,
  isMobile = false
}) {
  if (!submittedData) return null

  const isAssessmentResponse = submittedData.assessment || 
    (submittedData.price_range_min && submittedData.price_range_max)
  
  return (
    <div className="flex flex-col h-full">
      {/* Success Header */}
      <div className={cn(
        "pb-6 border-b bg-gradient-to-r from-green-50 to-emerald-50",
        isMobile ? "p-4" : "pb-6 px-6"
      )}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-green-100 animate-bounce">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className={cn(
              "font-bold text-green-900",
              isMobile ? "text-xl" : "text-2xl"
            )}>
              🎉 {isInvited ? 'Response Submitted!' : 'Interest Submitted Successfully!'}
            </h2>
            <p className="text-green-700 mt-2 text-sm">
              {isAssessmentResponse 
                ? 'Your assessment proposal has been sent to the customer for review'
                : 'Your quote has been sent to the customer for review'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Success Content - Scrollable */}
      <div className={cn(
        "flex-1 overflow-y-auto bg-background",
        isMobile ? "py-4 px-4" : "py-6 px-6"
      )}>
        <div className="space-y-6 max-w-2xl mx-auto">
          
          {/* Quote Summary Card */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {isAssessmentResponse ? 'Your Assessment Proposal' : 'Your Quote Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount Display */}
              {submittedData.amount ? (
                <div className="text-center py-6 bg-white rounded-lg border border-green-200">
                  <div className="text-4xl sm:text-5xl font-bold text-green-900">
                    JMD ${parseFloat(submittedData.amount).toLocaleString()}
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    {submittedData.assessment ? 'Preliminary Quote' : 'Quote Amount'}
                  </p>
                </div>
              ) : (submittedData.price_range_min || submittedData.price_range_max) && (
                <div className="text-center py-6 bg-white rounded-lg border border-green-200">
                  <div className="text-2xl sm:text-3xl font-bold text-green-900">
                    JMD ${submittedData.price_range_min ? parseFloat(submittedData.price_range_min).toLocaleString() : '?'} - 
                    ${submittedData.price_range_max ? parseFloat(submittedData.price_range_max).toLocaleString() : '?'}
                  </div>
                  <p className="text-sm text-green-700 mt-2">Estimated Price Range</p>
                </div>
              )}

              {/* Assessment Info */}
              {submittedData.assessment && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-amber-700" />
                    <p className="font-medium text-amber-900">Assessment Required</p>
                  </div>
                  <div className="space-y-2 text-sm text-amber-800">
                    <p>Method: <span className="font-medium capitalize">{submittedData.modality}</span></p>
                    {submittedData.fee > 0 && (
                      <p>Fee: <span className="font-medium">JMD ${submittedData.fee}</span></p>
                    )}
                    {submittedData.assessment_justification && (
                      <div className="mt-2 pt-2 border-t border-amber-300">
                        <p className="italic">"{submittedData.assessment_justification}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message Preview */}
              {submittedData.message && (
                <div className="p-4 bg-white rounded-md border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-2">Your Message:</p>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{submittedData.message.length > 200 
                      ? submittedData.message.substring(0, 200) + '...' 
                      : submittedData.message}"
                  </p>
                </div>
              )}

              {/* Availability Window */}
              {(submittedData.earliest_start || submittedData.latest_start) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {submittedData.earliest_start && (
                    <div className="p-3 bg-white rounded-md border border-green-200">
                      <p className="font-medium text-green-900 mb-1">Earliest Start</p>
                      <p className="text-muted-foreground">
                        {new Date(submittedData.earliest_start).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {submittedData.latest_start && (
                    <div className="p-3 bg-white rounded-md border border-green-200">
                      <p className="font-medium text-green-900 mb-1">Latest Start</p>
                      <p className="text-muted-foreground">
                        {new Date(submittedData.latest_start).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Duration */}
              {submittedData.estimated_duration_hours && (
                <div className="p-3 bg-white rounded-md border border-green-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-700" />
                    <p className="text-sm">
                      <span className="font-medium text-green-900">Estimated Duration:</span>
                      <span className="text-muted-foreground ml-2">
                        {submittedData.estimated_duration_hours} hours
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-700">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Customer Reviews Your Response</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {isAssessmentResponse 
                      ? "They'll review your assessment proposal and estimated price range alongside other professionals"
                      : isInvited
                      ? "The customer specifically invited you, so your response will be prioritized in their review"
                      : "They'll compare your quote with other professionals who responded"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-700">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Selection Decision</p>
                  <p className="text-sm text-blue-700 mt-1">
                    If the customer selects you, you'll receive an immediate notification
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-700">3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">
                    {isAssessmentResponse ? 'Conduct Assessment' : 'Project Begins'}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {isAssessmentResponse 
                      ? "If selected, you'll schedule and conduct the site assessment, then provide a final quote"
                      : "Once selected and confirmed, you can coordinate project scheduling with the customer"
                    }
                  </p>
                </div>
              </div>

              {isInvited && (
                <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-md border border-amber-200">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    <span className="font-medium">You were personally invited - respond quickly to maximize your chances!</span>
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 bg-white rounded-md border border-blue-200">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Track status in "My Interests" tab</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Info Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-right">
                  {appointment?.service?.name || appointment?.title}
                </span>
              </div>
              {appointment?.address && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right">
                    {appointment.address.city}, {appointment.address.parish}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium text-right">
                  {appointment?.customer?.account?.first_name} {appointment?.customer?.account?.last_name}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Footer */}
      <div className={cn(
        "border-t bg-muted/30",
        isMobile ? "p-4" : "pt-6 px-6 pb-6"
      )}>
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          <Button 
            onClick={onViewInterests}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            View in My Interests
          </Button>
          
          <Button 
            variant="outline"
            onClick={onClose}
            className="w-full h-11"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}