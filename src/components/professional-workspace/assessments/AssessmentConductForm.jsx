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
  Camera,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  X
} from 'lucide-react'

export default function AssessmentConductForm({ assessment, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: 'active', // Mark as active when starting
    started_at: new Date().toISOString(),
    professional_assessment_notes: '',
    complexity_vs_customer_estimate: '',
    customer_description_accurate: null,
    customer_photos_sufficient: null,
    customer_scope_understanding: '',
    scope_changes_required: false,
    scope_additions: [],
    scope_reductions: [],
    scope_change_explanation: '',
    additional_issues_found: [],
    condition_variance_from_photos: '',
    // Site access
    parking_availability: '',
    access_instructions: '',
    site_access_notes: '',
    work_area_details: '',
    utilities_available: null,
    workspace_constraints: '',
    // Additional requirements
    additional_permits_required: false,
    permit_details: '',
    additional_specialists_needed: [],
    code_compliance_issues: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/assessments/${assessment.assessment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          updated_at: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update assessment')
      }

      alert('Assessment findings saved successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating assessment:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const markAsCompleted = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/assessments/${assessment.assessment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete assessment')
      }

      alert('Assessment marked as completed! You can now provide a final quote.')
      onSuccess?.()
    } catch (error) {
      console.error('Error completing assessment:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
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
            <Label htmlFor="notes">Overall Assessment Notes *</Label>
            <Textarea
              id="notes"
              rows={5}
              value={formData.professional_assessment_notes}
              onChange={(e) => handleChange('professional_assessment_notes', e.target.value)}
              placeholder="Document your findings from the site visit. Include measurements, observations, and any important details..."
              required
            />
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

          {formData.condition_variance_from_photos && (
            <div className="space-y-2">
              <Label>Differences from Photos</Label>
              <Textarea
                rows={3}
                value={formData.condition_variance_from_photos}
                onChange={(e) => handleChange('condition_variance_from_photos', e.target.value)}
                placeholder="Describe how the actual site differs from the photos..."
              />
            </div>
          )}
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
            <>
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
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
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
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
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
            </>
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
            <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 rounded">
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

          {formData.workspace_constraints && (
            <div className="space-y-2">
              <Label>Workspace Constraints</Label>
              <Textarea
                rows={2}
                value={formData.workspace_constraints}
                onChange={(e) => handleChange('workspace_constraints', e.target.value)}
                placeholder="Any limitations or challenges with the workspace..."
              />
            </div>
          )}
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
            <div className="space-y-2">
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
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
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

          {formData.code_compliance_issues && (
            <div className="space-y-2">
              <Label>Code Compliance Issues</Label>
              <Textarea
                rows={2}
                value={formData.code_compliance_issues}
                onChange={(e) => handleChange('code_compliance_issues', e.target.value)}
                placeholder="Any code compliance concerns..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
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
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Progress
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={markAsCompleted}
          disabled={loading || !formData.professional_assessment_notes}
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
    </form>
  )
}