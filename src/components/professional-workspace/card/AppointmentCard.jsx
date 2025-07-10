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
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppointmentCard({ 
  appointment, 
  onView, 
  onAccept, 
  onDecline 
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

  // Status configuration using your semantic tokens
  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        variant: 'secondary',
        className: 'bg-muted text-muted-foreground',
        label: 'Pending'
      },
      quoted: { 
        variant: 'outline',
        className: 'bg-background text-foreground border-border',
        label: 'Quoted'
      },
      accepted: { 
        variant: 'default',
        className: 'bg-primary text-primary-foreground',
        label: 'Accepted'
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

  // Priority configuration using your semantic tokens
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

  // Format date using consistent pattern
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

  const statusConfig = getStatusConfig(appointment.status)
  const priorityConfig = getPriorityConfig(appointment.urgency)

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border bg-card">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          {/* Customer Info */}
          <div className="flex items-center gap-4 flex-1">
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
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
              </h4>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{appointment.customer?.account?.email}</span>
                </div>
                {appointment.customer?.phone?.phone_number && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{appointment.customer.phone.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-col gap-2 items-end">
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
            <Badge className={priorityConfig.className}>
              {priorityConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-foreground mb-1">
                {appointment.service?.name || appointment.title}
              </h5>
              {appointment.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {appointment.description}
                </p>
              )}
              {appointment.service?.base_price && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="font-medium text-foreground">Base Price:</span>
                  <span className="font-semibold text-primary">
                    JMD ${appointment.service.base_price}
                  </span>
                  {appointment.service.duration_minutes && (
                    <span className="text-muted-foreground">
                      • {appointment.service.duration_minutes} mins
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Schedule Information */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <span className="text-sm font-medium text-foreground">Preferred Time:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDateTime(appointment.preferred_start)}
                </p>
              </div>
              {appointment.deadline && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-foreground">Deadline:</span>
                  <span className="text-sm text-destructive">
                    {formatDateTime(appointment.deadline)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          {appointment.address && (
            <>
              <Separator className="bg-border" />
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm space-y-1">
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
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Customer Message */}
          {appointment.customer_message && (
            <>
              <Separator className="bg-border" />
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">Customer Notes:</span>
                  <div className="mt-2 p-3 bg-muted rounded-md border-l-4 border-l-primary">
                    <p className="text-sm text-foreground italic">"{appointment.customer_message}"</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Requested {new Date(appointment.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onView}
              disabled={!!actionLoading}
              className="flex items-center gap-2"
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            
            {appointment.status === 'pending' && (
              <>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('decline', onDecline)}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  {actionLoading === 'decline' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Decline
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => handleAction('accept', onAccept)}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2"
                >
                  {actionLoading === 'accept' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
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