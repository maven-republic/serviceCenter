// src/components/sheet/AppointmentInformationView.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ArrowLeft, User, Calendar, MapPin, MessageSquare, Clock, Phone, Mail, Building2, AlertCircle, Heart, Users, DollarSign, Target, Trophy } from 'lucide-react'
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
import AppointmentInteractionForm from '@/components/forms/AppointmentInteractionForm'

export default function AppointmentInformationView({ 
  open, 
  onOpenChange, 
  appointment,
  onAccept,
  onDecline,
  onExpressInterest,
  onUpdateInterest,
  mode = 'assigned' // 'available', 'interests', 'assigned'
}) {
  const [currentView, setCurrentView] = useState('details') // 'details', 'accept', 'decline', 'quote', 'express_interest'
  const [actionLoading, setActionLoading] = useState(false)

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
      // TODO: Replace with toast notification
      alert(`Appointment ${formData.action}ed successfully!`)

      // Close sheet
      handleClose()

    } catch (error) {
      console.error(`❌ Error ${formData.action}ing appointment:`, error)
      // TODO: Replace with toast notification
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, handleClose])

  // Handle interest expression (for available appointments)
  const handleInterestSubmit = useCallback(async (interestData) => {
    setActionLoading(true)
    
    try {
      console.log('🎯 Submitting interest expression:', interestData)
      
      await onExpressInterest?.(appointment.appointment_id, interestData)
      
      handleClose()

    } catch (error) {
      console.error('❌ Error expressing interest:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [appointment?.appointment_id, onExpressInterest, handleClose])

  // Handle interest update (for existing interests)
  const handleInterestUpdate = useCallback(async (updateData) => {
    setActionLoading(true)
    
    try {
      console.log('🔄 Submitting interest update:', updateData)
      
      // Find the interest ID from appointment interests
      const currentInterest = appointment.interests?.find(i => 
        i.professional_id === appointment.viewMode?.professional_id || 
        i.status !== 'withdrawn'
      )
      
      if (currentInterest) {
        await onUpdateInterest?.(currentInterest.interest_id, updateData)
      }
      
      handleClose()

    } catch (error) {
      console.error('❌ Error updating interest:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [appointment?.interests, onUpdateInterest, handleClose])

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
          intent: 'high',
          message: 'I am interested in this project and would like to provide a quote.',
          assessment: false,
          modality: 'none'
        })
      }
      handleClose()
    } catch (error) {
      console.error(`❌ Quick ${action} error:`, error)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, onExpressInterest, appointment?.appointment_id, handleClose])

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

  // Enhanced status configuration for interest workflow
  const getStatusConfig = (status, mode) => {
    if (mode === 'interests') {
      // Interest status configurations
      switch (status) {
        case 'interested': 
          return { 
            variant: 'default',
            className: 'bg-blue-100 text-blue-800',
            icon: Heart,
            label: 'Interested'
          }
        case 'quoted': 
          return { 
            variant: 'outline',
            className: 'bg-background text-foreground border-border',
            icon: DollarSign,
            label: 'Quoted'
          }
        case 'selected': 
          return { 
            variant: 'default',
            className: 'bg-green-100 text-green-800',
            icon: Target,
            label: 'Selected'
          }
        case 'rejected': 
          return { 
            variant: 'destructive',
            className: 'bg-red-100 text-red-800',
            icon: X,
            label: 'Not Selected'
          }
        default: 
          return { 
            variant: 'secondary',
            className: 'bg-muted text-muted-foreground border-border',
            icon: Heart,
            label: 'Interested'
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
            label: mode === 'available' ? 'Available' : 'Pending Review'
          }
        case 'interested': 
          return { 
            variant: 'default',
            className: 'bg-blue-100 text-blue-800',
            icon: Heart,
            label: 'Has Interest'
          }
        case 'competing': 
          return { 
            variant: 'default',
            className: 'bg-orange-100 text-orange-800',
            icon: Users,
            label: 'Competitive'
          }
        case 'evaluating': 
          return { 
            variant: 'default',
            className: 'bg-purple-100 text-purple-800',
            icon: Target,
            label: 'Under Review'
          }
        case 'quoted': 
          return { 
            variant: 'outline',
            className: 'bg-background text-foreground border-border hover:bg-muted/50',
            icon: Building2,
            label: 'Quote Sent'
          }
        case 'accepted': 
          return { 
            variant: 'default',
            className: 'bg-foreground text-background hover:bg-foreground/90',
            icon: Calendar,
            label: 'Accepted'
          }
        case 'converted': 
          return { 
            variant: 'default',
            className: 'bg-foreground text-background hover:bg-foreground/90',
            icon: Trophy,
            label: 'Converted'
          }
        case 'declined': 
          return { 
            variant: 'secondary',
            className: 'bg-muted text-muted-foreground border-border',
            icon: X,
            label: 'Declined'
          }
        default: 
          return { 
            variant: 'secondary',
            className: 'bg-muted text-muted-foreground border-border',
            icon: Clock,
            label: 'Unknown'
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
          indicator: 'bg-muted-foreground'
        }
      case 'standard': 
        return { 
          className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
          text: 'Standard',
          indicator: 'bg-muted-foreground'
        }
      case 'high': 
        return { 
          className: 'bg-background text-foreground border-border hover:bg-muted/30',
          text: 'Priority',
          indicator: 'bg-foreground'
        }
      case 'urgent': 
        return { 
          className: 'bg-foreground text-background hover:bg-foreground/90',
          text: 'Urgent',
          indicator: 'bg-background'
        }
      default: 
        return { 
          className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
          text: 'Standard',
          indicator: 'bg-muted-foreground'
        }
    }
  }

  if (!appointment) return null

  // Determine if showing interest data vs appointment data
  const isInterestView = mode === 'interests'
  const currentInterest = isInterestView ? appointment.interests?.[0] : null
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
          "w-full sm:max-w-2xl lg:max-w-3xl flex flex-col overflow-hidden bg-background border-border"
        )}
        onInteractOutside={(e) => {
          if (!actionLoading) {
            return true
          }
          e.preventDefault()
        }}
      >
        {/* Header */}
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
                     currentView === 'express_interest' ? 'Express Interest' :
                     currentView === 'accept' ? 'Accept Appointment' :
                     currentView === 'decline' ? 'Decline Appointment' :
                     currentView === 'quote' ? 'Send Quote' : 'Appointment'}
                  </SheetTitle>
                </div>
              </div>
              
              {/* Status and Competition Badges */}
              <div className="flex items-center gap-3 mb-3">
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
                
                {/* Competition Indicator for Available Appointments */}
                {mode === 'available' && displayData.interest_summary?.total_count > 0 && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    <Users className="w-3 h-3 mr-1" />
                    {displayData.interest_summary.total_count} interested
                  </Badge>
                )}
              </div>
              
              <SheetDescription className="text-muted-foreground">
                {currentView === 'details' 
                  ? (mode === 'available' ? 'Review details and express interest if suitable' :
                     mode === 'interests' ? 'Manage your interest and view appointment details' :
                     'Review appointment details and take action')
                  : 'Complete the form below to respond to this appointment'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 bg-background">
          
          {/* Details View */}
          {currentView === 'details' && (
            <div className="space-y-6">
              
              {/* Interest Details (for interests tab) */}
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
                          {formatDateTime(currentInterest.created_at)}
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
                      
                      {currentInterest.assessment && (
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">Assessment</span>
                          <span className="text-foreground">
                            {currentInterest.modality || 'Required'}
                            {currentInterest.fee && ` - JMD $${currentInterest.fee}`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {currentInterest.message && (
                      <div className="p-4 bg-muted/20 border border-border rounded-md border-l-4 border-l-foreground">
                        <p className="text-foreground italic leading-relaxed">
                          "{currentInterest.message}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Customer Information */}
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

              {/* Service Information */}
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
                    <h5 className="font-semibold text-foreground text-lg mb-3">
                      {displayData.service?.name || displayData.title}
                    </h5>
                    {displayData.description && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Project Description</p>
                        <div className="p-4 bg-muted/30 rounded-md border-l-4 border-foreground">
                          <p className="text-sm text-foreground leading-relaxed">{displayData.description}</p>
                        </div>
                      </div>
                    )}
                    {displayData.service?.base_price && (
                      <div className="mt-4 p-3 bg-muted/20 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Base Price</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-foreground">
                              JMD ${displayData.service.base_price}
                            </span>
                            {displayData.service.duration_minutes && (
                              <p className="text-sm text-muted-foreground">
                                {displayData.service.duration_minutes} minutes
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                    <div className="p-2 rounded-md bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Preferred Start</span>
                        <span className="text-foreground font-mono text-sm">{formatDateTime(displayData.session)}</span>
                      </div>
                      {displayData.preferred_end && (
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">Preferred End</span>
                          <span className="text-foreground font-mono text-sm">{formatDateTime(displayData.preferred_end)}</span>
                        </div>
                      )}
                      {displayData.deadline && (
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">Project Deadline</span>
                          <span className="text-foreground font-mono text-sm font-medium">{formatDateTime(displayData.deadline)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-3">
                        <span className="font-medium text-muted-foreground">Urgency Level</span>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", urgencyConfig.indicator)} />
                          <Badge className={urgencyConfig.className}>
                            {urgencyConfig.text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
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
                    <div className="space-y-3">
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
                        <div className="text-foreground font-medium">Near {displayData.address.landmark}</div>
                      )}
                      {displayData.address.is_rural && (
                        <div className="flex items-center gap-2 mt-3 p-3 bg-muted/30 border border-border rounded-md">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground text-sm">Rural location</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Customer Message */}
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
                    <div className="p-4 bg-muted/20 border border-border rounded-md border-l-4 border-l-foreground">
                      <p className="text-foreground italic leading-relaxed">"{displayData.customer_message}"</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Competition Analysis (for available appointments) */}
              {mode === 'available' && displayData.interest_summary?.total_count > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                      <div className="p-2 rounded-md bg-muted/50">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      Competition Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/20 rounded-md">
                        <div className="text-2xl font-bold text-foreground">
                          {displayData.interest_summary.total_count}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Interests</div>
                      </div>
                      <div className="text-center p-3 bg-muted/20 rounded-md">
                        <div className="text-2xl font-bold text-foreground">
                          {displayData.interest_summary.quoted_count || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">With Quotes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Form Views */}
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

          {/* Interest Expression Form */}
          {currentView === 'express_interest' && (
            <div className="px-6">
              <AppointmentInteractionForm
                appointment={displayData}
                action="express_interest"
                mode="available"
                onSubmit={handleInterestSubmit}
                onCancel={() => setCurrentView('details')}
                loading={actionLoading}
              />
            </div>
          )}

          {/* Interest Update Form */}
          {currentView === 'update_interest' && (
            <div className="px-6">
              <AppointmentInteractionForm
                appointment={displayData}
                interest={currentInterest}
                action="update_interest"
                mode="interests"
                onSubmit={handleInterestUpdate}
                onCancel={() => setCurrentView('details')}
                loading={actionLoading}
              />
            </div>
          )}
        </div>

        {/* Footer - Context-Aware Actions */}
        {currentView === 'details' && (
          <SheetFooter className="border-t border-border pt-6 bg-muted/30">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="text-sm text-muted-foreground font-mono bg-muted/30 px-3 py-1 rounded">
                ID: {displayData.appointment_id?.split('-')[0]}...
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* Available Appointments Actions */}
                {mode === 'available' && (
                  <Button
                    size="sm"
                    onClick={() => setCurrentView('express_interest')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Heart className="h-4 w-4" />
                    Express Interest
                  </Button>
                )}

                {/* My Interests Actions */}
                {mode === 'interests' && currentInterest && (
                  <>
                    {currentInterest.status === 'interested' && (
                      <Button
                        size="sm"
                        onClick={() => setCurrentView('update_interest')}
                        disabled={actionLoading}
                        className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90"
                      >
                        <DollarSign className="h-4 w-4" />
                        Update Quote
                      </Button>
                    )}
                    
                    {currentInterest.status === 'quoted' && (
                      <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
                        <Clock className="h-4 w-4" />
                        Awaiting customer response
                      </div>
                    )}
                    
                    {currentInterest.status === 'selected' && (
                      <div className="flex items-center gap-2 text-green-600 italic text-sm">
                        <Target className="h-4 w-4" />
                        You were selected for this project!
                      </div>
                    )}
                    
                    {currentInterest.status === 'rejected' && (
                      <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
                        <X className="h-4 w-4" />
                        Customer selected another professional
                      </div>
                    )}
                  </>
                )}

                {/* Assigned Appointments Actions */}
                {mode === 'assigned' && displayData.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentView('quote')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 bg-background hover:bg-muted border-border text-foreground"
                    >
                      <Building2 className="h-4 w-4" />
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
                
                {mode === 'assigned' && displayData.status === 'quoted' && (
                  <>
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
                      Accept Quote
                    </Button>
                  </>
                )}
                
                {mode === 'assigned' && ['accepted', 'converted', 'declined'].includes(displayData.status) && (
                  <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
                    {displayData.status === 'declined' ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
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