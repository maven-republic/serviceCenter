// src/components/professional-workspace/interests/ProfessionalInterestForm.jsx
'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, 
  DollarSign, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle,
  Loader2,
  Send,
  Star,
  Crown,
  Target
} from "lucide-react"

export default function ProfessionalInterestForm({
  appointment,
  professionalId, // Professional ID to check for invitations
  onSubmit,
  onCancel,
  loading = false
}) {
  const [formData, setFormData] = useState({
    intent: 'standard',
    message: '',
    assessment: false,
    modality: 'none',
    fee: 0.00,
    amount: null,
    earliest_start: '',
    latest_start: '',
    notes: '',
    estimated_duration_hours: null,
    specification: {}
  })

  const [errors, setErrors] = useState({})

  // ✅ NEW: Check if this professional was specifically invited
  const isInvited = appointment?.recipients && professionalId && 
    appointment.recipients.includes(professionalId)

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }, [errors])

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {}
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide a message expressing your interest'
    }

    if (formData.assessment && !['local', 'remote', 'phone'].includes(formData.modality)) {
      newErrors.modality = 'Please select assessment method when assessment is required'
    }

    if (formData.assessment && formData.modality === 'local' && formData.fee < 0) {
      newErrors.fee = 'Assessment fee cannot be negative'
    }

    if (formData.amount && (isNaN(formData.amount) || formData.amount <= 0)) {
      newErrors.amount = 'Quote amount must be a valid positive number'
    }

    if (formData.earliest_start && formData.latest_start) {
      if (new Date(formData.earliest_start) >= new Date(formData.latest_start)) {
        newErrors.latest_start = 'Latest available must be after earliest available'
      }
    }

    if (formData.estimated_duration_hours && (isNaN(formData.estimated_duration_hours) || formData.estimated_duration_hours <= 0)) {
      newErrors.estimated_duration_hours = 'Duration must be a positive number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Clean up data before submission
    const submissionData = {
      ...formData,
      amount: formData.amount || null,
      fee: formData.assessment && formData.modality === 'local' ? formData.fee : 0,
      earliest_start: formData.earliest_start || null,
      latest_start: formData.latest_start || null,
      estimated_duration_hours: formData.estimated_duration_hours || null,
      specification: Object.keys(formData.specification).length > 0 ? formData.specification : null
    }
    
    await onSubmit(submissionData)
  }, [formData, onSubmit, validateForm])

  const minDateTime = new Date().toISOString().slice(0, 16)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ✅ NEW: Invitation Alert */}
      {isInvited && (
        <Alert className="border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Crown className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">You've been invited!</span>
              </div>
              <AlertDescription className="text-blue-700">
                The customer specifically selected you to quote on this project. This gives you a competitive advantage - make your proposal stand out!
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Competition Alert - UPDATED */}
      {appointment?.interest_summary?.total_count > 0 && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>{appointment.interest_summary.total_count} professionals</strong> have already 
            expressed interest. {isInvited ? 'As an invited professional, make your proposal stand out!' : 'Make your proposal stand out!'}
          </AlertDescription>
        </Alert>
      )}

      {/* Interest Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Interest Level
            {isInvited && (
              <Badge className="bg-blue-600 text-white text-xs ml-2">
                <Target className="w-3 h-3 mr-1" />
                Invited
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intent">How interested are you?</Label>
            <Select value={formData.intent} onValueChange={(value) => handleChange('intent', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="space-y-1">
                    <div className="font-medium">Low - Exploring</div>
                    <div className="text-xs text-muted-foreground">Just checking details</div>
                  </div>
                </SelectItem>
                <SelectItem value="standard">
                  <div className="space-y-1">
                    <div className="font-medium">Standard - Interested</div>
                    <div className="text-xs text-muted-foreground">Would like to be considered</div>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="space-y-1">
                    <div className="font-medium">High - Very Interested</div>
                    <div className="text-xs text-muted-foreground">Highly motivated to get this project</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{isInvited ? 'Why are you the right choice?' : 'Why are you interested?'} *</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder={isInvited 
                ? "The customer chose you specifically. Explain your approach, relevant experience, and what makes you the perfect fit for this project..."
                : "Explain your interest, relevant experience, and what makes you the right professional for this project..."
              }
              required
              className={errors.message ? 'border-destructive' : ''}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message}</p>
            )}
            {isInvited && (
              <p className="text-xs text-blue-600 font-medium">
                💡 Tip: As an invited professional, emphasize your specific qualifications and unique approach to win this project.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Requirements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Assessment Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="assessment"
              checked={formData.assessment}
              onCheckedChange={(checked) => handleChange('assessment', checked)}
            />
            <Label htmlFor="assessment" className="font-medium">
              I need to assess the site before providing an accurate quote
            </Label>
          </div>

          {formData.assessment && (
            <div className="ml-6 space-y-4 p-4 border border-border rounded-md bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="modality">Assessment Method *</Label>
                <Select value={formData.modality} onValueChange={(value) => handleChange('modality', value)}>
                  <SelectTrigger className={errors.modality ? 'border-destructive' : ''}>
                    <SelectValue placeholder="How would you like to assess?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">
                      <div className="space-y-1">
                        <div className="font-medium">Site Visit</div>
                        <div className="text-xs text-muted-foreground">Travel to customer location</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="remote">
                      <div className="space-y-1">
                        <div className="font-medium">Video Call</div>
                        <div className="text-xs text-muted-foreground">Virtual assessment via video</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="space-y-1">
                        <div className="font-medium">Phone Consultation</div>
                        <div className="text-xs text-muted-foreground">Discuss details over phone</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.modality && (
                  <p className="text-sm text-destructive">{errors.modality}</p>
                )}
              </div>

              {formData.modality === 'local' && (
                <div className="space-y-2">
                  <Label htmlFor="fee">Site Visit Fee (JMD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      id="fee"
                      value={formData.fee}
                      onChange={(e) => handleChange('fee', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={`pl-10 ${errors.fee ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.fee && (
                    <p className="text-sm text-destructive">{errors.fee}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Fee for traveling to customer location (typically deducted from final quote if you're selected)
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Initial Quote (Optional) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Initial Quote (Optional)
            {isInvited && (
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                Competitive Advantage
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Estimated Price (JMD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                id="amount"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', e.target.value ? parseFloat(e.target.value) : null)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`pl-10 ${errors.amount ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Provide an estimate if you can quote without assessment. Leave blank if assessment is required.
            </p>
            {isInvited && (
              <p className="text-xs text-blue-600 font-medium">
                💡 Invited professionals who provide competitive quotes often win the project.
              </p>
            )}
          </div>

          {/* Estimated Duration */}
          <div className="space-y-2">
            <Label htmlFor="estimated_duration_hours">Estimated Duration (Hours)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                id="estimated_duration_hours"
                value={formData.estimated_duration_hours || ''}
                onChange={(e) => handleChange('estimated_duration_hours', e.target.value ? parseFloat(e.target.value) : null)}
                min="0"
                step="0.5"
                placeholder="0.0"
                className={`pl-10 ${errors.estimated_duration_hours ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.estimated_duration_hours && (
              <p className="text-sm text-destructive">{errors.estimated_duration_hours}</p>
            )}
            <p className="text-xs text-muted-foreground">
              How many hours do you estimate this project will take?
            </p>
          </div>

          {appointment?.service?.base_price && (
            <div className="p-3 bg-muted/20 rounded-md">
              <p className="text-sm text-muted-foreground">
                Service base price: <span className="font-medium">JMD ${appointment.service.base_price}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Window */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Your Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="earliest_start">Earliest Available</Label>
              <Input
                type="datetime-local"
                id="earliest_start"
                value={formData.earliest_start}
                onChange={(e) => handleChange('earliest_start', e.target.value)}
                min={minDateTime}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latest_start">Latest Available</Label>
              <Input
                type="datetime-local"
                id="latest_start"
                value={formData.latest_start}
                onChange={(e) => handleChange('latest_start', e.target.value)}
                min={formData.earliest_start || minDateTime}
                className={errors.latest_start ? 'border-destructive' : ''}
              />
              {errors.latest_start && (
                <p className="text-sm text-destructive">{errors.latest_start}</p>
              )}
            </div>
          </div>

          <div className="p-3 bg-muted/20 rounded-md">
            <p className="text-sm text-muted-foreground">
              Customer's preferred time: {' '}
              <span className="font-medium">
                {appointment?.session ? 
                  new Date(appointment.session).toLocaleString() : 
                  'Not specified'
                }
              </span>
            </p>
            {isInvited && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                💡 Matching the customer's preferred time increases your chances of selection.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={isInvited 
                ? "Share your specific qualifications, unique approach, or any special considerations for this invited project..."
                : "Share anything else about your approach, special equipment, experience, or considerations..."
              }
            />
            {isInvited && (
              <p className="text-xs text-blue-600 font-medium">
                💡 Use this space to highlight why the customer made the right choice by inviting you.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          disabled={loading}
          className={`gap-2 ${isInvited ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isInvited ? 'Responding to Invitation...' : 'Expressing Interest...'}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {isInvited ? 'Respond to Invitation' : 'Express Interest'}
            </>
          )}
        </Button>
      </div>

      {/* ✅ NEW: Invitation Summary Footer */}
      {isInvited && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
              <Crown className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 mb-2">You're in a Great Position!</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>✓ Customer specifically selected you for this project</p>
                <p>✓ You have a competitive advantage over other professionals</p>
                <p>✓ Focus on demonstrating your expertise and unique value</p>
                <p>✓ Provide a competitive quote and timeline to win the project</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}