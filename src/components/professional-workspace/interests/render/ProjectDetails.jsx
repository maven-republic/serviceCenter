// src/components/professional-workspace/interests/render/ProjectDetails.jsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, DollarSign, ClipboardCheck, Calendar } from 'lucide-react'

export default function ProjectDetails({ appointment, interest }) {
  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          Project Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Key Project Info - Enhanced Layout */}
        <div className="space-y-4">
          
          {/* Service */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-muted-foreground mb-1">Service</div>
              <div className="text-base font-semibold text-foreground leading-tight">
                {appointment.service?.name || appointment.title || 'Service Request'}
              </div>
            </div>
          </div>

          {/* Your Quote - Highlighted */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-primary/70 mb-1">Your Quote</div>
              <div className="text-lg font-bold text-primary">
                {interest.amount ? `JMD ${parseFloat(interest.amount).toLocaleString()}` : 'Not specified'}
              </div>
            </div>
          </div>

          {/* Assessment - If Required */}
          {interest.assessment && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <ClipboardCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-blue-700 mb-1">Assessment Required</div>
                <div className="text-base font-semibold text-blue-800">
                  {interest.fee ? `JMD ${parseFloat(interest.fee).toLocaleString()}` : 'No additional fee'}
                </div>
                {interest.assessment_justification && (
                  <div className="text-sm text-blue-600 mt-2 italic">
                    "{interest.assessment_justification}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferred Time - If Available */}
          {appointment.appointment_time && (
            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground mb-1">Preferred Time</div>
                <div className="text-base font-semibold text-foreground">
                  {formatDateTime(appointment.appointment_time)}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Project Description */}
        {appointment.description && (
          <div className="space-y-3">
            <div className="font-medium text-sm text-foreground">Project Description</div>
            <div className="p-4 bg-muted/20 border border-border rounded-lg">
              <p className="text-foreground text-sm leading-relaxed">
                {appointment.description}
              </p>
            </div>
          </div>
        )}

        {/* Original Interest Message */}
        {interest.message && (
          <div className="space-y-3">
            <div className="font-medium text-sm text-foreground">Your Original Interest Message</div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg border-l-4 border-l-blue-500">
              <p className="text-blue-700 text-sm leading-relaxed italic">
                "{interest.message}"
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}