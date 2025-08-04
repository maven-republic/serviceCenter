// src/components/professional-workspace/modal/AppointmentInformationModal.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, User, Calendar, MapPin, MessageSquare, Clock, Phone, Mail, Building2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppointmentInteractionForm from '@/components/forms/AppointmentInteractionForm'

export default function AppointmentInformationModal({ 
  isOpen, 
  onClose, 
  appointment,
  onAccept,
  onDecline 
}) {
  const [currentView, setCurrentView] = useState('details') // 'details', 'accept', 'decline', 'quote'
  const [actionLoading, setActionLoading] = useState(false)

  // Reset view when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentView('details')
      setActionLoading(false)
    }
  }, [isOpen])

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!actionLoading) {
      setCurrentView('details')
      onClose?.()
    }
  }, [actionLoading, onClose])

  // Handle form submission
  const handleFormSubmit = useCallback(async (formData) => {
    setActionLoading(true)
    
    try {
      console.log('📝 Submitting appointment response:', formData)
      
      const response = await fetch(`/api/appointments/${formData.appointment_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: formData.action === 'accept' ? 'accepted' : 
                 formData.action === 'decline' ? 'declined' : 'quoted',
          
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
          
          response_timestamp: new Date().toISOString(),
          duration_minutes: formData.estimated_duration
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${formData.action} appointment`)
      }

      console.log(`✅ Appointment ${formData.action}ed successfully:`, data.appointment)

      if (formData.action === 'accept') {
        onAccept?.()
      } else if (formData.action === 'decline') {
        onDecline?.()
      }

      // TODO: Replace with toast notification
      alert(`Appointment ${formData.action}ed successfully!`)
      handleClose()

    } catch (error) {
      console.error(`❌ Error ${formData.action}ing appointment:`, error)
      // TODO: Replace with toast notification
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, handleClose])

  // Don't render if not open or no appointment
  if (!isOpen || !appointment) return null

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

  // Professional status configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        variant: 'secondary', 
        className: 'bg-muted text-muted-foreground',
        label: 'Pending Review'
      },
      quoted: { 
        variant: 'outline', 
        className: 'bg-primary/10 text-primary border-primary/20',
        label: 'Quote Sent'
      },
      accepted: { 
        variant: 'default', 
        className: 'bg-primary text-primary-foreground',
        label: 'Accepted'
      },
      converted: { 
        variant: 'default', 
        className: 'bg-primary text-primary-foreground',
        label: 'Completed'
      },
      declined: { 
        variant: 'secondary', 
        className: 'bg-muted text-muted-foreground',
        label: 'Declined'
      }
    }
    return configs[status] || configs.pending
  }

  // Professional urgency configuration
  const getUrgencyConfig = (urgency) => {
    const configs = {
      low: { 
        className: 'bg-muted text-muted-foreground',
        label: 'Flexible'
      },
      standard: { 
        className: 'bg-muted text-muted-foreground',
        label: 'Standard'
      },
      high: { 
        className: 'bg-secondary text-secondary-foreground',
        label: 'Priority'
      },
      urgent: { 
        className: 'bg-destructive text-destructive-foreground',
        label: 'Urgent'
      }
    }
    return configs[urgency] || configs.standard
  }

  const statusConfig = getStatusConfig(appointment.status)
  const urgencyConfig = getUrgencyConfig(appointment.urgency)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-background border-border p-0 gap-0">
        
        {/* Professional Modal Header */}
        <DialogHeader className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {currentView !== 'details' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('details')}
                    disabled={actionLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {currentView === 'details' ? 'Appointment Details' :
                   currentView === 'accept' ? 'Accept Appointment' :
                   currentView === 'decline' ? 'Decline Appointment' :
                   currentView === 'quote' ? 'Send Quote' : 'Appointment'}
                </DialogTitle>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
                <Badge className={urgencyConfig.className}>
                  {urgencyConfig.label}
                  {appointment.urgency === 'standard' ? ' (3 days)' :
                   appointment.urgency === 'low' ? ' (1 week)' :
                   appointment.urgency === 'high' ? ' (24hrs)' : ' (ASAP)'}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Modal Body */}
        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          
          {/* Details View */}
          {currentView === 'details' && (
            <div className="p-6 space-y-6">
              
              {/* Customer Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <User className="h-4 w-4" />
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
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {appointment.customer?.account?.first_name?.[0]}
                        {appointment.customer?.account?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground">
                        {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
                      </h5>
                      <div className="space-y-1 mt-2">
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

              {/* Service Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <Building2 className="h-4 w-4" />
                    Service Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-foreground mb-2">
                      {appointment.service?.name || appointment.title}
                    </h5>
                    {appointment.description && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Project Description:</p>
                        <div className="p-3 bg-muted rounded-md border-l-4 border-primary">
                          <p className="text-sm text-foreground">{appointment.description}</p>
                        </div>
                      </div>
                    )}
                    {appointment.service?.base_price && (
                      <div className="mt-3 text-sm">
                        <span className="font-medium text-foreground">Base Price:</span>
                        <span className="ml-2 text-primary font-semibold">
                          JMD ${appointment.service.base_price}
                        </span>
                        {appointment.service.duration_minutes && (
                          <span className="ml-2 text-muted-foreground">
                            • {appointment.service.duration_minutes} minutes
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <Calendar className="h-4 w-4" />
                    Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="font-medium text-muted-foreground">Preferred Start:</span>
                      <span className="text-foreground">{formatDateTime(appointment.session)}</span>
                    </div>
                    {appointment.preferred_end && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="font-medium text-muted-foreground">Preferred End:</span>
                        <span className="text-foreground">{formatDateTime(appointment.preferred_end)}</span>
                      </div>
                    )}
                    {appointment.deadline && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="font-medium text-muted-foreground">Project Deadline:</span>
                        <span className="text-destructive font-medium">{formatDateTime(appointment.deadline)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span className="font-medium text-muted-foreground">Urgency Level:</span>
                      <Badge className={urgencyConfig.className}>
                        {urgencyConfig.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              {appointment.address && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-foreground">
                      <MapPin className="h-4 w-4" />
                      Service Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {appointment.address.street_address && (
                        <div className="text-foreground">{appointment.address.street_address}</div>
                      )}
                      <div className="text-foreground">
                        {appointment.address.city}, {appointment.address.parish}
                      </div>
                      {appointment.address.community && (
                        <div className="text-muted-foreground italic">{appointment.address.community}</div>
                      )}
                      {appointment.address.landmark && (
                        <div className="text-primary font-medium">Near {appointment.address.landmark}</div>
                      )}
                      {appointment.address.is_rural && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-secondary/50 border border-secondary rounded-md">
                          <AlertCircle className="h-4 w-4 text-secondary-foreground" />
                          <span className="text-secondary-foreground text-sm">Rural location</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Customer Message */}
              {appointment.customer_message && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-foreground">
                      <MessageSquare className="h-4 w-4" />
                      Customer Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-md border-l-4 border-l-primary">
                      <p className="text-sm text-foreground italic">"{appointment.customer_message}"</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Request Information */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <Clock className="h-4 w-4" />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="font-medium text-muted-foreground">Requested:</span>
                      <span className="text-foreground">{formatDateTime(appointment.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="font-medium text-muted-foreground">Last Updated:</span>
                      <span className="text-foreground">{formatDateTime(appointment.updated_at)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="font-medium text-muted-foreground">Appointment ID:</span>
                      <span className="text-foreground font-mono text-sm">
                        {appointment.appointment_id.split('-')[0]}...
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Form Views */}
          {(currentView === 'accept' || currentView === 'decline' || currentView === 'quote') && (
            <div className="p-6">
              <AppointmentInteractionForm
                appointment={appointment}
                action={currentView}
                onSubmit={handleFormSubmit}
                onCancel={() => setCurrentView('details')}
                loading={actionLoading}
              />
            </div>
          )}
        </ScrollArea>

        {/* Professional Modal Footer */}
        {currentView === 'details' && (
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground font-mono">
              ID: {appointment.appointment_id.split('-')[0]}...
            </div>
            
            <div className="flex items-center gap-3">
              {appointment.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('quote')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-background hover:bg-muted border-border"
                  >
                    <Building2 className="h-4 w-4" />
                    Send Quote
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('decline')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Decline
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentView('accept')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
                    onClick={() => setCurrentView('decline')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Decline
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentView('accept')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Calendar className="h-4 w-4" />
                    Accept Quote
                  </Button>
                </>
              )}
              
              {['accepted', 'converted', 'declined'].includes(appointment.status) && (
                <div className="flex items-center gap-2 text-muted-foreground italic">
                  <Calendar className="h-4 w-4" />
                  This appointment has been {appointment.status}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}