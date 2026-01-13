// src/components/sheet/AppointmentInformationView.jsx
// ✅ COMPLETE REBUILD - Clean, modern PATH B workflow
// ✅ FIXED: Proper handling of myInterest from page.jsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  X, ArrowLeft, User, Calendar, MapPin, MessageSquare, Clock, 
  Mail, Building2, AlertCircle, Crown, Info, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from '@/components/ui/scroll-area'

// Import our new clean components
import InterestForm from '@/components/professional-workspace/interests/InterestForm'
import InterestSuccessView from '@/components/professional-workspace/interests/InterestSuccessView'

export default function AppointmentInformationView({ 
  open, 
  onOpenChange, 
  appointment,
  interests = [],
  professionalId,
  onExpressInterest,
  onRefresh,
  mode = 'available', // 'available' | 'interest'
  setActiveTab
}) {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  // View state: 'details' | 'form' | 'success'
  const [currentView, setCurrentView] = useState('details')
  const [actionLoading, setActionLoading] = useState(false)
  
  // Success state
  const [showSuccessState, setShowSuccessState] = useState(false)
  const [submittedQuoteData, setSubmittedQuoteData] = useState(null)

  // Detect mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setCurrentView('details')
      setShowSuccessState(false)
      setSubmittedQuoteData(null)
      setActionLoading(false)
    }
  }, [open])

  // ✅ CRITICAL: Determine effective mode based on myInterest or mode prop
  const effectiveMode = useMemo(() => {
    console.log('🎯 Determining effective mode:', {
      hasMyInterest: !!appointment?.myInterest,
      modeProp: mode,
      myInterestData: appointment?.myInterest ? {
        id: appointment.myInterest.interest_id,
        status: appointment.myInterest.status
      } : null
    });
    
    // If appointment has myInterest attached from page.jsx, it's an interest view
    if (appointment?.myInterest) {
      console.log('✅ Using INTEREST mode (myInterest detected)');
      return 'interest'
    }
    // Otherwise use the mode prop
    console.log('✅ Using mode from prop:', mode);
    return mode
  }, [appointment?.myInterest, mode])

  // Check if invited
  const isInvited = useMemo(() => {
    return professionalId && appointment?.recipients && 
      appointment.recipients.includes(professionalId)
  }, [professionalId, appointment?.recipients])

  // ✅ FIXED: Check for existing interest using effectiveMode and myInterest
  const hasExistingInterest = useMemo(() => {
    // Don't check for duplicates when showing success state
    if (showSuccessState || currentView === 'success') {
      return false
    }
    
    // If we're in interest mode (myInterest attached), then yes, interest exists
    if (effectiveMode === 'interest') {
      return true
    }
    
    // Otherwise, check the interests array (for available mode)
    if (effectiveMode !== 'available' || !professionalId || !appointment?.appointment_id) {
      return false
    }
    
    const existingInterest = interests?.find(i => {
      const interestAppointmentId = i.appointment_id || i.appointment?.appointment_id
      const interestProfessionalId = i.professional_id || i.professionalId
      
      const appointmentMatch = interestAppointmentId === appointment.appointment_id
      const professionalMatch = interestProfessionalId === professionalId
      const notWithdrawn = i.status !== 'withdrawn'
      
      return appointmentMatch && professionalMatch && notWithdrawn
    })
    
    console.log('🔍 Duplicate check:', {
      effectiveMode,
      appointmentId: appointment.appointment_id,
      professionalId,
      hasMyInterest: !!appointment?.myInterest,
      totalInterests: interests?.length || 0,
      foundExisting: !!existingInterest,
      existingInterestId: existingInterest?.interest_id,
      currentView,
      showSuccessState
    })
    
    return !!existingInterest
  }, [interests, professionalId, appointment?.appointment_id, appointment?.myInterest, effectiveMode, currentView, showSuccessState])

  // Get the current interest data (if in interest mode)
  const currentInterest = useMemo(() => {
    if (effectiveMode === 'interest') {
      return appointment?.myInterest || null
    }
    return null
  }, [effectiveMode, appointment?.myInterest])

  // Close handler
  const handleClose = useCallback(() => {
    if (!actionLoading) {
      setCurrentView('details')
      setShowSuccessState(false)
      setSubmittedQuoteData(null)
      onOpenChange?.(false)
    }
  }, [actionLoading, onOpenChange])

  // ✅ Handle interest submission
  const handleInterestSubmit = useCallback(async (interestData) => {
    setActionLoading(true)
    
    console.log('🚀 Submitting interest:', {
      appointmentId: appointment.appointment_id,
      professionalId,
      hasExistingInterest,
      effectiveMode
    })
    
    try {
      const result = await onExpressInterest?.(appointment.appointment_id, interestData)
      
      console.log('✅ Interest submitted successfully')
      
      // Show success state FIRST (before refresh)
      setSubmittedQuoteData(interestData)
      setShowSuccessState(true)
      setCurrentView('success')
      setActionLoading(false)
      
      // Refresh in background AFTER showing success
      // Use setTimeout to ensure success state is rendered first
      setTimeout(() => {
        onRefresh?.()
      }, 100)
      
    } catch (error) {
      console.error('❌ Error submitting interest:', error)
      
      // Only handle duplicate errors from the API (409 status)
      if (error.message && error.message.toLowerCase().includes('already expressed interest')) {
        alert('You have already submitted an interest for this appointment. Check "My Interests" tab.')
        
        if (setActiveTab) {
          setActiveTab('interests')
        }
        
        handleClose()
      } else {
        alert(`Error: ${error.message}`)
      }
      
      setShowSuccessState(false)
      setActionLoading(false)
    }
  }, [appointment?.appointment_id, professionalId, hasExistingInterest, effectiveMode, onExpressInterest, onRefresh, setActiveTab, handleClose])

  // Handle view interests
  const handleViewInterests = useCallback(() => {
    if (setActiveTab) {
      setActiveTab('interests')
    }
    handleClose()
  }, [setActiveTab, handleClose])

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: isMobile ? 'short' : 'long',
      year: 'numeric',
      month: isMobile ? 'short' : 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!appointment) return null

  // ✅ Log the current state for debugging
  console.log('📊 AppointmentInformationView State:', {
    mode,
    effectiveMode,
    hasMyInterest: !!appointment?.myInterest,
    hasExistingInterest,
    currentInterest: !!currentInterest,
    currentView
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className={cn(
          "professional-workspace flex flex-col overflow-hidden",
          isMobile ? "w-full h-full" : "w-full sm:max-w-2xl lg:max-w-3xl"
        )}
        onInteractOutside={(e) => {
          if (actionLoading) e.preventDefault()
        }}
      >
        
        {/* Success View */}
        {showSuccessState && currentView === 'success' ? (
          <InterestSuccessView
            submittedData={submittedQuoteData}
            appointment={appointment}
            isInvited={isInvited}
            onViewInterests={handleViewInterests}
            onClose={handleClose}
            isMobile={isMobile}
          />
        ) : (
          <>
            {/* Header */}
            <SheetHeader className={cn(
              "pb-4 border-b",
              isInvited && currentView === 'details' && !hasExistingInterest ? "bg-gradient-to-r from-amber-50 to-orange-50" : "bg-muted/30",
              isMobile ? "p-4" : "pb-6"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {currentView !== 'details' && (
                      <Button
                        variant="ghost"
                        size={isMobile ? "sm" : "icon"}
                        onClick={() => setCurrentView('details')}
                        disabled={actionLoading}
                        className={cn(isMobile ? "h-8 px-2" : "h-8 w-8")}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {isMobile && <span className="ml-1">Back</span>}
                      </Button>
                    )}
                    <SheetTitle className={cn(
                      "font-bold",
                      isMobile ? "text-lg" : "text-xl"
                    )}>
                      {currentView === 'details' ? (
                        effectiveMode === 'interest' ? 'My Interest Details' :
                        isInvited ? '👑 Personal Invitation' : 'Available Appointment'
                      ) : currentView === 'form' ? (
                        isInvited ? 'Respond to Invitation' : 'Express Interest'
                      ) : 'Appointment'}
                    </SheetTitle>
                    {isMobile && currentView === 'details' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={actionLoading}
                        className="h-8 w-8 p-0 ml-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Invitation Alert - Only show if NOT already submitted */}
                  {isInvited && currentView === 'details' && !hasExistingInterest && effectiveMode === 'available' && (
                    <Alert className="mb-3 border-amber-500 bg-amber-50">
                      <Crown className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-900">
                        The customer specifically invited you! You have a higher chance of being selected.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Status Badges */}
                  {currentView === 'details' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {effectiveMode === 'interest' && currentInterest && (
                        <Badge className="bg-green-600 text-white">
                          Interest Submitted
                        </Badge>
                      )}
                      
                      {isInvited && effectiveMode === 'available' && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Invited
                        </Badge>
                      )}
                      
                      <Badge variant="outline">
                        {currentInterest?.status || appointment.status}
                      </Badge>
                      
                      {appointment.urgency && (
                        <Badge variant="outline">
                          {appointment.urgency}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <SheetDescription className={cn("mt-2", isMobile ? "text-sm" : "")}>
                    {currentView === 'details' 
                      ? effectiveMode === 'interest'
                        ? 'Your submitted interest details'
                        : hasExistingInterest 
                          ? 'You have already responded to this appointment'
                          : isInvited 
                            ? 'Review details and submit your response'
                            : 'Review details and express interest if suitable'
                      : 'Complete the form to submit your response'
                    }
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Content */}
            <ScrollArea className={cn("flex-1", isMobile ? "py-4" : "py-6")}>
              
              {/* Details View */}
              {currentView === 'details' && (
                <div className={cn("space-y-4", isMobile ? "px-4" : "px-6 space-y-6")}>
                  
                  {/* My Interest Details - Show when in interest mode */}
                  {effectiveMode === 'interest' && currentInterest && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-green-800">
                          <Info className="h-4 w-4" />
                          Your Submitted Interest
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentInterest.amount && (
                          <div>
                            <p className="text-sm font-medium text-green-800">Quote Amount</p>
                            <p className="text-xl font-bold text-green-900">
                              JMD ${parseFloat(currentInterest.amount).toLocaleString()}
                            </p>
                          </div>
                        )}
                        
                        {currentInterest.message && (
                          <div>
                            <p className="text-sm font-medium text-green-800">Your Message</p>
                            <p className="text-sm text-green-900 leading-relaxed">
                              {currentInterest.message}
                            </p>
                          </div>
                        )}
                        
                        {currentInterest.needs_assessment && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800 text-sm">
                              Assessment required before final quote
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewInterests}
                            className="w-full text-green-700 border-green-300 hover:bg-green-100"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View in My Interests
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Already Submitted Alert - Show when in available mode but has interest */}
                  {effectiveMode === 'available' && hasExistingInterest && (
                    <Alert className="border-blue-500 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <strong>Interest Already Submitted</strong>
                            <p className="text-sm mt-1">
                              You've already expressed interest in this appointment. 
                              View it in "My Interests" tab.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (setActiveTab) {
                                setActiveTab('interests')
                                handleClose()
                              }
                            }}
                            className="shrink-0 text-blue-700 border-blue-300 hover:bg-blue-100"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Avatar className={cn(isMobile ? "h-10 w-10" : "h-12 w-12")}>
                          <AvatarImage src={appointment.customer?.account?.profile_picture_url} />
                          <AvatarFallback>
                            {appointment.customer?.account?.first_name?.[0]}
                            {appointment.customer?.account?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h5 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>
                            {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
                          </h5>
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{appointment.customer?.account?.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Service Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className={cn("font-semibold mb-2", isMobile ? "text-base" : "text-lg")}>
                          {appointment.service?.name || appointment.title}
                        </h5>
                        {appointment.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                      
                      <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Preferred Date</p>
                            <p className="text-muted-foreground text-sm">
                              {formatDateTime(appointment.session)}
                            </p>
                          </div>
                        </div>
                        
                        {appointment.address && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">Location</p>
                              <p className="text-muted-foreground text-sm">
                                {appointment.address.city}, {appointment.address.parish}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Message */}
                  {appointment.customer_message && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Customer Message
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {appointment.customer_message}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Form View */}
              {currentView === 'form' && (
                <InterestForm
                  appointment={appointment}
                  professionalId={professionalId}
                  isInvited={isInvited}
                  onSuccess={handleInterestSubmit}
                  onCancel={() => setCurrentView('details')}
                  isMobile={isMobile}
                />
              )}
            </ScrollArea>

            {/* Footer - Only show for available mode without existing interest */}
            {currentView === 'details' && effectiveMode === 'available' && !hasExistingInterest && (
              <div className={cn(
                "border-t bg-muted/30",
                isMobile ? "p-4" : "pt-6 px-6 pb-6"
              )}>
                <Button 
                  onClick={() => setCurrentView('form')}
                  disabled={actionLoading}
                  className={cn(
                    "w-full text-white",
                    isInvited 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  )}
                >
                  {isInvited ? <Crown className="h-4 w-4 mr-2" /> : null}
                  {isInvited ? 'Respond to Invitation' : 'Express Interest'}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}