// src/components/professional-workspace/interests/InterestForm.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  CalendarIcon, 
  Clock, 
  DollarSign, 
  MapPin, 
  AlertCircle, 
  CheckCircle2,
  Crown,
  Sparkles,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function InterestForm({ 
  appointment, 
  professionalId,
  isInvited = false,
  onSuccess,
  onCancel,
  isMobile = false
}) {
  // Form state
  const [responseType, setResponseType] = useState('quote')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [needsAssessment, setNeedsAssessment] = useState(false)
  const [assessmentType, setAssessmentType] = useState('local')
  const [assessmentFee, setAssessmentFee] = useState('')
  const [assessmentDate, setAssessmentDate] = useState(null)
  const [assessmentTime, setAssessmentTime] = useState('')
  const [priceRangeMin, setPriceRangeMin] = useState('')
  const [priceRangeMax, setPriceRangeMax] = useState('')
  const [assessmentJustification, setAssessmentJustification] = useState('')
  const [earliestStart, setEarliestStart] = useState(null)
  const [latestStart, setLatestStart] = useState(null)
  const [estimatedDuration, setEstimatedDuration] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Validation
  const validate = () => {
    const newErrors = {}

    if (responseType === 'quote') {
      if (!amount || parseFloat(amount) <= 0) {
        newErrors.amount = 'Please provide a valid quote amount'
      }
    }

    if (responseType === 'assessment' || needsAssessment) {
      if (!priceRangeMin || !priceRangeMax) {
        newErrors.priceRange = 'Please provide a price range estimate'
      }
      if (parseFloat(priceRangeMin) >= parseFloat(priceRangeMax)) {
        newErrors.priceRange = 'Maximum price must be greater than minimum'
      }
      if (!assessmentJustification?.trim()) {
        newErrors.assessmentJustification = 'Please explain why assessment is needed'
      }
      if (assessmentType === 'local') {
        if (!assessmentDate) {
          newErrors.assessmentDate = 'Please select assessment date'
        }
        if (!assessmentTime) {
          newErrors.assessmentTime = 'Please select assessment time'
        }
      }
    }

    if (!message?.trim()) {
      newErrors.message = 'Please add a message for the customer'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const payload = {
        appointment_id: appointment.appointment_id,
        professional_id: professionalId,
        intent: 'standard',
        message: message.trim(),
        assessment: responseType === 'assessment' || needsAssessment,
        modality: (responseType === 'assessment' || needsAssessment) ? assessmentType : 'none',
        fee: (responseType === 'assessment' || needsAssessment) ? parseFloat(assessmentFee) || 0 : 0,
        amount: responseType === 'quote' ? parseFloat(amount) : null,
        price_range_min: (responseType === 'assessment' || needsAssessment) ? parseFloat(priceRangeMin) : null,
        price_range_max: (responseType === 'assessment' || needsAssessment) ? parseFloat(priceRangeMax) : null,
        assessment_justification: (responseType === 'assessment' || needsAssessment) ? assessmentJustification : null,
        assessment_proposed_date: assessmentDate ? format(assessmentDate, 'yyyy-MM-dd') : null,
        assessment_proposed_time: assessmentTime || null,
        assessment_duration_minutes: 60,
        earliest_start: earliestStart ? earliestStart.toISOString() : null,
        latest_start: latestStart ? latestStart.toISOString() : null,
        estimated_duration_hours: estimatedDuration ? parseFloat(estimatedDuration) : null,
        invitation_response: isInvited
      }

      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit interest')
      }

      const result = await response.json()
      onSuccess?.(payload)
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn(
      "w-full mx-auto space-y-6",
      isMobile ? "px-4 py-4" : "px-6 py-6 max-w-3xl"
    )}>
      {/* Header */}
      <div className="space-y-2">
        {isInvited && (
          <Badge className="mb-2 bg-gradient-to-r from-amber-500 to-orange-500">
            <Crown className="w-3 h-3 mr-1" />
            Personal Invitation
          </Badge>
        )}
        <h2 className={cn(
          "font-bold",
          isMobile ? "text-xl" : "text-2xl"
        )}>
          {isInvited ? 'Respond to Invitation' : 'Express Your Interest'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {appointment?.title || appointment?.service?.name || 'Untitled Appointment'}
        </p>
      </div>

      {/* Quick Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{appointment?.address?.city || 'Location not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {appointment?.deadline 
                  ? format(new Date(appointment.deadline), 'MMM dd, yyyy')
                  : 'No deadline'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Response Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              How would you like to respond?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={responseType} onValueChange={setResponseType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quote">Provide Quote Now</TabsTrigger>
                <TabsTrigger value="assessment">Need Assessment Visit</TabsTrigger>
              </TabsList>

              {/* QUOTE TAB */}
              <TabsContent value="quote" className="space-y-4 mt-4">
                <Alert>
                  <CheckCircle2 className="w-4 h-4" />
                  <AlertDescription>
                    You have enough information to provide an accurate quote immediately.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Your Quote Amount (JMD)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount}</p>
                  )}
                </div>

                {/* Optional Assessment */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Offer free assessment visit?</Label>
                    <p className="text-sm text-muted-foreground">
                      Build trust by offering to verify scope in person
                    </p>
                  </div>
                  <Switch 
                    checked={needsAssessment} 
                    onCheckedChange={setNeedsAssessment}
                  />
                </div>
              </TabsContent>

              {/* ASSESSMENT TAB */}
              <TabsContent value="assessment" className="space-y-4 mt-4">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    You need to visit the site to provide an accurate quote.
                  </AlertDescription>
                </Alert>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Estimated Price Range (JMD)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Min (e.g., 20000)"
                      value={priceRangeMin}
                      onChange={(e) => setPriceRangeMin(e.target.value)}
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Max (e.g., 35000)"
                      value={priceRangeMax}
                      onChange={(e) => setPriceRangeMax(e.target.value)}
                    />
                  </div>
                  {errors.priceRange && (
                    <p className="text-sm text-destructive">{errors.priceRange}</p>
                  )}
                </div>

                {/* Assessment Method */}
                <div className="space-y-2">
                  <Label>Assessment Method</Label>
                  <Select value={assessmentType} onValueChange={setAssessmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Site Visit (In-Person)</SelectItem>
                      <SelectItem value="remote">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assessment Fee */}
                <div className="space-y-2">
                  <Label htmlFor="assessmentFee">Assessment Fee (JMD)</Label>
                  <Input
                    id="assessmentFee"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0 (free) or enter amount"
                    value={assessmentFee}
                    onChange={(e) => setAssessmentFee(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave as 0 for free. Fee may be applied to final project cost.
                  </p>
                </div>

                {/* Site Visit Scheduling */}
                {assessmentType === 'local' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold">Propose Assessment Date & Time</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {assessmentDate ? format(assessmentDate, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={assessmentDate}
                              onSelect={setAssessmentDate}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.assessmentDate && (
                          <p className="text-sm text-destructive">{errors.assessmentDate}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assessmentTime">Time</Label>
                        <Input
                          id="assessmentTime"
                          type="time"
                          value={assessmentTime}
                          onChange={(e) => setAssessmentTime(e.target.value)}
                        />
                        {errors.assessmentTime && (
                          <p className="text-sm text-destructive">{errors.assessmentTime}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Justification */}
                <div className="space-y-2">
                  <Label htmlFor="justification">Why is an assessment needed?</Label>
                  <Textarea
                    id="justification"
                    placeholder="Explain what you need to verify in person..."
                    value={assessmentJustification}
                    onChange={(e) => setAssessmentJustification(e.target.value)}
                    rows={3}
                  />
                  {errors.assessmentJustification && (
                    <p className="text-sm text-destructive">{errors.assessmentJustification}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message to Customer</CardTitle>
            <CardDescription>
              Introduce yourself and explain why you're the right fit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Hello! I specialize in... I can help you with..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            {errors.message && (
              <p className="text-sm text-destructive mt-2">{errors.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5" />
              Your Availability
            </CardTitle>
            <CardDescription>When can you start the actual work?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Earliest Start</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {earliestStart ? format(earliestStart, 'PPP') : 'Select'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={earliestStart}
                      onSelect={setEarliestStart}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Latest Start</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {latestStart ? format(latestStart, 'PPP') : 'Select'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={latestStart}
                      onSelect={setLatestStart}
                      disabled={(date) => date < (earliestStart || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="e.g., 4"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Error */}
        {errors.submit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? 'Submitting...' : isInvited ? 'Submit Response' : 'Express Interest'}
          </Button>
        </div>
      </form>
    </div>
  )
}