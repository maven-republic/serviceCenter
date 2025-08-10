// src/components/sheet/AppointmentInformationView.jsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, ArrowLeft, User, Calendar, MapPin, MessageSquare, Clock, Phone, Mail, Building2, AlertCircle, Heart, Users, DollarSign, Target, Trophy, Crown, CheckCircle, ExternalLink, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
// ✅ FIXED: Import the correct forms
import ProfessionalInterestForm from '@/components/professional-workspace/interests/ProfessionalInterestForm'
import InterestResponseForm from '@/components/professional-workspace/interests/InterestResponseForm'
import AppointmentInteractionForm from '@/components/forms/AppointmentInteractionForm'

export default function AppointmentInformationView({ 
  open, 
  onOpenChange, 
  appointment,
  professionalId, // Professional ID for invitation and response context
  professional, // Professional profile data
  onAccept,
  onDecline,
  onExpressInterest,
  onUpdateInterest,
  onRefresh,
  mode = 'available', // 'available', 'interests', 'assigned'
  setActiveTab // ✅ NEW: For navigation between tabs
}) {
  const [currentView, setCurrentView] = useState('details') // 'details', 'accept', 'decline', 'quote', 'express_interest', 'update_interest'
  const [actionLoading, setActionLoading] = useState(false)

  // ✅ NEW: Check for existing interest - Smart state detection
  const existingInterest = useMemo(() => {
    if (!professionalId || !appointment) return null
    
    // For interests mode, we already have the interest
    if (mode === 'interests') {
      return appointment.interests?.[0] || appointment || null
    }
    
    // For available mode, check if professional already responded
    return appointment.interests?.find(i => 
      i.professional_id === professionalId && 
      i.status !== 'withdrawn'
    ) || null
  }, [appointment, professionalId, mode])

  // ✅ NEW: Determine if this is a fresh invitation
  const isFreshInvitation = useMemo(() => {
    const isInvited = professionalId && appointment?.recipients && 
      appointment.recipients.includes(professionalId)
    return isInvited && !existingInterest && mode === 'available'
  }, [professionalId, appointment?.recipients, existingInterest, mode])

  // ✅ NEW: Determine response status for UI
  const responseStatus = useMemo(() => {
    if (!existingInterest) return null
    
    return {
      hasResponded: true,
      status: existingInterest.status,
      message: existingInterest.message,
      amount: existingInterest.amount,
      priceRangeMin: existingInterest.price_range_min,
      priceRangeMax: existingInterest.price_range_max,
      assessment: existingInterest.assessment,
      assessmentJustification: existingInterest.assessment_justification,
      createdAt: existingInterest.created_at,
      updatedAt: existingInterest.updated_at
    }
  }, [existingInterest])

  // ✅ Check if this is an invitation
  const isInvited = useMemo(() => {
    return professionalId && appointment?.recipients && 
      appointment.recipients.includes(professionalId)
  }, [professionalId, appointment?.recipients])

  // Reset view when sheet opens/closes
  useEffect(() => {
    if (open) {
      setCurrentView('details')
      setActionLoading(false)
    }
  }, [open])

  // Handle sheet close
  const handleClose = useCallback(() => {
    if (!actionLoading) {
      setCurrentView('details')
      onOpenChange?.(false)
    }
  }, [actionLoading, onOpenChange])

  // Handle form submission for assigned appointments
  const handleFormSubmit = useCallback(async (formData) => {
    setActionLoading(true)
    
    try {
      console.log('📝 Submitting appointment response:', formData)
      
      // Call the API to update appointment
      const response = await fetch(`/api/appointments/${formData.appointment_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: formData.action === 'accept' ? 'accepted' : 
                 formData.action === 'decline' ? 'declined' : 'quoted',
          
          // Include all form data
          professional_notes: formData.professional_notes,
          estimated_duration: formData.estimated_duration,
          suggested_start: formData.suggested_start,
          suggested_end: formData.suggested_end,
          quoted_price: formData.quoted_price,
          price_breakdown: formData.price_breakdown,
          requirements: formData.requirements,
          next_steps: formData.next_steps,
          decline_reason: formData.decline_reason,
          alternative_suggestions: formData.alternative_suggestions,
          
          // Additional metadata
          response_timestamp: new Date().toISOString(),
          duration_minutes: formData.estimated_duration
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${formData.action} appointment`)
      }

      console.log(`✅ Appointment ${formData.action}ed successfully:`, data.appointment)

      // Call the appropriate callback
      if (formData.action === 'accept') {
        onAccept?.()
      } else if (formData.action === 'decline') {
        onDecline?.()
      }

      // Show success message
      alert(`Appointment ${formData.action}ed successfully!`)

      // Refresh and close
      onRefresh?.()
      handleClose()

    } catch (error) {
      console.error(`❌ Error ${formData.action}ing appointment:`, error)
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, onRefresh, handleClose])

  // ✅ UPDATED: Handle interest expression with new form
  const handleInterestSubmit = useCallback(async (interestData) => {
    setActionLoading(true)
    
    try {
      console.log('🎯 Submitting interest expression:', interestData)
      
      await onExpressInterest?.(appointment.appointment_id, interestData)
      
      // ✅ NEW: Auto-switch to interests tab after successful submission
      if (setActiveTab) {
        setTimeout(() => {
          setActiveTab('interests')
        }, 100)
      }
      
      handleClose()

    } catch (error) {
      console.error('❌ Error expressing interest:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [appointment?.appointment_id, onExpressInterest, setActiveTab, handleClose])

  // ✅ UPDATED: Handle interest update with new form
  const handleInterestUpdate = useCallback(async (updateData) => {
    setActionLoading(true)
    
    try {
      console.log('🔄 Submitting interest update:', updateData)
      
      // Find the interest ID from appointment interests
      const currentInterest = appointment.interests?.find(i => 
        i.professional_id === professionalId || 
        i.status !== 'withdrawn'
      )
      
      if (currentInterest) {
        await onUpdateInterest?.(currentInterest.interest_id, updateData)
      }
      
      // Refresh and close
      onRefresh?.()
      handleClose()

    } catch (error) {
      console.error('❌ Error updating interest:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [appointment?.interests, professionalId, onUpdateInterest, onRefresh, handleClose])

  // ✅ UPDATED: Handle withdraw interest
  const handleWithdrawInterest = useCallback(async () => {
    setActionLoading(true)
    
    try {
      const currentInterest = appointment.interests?.find(i => 
        i.professional_id === professionalId
      )
      
      if (currentInterest) {
        const response = await fetch(`/api/interests/${currentInterest.interest_id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Failed to withdraw interest')
        }
        
        alert('Interest withdrawn successfully')
        onRefresh?.()
        handleClose()
      }
    } catch (error) {
      console.error('❌ Error withdrawing interest:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [appointment?.interests, professionalId, onRefresh, handleClose])

  // Handle quick actions (for simple accept/decline without form)
  const handleQuickAction = useCallback(async (action) => {
    setActionLoading(true)
    
    try {
      if (action === 'accept') {
        await onAccept?.()
      } else if (action === 'decline') {
        await onDecline?.()
      } else if (action === 'express_interest') {
        await onExpressInterest?.(appointment.appointment_id, {
          intent: isInvited ? 'high' : 'standard',
          message: 'I am interested in this project and would like to provide a quote.',
          assessment: false,
          modality: 'none'
        })
      }
      
      onRefresh?.()
      handleClose()
    } catch (error) {
      console.error(`❌ Quick ${action} error:`, error)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, onExpressInterest, appointment?.appointment_id, isInvited, onRefresh, handleClose])

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Format date for relative display
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  // Enhanced status configuration for interest workflow
  const getStatusConfig = (status, mode) => {
    if (mode === 'interests') {
      // Interest status configurations
      switch (status) {
        case 'interested': 
          return { 
            variant: 'default',
            className: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: Heart,
            label: 'Interested',
            description: 'Your interest has been submitted'
          }
        case 'quoted': 
          return { 
            variant: 'outline',
            className: 'bg-background text-foreground border-border hover:bg-muted/50',
            icon: DollarSign,
            label: 'Quoted',
            description: 'You provided a quote'
          }
        case 'selected': 
          return { 
            variant: 'default',
            className: 'bg-green-100 text-green-800 border-green-200',
            icon: Target,
            label: 'Selected',
            description: 'Customer chose you for this project!'
          }
        case 'confirmed': 
          return { 
            variant: 'default',
            className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            icon: CheckCircle,
            label: 'Confirmed',
            description: 'Project confirmed and ready to start'
          }
        case 'updated': 
          return { 
            variant: 'default',
            className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
            icon: Edit,
            label: 'Updated',
            description: 'You updated your quote - awaiting customer review'
          }
        case 'rejected': 
          return { 
            variant: 'secondary',
            className: 'bg-red-100 text-red-800 border-red-200',
            icon: X,
            label: 'Not Selected',
            description: 'Customer chose another professional'
          }
        default: 
          return { 
            variant: 'secondary',
            className: 'bg-muted text-muted-foreground border-border',
            icon: Heart,
            label: 'Interested',
            description: 'Your interest has been submitted'
          }
      }
    } else {
      // Appointment status configurations
      switch (status) {
        case 'pending': 
          return { 
            variant: 'secondary',
            className: 'bg-muted text-muted-foreground border-border',
            icon: Clock,
            label: mode === 'available' ? 'Available' : 'Pending Review',
            description: mode === 'available' ? 'Open for applications' : 'Awaiting your response'
          }
        case 'interested': 
          return { 
            variant: 'default',
            className: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: Heart,
            label: 'Has Interest',
            description: 'Professionals have shown interest'
          }
        case 'competing': 
          return { 
            variant: 'default',
            className: 'bg-orange-100 text-orange-800 border-orange-200',
            icon: Users,
            label: 'Competitive',
            description: 'Multiple professionals competing'
          }
        case 'evaluating': 
          return { 
            variant: 'default',
            className: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: Target,
            label: 'Under Review',
            description: 'Customer is evaluating responses'
          }
        case 'quoted': 
          return { 
            variant: 'outline',
            className: 'bg-background text-foreground border-border hover:bg-muted/50',
            icon: Building2,
            label: 'Quote Sent',
            description: 'Quote has been provided'
          }
        case 'accepted': 
          return { 
            variant: 'default',
            className: 'bg-foreground text-background hover:bg-foreground/90',
            icon: Calendar,
            label: 'Accepted',
            description: 'Appointment confirmed'
          }
        case 'converted': 
          return { 
            variant: 'default',
            className: 'bg-foreground text-background hover:bg-foreground/90',
            icon: Trophy,
            label: 'Converted',
            description: 'Project completed successfully'
          }
        case 'declined': 
          return { 
            variant: 'secondary',
            className: 'bg-muted text-muted-foreground border-border',
            icon: X,
            label: 'Declined',
            description: 'Appointment was declined'
          }
        default: 
          return { 
            variant: 'secondary',
            className: 'bg-muted text-muted-foreground border-border',
            icon: Clock,
            label: 'Unknown',
            description: 'Status unknown'
          }
      }
    }
  }

  // Enhanced urgency configuration
  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case 'low': 
        return { 
          className: 'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
          text: 'Flexible',
          indicator: 'bg-muted-foreground',
          description: 'No rush - flexible timeline'
        }
      case 'standard': 
        return { 
          className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
          text: 'Standard',
          indicator: 'bg-muted-foreground',
          description: 'Normal timeline expectations'
        }
      case 'high': 
        return { 
          className: 'bg-background text-foreground border-border hover:bg-muted/30',
          text: 'Priority',
          indicator: 'bg-foreground',
          description: 'High priority - quick response needed'
        }
      case 'critical': 
        return { 
          className: 'bg-foreground text-background hover:bg-foreground/90',
          text: 'Urgent',
          indicator: 'bg-background',
          description: 'Critical - immediate attention required'
        }
      default: 
        return { 
          className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
          text: 'Standard',
          indicator: 'bg-muted-foreground',
          description: 'Normal timeline expectations'
        }
    }
  }

  if (!appointment) return null

  // Determine if showing interest data vs appointment data
  const isInterestView = mode === 'interests'
  const currentInterest = isInterestView ? (existingInterest || appointment) : null
  const displayData = isInterestView ? appointment : appointment
  
  console.log('🔍 AppointmentInformationView Debug:', {
    mode,
    currentView,
    professionalId,
    appointment: appointment?.appointment_id,
    isInvited,
    isFreshInvitation,
    responseStatus: responseStatus?.status,
    existingInterest: !!existingInterest
  })
  
  const statusConfig = getStatusConfig(
    isInterestView ? currentInterest?.status : displayData.status, 
    mode
  )
  const urgencyConfig = getUrgencyConfig(displayData.urgency)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className={cn(
          "professional-workspace",
          "w-full sm:max-w-2xl lg:max-w-3xl flex flex-col overflow-hidden bg-background border-border"
        )}
        onInteractOutside={(e) => {
          if (actionLoading) {
            e.preventDefault()
          }
        }}
      >
        {/* ✅ UPDATED: Enhanced Header */}
        <SheetHeader className="pb-6 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {currentView !== 'details' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentView('details')}
                    disabled={actionLoading}
                    className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex-1">
                  <SheetTitle className="text-xl font-bold text-foreground">
                    {currentView === 'details' ? (
                      mode === 'available' ? 'Available Appointment' :
                      mode === 'interests' ? 'My Interest Details' :
                      'Appointment Details'
                    ) :
                     currentView === 'express_interest' ? (isFreshInvitation ? 'Respond to Invitation' : 'Express Interest') :
                     currentView === 'update_interest' ? 'Update Interest' :
                     currentView === 'accept' ? 'Accept Appointment' :
                     currentView === 'decline' ? 'Decline Appointment' :
                     currentView === 'quote' ? 'Send Quote' : 'Appointment'}
                  </SheetTitle>
                </div>
              </div>
              
              {/* ✅ UPDATED: Enhanced Status and Invitation Badges */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {/* Invitation badge */}
                {isInvited && (
                  <Badge className="bg-blue-600 text-white border-blue-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Invited
                  </Badge>
                )}
                
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", statusConfig.indicator)} />
                  <Badge className={statusConfig.className}>
                    <statusConfig.icon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                
                {/* Urgency badge */}
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", urgencyConfig.indicator)} />
                  <Badge className={urgencyConfig.className}>
                    {urgencyConfig.text}
                  </Badge>
                </div>
                
                {/* Competition indicator for available appointments */}
                {mode === 'available' && displayData.interest_summary?.total_count > 0 && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    <Users className="w-3 h-3 mr-1" />
                    {displayData.interest_summary.total_count} interested
                  </Badge>
                )}

                {/* Response status for available appointments */}
                {mode === 'available' && responseStatus && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Response Submitted
                  </Badge>
                )}
              </div>
              
              <SheetDescription className="text-muted-foreground">
                {currentView === 'details' 
                  ? (mode === 'available' ? (responseStatus ? 'You have already responded to this appointment' : 'Review details and express interest if suitable') :
                     mode === 'interests' ? 'Manage your interest and view appointment details' :
                     'Review appointment details and take action')
                  : 'Complete the form below to respond to this appointment'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ✅ UPDATED: Scrollable Content */}
        <ScrollArea className="flex-1 py-6 bg-background">
          
          {/* Details View */}
          {currentView === 'details' && (
            <div className="space-y-6 px-6">
              
              {/* ✅ UPDATED: Interest Details (for interests tab) with enhanced display */}
              {isInterestView && currentInterest && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                      <div className="p-2 rounded-md bg-muted/50">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </div>
                      My Interest Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Expressed</span>
                        <span className="text-foreground font-mono text-sm">
                          {formatRelativeTime(currentInterest.created_at)}
                        </span>
                      </div>
                      
                      {currentInterest.amount && (
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">My Quote</span>
                          <span className="text-foreground font-semibold">
                            JMD ${parseFloat(currentInterest.amount).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* ✅ Enhanced: Price range display */}
                      {(currentInterest.price_range_min || currentInterest.price_range_max) && (
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">Price Range</span>
                          <span className="text-foreground font-semibold">
                            JMD ${currentInterest.price_range_min ? parseFloat(currentInterest.price_range_min).toLocaleString() : '?'} - 
                            ${currentInterest.price_range_max ? parseFloat(currentInterest.price_range_max).toLocaleString() : '?'}
                          </span>
                        </div>
                      )}
                      
                      {currentInterest.assessment && (
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">Assessment</span>
                          <span className="text-foreground">
                            {currentInterest.modality || 'Required'}
                            {currentInterest.fee && ` - JMD $${currentInterest.fee}`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between py-3">
                        <span className="font-medium text-muted-foreground">Intent Level</span>
                        <Badge className={currentInterest.intent === 'high' ? 'bg-blue-100 text-blue-800' : 'bg-muted text-muted-foreground'}>
                          {currentInterest.intent === 'high' ? 'High Priority' : 'Standard'}
                        </Badge>
                      </div>
                    </div>
                    
                    {currentInterest.message && (
                      <div className="p-4 bg-muted/20 border border-border rounded-md border-l-4 border-l-foreground">
                        <p className="text-foreground italic leading-relaxed">
                          "{currentInterest.message}"
                        </p>
                      </div>
                    )}

                    {/* ✅ Enhanced: Assessment justification display */}
                    {currentInterest.assessment_justification && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md border-l-4 border-l-amber-500">
                        <div className="font-medium text-amber-800 mb-2">Assessment Justification</div>
                        <p className="text-amber-700 text-sm leading-relaxed">
                          {currentInterest.assessment_justification}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Interest timeline */}
                    {currentInterest.updated_at && currentInterest.updated_at !== currentInterest.created_at && (
                      <div className="text-xs text-muted-foreground border-t pt-3">
                        Last updated: {formatRelativeTime(currentInterest.updated_at)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ✅ UPDATED: Customer Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                    <div className="p-2 rounded-md bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage 
                        src={displayData.customer?.account?.profile_picture_url} 
                        alt="Customer"
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                        {displayData.customer?.account?.first_name?.[0]}
                        {displayData.customer?.account?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground text-lg">
                        {displayData.customer?.account?.first_name} {displayData.customer?.account?.last_name}
                      </h5>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{displayData.customer?.account?.email}</span>
                        </div>
                        {displayData.customer?.phone?.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{displayData.customer.phone.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ✅ UPDATED: Service Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                    <div className="p-2 rounded-md bg-muted/50">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Service Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-foreground mb-2 text-lg">
                      {displayData.service?.name || displayData.title}
                    </h5>
                    {displayData.description && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Project Description:</p>
                        <div className="p-3 bg-muted/30 rounded-md border-l-4 border-primary">
                          <p className="text-sm text-foreground leading-relaxed">{displayData.description}</p>
                        </div>
                      </div>
                    )}
                    {displayData.service?.base_price && (
                      <div className="mt-3 text-sm">
                        <span className="font-medium text-foreground">Base Price:</span>
                        <span className="ml-2 text-primary font-semibold">
                          JMD ${parseFloat(displayData.service.base_price).toLocaleString()}
                        </span>
                        {displayData.service.duration_minutes && (
                          <span className="ml-2 text-muted-foreground">
                            • {displayData.service.duration_minutes} minutes
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ✅ UPDATED: Schedule Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                    <div className="p-2 rounded-md bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="font-medium text-muted-foreground">Preferred Start:</span>
                      <span className="text-foreground">{formatDateTime(displayData.session)}</span>
                    </div>
                    {displayData.preferred_end && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="font-medium text-muted-foreground">Preferred End:</span>
                        <span className="text-foreground">{formatDateTime(displayData.preferred_end)}</span>
                      </div>
                    )}
                    {displayData.deadline && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="font-medium text-muted-foreground">Project Deadline:</span>
                        <span className="text-destructive font-medium">{formatDateTime(displayData.deadline)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="font-medium text-muted-foreground">Urgency Level:</span>
                      <Badge className={urgencyConfig.className}>
                        {urgencyConfig.text}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="font-medium text-muted-foreground">Duration:</span>
                      <span className="text-foreground">{displayData.duration || 60} minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ✅ UPDATED: Location Information */}
              {displayData.address && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                      <div className="p-2 rounded-md bg-muted/50">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      Service Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {displayData.address.street_address && (
                        <div className="text-foreground font-medium">{displayData.address.street_address}</div>
                      )}
                      <div className="text-foreground">
                        {displayData.address.city}, {displayData.address.parish}
                      </div>
                      {displayData.address.community && (
                        <div className="text-muted-foreground italic">{displayData.address.community}</div>
                      )}
                      {displayData.address.landmark && (
                        <div className="text-primary font-medium">Near {displayData.address.landmark}</div>
                      )}
                      {displayData.address.is_rural && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-secondary/50 border border-secondary rounded-md">
                          <AlertCircle className="h-4 w-4 text-secondary-foreground" />
                          <span className="text-secondary-foreground text-sm">Rural location</span>
                        </div>
                      )}
                      {displayData.address.special_instructions && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <div className="font-medium text-amber-800 text-sm">Special Instructions:</div>
                          <div className="text-amber-700 text-sm mt-1">{displayData.address.special_instructions}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ✅ UPDATED: Customer Message */}
              {displayData.customer_message && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                      <div className="p-2 rounded-md bg-muted/50">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      Customer Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-md border-l-4 border-l-primary">
                      <p className="text-sm text-foreground italic leading-relaxed">"{displayData.customer_message}"</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ✅ UPDATED: Request Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                    <div className="p-2 rounded-md bg-muted/50">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="font-medium text-muted-foreground">Requested:</span>
                      <span className="text-foreground">{formatRelativeTime(displayData.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="font-medium text-muted-foreground">Last Updated:</span>
                      <span className="text-foreground">{formatRelativeTime(displayData.updated_at)}</span>
                    </div>
                    {displayData.interest_count > 0 && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="font-medium text-muted-foreground">Professional Interest:</span>
                        <span className="text-foreground">{displayData.interest_count} professional{displayData.interest_count !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span className="font-medium text-muted-foreground">Appointment ID:</span>
                      <span className="text-foreground font-mono text-sm">
                        {displayData.appointment_id?.split('-')[0]}...
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ✅ UPDATED: Form Views with proper component usage */}
          {(currentView === 'accept' || currentView === 'decline' || currentView === 'quote') && (
            <div className="px-6">
              <AppointmentInteractionForm
                appointment={displayData}
                action={currentView}
                mode="assigned"
                onSubmit={handleFormSubmit}
                onCancel={() => setCurrentView('details')}
                loading={actionLoading}
              />
            </div>
          )}

          {/* ✅ UPDATED: Interest Expression Form */}
          {currentView === 'express_interest' && (
            <div className="px-6">
              <ProfessionalInterestForm
                appointment={displayData}
                professionalId={professionalId}
                isInvitation={isFreshInvitation}
                onSubmit={handleInterestSubmit}
                onCancel={() => setCurrentView('details')}
                loading={actionLoading}
              />
            </div>
          )}

          {/* ✅ UPDATED: Interest Update Form */}
          {currentView === 'update_interest' && currentInterest && (
            <div className="px-6">
              <InterestResponseForm
                interest={currentInterest}
                appointment={displayData}
                onSubmit={handleInterestUpdate}
                onWithdraw={handleWithdrawInterest}
                onCancel={() => setCurrentView('details')}
                loading={actionLoading}
              />
            </div>
          )}
        </ScrollArea>

        {/* ✅ UPDATED: Smart Context-Aware Footer */}
        {currentView === 'details' && (
          <SheetFooter className="border-t border-border pt-6 bg-muted/30">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="text-sm text-muted-foreground font-mono bg-muted/30 px-3 py-1 rounded">
                ID: {displayData.appointment_id?.split('-')[0]}...
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* ✅ UPDATED: Available Appointments - Smart State Detection */}
                {mode === 'available' && !responseStatus && (
                  <Button
                    size="sm"
                    onClick={() => setCurrentView('express_interest')}
                    disabled={actionLoading}
                    className={`flex items-center gap-2 ${isFreshInvitation ? 'bg-blue-600 hover:bg-blue-700' : 'bg-foreground hover:bg-foreground/90'} text-white`}
                  >
                    {isFreshInvitation ? <Crown className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                    {isFreshInvitation ? 'Respond to Invitation' : 'Express Interest'}
                  </Button>
                )}

                {/* ✅ UPDATED: Show response status for available appointments */}
                {mode === 'available' && responseStatus && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Response Submitted</span>
                    </div>
                    <div className="text-sm text-green-600">
                      {responseStatus.amount ? 
                        `Quoted: JMD ${parseFloat(responseStatus.amount).toLocaleString()}` :
                        responseStatus.priceRangeMin && responseStatus.priceRangeMax ?
                        `Range: JMD ${parseFloat(responseStatus.priceRangeMin).toLocaleString()} - ${parseFloat(responseStatus.priceRangeMax).toLocaleString()}` :
                        `Status: ${responseStatus.status}`
                      }
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
                      className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Manage in My Interests
                    </Button>
                  </div>
                )}

                {/* ✅ UPDATED: My Interests Actions */}
                {mode === 'interests' && currentInterest && (
                  <>
                    {['interested', 'quoted', 'updated'].includes(currentInterest.status) && (
                      <Button
                        size="sm"
                        onClick={() => setCurrentView('update_interest')}
                        disabled={actionLoading}
                        className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90"
                      >
                        <Edit className="h-4 w-4" />
                        Update Interest
                      </Button>
                    )}
                    
                    {currentInterest.status === 'selected' && (
                      <div className="flex items-center gap-2 text-green-600 italic text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">You were selected for this project!</span>
                      </div>
                    )}
                    
                    {currentInterest.status === 'confirmed' && (
                      <div className="flex items-center gap-2 text-emerald-600 italic text-sm bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Project confirmed - ready to start!</span>
                      </div>
                    )}
                    
                    {currentInterest.status === 'rejected' && (
                      <div className="flex items-center gap-2 text-muted-foreground italic text-sm bg-muted/30 px-3 py-2 rounded-lg border border-border">
                        <X className="h-4 w-4" />
                        <span>Customer selected another professional</span>
                      </div>
                    )}
                  </>
                )}

                {/* ✅ UPDATED: Assigned Appointments Actions */}
                {mode === 'assigned' && displayData.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentView('quote')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 bg-background hover:bg-muted border-border text-foreground"
                    >
                      <DollarSign className="h-4 w-4" />
                      Send Quote
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentView('decline')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => setCurrentView('accept')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90"
                    >
                      <Calendar className="h-4 w-4" />
                      Accept
                    </Button>
                  </>
                )}

                {/* ✅ NEW: Status-specific information for other appointment statuses */}
                {mode === 'assigned' && displayData.status !== 'pending' && (
                  <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
                    <statusConfig.icon className="h-4 w-4" />
                    This appointment has been {displayData.status}
                  </div>
                )}
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}