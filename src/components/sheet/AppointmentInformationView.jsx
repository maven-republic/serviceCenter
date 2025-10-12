// src/components/sheet/AppointmentInformationView.jsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, ArrowLeft, User, Calendar, MapPin, MessageSquare, Clock, Phone, Mail, Building2, AlertCircle, Heart, Users, DollarSign, Target, Trophy, Crown, CheckCircle, ExternalLink, Edit, ChevronDown, ChevronUp } from 'lucide-react'
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
import ProfessionalInterestForm from '@/components/professional-workspace/interests/ProfessionalInterestForm'
import InterestResponseForm from '@/components/professional-workspace/interests/InterestResponseForm'
import ProfessionalResponseHandler from '@/components/professional-workspace/interests/ProfessionalResponseHandler'
import AppointmentInteractionForm from '@/components/forms/AppointmentInteractionForm'

export default function AppointmentInformationView({ 
  open, 
  onOpenChange, 
  appointment,
  interests = [],
  professionalId,
  professional,
  onAccept,
  onDecline,
  onExpressInterest,
  onUpdateInterest,
  onRefresh,
  mode = 'available',
  setActiveTab
}) {
  // Mobile detection state
  const [isMobile, setIsMobile] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    service: true,
    details: false,
    interest: true
  })

  // Detect mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const [currentView, setCurrentView] = useState('details')
  const [actionLoading, setActionLoading] = useState(false)

  // All the existing logic from your original file
  const existingInterest = useMemo(() => {
    if (!professionalId || !appointment) return null
    
    if (mode === 'interests') {
      if (appointment.interest_id) {
        const enhancedAppointment = {
          ...appointment,
          professional_id: appointment.professional_id || professionalId
        }
        return enhancedAppointment
      }
      
      if (interests?.length > 0) {
        const foundInterest = interests.find(i => {
          const iProfId = i.professional_id || i.professionalId || professionalId
          return iProfId === professionalId || String(iProfId) === String(professionalId)
        })
        
        if (foundInterest) {
          const enhancedInterest = {
            ...foundInterest,
            professional_id: foundInterest.professional_id || foundInterest.professionalId || professionalId
          }
          return enhancedInterest
        }
        
        const enhancedFirstInterest = {
          ...interests[0],
          professional_id: interests[0].professional_id || interests[0].professionalId || professionalId
        }
        return enhancedFirstInterest
      }
      return null
    }
    
    const foundInterest = interests?.find(i => {
      const iProfId = i.professional_id || i.professionalId
      return iProfId === professionalId && i.status !== 'withdrawn'
    })
    
    return foundInterest || null
  }, [appointment, professionalId, mode, interests])

  const getInterestMode = useCallback(() => {
    if (!existingInterest) return null
    
    const status = existingInterest.status
    const interestProfessionalId = existingInterest.professional_id || 
                                  existingInterest.professionalId || 
                                  professionalId
    
    const professionalIdMatch = interestProfessionalId === professionalId || 
                               String(interestProfessionalId) === String(professionalId) ||
                               (mode === 'interests' && !existingInterest.professional_id)
    
    const isProfessionalSelected = status === 'selected' && professionalIdMatch
    
    if (isProfessionalSelected) return 'response'
    if (['interested', 'quoted', 'updated'].includes(status)) return 'edit'
    return 'view'
  }, [existingInterest, professionalId, mode])

  const interestMode = getInterestMode()

  const isFreshInvitation = useMemo(() => {
    const isInvited = professionalId && appointment?.recipients && 
      appointment.recipients.includes(professionalId)
    return isInvited && !existingInterest && mode === 'available'
  }, [professionalId, appointment?.recipients, existingInterest, mode])

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

  const isInvited = useMemo(() => {
    return professionalId && appointment?.recipients && 
      appointment.recipients.includes(professionalId)
  }, [professionalId, appointment?.recipients])

  // Reset view when sheet opens/closes
  useEffect(() => {
    if (open) {
      setCurrentView('details')
      setActionLoading(false)
      // Reset expanded sections for mobile
      if (isMobile) {
        setExpandedSections({
          customer: true,
          service: true,
          details: false,
          interest: true
        })
      } else {
        setExpandedSections({
          customer: true,
          service: true,
          details: true,
          interest: true
        })
      }
    }
  }, [open, isMobile])

  // Mobile section toggle
  const toggleSection = (section) => {
    if (isMobile) {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }))
    }
  }

  // Handle sheet close
  const handleClose = useCallback(() => {
    if (!actionLoading) {
      setCurrentView('details')
      onOpenChange?.(false)
    }
  }, [actionLoading, onOpenChange])

  // FIXED: Professional accept/decline handler
  const handleFormSubmit = useCallback(async (formData) => {
    setActionLoading(true)
    
    try {
      if (formData.action === 'accept') {
        // FIXED: Professional acceptance should trigger booking creation by setting status to 'approved'
        const response = await fetch(`/api/appointments/${formData.appointment_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'approved', // FIXED: This triggers booking creation logic
            professional_notes: formData.professional_notes,
            estimated_duration: formData.estimated_duration,
            suggested_start: formData.suggested_start,
            suggested_end: formData.suggested_end,
            requirements: formData.requirements,
            next_steps: formData.next_steps,
            response_timestamp: new Date().toISOString(),
            duration_minutes: formData.estimated_duration
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || `Failed to ${formData.action} appointment`)

        onAccept?.()
        alert('Appointment accepted and booking created successfully!')
        onRefresh?.()
        handleClose()

      } else if (formData.action === 'decline') {
        // Professional decline - update appointment status to declined
        const response = await fetch(`/api/appointments/${formData.appointment_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'declined', // Set appointment to declined
            professional_notes: formData.professional_notes,
            decline_reason: formData.decline_reason,
            alternative_suggestions: formData.alternative_suggestions,
            response_timestamp: new Date().toISOString()
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || `Failed to ${formData.action} appointment`)

        onDecline?.()
        alert('Appointment declined successfully!')
        onRefresh?.()
        handleClose()

      } else if (formData.action === 'quote') {
        // Quote logic - update appointment status to quoted
        const response = await fetch(`/api/appointments/${formData.appointment_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'quoted',
            professional_notes: formData.professional_notes,
            estimated_duration: formData.estimated_duration,
            quoted_price: formData.quoted_price,
            price_breakdown: formData.price_breakdown,
            response_timestamp: new Date().toISOString()
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || `Failed to ${formData.action} appointment`)

        alert('Quote sent successfully!')
        onRefresh?.()
        handleClose()
      }

    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, onRefresh, handleClose])

  const handleInterestSubmit = useCallback(async (interestData) => {
    setActionLoading(true)
    
    try {
      await onExpressInterest?.(appointment.appointment_id, interestData)
      
      if (setActiveTab) {
        setTimeout(() => setActiveTab('interests'), 100)
      }
      
      handleClose()
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [appointment?.appointment_id, onExpressInterest, setActiveTab, handleClose])

  const handleInterestUpdate = useCallback(async (updateData) => {
    setActionLoading(true)
    
    try {
      const currentInterest = interests?.find(i => 
        i.professional_id === professionalId || i.status !== 'withdrawn'
      )
      
      if (currentInterest) {
        await onUpdateInterest?.(currentInterest.interest_id, updateData)
      }
      
      onRefresh?.()
      handleClose()
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [interests, professionalId, onUpdateInterest, onRefresh, handleClose])

  const handleProfessionalResponse = useCallback(async (responseData) => {
    setActionLoading(true)
    
    try {
      onRefresh?.()
      handleClose()
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [onRefresh, handleClose])

  const handleWithdrawInterest = useCallback(async () => {
    setActionLoading(true)
    
    try {
      const currentInterest = interests?.find(i => 
        i.professional_id === professionalId
      )
      
      if (currentInterest) {
        const response = await fetch(`/api/interests/${currentInterest.interest_id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) throw new Error('Failed to withdraw interest')
        
        alert('Interest withdrawn successfully')
        onRefresh?.()
        handleClose()
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [interests, professionalId, onRefresh, handleClose])

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
      console.error(`Quick ${action} error:`, error)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, onExpressInterest, appointment?.appointment_id, isInvited, onRefresh, handleClose])

  // Format date functions
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

  // Status configurations
  const getStatusConfig = (status, mode) => {
    if (mode === 'interests') {
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
            icon: Crown,
            label: 'Selected!',
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

  // Collapsible section component for mobile
  const CollapsibleSection = ({ title, icon: Icon, children, sectionKey, defaultExpanded = true }) => {
    const isExpanded = expandedSections[sectionKey]
    
    return (
      <Card className="bg-card border-border">
        <CardHeader 
          className={cn(
            "pb-2 cursor-pointer transition-colors",
            isMobile && "hover:bg-muted/50"
          )}
          onClick={() => toggleSection(sectionKey)}
        >
          <CardTitle className="flex items-center justify-between text-base font-medium text-foreground">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-muted/50">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              {title}
            </div>
            {isMobile && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        {(isExpanded || !isMobile) && (
          <CardContent>
            {children}
          </CardContent>
        )}
      </Card>
    )
  }

  if (!appointment) return null

  const isInterestView = mode === 'interests'
  const currentInterest = isInterestView ? (existingInterest || appointment) : null
  const displayData = isInterestView ? appointment : appointment
  
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
          // Mobile: full screen, Desktop: sidebar
          isMobile ? "w-full h-full" : "w-full sm:max-w-2xl lg:max-w-3xl",
          "flex flex-col overflow-hidden bg-background border-border"
        )}
        onInteractOutside={(e) => {
          if (actionLoading) e.preventDefault()
        }}
      >
        {/* Mobile-Optimized Header */}
        <SheetHeader className={cn(
          "pb-4 border-b border-border bg-muted/30",
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
                    className={cn(
                      "hover:bg-muted text-muted-foreground hover:text-foreground",
                      isMobile ? "h-8 px-2" : "h-8 w-8"
                    )}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {isMobile && <span className="ml-1">Back</span>}
                  </Button>
                )}
                <div className="flex-1">
                  <SheetTitle className={cn(
                    "font-bold text-foreground",
                    isMobile ? "text-lg" : "text-xl"
                  )}>
                    {currentView === 'details' ? (
                      mode === 'available' ? 'Available Appointment' :
                      mode === 'interests' ? 'My Interest Details' :
                      'Appointment Details'
                    ) :
                     currentView === 'express_interest' ? (isFreshInvitation ? 'Respond to Invitation' : 'Express Interest') :
                     currentView === 'update_interest' ? (interestMode === 'response' ? 'Respond to Selection' : 'Update Interest') :
                     'Appointment'}
                  </SheetTitle>
                </div>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={actionLoading}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Mobile-Optimized Status Badges */}
              <div className={cn(
                "flex items-center gap-2 mb-3",
                isMobile ? "flex-wrap" : "gap-3"
              )}>
                {isInvited && (
                  <Badge className="bg-blue-600 text-white border-blue-700">
                    <Crown className="w-3 h-3 mr-1" />
                    {isMobile ? 'Invited' : 'Invited'}
                  </Badge>
                )}
                
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", statusConfig.indicator)} />
                  <Badge className={statusConfig.className}>
                    <statusConfig.icon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", urgencyConfig.indicator)} />
                  <Badge className={urgencyConfig.className}>
                    {urgencyConfig.text}
                  </Badge>
                </div>
                
                {mode === 'available' && displayData.interest_summary?.total_count > 0 && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    <Users className="w-3 h-3 mr-1" />
                    {displayData.interest_summary.total_count} interested
                  </Badge>
                )}

                {/* Mobile Quick Action for Available */}
                {mode === 'available' && !responseStatus && isMobile && (
                  <Button
                    size="sm"
                    onClick={() => setCurrentView('express_interest')}
                    disabled={actionLoading}
                    className={cn(
                      "flex items-center gap-2 text-white",
                      isFreshInvitation ? 'bg-blue-600 hover:bg-blue-700' : 'bg-foreground hover:bg-foreground/90'
                    )}
                  >
                    {isFreshInvitation ? <Crown className="h-3 w-3" /> : <Heart className="h-3 w-3" />}
                    {isFreshInvitation ? 'Respond' : 'Express Interest'}
                  </Button>
                )}
              </div>
              
              <SheetDescription className={cn(
                "text-muted-foreground",
                isMobile ? "text-sm" : ""
              )}>
                {currentView === 'details' 
                  ? (mode === 'available' ? (responseStatus ? 'You have already responded to this appointment' : 'Review details and express interest if suitable') :
                     mode === 'interests' ? (interestMode === 'response' ? 'Customer selected you! Please respond to confirm or decline.' : 'Manage your interest and view appointment details') :
                     'Review appointment details and take action')
                  : 'Complete the form below to respond to this appointment'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Mobile-Optimized Scrollable Content */}
        <ScrollArea className={cn(
          "flex-1 bg-background",
          isMobile ? "py-4" : "py-6"
        )}>
          
          {/* Details View */}
          {currentView === 'details' && (
            <div className={cn(
              "space-y-4",
              isMobile ? "px-4" : "px-6 space-y-6"
            )}>
              
              {/* Interest Details (for interests tab) */}
              {isInterestView && currentInterest && (
                <CollapsibleSection
                  title="My Interest Details"
                  icon={Heart}
                  sectionKey="interest"
                  defaultExpanded={true}
                >
                  <div className="space-y-4">
                    <div className={cn(
                      "grid gap-4",
                      isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                    )}>
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
                            {currentInterest.fee && ` - JMD ${currentInterest.fee}`}
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

                    {currentInterest.assessment_justification && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md border-l-4 border-l-amber-500">
                        <div className="font-medium text-amber-800 mb-2">Assessment Justification</div>
                        <p className="text-amber-700 text-sm leading-relaxed">
                          {currentInterest.assessment_justification}
                        </p>
                      </div>
                    )}

                    {currentInterest.updated_at && currentInterest.updated_at !== currentInterest.created_at && (
                      <div className="text-xs text-muted-foreground border-t pt-3">
                        Last updated: {formatRelativeTime(currentInterest.updated_at)}
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* Customer Information */}
              <CollapsibleSection
                title="Customer Information"
                icon={User}
                sectionKey="customer"
                defaultExpanded={true}
              >
                <div className="flex items-center gap-4">
                  <Avatar className={cn(
                    "border border-border",
                    isMobile ? "h-10 w-10" : "h-12 w-12"
                  )}>
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
                    <h5 className={cn(
                      "font-semibold text-foreground",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      {displayData.customer?.account?.first_name} {displayData.customer?.account?.last_name}
                    </h5>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{displayData.customer?.account?.email}</span>
                      </div>
                      {displayData.customer?.phone?.phone_number && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{displayData.customer.phone.phone_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Service Information */}
              <CollapsibleSection
                title="Service Information"
                icon={Building2}
                sectionKey="service"
                defaultExpanded={true}
              >
                <div className="space-y-4">
                  <div>
                    <h5 className={cn(
                      "font-semibold text-foreground mb-2",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      {displayData.service?.name || displayData.title || 'Service Request'}
                    </h5>
                    {displayData.description && (
                      <p className={cn(
                        "text-muted-foreground leading-relaxed",
                        isMobile ? "text-sm" : ""
                      )}>
                        {displayData.description}
                      </p>
                    )}
                  </div>
                  
                  <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-1" : "grid-cols-2"
                  )}>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Preferred Date</p>
                        <p className="text-muted-foreground text-sm">
                          {formatDateTime(displayData.session)}
                        </p>
                      </div>
                    </div>
                    
                    {displayData.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Location</p>
                          <p className="text-muted-foreground text-sm">
                            {displayData.address.street_address}, {displayData.address.city}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {displayData.budget_range && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Budget Range</p>
                          <p className="text-muted-foreground text-sm">
                            JMD ${displayData.budget_range.min?.toLocaleString()} - 
                            ${displayData.budget_range.max?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {displayData.urgency && (
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Priority Level</p>
                          <p className="text-muted-foreground text-sm">
                            {urgencyConfig.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleSection>

              {/* Additional Details (collapsible on mobile) */}
              <CollapsibleSection
                title="Additional Details"
                icon={MessageSquare}
                sectionKey="details"
                defaultExpanded={!isMobile}
              >
                <div className="space-y-4">
                  {displayData.customer_message && (
                    <div className="p-4 bg-muted/20 border border-border rounded-md border-l-4 border-l-foreground">
                      <p className="font-medium text-foreground mb-2">Customer Message</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {displayData.customer_message}
                      </p>
                    </div>
                  )}
                  
                  {displayData.requirements && (
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Requirements</p>
                      <div className="space-y-1">
                        {displayData.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-foreground rounded-full flex-shrink-0" />
                            <span className="text-muted-foreground">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-3 py-2 rounded border">
                    Created: {formatRelativeTime(displayData.created_at)} • 
                    ID: {displayData.appointment_id?.split('-')[0]}...
                  </div>
                </div>
              </CollapsibleSection>

              {/* Available Mode Response Status */}
              {mode === 'available' && responseStatus && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">
                          {responseStatus.status === 'confirmed' ? 'Project Confirmed' : 'Response Submitted'}
                        </p>
                        <p className="text-sm text-green-600">
                          {responseStatus.status === 'confirmed' ? 
                            'Ready to start! Contact customer to coordinate.' :
                            responseStatus.amount ? 
                            `Quoted: JMD ${parseFloat(responseStatus.amount).toLocaleString()}` :
                            `Status: ${responseStatus.status}`
                          }
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
                        className="text-green-700 border-green-300 hover:bg-green-100"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {isMobile ? 'Manage' : 'Manage in My Interests'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Form Views */}
          {(currentView === 'accept' || currentView === 'decline' || currentView === 'quote') && (
            <div className={cn(isMobile ? "px-4" : "px-6")}>
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

          {/* Interest Expression Form */}
          {currentView === 'express_interest' && (
            <div className={cn(isMobile ? "px-4" : "px-6")}>
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

          {/* Interest Update Forms */}
          {currentView === 'update_interest' && currentInterest && (
            <div className={cn(isMobile ? "px-4 mb-6" : "px-6 mb-6")}>
              {interestMode === 'response' ? (
                <ProfessionalResponseHandler
                  interest={currentInterest}
                  appointment={displayData}
                  professional={professional}
                  onSuccess={(result) => {
                    onRefresh?.()
                    setCurrentView('details')
                  }}
                  onClose={() => setCurrentView('details')}
                  open={true}
                />
              ) : interestMode === 'edit' ? (
                <InterestResponseForm
                  interest={currentInterest}
                  appointment={displayData}
                  onSubmit={handleInterestUpdate}
                  onWithdraw={handleWithdrawInterest}
                  onCancel={() => setCurrentView('details')}
                  loading={actionLoading}
                />
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Interest Status: {currentInterest.status}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        This interest is in read-only mode due to its current status.
                      </p>
                      {currentInterest.status === 'rejected' && (
                        <p className="text-sm mt-2 text-red-600">
                          The customer selected another professional for this project.
                        </p>
                      )}
                      {currentInterest.status === 'confirmed' && (
                        <p className="text-sm mt-2 text-green-600">
                          Project confirmed! The customer may contact you soon.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('details')}
                    className="w-full"
                  >
                    Back to Details
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Mobile-Optimized Footer Actions */}
        {currentView === 'details' && (
          <SheetFooter className={cn(
            "border-t border-border bg-muted/30",
            isMobile ? "p-4" : "pt-6"
          )}>
            <div className={cn(
              "flex items-center justify-between w-full gap-4",
              isMobile ? "flex-col space-y-3" : "flex-col sm:flex-row"
            )}>
              {!isMobile && (
                <div className="text-sm text-muted-foreground font-mono bg-muted/30 px-3 py-1 rounded">
                  ID: {displayData.appointment_id?.split('-')[0]}...
                </div>
              )}
              
              <div className={cn(
                "flex items-center gap-3",
                isMobile ? "w-full justify-center flex-wrap" : "flex-wrap"
              )}>
                {/* Interest Actions */}
                {mode === 'interests' && currentInterest && (
                  <>
                    {interestMode === 'response' && (
                      <Button
                        size={isMobile ? "default" : "sm"}
                        onClick={() => setCurrentView('update_interest')}
                        disabled={actionLoading}
                        className={cn(
                          "flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white",
                          isMobile && "flex-1"
                        )}
                      >
                        <Crown className="h-4 w-4" />
                        {isMobile ? 'Respond' : 'Respond to Selection'}
                      </Button>
                    )}
                    
                    {interestMode === 'edit' && (
                      <Button
                        size={isMobile ? "default" : "sm"}
                        onClick={() => setCurrentView('update_interest')}
                        disabled={actionLoading}
                        className={cn(
                          "flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90",
                          isMobile && "flex-1"
                        )}
                      >
                        <Edit className="h-4 w-4" />
                        {isMobile ? 'Update' : 'Update Interest'}
                      </Button>
                    )}
                    
                    {currentInterest.status === 'confirmed' && (
                      <div className={cn(
                        "flex items-center gap-2 text-emerald-600 italic text-sm bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200",
                        isMobile && "w-full justify-center"
                      )}>
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">
                          {isMobile ? 'Project confirmed!' : 'Project confirmed - ready to start!'}
                        </span>
                      </div>
                    )}
                    
                    {currentInterest.status === 'rejected' && (
                      <div className={cn(
                        "flex items-center gap-2 text-muted-foreground italic text-sm bg-muted/30 px-3 py-2 rounded-lg border border-border",
                        isMobile && "w-full justify-center"
                      )}>
                        <X className="h-4 w-4" />
                        <span>{isMobile ? 'Not selected' : 'Customer selected another professional'}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Available Mode Actions */}
                {mode === 'available' && !responseStatus && !isMobile && (
                  <Button
                    size="sm"
                    onClick={() => setCurrentView('express_interest')}
                    disabled={actionLoading}
                    className={cn(
                      "flex items-center gap-2 text-white",
                      isFreshInvitation ? 'bg-blue-600 hover:bg-blue-700' : 'bg-foreground hover:bg-foreground/90'
                    )}
                  >
                    {isFreshInvitation ? <Crown className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                    {isFreshInvitation ? 'Respond to Invitation' : 'Express Interest'}
                  </Button>
                )}

                {/* Assigned Mode Actions */}
                {mode === 'assigned' && (
                  <div className={cn(
                    "flex gap-2",
                    isMobile && "w-full"
                  )}>
                    <Button
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      onClick={() => setCurrentView('decline')}
                      disabled={actionLoading}
                      className={cn(
                        "flex items-center gap-2 text-red-600 hover:text-red-700",
                        isMobile && "flex-1"
                      )}
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                    <Button
                      size={isMobile ? "default" : "sm"}
                      onClick={() => setCurrentView('accept')}
                      disabled={actionLoading}
                      className={cn(
                        "flex items-center gap-2",
                        isMobile && "flex-1"
                      )}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </Button>
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