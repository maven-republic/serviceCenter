// src/components/professional-workspace/interests/InterestResponseForm.jsx
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
  Users
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

  // Validate form
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

  // Get status configuration - UPDATED to include all database statuses
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
  // UPDATED: Fixed canEdit logic to match database statuses
  const canEdit = ['interested', 'invited', 'quoted'].includes(interest?.status)

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Interest Status
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
          {/* Updated Quote */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Update Quote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Updated Quote Amount (JMD)</Label>
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
              {interest?.amount && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">Quote Amount</span>
                  <span className="font-semibold">JMD ${parseFloat(interest.amount).toLocaleString()}</span>
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