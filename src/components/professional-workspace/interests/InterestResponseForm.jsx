// src/components/professional-workspace/interests/InterestResponseForm.jsx
// UPDATED with price range support

'use client'

import { useState, useCallback, useEffect } from 'react'
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
  Target, 
  DollarSign, 
  Clock, 
  Edit, 
  AlertTriangle,
  Loader2,
  Save,
  Trash2,
  CheckCircle,
  Users,
  Info
} from "lucide-react"

export default function InterestResponseForm({
  interest,
  appointment,
  onSubmit,
  onWithdraw,
  onCancel,
  loading = false
}) {
  const [formData, setFormData] = useState({
    intent: interest?.intent || 'standard',
    message: interest?.message || '',
    assessment: interest?.assessment || false,
    modality: interest?.modality || 'none',
    fee: interest?.fee || 0.00,
    amount: interest?.amount || null,
    // NEW: Price range fields
    price_range_min: interest?.price_range_min || '',
    price_range_max: interest?.price_range_max || '',
    assessment_justification: interest?.assessment_justification || '',
    earliest_start: interest?.earliest_start || '',
    latest_start: interest?.latest_start || '',
    notes: interest?.notes || '',
    estimated_duration_hours: interest?.estimated_duration_hours || null
  })

  const [errors, setErrors] = useState({})

  // Update form when interest changes
  useEffect(() => {
    if (interest) {
      setFormData({
        intent: interest.intent || 'standard',
        message: interest.message || '',
        assessment: interest.assessment || false,
        modality: interest.modality || 'none',
        fee: interest.fee || 0.00,
        amount: interest.amount || null,
        // NEW: Price range fields
        price_range_min: interest.price_range_min || '',
        price_range_max: interest.price_range_max || '',
        assessment_justification: interest.assessment_justification || '',
        earliest_start: interest.earliest_start || '',
        latest_start: interest.latest_start || '',
        notes: interest.notes || '',
        estimated_duration_hours: interest.estimated_duration_hours || null
      })
    }
  }, [interest])

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

  // NEW: Get pricing strategy
  const getPricingStrategy = () => {
    if (!formData.assessment && formData.amount) return 'immediate'
    if (formData.assessment && formData.amount) return 'preliminary'
    if (formData.assessment && !formData.amount && (formData.price_range_min || formData.price_range_max)) return 'range'
    if (formData.assessment && !formData.amount) return 'assessment_only'
    return 'none'
  }

  // UPDATED: Enhanced validation with price range
  const validateForm = useCallback(() => {
    const newErrors = {}
    
    if (formData.amount && (isNaN(formData.amount) || formData.amount <= 0)) {
      newErrors.amount = 'Quote amount must be a valid positive number'
    }

    if (formData.assessment && !['local', 'remote', 'phone'].includes(formData.modality)) {
      newErrors.modality = 'Please select assessment method when assessment is required'
    }

    if (formData.assessment && formData.modality === 'local' && formData.fee < 0) {
      newErrors.fee = 'Assessment fee cannot be negative'
    }

    // NEW: Price range validation for assessment-only
    if (formData.assessment && !formData.amount) {
      if (!formData.price_range_min && !formData.price_range_max) {
        newErrors.pricing = 'Please provide either a quote or price range when assessment is required'
      } else if (formData.price_range_min && formData.price_range_max) {
        const min = parseFloat(formData.price_range_min)
        const max = parseFloat(formData.price_range_max)
        if (min >= max) {
          newErrors.price_range_max = 'Maximum price must be greater than minimum price'
        }
      }
      
      if (!formData.assessment_justification.trim()) {
        newErrors.assessment_justification = 'Please explain why assessment is required'
      }
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

  // UPDATED: Handle form submission with price range
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const submissionData = {
      ...formData,
      amount: formData.amount || null,
      fee: formData.assessment && formData.modality === 'local' ? formData.fee : 0,
      // NEW: Include price range fields
      price_range_min: formData.price_range_min ? parseFloat(formData.price_range_min) : null,
      price_range_max: formData.price_range_max ? parseFloat(formData.price_range_max) : null,
      assessment_justification: formData.assessment_justification || null,
      earliest_start: formData.earliest_start || null,
      latest_start: formData.latest_start || null,
      estimated_duration_hours: formData.estimated_duration_hours || null
    }
    
    await onSubmit(submissionData)
  }, [formData, onSubmit, validateForm])

  // Handle withdrawal
  const handleWithdraw = useCallback(async () => {
    if (window.confirm('Are you sure you want to withdraw your interest? This action cannot be undone.')) {
      await onWithdraw()
    }
  }, [onWithdraw])

  const minDateTime = new Date().toISOString().slice(0, 16)
  const strategy = getPricingStrategy()

  // Get status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'interested':
        return { 
          label: 'Interest Submitted', 
          variant: 'default',
          description: 'Your interest has been submitted and is waiting for customer review'
        }
      case 'invited':
        return { 
          label: 'Invited to Quote', 
          variant: 'default',
          description: 'Customer specifically invited you to provide a quote'
        }
      case 'quoted':
        return { 
          label: 'Quote Provided', 
          variant: 'default',
          description: 'You have provided a quote to the customer'
        }
      case 'selected':
        return { 
          label: 'Selected!', 
          variant: 'default',
          description: 'Customer has selected you for this project'
        }
      case 'rejected':
        return { 
          label: 'Not Selected', 
          variant: 'secondary',
          description: 'Customer selected another professional'
        }
      case 'withdrawn':
        return { 
          label: 'Withdrawn', 
          variant: 'secondary',
          description: 'You have withdrawn your interest in this project'
        }
      default:
        return { 
          label: status || 'Unknown', 
          variant: 'secondary',
          description: 'Status unknown'
        }
    }
  }

  const statusConfig = getStatusConfig(interest?.status)
  const canEdit = ['interested', 'invited', 'quoted'].includes(interest?.status)

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Interest Status
            {/* NEW: Show pricing strategy badge */}
            <Badge variant="outline" className="ml-2">
              {strategy === 'immediate' && 'Immediate Quote'}
              {strategy === 'preliminary' && 'Preliminary + Assessment'}
              {strategy === 'range' && 'Range + Assessment'}
              {strategy === 'assessment_only' && 'Assessment Only'}
              {strategy === 'none' && 'No Pricing'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant={statusConfig.variant} className="text-sm">
                {statusConfig.label}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {statusConfig.description}
              </p>
              {interest?.customer_viewed_at && (
                <p className="text-xs text-muted-foreground">
                  Viewed by customer: {new Date(interest.customer_viewed_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Expressed: {new Date(interest?.created_at).toLocaleDateString()}</div>
              {interest?.updated_at && interest.updated_at !== interest.created_at && (
                <div>Updated: {new Date(interest.updated_at).toLocaleDateString()}</div>
              )}
              {interest?.quoted_at && (
                <div>Quoted: {new Date(interest.quoted_at).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cannot Edit Warning */}
      {!canEdit && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {interest?.status === 'selected' ? 
              'Congratulations! You have been selected. The customer may contact you soon.' :
              interest?.status === 'withdrawn' ?
              'You have withdrawn your interest in this project.' :
              'This interest can no longer be edited due to its current status.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Update Form */}
      {canEdit && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* UPDATED: Pricing Strategy with price range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Update Pricing Strategy
                <Badge variant={strategy === 'immediate' ? 'default' : 'outline'} className="ml-2">
                  {strategy === 'immediate' && 'Immediate Quote'}
                  {strategy === 'preliminary' && 'Preliminary + Assessment'}
                  {strategy === 'range' && 'Range + Assessment'}
                  {strategy === 'assessment_only' && 'Assessment Only'}
                  {strategy === 'none' && 'Select Strategy'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quote field */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  {formData.assessment ? 'Preliminary Quote (JMD)' : 'Final Quote (JMD)'}
                </Label>
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
                {interest?.amount && (
                  <p className="text-xs text-muted-foreground">
                    Current quote: JMD ${parseFloat(interest.amount).toLocaleString()}
                  </p>
                )}
              </div>

              {/* NEW: Price Range (when assessment but no quote) */}
              {formData.assessment && !formData.amount && (
                <div className="space-y-4 p-4 border border-amber-200 bg-amber-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-600" />
                    <Label className="font-medium text-amber-800">
                      Updated Price Range (Required for Assessment-Only)
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm">Minimum (JMD)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 3000"
                        value={formData.price_range_min}
                        onChange={(e) => handleChange('price_range_min', e.target.value)}
                        className={errors.pricing ? 'border-destructive' : ''}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Maximum (JMD)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 8000"
                        value={formData.price_range_max}
                        onChange={(e) => handleChange('price_range_max', e.target.value)}
                        className={errors.price_range_max ? 'border-destructive' : ''}
                      />
                    </div>
                  </div>
                  {errors.pricing && (
                    <p className="text-sm text-destructive">{errors.pricing}</p>
                  )}
                  {errors.price_range_max && (
                    <p className="text-sm text-destructive">{errors.price_range_max}</p>
                  )}
                  {/* Show current range if exists */}
                  {(interest?.price_range_min || interest?.price_range_max) && (
                    <p className="text-xs text-muted-foreground">
                      Current range: JMD ${interest.price_range_min || '?'} - ${interest.price_range_max || '?'}
                    </p>
                  )}
                </div>
              )}

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
              </div>
            </CardContent>
          </Card>

          {/* Assessment Updates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assessment Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="assessment"
                  checked={formData.assessment}
                  onCheckedChange={(checked) => handleChange('assessment', checked)}
                />
                <Label htmlFor="assessment" className="font-medium">
                  Site assessment required
                </Label>
              </div>

              {formData.assessment && (
                <div className="ml-6 space-y-4 p-4 border border-border rounded-md bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="modality">Assessment Method *</Label>
                    <Select value={formData.modality} onValueChange={(value) => handleChange('modality', value)}>
                      <SelectTrigger className={errors.modality ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select assessment method..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Site Visit</SelectItem>
                        <SelectItem value="remote">Video Call</SelectItem>
                        <SelectItem value="phone">Phone Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.modality && (
                      <p className="text-sm text-destructive">{errors.modality}</p>
                    )}
                  </div>

                  {formData.modality === 'local' && (
                    <div className="space-y-2">
                      <Label htmlFor="fee">Updated Assessment Fee (JMD)</Label>
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
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Fee Policy:</strong> This fee will be <strong>deducted from your final quote</strong> if the customer accepts your proposal.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* NEW: Assessment justification for assessment-only */}
                  {!formData.amount && (
                    <div className="space-y-2">
                      <Label htmlFor="assessment_justification">
                        Updated Assessment Justification *
                      </Label>
                      <Textarea
                        id="assessment_justification"
                        rows={3}
                        value={formData.assessment_justification}
                        onChange={(e) => handleChange('assessment_justification', e.target.value)}
                        placeholder="Update your explanation of why site assessment is necessary..."
                        className={errors.assessment_justification ? 'border-destructive' : ''}
                      />
                      {errors.assessment_justification && (
                        <p className="text-sm text-destructive">{errors.assessment_justification}</p>
                      )}
                      {interest?.assessment_justification && (
                        <p className="text-xs text-muted-foreground">
                          Current: "{interest.assessment_justification}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Updated Message */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Update Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Updated Interest Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Update your interest message or provide additional information..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Updated Availability */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Updated Availability
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
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Updated Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any updates to your approach or additional information..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                variant="destructive"
                onClick={handleWithdraw}
                disabled={loading}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Withdraw Interest
              </Button>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Interest
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Read-only view for non-editable statuses */}
      {!canEdit && (
        <div className="space-y-6">
          {/* Current Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Interest Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quote or Price Range Display */}
              {interest?.amount && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">Quote Amount</span>
                  <span className="font-semibold">JMD ${parseFloat(interest.amount).toLocaleString()}</span>
                </div>
              )}

              {/* NEW: Price Range Display */}
              {!interest?.amount && (interest?.price_range_min || interest?.price_range_max) && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">Price Range</span>
                  <span className="font-semibold">
                    JMD ${interest.price_range_min ? parseFloat(interest.price_range_min).toLocaleString() : '?'} - 
                    ${interest.price_range_max ? parseFloat(interest.price_range_max).toLocaleString() : '?'}
                  </span>
                </div>
              )}

              {interest?.estimated_duration_hours && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">Estimated Duration</span>
                  <span>{interest.estimated_duration_hours} hours</span>
                </div>
              )}
              
              {interest?.assessment && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">Assessment</span>
                  <span>{interest.modality} {interest.fee > 0 && `- JMD ${interest.fee}`}</span>
                </div>
              )}

              {interest?.message && (
                <div className="space-y-2">
                  <span className="font-medium text-muted-foreground">Message</span>
                  <p className="text-sm bg-muted/30 p-3 rounded-md italic">"{interest.message}"</p>
                </div>
              )}

              {/* NEW: Assessment Justification Display */}
              {interest?.assessment_justification && (
                <div className="space-y-2">
                  <span className="font-medium text-muted-foreground">Assessment Justification</span>
                  <p className="text-sm bg-amber-50 p-3 rounded-md border border-amber-200">
                    {interest.assessment_justification}
                  </p>
                </div>
              )}

              {(interest?.earliest_start || interest?.latest_start) && (
                <div className="space-y-2">
                  <span className="font-medium text-muted-foreground">Availability Window</span>
                  <div className="text-sm space-y-1">
                    {interest.earliest_start && (
                      <div>Earliest: {new Date(interest.earliest_start).toLocaleString()}</div>
                    )}
                    {interest.latest_start && (
                      <div>Latest: {new Date(interest.latest_start).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              )}

              {interest?.notes && (
                <div className="space-y-2">
                  <span className="font-medium text-muted-foreground">Additional Notes</span>
                  <p className="text-sm bg-muted/30 p-3 rounded-md">{interest.notes}</p>
                </div>
              )}

              {interest?.customer_notes && (
                <div className="space-y-2">
                  <span className="font-medium text-muted-foreground">Customer Notes</span>
                  <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200">{interest.customer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions for selected interests */}
          {interest?.status === 'selected' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Congratulations - You've Been Selected!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    The customer has selected you for this project! You should receive further 
                    communication about next steps. If you need to reach out, you can contact 
                    the customer directly or wait for them to initiate the booking process.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button variant="default" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Contact Customer
                  </Button>
                  <Button variant="outline">
                    View Project Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions for invited interests */}
          {interest?.status === 'invited' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  You've Been Invited to Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    The customer has specifically invited you to provide a quote for this project. 
                    This is a great opportunity to showcase your expertise!
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button variant="default" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Update Quote
                  </Button>
                  <Button variant="outline">
                    Contact Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}