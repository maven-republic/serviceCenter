// src/components/professional-workspace/card/AppointmentCard.jsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  MapPin, 
  MessageSquare, 
  User, 
  Calendar, 
  Phone,
  Mail,
  AlertTriangle,
  Eye,
  Check,
  X,
  Loader2,
  Paperclip,
  Image,
  FileText,
  Heart,
  Users,
  DollarSign,
  Target,
  Edit3
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppointmentCard({ 
  appointment, 
  interest, // For interests tab
  onView, 
  onAccept, 
  onDecline,
  onViewAttachments,
  onExpressInterest,
  onUpdateInterest,
  mode = 'assigned' // 'available', 'interests', 'assigned'
}) {
  const [actionLoading, setActionLoading] = useState(null)

  // Handle action with loading state
  const handleAction = async (action, actionHandler) => {
    setActionLoading(action)
    try {
      await actionHandler()
    } finally {
      setActionLoading(null)
    }
  }

  // Determine data source based on mode
  const appointmentInformation = mode === 'interests' ? interest?.appointment : appointment
  const isInterestCard = mode === 'interests'

  // Status configuration for appointments
  const getAppointmentStatusConfig = (status) => {
    const configs = {
      pending: { 
        variant: 'secondary',
        className: 'bg-muted text-muted-foreground',
        label: 'Available'
      },
      interested: { 
        variant: 'default',
        className: 'bg-blue-100 text-blue-800',
        label: 'Has Interest'
      },
      competing: { 
        variant: 'default',
        className: 'bg-orange-100 text-orange-800',
        label: 'Competitive'
      },
      evaluating: { 
        variant: 'default',
        className: 'bg-purple-100 text-purple-800',
        label: 'In Review'
      },
      quoted: { 
        variant: 'outline',
        className: 'bg-background text-foreground border-border',
        label: 'Quoted'
      },
      approved: { 
        variant: 'default',
        className: 'bg-green-100 text-green-800',
        label: 'Approved'
      },
      converted: { 
        variant: 'default',
        className: 'bg-primary text-primary-foreground',
        label: 'Converted'
      },
      declined: { 
        variant: 'destructive',
        className: 'bg-destructive text-destructive-foreground',
        label: 'Declined'
      }
    }
    return configs[status] || configs.pending
  }

  // Status configuration for interests
  const getInterestStatusConfig = (status) => {
    const configs = {
      interested: { 
        variant: 'default',
        className: 'bg-blue-100 text-blue-800',
        label: 'Interested',
        icon: Heart
      },
      quoted: { 
        variant: 'outline',
        className: 'bg-background text-foreground border-border',
        label: 'Quoted',
        icon: DollarSign
      },
      selected: { 
        variant: 'default',
        className: 'bg-green-100 text-green-800',
        label: 'Selected',
        icon: Target
      },
      rejected: { 
        variant: 'destructive',
        className: 'bg-red-100 text-red-800',
        label: 'Not Selected',
        icon: X
      },
      withdrawn: { 
        variant: 'secondary',
        className: 'bg-muted text-muted-foreground',
        label: 'Withdrawn',
        icon: X
      }
    }
    return configs[status] || configs.interested
  }

  // Priority configuration
  const getPriorityConfig = (urgency) => {
    const configs = {
      urgent: { 
        className: 'bg-destructive text-destructive-foreground',
        label: 'Urgent'
      },
      high: { 
        className: 'bg-secondary text-secondary-foreground',
        label: 'Priority'
      },
      standard: { 
        className: 'bg-muted text-muted-foreground',
        label: 'Standard'
      },
      low: { 
        className: 'bg-muted/50 text-muted-foreground',
        label: 'Flexible'
      }
    }
    return configs[urgency] || configs.standard
  }

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified'
    
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    if (isToday) {
      return `Today at ${timeStr}`
    } else if (isTomorrow) {
      return `Tomorrow at ${timeStr}`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }) + ` at ${timeStr}`
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Handle express interest
  const handleExpressInterest = () => {
    if (onExpressInterest && appointmentInformation) {
      handleAction('express', () => 
        onExpressInterest(appointmentInformation.appointment_id, {
          intent: 'high',
          message: 'I am interested in this project and would like to provide a quote.',
          assessment: false,
          modality: 'none'
        })
      )
    }
  }

  // Handle update interest
  const handleUpdateInterest = () => {
    if (onUpdateInterest && interest) {
      onUpdateInterest(interest.interest_id)
    }
  }

  if (!appointmentInformation) return null

  const statusConfig = isInterestCard 
    ? getInterestStatusConfig(interest?.status)
    : getAppointmentStatusConfig(appointmentInformation.status)
  const priorityConfig = getPriorityConfig(appointmentInformation.urgency)

  // Show competition indicator for available appointments
  const showCompetition = mode === 'available' && (appointmentInformation.interest_count > 0 || appointmentInformation.interest_summary?.total_count > 0)
  const competitionCount = appointmentInformation.interest_count || appointmentInformation.interest_summary?.total_count || 0

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border bg-card">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          {/* Customer Info */}
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage 
                src={appointmentInformation.customer?.account?.profile_image || appointmentInformation.customer?.profile_image} 
                alt={appointmentInformation.customer?.account?.first_name || appointmentInformation.customer?.first_name}
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              {/* Customer Name & Contact */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {appointmentInformation.customer?.account?.first_name || appointmentInformation.customer?.first_name} {' '}
                  {appointmentInformation.customer?.account?.last_name || appointmentInformation.customer?.last_name}
                </h3>
                {appointmentInformation.customer?.account?.phone && (
                  <Phone className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              
              {/* Service & Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">
                  {appointmentInformation.service?.name || 'Service request'}
                </span>
                {appointmentInformation.address && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {appointmentInformation.address?.city}, {appointmentInformation.address?.state}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status & Priority Badges */}
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant={statusConfig.variant}
              className={cn(statusConfig.className, "text-xs")}
            >
              {isInterestCard && statusConfig.icon && (
                <statusConfig.icon className="w-3 h-3 mr-1" />
              )}
              {statusConfig.label}
            </Badge>
            
            {appointmentInformation.urgency && (
              <Badge 
                variant="outline"
                className={cn(priorityConfig.className, "text-xs")}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {priorityConfig.label}
              </Badge>
            )}

            {/* Competition Indicator */}
            {showCompetition && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                <Users className="w-3 h-3 mr-1" />
                {competitionCount} interested
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Schedule */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Schedule</p>
              <p className="text-muted-foreground">
                {formatDateTime(appointmentInformation.preferred_date)}
              </p>
            </div>
          </div>

          {/* Budget/Quote */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">
                {isInterestCard && interest?.amount ? 'My Quote' : 'Budget'}
              </p>
              <p className="text-muted-foreground">
                {isInterestCard && interest?.amount 
                  ? formatCurrency(interest.amount)
                  : formatCurrency(appointmentInformation.budget_range?.max || appointmentInformation.budget)
                }
              </p>
            </div>
          </div>
        </div>

        {/* Interest-specific Information */}
        {isInterestCard && interest && (
          <div className="border border-border rounded-lg p-3 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">My Interest Details</span>
              <span className="text-xs text-muted-foreground">
                {new Date(interest.created_at).toLocaleDateString()}
              </span>
            </div>
            
            {interest.message && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {interest.message}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {interest.assessment && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Assessment: {interest.modality || 'Required'}
                </span>
              )}
              {interest.fee && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Fee: {formatCurrency(interest.fee)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Customer Message */}
        {appointmentInformation.description && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm mb-1">Customer Message</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {appointmentInformation.description}
              </p>
            </div>
          </div>
        )}

        {/* Attachments */}
        {appointmentInformation.attachments && appointmentInformation.attachments.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {appointmentInformation.attachments.length} attachment{appointmentInformation.attachments.length > 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              onClick={() => onViewAttachments?.(appointmentInformation.appointment_id)}
            >
              View files
            </Button>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {/* View Button (always present) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(appointmentInformation.appointment_id)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>

          {/* Action Buttons Based on Mode */}
          <div className="flex items-center gap-2">
            {/* Available Appointments - Express Interest */}
            {mode === 'available' && (
              <Button
                size="sm"
                onClick={handleExpressInterest}
                disabled={actionLoading === 'express'}
                className="flex items-center gap-2"
              >
                {actionLoading === 'express' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                Express Interest
              </Button>
            )}

            {/* My Interests - Update/Manage */}
            {mode === 'interests' && interest && (
              <>
                {interest.status === 'interested' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUpdateInterest}
                    disabled={actionLoading === 'update'}
                    className="flex items-center gap-2"
                  >
                    {actionLoading === 'update' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Edit3 className="h-4 w-4" />
                    )}
                    Update Quote
                  </Button>
                )}
                
                {interest.status === 'quoted' && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Awaiting Response
                  </Badge>
                )}
                
                {interest.status === 'selected' && (
                  <Badge className="text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </>
            )}

            {/* Assigned Appointments - Accept/Decline */}
            {mode === 'assigned' && appointmentInformation.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('decline', onDecline)}
                  disabled={actionLoading === 'decline'}
                  className="flex items-center gap-2"
                >
                  {actionLoading === 'decline' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Decline
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleAction('accept', onAccept)}
                  disabled={actionLoading === 'accept'}
                  className="flex items-center gap-2"
                >
                  {actionLoading === 'accept' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Accept
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}