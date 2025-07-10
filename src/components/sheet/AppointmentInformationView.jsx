// src/components/sheet/AppointmentInformationView.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ArrowLeft, User, Calendar, MapPin, MessageSquare, Clock, Phone, Mail, Building2, AlertCircle } from 'lucide-react'
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
  onDecline 
}) {
  const [currentView, setCurrentView] = useState('details') // 'details', 'accept', 'decline', 'quote'
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

  // Handle form submission
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

  // Handle quick actions (for simple accept/decline without form)
  const handleQuickAction = useCallback(async (action) => {
    setActionLoading(true)
    
    try {
      if (action === 'accept') {
        await onAccept?.()
      } else if (action === 'decline') {
        await onDecline?.()
      }
      handleClose()
    } catch (error) {
      console.error(`❌ Quick ${action} error:`, error)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, handleClose])

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

  // Analytics-style status configuration (dark theme optimized)
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': 
        return { 
          variant: 'secondary',
          className: 'bg-muted text-muted-foreground border-border',
          icon: Clock,
          label: 'Pending Review'
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
          icon: Calendar,
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

  // Analytics-style urgency configuration (dark theme optimized)
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

  const statusConfig = getStatusConfig(appointment.status)
  const urgencyConfig = getUrgencyConfig(appointment.urgency)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className={cn(
          "professional-workspace", // 🔥 Apply dark theme here
          "w-full sm:max-w-2xl lg:max-w-3xl flex flex-col overflow-hidden bg-background border-border"
        )}
        onInteractOutside={(e) => {
          if (!actionLoading) {
            return true
          }
          e.preventDefault()
        }}
      >
        {/* Header - Dark Analytics Style */}
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
                    {currentView === 'details' ? 'Appointment Details' :
                     currentView === 'accept' ? 'Accept Appointment' :
                     currentView === 'decline' ? 'Decline Appointment' :
                     currentView === 'quote' ? 'Send Quote' : 'Appointment'}
                  </SheetTitle>
                </div>
              </div>
              
              {/* Status and Urgency Badges - Dark Theme */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", statusConfig.indicator)} />
                  <Badge className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", urgencyConfig.indicator)} />
                  <Badge className={urgencyConfig.className}>
                    {urgencyConfig.text}
                  </Badge>
                </div>
              </div>
              
              <SheetDescription className="text-muted-foreground">
                {currentView === 'details' 
                  ? 'Review appointment details and take action'
                  : 'Complete the form below to respond to this appointment'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Content - Dark Theme */}
        <div className="flex-1 overflow-y-auto py-6 bg-background">
          
          {/* Details View */}
          {currentView === 'details' && (
            <div className="space-y-6">
              
              {/* Customer Information - Dark Card Style */}
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
                        src={appointment.customer?.account?.profile_picture_url} 
                        alt="Customer"
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                        {appointment.customer?.account?.first_name?.[0]}
                        {appointment.customer?.account?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground text-lg">
                        {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
                      </h5>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{appointment.customer?.account?.email}</span>
                        </div>
                        {appointment.customer?.phone?.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.customer.phone.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Information - Dark Card Style */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                    <div className="p-2 rounded-md bg-muted/50">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Service 
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-foreground text-lg mb-3">
                      {appointment.service?.name || appointment.title}
                    </h5>
                    {appointment.description && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Project Description</p>
                        <div className="p-4 bg-muted/30 rounded-md border-l-4 border-foreground">
                          <p className="text-sm text-foreground leading-relaxed">{appointment.description}</p>
                        </div>
                      </div>
                    )}
                    {appointment.service?.base_price && (
                      <div className="mt-4 p-3 bg-muted/20 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Base Price</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-foreground">
                              JMD ${appointment.service.base_price}
                            </span>
                            {appointment.service.duration_minutes && (
                              <p className="text-sm text-muted-foreground">
                                {appointment.service.duration_minutes} minutes
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Information - Dark Card Style */}
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
                        <span className="font-medium text-muted-foreground">Appointment</span>
                        <span className="text-foreground font-mono text-sm">{formatDateTime(appointment.preferred_start)}</span>
                      </div>
                      {appointment.preferred_end && (
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">Preferred End</span>
                          <span className="text-foreground font-mono text-sm">{formatDateTime(appointment.preferred_end)}</span>
                        </div>
                      )}
                      {appointment.deadline && (
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">Project Deadline</span>
                          <span className="text-foreground font-mono text-sm font-medium">{formatDateTime(appointment.deadline)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-3">
                        <span className="font-medium text-muted-foreground">Urgency Level</span>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", urgencyConfig.indicator)} />
                          <Badge className={urgencyConfig.className}>
                            {urgencyConfig.text}
                            {appointment.urgency === 'standard' ? ' (3 days)' :
                             appointment.urgency === 'low' ? ' (1 week)' :
                             appointment.urgency === 'high' ? ' (24hrs)' : ' (ASAP)'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information - Dark Card Style */}
              {appointment.address && (
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
                      {appointment.address.street_address && (
                        <div className="text-foreground font-medium">{appointment.address.street_address}</div>
                      )}
                      <div className="text-foreground">
                        {appointment.address.city}, {appointment.address.parish}
                      </div>
                      {appointment.address.community && (
                        <div className="text-muted-foreground italic">{appointment.address.community}</div>
                      )}
                      {appointment.address.landmark && (
                        <div className="text-foreground font-medium">Near {appointment.address.landmark}</div>
                      )}
                      {appointment.address.is_rural && (
                        <div className="flex items-center gap-2 mt-3 p-3 bg-muted/30 border border-border rounded-md">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground text-sm">Rural location</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Customer Message - Dark Card Style */}
              {appointment.customer_message && (
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
                      <p className="text-foreground italic leading-relaxed">"{appointment.customer_message}"</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Request Information - Dark Card Style */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                    <div className="p-2 rounded-md bg-muted/50">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Requested</span>
                        <span className="text-foreground font-mono text-sm">{formatDateTime(appointment.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Last Updated</span>
                        <span className="text-foreground font-mono text-sm">{formatDateTime(appointment.updated_at)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="font-medium text-muted-foreground">Appointment ID</span>
                        <span className="text-foreground font-mono text-sm bg-muted/30 px-2 py-1 rounded">
                          {appointment.appointment_id.split('-')[0]}...
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Form Views */}
          {(currentView === 'accept' || currentView === 'decline' || currentView === 'quote') && (
            <div className="px-6">
              <AppointmentInteractionForm
                appointment={appointment}
                action={currentView}
                onSubmit={handleFormSubmit}
                onCancel={() => setCurrentView('details')}
                loading={actionLoading}
              />
            </div>
          )}
        </div>

        {/* Footer - Dark Analytics Style */}
        {currentView === 'details' && (
          <SheetFooter className="border-t border-border pt-6 bg-muted/30">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="text-sm text-muted-foreground font-mono bg-muted/30 px-3 py-1 rounded">
                ID: {appointment.appointment_id.split('-')[0]}...
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {appointment.status === 'pending' && (
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
                
                {appointment.status === 'quoted' && (
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
                
                {['accepted', 'converted', 'declined'].includes(appointment.status) && (
                  <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
                    {appointment.status === 'declined' ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                    This appointment has been {appointment.status}
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