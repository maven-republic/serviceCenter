// src/components/professional-workspace/assessments/AssessmentItem.jsx
'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle,
  ChevronRight,
  User
} from 'lucide-react'
import AssessmentStatus from './AssessmentStatus'

export default function AssessmentItem({ assessment, onView }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    })
  }

  const getTimeUntil = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Past due'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return null
  }

  const customer = assessment.appointment?.customer?.account
  const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer'
  const projectTitle = assessment.appointment?.title || 'Assessment'
  const address = assessment.appointment?.address
  const timeUntil = getTimeUntil(assessment.confirmed_date)

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={onView}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={customer?.profile_picture_url} alt={customerName} />
              <AvatarFallback>
                {customer?.first_name?.[0]}{customer?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {customerName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{projectTitle}</p>
            </div>
          </div>
          <AssessmentStatus status={assessment.status} size="sm" />
        </div>

        {/* Date & Time */}
        {assessment.confirmed_date && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground font-medium">
                {formatDate(assessment.confirmed_date)}
              </span>
              {timeUntil && (
                <Badge variant="outline" className="ml-auto">
                  {timeUntil}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">
                {formatTime(assessment.confirmed_date)}
                {assessment.confirmed_duration_minutes && 
                  ` (${assessment.confirmed_duration_minutes} min)`
                }
              </span>
            </div>
          </div>
        )}

        {/* Location */}
        {address && (
          <div className="flex items-start gap-2 text-sm mb-3">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground line-clamp-2">
              {address.street_address}, {address.city}
            </span>
          </div>
        )}

        {/* Fee & Quote Status */}
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          {assessment.proposed_fee > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Fee: <span className="font-medium text-foreground">
                  JMD ${parseFloat(assessment.proposed_fee).toLocaleString()}
                </span>
              </span>
            </div>
          )}
          
          {assessment.final_quote_provided && assessment.final_quote_amount && (
            <Badge variant="default" className="ml-auto bg-green-100 text-green-800">
              Quote: JMD ${parseFloat(assessment.final_quote_amount).toLocaleString()}
            </Badge>
          )}
          
          {!assessment.final_quote_provided && assessment.status === 'completed' && (
            <Badge variant="destructive" className="ml-auto">
              Quote Needed
            </Badge>
          )}
        </div>

        {/* View Button */}
        <Button 
          variant="ghost" 
          className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}