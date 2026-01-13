// src/components/professional-workspace/interests/forms/Assessment.jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { AssessmentDetails } from '../render'
import CustomerAvailabilityCalendar from '@/components/calendar/CustomerAvailabilityCalendar'

export default function AssessmentForm({
  interest,
  professionalId,
  responseMessage,
  setResponseMessage,
  assessmentSchedule,
  setAssessmentSchedule,
  loading = false
}) {
  // ==================== STATE ====================
  
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [validationError, setValidationError] = useState(null)

  // ==================== COMPUTED VALUES ====================
  
  // Parse customer's availability window
  const customerWindow = useMemo(() => {
    if (!interest?.earliest_available || !interest?.latest_available) {
      return null
    }

    return {
      start: new Date(interest.earliest_available),
      end: new Date(interest.latest_available),
      startFormatted: new Date(interest.earliest_available).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      endFormatted: new Date(interest.latest_available).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  }, [interest])

  // Format selected datetime for display
  const selectedTimeDisplay = useMemo(() => {
    if (!selectedSlot?.datetime) return null

    const date = new Date(selectedSlot.datetime)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      full: date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }, [selectedSlot])

  // ==================== HANDLERS ====================
  
  const handleSlotSelect = (datetime, slotInfo) => {
    setValidationError(null)
    setSelectedSlot(slotInfo)
    
    // Update assessment schedule with selected datetime
    setAssessmentSchedule(prev => ({
      ...prev,
      proposed_datetime: datetime,
      proposed_date: datetime.split('T')[0], // Keep for backward compatibility
      proposed_time: datetime.split('T')[1]?.substring(0, 5) // Keep for backward compatibility
    }))
  }

  const handleDurationChange = (value) => {
    const minutes = parseInt(value)
    setAssessmentSchedule(prev => ({
      ...prev,
      duration_minutes: minutes
    }))

    // Validate if we have a selected slot
    if (selectedSlot?.datetime) {
      validateSlotDuration(selectedSlot.datetime, minutes)
    }
  }

  // ==================== VALIDATION ====================
  
  const validateSlotDuration = (datetime, durationMinutes) => {
    // Check if assessment end time conflicts with next available slot
    // This is a client-side check - server will validate as well
    const startTime = new Date(datetime)
    const endTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000))
    
    // Basic validation - more detailed validation happens server-side
    if (customerWindow) {
      if (endTime > customerWindow.end) {
        setValidationError('Assessment duration extends beyond customer\'s availability window')
        return false
      }
    }
    
    setValidationError(null)
    return true
  }

  // Validate when slot or duration changes
  useEffect(() => {
    if (selectedSlot?.datetime && assessmentSchedule.duration_minutes) {
      validateSlotDuration(selectedSlot.datetime, assessmentSchedule.duration_minutes)
    }
  }, [selectedSlot, assessmentSchedule.duration_minutes, customerWindow])

  // ==================== VALIDATION SUMMARY ====================
  
  const isValidSelection = useMemo(() => {
    return !!(
      selectedSlot?.datetime &&
      assessmentSchedule.duration_minutes &&
      responseMessage.trim() &&
      !validationError
    )
  }, [selectedSlot, assessmentSchedule.duration_minutes, responseMessage, validationError])

  // ==================== RENDER ====================
  
  return (
    <div className="space-y-6">
      {/* Existing Assessment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-700">Assessment Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AssessmentDetails interest={interest} />
        </CardContent>
      </Card>

      {/* Customer Availability Window */}
      {customerWindow && (
        <Alert className="bg-blue-50 border-blue-200">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Customer's Available Window:</strong> {customerWindow.startFormatted} - {customerWindow.endFormatted}
            <br />
            <span className="text-xs text-blue-600 mt-1 block">
              Select a time within this window that works for your schedule
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-700">Propose Assessment Time</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select an available time from your calendar
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Calendar Component */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <CustomerAvailabilityCalendar
              professionalId={professionalId}
              serviceId={interest.service_id}
              selectedProfessionals={[]}
              isMultiSelect={false}
              onSlotSelect={handleSlotSelect}
              selectedSlot={selectedSlot?.datetime}
              durationMinutes={assessmentSchedule.duration_minutes}
              className="w-full"
            />
          </div>

          {/* Selected Time Display */}
          {selectedTimeDisplay && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Proposed Time:</strong> {selectedTimeDisplay.full}
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* No Selection Warning */}
          {!selectedSlot && (
            <Alert className="bg-amber-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Please select an available time slot from the calendar above
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Assessment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-700">Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Assessment Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Estimated Duration <span className="text-red-500">*</span>
            </label>
            <Select 
              value={assessmentSchedule.duration_minutes.toString()} 
              onValueChange={handleDurationChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long will the on-site assessment take?
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What Happens After Assessment
            </label>
            <Textarea
              placeholder="e.g., I'll provide a detailed final quote within 24 hours of completing the assessment..."
              value={assessmentSchedule.next_steps}
              onChange={(e) => setAssessmentSchedule(prev => ({ 
                ...prev, 
                next_steps: e.target.value 
              }))}
              className="min-h-[80px]"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Let the customer know your process after the assessment
            </p>
          </div>

          {/* Message to Customer */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Message to Customer <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Thank you for selecting me! I'd like to schedule the on-site assessment. I'm proposing the time shown above..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="min-h-[100px]"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent with your assessment scheduling proposal
            </p>
          </div>

          {/* Info Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <Calendar className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Assessment Process:</strong> Customer can accept your proposed time or suggest alternatives. 
              You'll conduct the assessment and provide a final detailed quote afterward.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Submission Validation Summary */}
      {!isValidSelection && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Complete the following before submitting:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {!selectedSlot?.datetime && <li>Select an assessment time from the calendar</li>}
              {!assessmentSchedule.duration_minutes && <li>Select assessment duration</li>}
              {!responseMessage.trim() && <li>Add a message to the customer</li>}
              {validationError && <li>{validationError}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}