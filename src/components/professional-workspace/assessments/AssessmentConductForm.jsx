// src/components/professional-workspace/assessments/AssessmentConductForm.jsx
'use client'

import { useState } from 'react'
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
import { 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  X,
  Play,
  Save,
  Clock
} from 'lucide-react'
import AssessmentStatus from './AssessmentStatus'

export default function AssessmentConductForm({ assessment, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    professional_assessment_notes: assessment.professional_assessment_notes || '',
    complexity_vs_customer_estimate: assessment.complexity_vs_customer_estimate || '',
    customer_description_accurate: assessment.customer_description_accurate,
    customer_photos_sufficient: assessment.customer_photos_sufficient,
    customer_scope_understanding: assessment.customer_scope_understanding || '',
    scope_changes_required: assessment.scope_changes_required || false,
    scope_additions: assessment.scope_additions || [],
    scope_reductions: assessment.scope_reductions || [],
    scope_change_explanation: assessment.scope_change_explanation || '',
    additional_issues_found: assessment.additional_issues_found || [],
    condition_variance_from_photos: assessment.condition_variance_from_photos || '',
    parking_availability: assessment.parking_availability || '',
    access_instructions: assessment.access_instructions || '',
    site_access_notes: assessment.site_access_notes || '',
    work_area_details: assessment.work_area_details || '',
    utilities_available: assessment.utilities_available,
    workspace_constraints: assessment.workspace_constraints || '',
    additional_permits_required: assessment.additional_permits_required || false,
    permit_details: assessment.permit_details || '',
    additional_specialists_needed: assessment.additional_specialists_needed || [],
    code_compliance_issues: assessment.code_compliance_issues || ''
  })

  const [newIssue, setNewIssue] = useState('')
  const [newSpecialist, setNewSpecialist] = useState('')
  const [newAddition, setNewAddition] = useState('')
  const [newReduction, setNewReduction] = useState('')

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addToArray = (field, value, resetField) => {
    if (!value.trim()) return
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }))
    resetField('')
  }

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // ✅ STEP 1: Start the assessment (accepted → active)
  const handleStartAssessment = async () => {
    setLoading(true)
    try {
      console.log('▶️ Starting assessment...')
      
      const response = await fetch(`/api/assessments/${assessment.assessment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'active'
          // started_at will be auto-set by API
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start assessment')
      }

      const result = await response.json()
      console.log('✅ Assessment started')
      alert('Assessment started! Fill out the form below.')
      onSuccess?.(result.assessment)
    } catch (error) {
      console.error('❌ Error starting assessment:', error)
      alert(`Failed to start assessment: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

const handleSaveProgress = async (e) => {
  e.preventDefault()
  setLoading(true)

  try {
    console.log('💾 Saving assessment progress...')
    
    // 🔧 Sanitize enum fields
    const sanitizedData = {
      ...formData,
      complexity_vs_customer_estimate: formData.complexity_vs_customer_estimate || null,
      customer_scope_understanding: formData.customer_scope_understanding || null,
    }
    
    const response = await fetch(`/api/assessments/${assessment.assessment_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedData)
    })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save progress')
      }

      const result = await response.json()
      console.log('✅ Progress saved')
      alert('Progress saved successfully!')
      onSuccess?.(result.assessment)
    } catch (error) {
      console.error('❌ Error saving progress:', error)
      alert(`Failed to save: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

// ✅ STEP 3: Complete the assessment (active → completed)
const handleMarkAsCompleted = async () => {
  if (!formData.professional_assessment_notes?.trim()) {
    alert('Please provide assessment notes before completing.')
    return
  }

  setLoading(true)
  try {
    console.log('✅ Marking assessment as completed...')
    
    // 🔧 Sanitize enum fields: convert empty strings to null
    const sanitizedData = {
      ...formData,
      complexity_vs_customer_estimate: formData.complexity_vs_customer_estimate || null,
      customer_scope_understanding: formData.customer_scope_understanding || null,
      status: 'completed'
      // completed_at will be auto-set by API
    }
    
    const response = await fetch(`/api/assessments/${assessment.assessment_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to complete assessment')
    }

    const result = await response.json()
    console.log('✅ Assessment completed')
    alert('Assessment completed! You can now provide a final quote.')
    onSuccess?.(result.assessment)
  } catch (error) {
    console.error('❌ Error completing assessment:', error)
    alert(`Failed to complete: ${error.message}`)
  } finally {
    setLoading(false)
  }
}

  // Show different UI based on assessment status
  const isAccepted = assessment.status === 'accepted'
  const isActive = assessment.status === 'active'
  const isCompleted = assessment.status === 'completed'

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">Conduct Assessment</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {assessment.appointment?.title || 'Assessment'}
          </p>
        </div>
        <AssessmentStatus status={assessment.status} size="lg" />
      </div>

      {/* ===== ACCEPTED STATE: Show Start Button ===== */}
      {isAccepted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Ready to Begin Assessment
                </h3>
                <p className="text-green-700 mb-4">
                  Click the button below to start the on-site assessment. This will mark the assessment as in progress.
                </p>
                {assessment.confirmed_date && (
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>
                      Scheduled for {new Date(assessment.confirmed_date).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleStartAssessment}
                disabled={loading}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Assessment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== ACTIVE STATE: Show Form ===== */}
      {isActive && (
        <form onSubmit={handleSaveProgress} className="space-y-6">
          {/* Active Indicator */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Play className="h-5 w-5 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">Assessment In Progress</p>
                  <p className="text-sm text-amber-700">
                    Started at: {assessment.started_at ? new Date(assessment.started_at).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Assessment Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Overall Assessment Notes <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="notes"
                  rows={6}
                  value={formData.professional_assessment_notes}
                  onChange={(e) => handleChange('professional_assessment_notes', e.target.value)}
                  placeholder="Document your findings from the site visit. Include measurements, observations, and any important details..."
                  className="resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Be thorough - this will inform your final quote
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexity">Project Complexity vs Customer Estimate</Label>
                <Select 
                  value={formData.complexity_vs_customer_estimate}
                  onValueChange={(value) => handleChange('complexity_vs_customer_estimate', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How complex is the project?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simpler">Simpler than described</SelectItem>
                    <SelectItem value="as_described">As described</SelectItem>
                    <SelectItem value="more_complex">More complex</SelectItem>
                    <SelectItem value="completely_different">Completely different</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Information Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="description_accurate">Description was accurate</Label>
                <Switch
                  id="description_accurate"
                  checked={formData.customer_description_accurate === true}
                  onCheckedChange={(checked) => handleChange('customer_description_accurate', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="photos_sufficient">Customer photos were helpful</Label>
                <Switch
                  id="photos_sufficient"
                  checked={formData.customer_photos_sufficient === true}
                  onCheckedChange={(checked) => handleChange('customer_photos_sufficient', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Customer's Understanding of Scope</Label>
                <Select 
                  value={formData.customer_scope_understanding}
                  onValueChange={(value) => handleChange('customer_scope_understanding', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="underestimated">Underestimated the work</SelectItem>
                    <SelectItem value="accurate">Accurate understanding</SelectItem>
                    <SelectItem value="overestimated">Overestimated the work</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Differences from Photos</Label>
                <Textarea
                  rows={3}
                  value={formData.condition_variance_from_photos}
                  onChange={(e) => handleChange('condition_variance_from_photos', e.target.value)}
                  placeholder="Describe how the actual site differs from the photos..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Scope Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Scope Changes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="scope_changes">Scope changes required?</Label>
                <Switch
                  id="scope_changes"
                  checked={formData.scope_changes_required}
                  onCheckedChange={(checked) => handleChange('scope_changes_required', checked)}
                />
              </div>

              {formData.scope_changes_required && (
                <div className="space-y-4 pl-4 border-l-2 border-amber-300">
                  {/* Additions */}
                  <div className="space-y-2">
                    <Label>Additional Work Needed</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newAddition}
                        onChange={(e) => setNewAddition(e.target.value)}
                        placeholder="Add work item..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addToArray('scope_additions', newAddition, setNewAddition)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addToArray('scope_additions', newAddition, setNewAddition)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.scope_additions?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                        <span className="text-sm flex-1">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray('scope_additions', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Reductions */}
                  <div className="space-y-2">
                    <Label>Work to Remove</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newReduction}
                        onChange={(e) => setNewReduction(e.target.value)}
                        placeholder="Add work item..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addToArray('scope_reductions', newReduction, setNewReduction)
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addToArray('scope_reductions', newReduction, setNewReduction)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.scope_reductions?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <span className="text-sm flex-1">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray('scope_reductions', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Explanation of Scope Changes</Label>
                    <Textarea
                      rows={3}
                      value={formData.scope_change_explanation}
                      onChange={(e) => handleChange('scope_change_explanation', e.target.value)}
                      placeholder="Explain why these changes are necessary..."
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Issues Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="Describe any issues discovered..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addToArray('additional_issues_found', newIssue, setNewIssue)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addToArray('additional_issues_found', newIssue, setNewIssue)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.additional_issues_found?.map((issue, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span className="text-sm flex-1">{issue}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromArray('additional_issues_found', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Site Access Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Site Access & Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Parking Availability</Label>
                <Input
                  value={formData.parking_availability}
                  onChange={(e) => handleChange('parking_availability', e.target.value)}
                  placeholder="e.g., Street parking available, driveway access"
                />
              </div>

              <div className="space-y-2">
                <Label>Access Instructions</Label>
                <Textarea
                  rows={2}
                  value={formData.access_instructions}
                  onChange={(e) => handleChange('access_instructions', e.target.value)}
                  placeholder="How to access the work area..."
                />
              </div>

              <div className="space-y-2">
                <Label>Work Area Details</Label>
                <Textarea
                  rows={3}
                  value={formData.work_area_details}
                  onChange={(e) => handleChange('work_area_details', e.target.value)}
                  placeholder="Describe the work area conditions, space constraints, etc..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Utilities Available (water, electricity)</Label>
                <Switch
                  checked={formData.utilities_available === true}
                  onCheckedChange={(checked) => handleChange('utilities_available', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Workspace Constraints</Label>
                <Textarea
                  rows={2}
                  value={formData.workspace_constraints}
                  onChange={(e) => handleChange('workspace_constraints', e.target.value)}
                  placeholder="Any limitations or challenges with the workspace..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Additional permits required?</Label>
                <Switch
                  checked={formData.additional_permits_required}
                  onCheckedChange={(checked) => handleChange('additional_permits_required', checked)}
                />
              </div>

              {formData.additional_permits_required && (
                <div className="space-y-2 pl-4 border-l-2 border-blue-300">
                  <Label>Permit Details</Label>
                  <Textarea
                    rows={2}
                    value={formData.permit_details}
                    onChange={(e) => handleChange('permit_details', e.target.value)}
                    placeholder="What permits are needed and why..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Additional Specialists Needed</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSpecialist}
                    onChange={(e) => setNewSpecialist(e.target.value)}
                    placeholder="e.g., Electrician, Plumber"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('additional_specialists_needed', newSpecialist, setNewSpecialist)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addToArray('additional_specialists_needed', newSpecialist, setNewSpecialist)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.additional_specialists_needed?.map((specialist, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-sm flex-1">{specialist}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromArray('additional_specialists_needed', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Code Compliance Issues</Label>
                <Textarea
                  rows={2}
                  value={formData.code_compliance_issues}
                  onChange={(e) => handleChange('code_compliance_issues', e.target.value)}
                  placeholder="Any code compliance concerns..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
              variant="secondary"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleMarkAsCompleted}
              disabled={loading || !formData.professional_assessment_notes?.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>

          {!formData.professional_assessment_notes?.trim() && (
            <p className="text-sm text-red-600 text-center -mt-2">
              Assessment notes are required to complete
            </p>
          )}
        </form>
      )}

      {/* ===== COMPLETED STATE: Show Completion Message ===== */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Assessment Completed
                </h3>
                <p className="text-green-700 mb-2">
                  Completed on {new Date(assessment.completed_at).toLocaleString()}
                </p>
              </div>
              
              {/* Show Assessment Summary */}
              <div className="bg-white rounded-lg p-4 border border-green-200 text-left">
                <h4 className="font-semibold mb-2">Assessment Summary</h4>
                <div className="space-y-2 text-sm">
                  {assessment.professional_assessment_notes && (
                    <div>
                      <span className="font-medium">Notes:</span>
                      <p className="text-muted-foreground mt-1">{assessment.professional_assessment_notes}</p>
                    </div>
                  )}
                  {assessment.complexity_vs_customer_estimate && (
                    <div>
                      <span className="font-medium">Complexity:</span>{' '}
                      <Badge variant="outline">{assessment.complexity_vs_customer_estimate}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-2">📋 Next Step:</p>
                <p className="text-blue-700">
                  Provide your final quote based on the assessment findings
                </p>
              </div>

              <Button
                onClick={onCancel}
                variant="outline"
                className="mt-4"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}