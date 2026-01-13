// src/components/professional-workspace/assessments/AssessmentFinalQuoteForm.jsx
'use client'

import { useState, useEffect } from 'react'
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
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  X,
  FileText,
  Info
} from 'lucide-react'

export default function AssessmentFinalQuoteForm({ assessment, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    final_quote_amount: '',
    final_quote_breakdown: {
      labor: '',
      materials: '',
      equipment: '',
      permits: '',
      other: ''
    },
    final_quote_notes: '',
    final_quote_valid_until: '',
    timeline_estimate: '',
    revised_timeline_hours: '',
    revised_timeline_days: '',
    payment_terms: '',
    deposit_percentage: 30,
    milestones: [],
    warranty_offered: '',
    warranty_duration_months: '',
    exclusions: [],
    assumptions: [],
    terms_and_conditions: ''
  })

  const [newMilestone, setNewMilestone] = useState({ description: '', percentage: '' })
  const [newExclusion, setNewExclusion] = useState('')
  const [newAssumption, setNewAssumption] = useState('')
  const [calculatedTotal, setCalculatedTotal] = useState(0)

  // Calculate total from breakdown
  useEffect(() => {
    const total = Object.values(formData.final_quote_breakdown)
      .reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
    setCalculatedTotal(total)
  }, [formData.final_quote_breakdown])

  // Set default valid until date (30 days from now)
  useEffect(() => {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    handleChange('final_quote_valid_until', thirtyDaysFromNow.toISOString().split('T')[0])
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBreakdownChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      final_quote_breakdown: {
        ...prev.final_quote_breakdown,
        [field]: value
      }
    }))
  }

  const useCalculatedTotal = () => {
    handleChange('final_quote_amount', calculatedTotal.toString())
  }

  const addMilestone = () => {
    if (!newMilestone.description || !newMilestone.percentage) return
    
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { ...newMilestone }]
    }))
    setNewMilestone({ description: '', percentage: '' })
  }

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const addToArray = (field, value, resetFn) => {
    if (!value.trim()) return
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }))
    resetFn('')
  }

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!formData.final_quote_amount || parseFloat(formData.final_quote_amount) <= 0) {
      alert('Please enter a valid quote amount')
      return false
    }

    if (!formData.final_quote_notes?.trim()) {
      alert('Please provide quote notes/explanation')
      return false
    }

    if (!formData.final_quote_valid_until) {
      alert('Please set quote expiration date')
      return false
    }

    // Check if assessment fee should be deducted
    if (assessment.proposed_fee > 0) {
      const quoteAmount = parseFloat(formData.final_quote_amount)
      if (quoteAmount < assessment.proposed_fee) {
        alert(`Quote amount must be at least the assessment fee (JMD $${assessment.proposed_fee})`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch(`/api/assessments/${assessment.assessment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_quote_provided: true,
          final_quote_amount: parseFloat(formData.final_quote_amount),
          final_quote_breakdown: formData.final_quote_breakdown,
          final_quote_notes: formData.final_quote_notes,
          final_quote_valid_until: formData.final_quote_valid_until,
          revised_timeline_hours: formData.revised_timeline_hours ? parseInt(formData.revised_timeline_hours) : null,
          revised_timeline_days: formData.revised_timeline_days ? parseInt(formData.revised_timeline_days) : null,
          payment_terms: formData.payment_terms,
          deposit_percentage: formData.deposit_percentage,
          milestones: formData.milestones,
          warranty_offered: formData.warranty_offered,
          warranty_duration_months: formData.warranty_duration_months ? parseInt(formData.warranty_duration_months) : null,
          exclusions: formData.exclusions,
          assumptions: formData.assumptions,
          terms_and_conditions: formData.terms_and_conditions,
          status: 'completed',
          completed_at: assessment.completed_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit final quote')
      }

      alert('Final quote submitted successfully! The customer will be notified.')
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting quote:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const totalMilestonePercentage = formData.milestones.reduce(
    (sum, m) => sum + (parseFloat(m.percentage) || 0), 
    0
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* Assessment Fee Notice */}
      {assessment.proposed_fee > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Assessment Fee Will Be Deducted
                </p>
                <p className="text-sm text-blue-800">
                  The assessment fee of <strong>JMD ${parseFloat(assessment.proposed_fee).toLocaleString()}</strong> will 
                  be automatically deducted from your final quote if the customer accepts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quote Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Final Quote Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote_amount">Total Quote Amount (JMD) *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="quote_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.final_quote_amount}
                  onChange={(e) => handleChange('final_quote_amount', e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cost Breakdown (Optional) */}
          <div className="space-y-3 p-3 border rounded-md bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Cost Breakdown (Optional)</h4>
              {calculatedTotal > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useCalculatedTotal}
                >
                  Use Calculated: ${calculatedTotal.toLocaleString()}
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Labor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.final_quote_breakdown.labor}
                  onChange={(e) => handleBreakdownChange('labor', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Materials</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.final_quote_breakdown.materials}
                  onChange={(e) => handleBreakdownChange('materials', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Equipment</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.final_quote_breakdown.equipment}
                  onChange={(e) => handleBreakdownChange('equipment', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Permits</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.final_quote_breakdown.permits}
                  onChange={(e) => handleBreakdownChange('permits', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Other</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.final_quote_breakdown.other}
                  onChange={(e) => handleBreakdownChange('other', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {calculatedTotal > 0 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Calculated Total:</span>
                <span className="text-lg font-bold">JMD ${calculatedTotal.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote_notes">Quote Explanation *</Label>
            <Textarea
              id="quote_notes"
              rows={4}
              value={formData.final_quote_notes}
              onChange={(e) => handleChange('final_quote_notes', e.target.value)}
              placeholder="Explain your quote, what's included, and any important details the customer should know..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until">Quote Valid Until *</Label>
            <Input
              id="valid_until"
              type="date"
              value={formData.final_quote_valid_until}
              onChange={(e) => handleChange('final_quote_valid_until', e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Estimate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline Estimate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline_hours">Estimated Hours</Label>
              <Input
                id="timeline_hours"
                type="number"
                min="0"
                value={formData.revised_timeline_hours}
                onChange={(e) => handleChange('revised_timeline_hours', e.target.value)}
                placeholder="e.g., 40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline_days">Estimated Days</Label>
              <Input
                id="timeline_days"
                type="number"
                min="0"
                value={formData.revised_timeline_days}
                onChange={(e) => handleChange('revised_timeline_days', e.target.value)}
                placeholder="e.g., 5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_terms">Payment Structure</Label>
            <Select 
              value={formData.payment_terms}
              onValueChange={(value) => handleChange('payment_terms', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_upfront">Full payment upfront</SelectItem>
                <SelectItem value="deposit_then_balance">Deposit then balance on completion</SelectItem>
                <SelectItem value="milestone_based">Milestone-based payments</SelectItem>
                <SelectItem value="net_30">Net 30 days</SelectItem>
                <SelectItem value="custom">Custom terms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payment_terms === 'deposit_then_balance' && (
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="deposit"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.deposit_percentage}
                  onChange={(e) => handleChange('deposit_percentage', e.target.value)}
                />
                <span className="text-muted-foreground">%</span>
              </div>
              {formData.final_quote_amount && (
                <p className="text-sm text-muted-foreground">
                  Deposit: JMD ${(parseFloat(formData.final_quote_amount) * formData.deposit_percentage / 100).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {formData.payment_terms === 'milestone_based' && (
            <div className="space-y-3">
              <Label>Payment Milestones</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Milestone description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Percentage"
                    value={newMilestone.percentage}
                    onChange={(e) => setNewMilestone({ ...newMilestone, percentage: e.target.value })}
                    className="w-32"
                  />
                  <span className="flex items-center text-muted-foreground">%</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMilestone}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {formData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <span className="text-sm flex-1">{milestone.description}</span>
                  <Badge variant="secondary">{milestone.percentage}%</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMilestone(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {totalMilestonePercentage > 0 && (
                <div className={`p-2 rounded text-sm ${
                  totalMilestonePercentage === 100 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-amber-50 text-amber-800'
                }`}>
                  Total: {totalMilestonePercentage}% {totalMilestonePercentage !== 100 && '(should equal 100%)'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warranty */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Warranty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warranty">Warranty Description</Label>
            <Textarea
              id="warranty"
              rows={2}
              value={formData.warranty_offered}
              onChange={(e) => handleChange('warranty_offered', e.target.value)}
              placeholder="Describe any warranty you're offering..."
            />
          </div>

          {formData.warranty_offered && (
            <div className="space-y-2">
              <Label htmlFor="warranty_duration">Warranty Duration (months)</Label>
              <Input
                id="warranty_duration"
                type="number"
                min="0"
                value={formData.warranty_duration_months}
                onChange={(e) => handleChange('warranty_duration_months', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exclusions & Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exclusions & Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What's NOT Included</Label>
            <div className="flex gap-2">
              <Input
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                placeholder="Add exclusion..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addToArray('exclusions', newExclusion, setNewExclusion)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addToArray('exclusions', newExclusion, setNewExclusion)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.exclusions.map((exclusion, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                <span className="text-sm flex-1">{exclusion}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromArray('exclusions', index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Assumptions</Label>
            <div className="flex gap-2">
              <Input
                value={newAssumption}
                onChange={(e) => setNewAssumption(e.target.value)}
                placeholder="Add assumption..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addToArray('assumptions', newAssumption, setNewAssumption)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addToArray('assumptions', newAssumption, setNewAssumption)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.assumptions.map((assumption, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="text-sm flex-1">{assumption}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromArray('assumptions', index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={formData.terms_and_conditions}
            onChange={(e) => handleChange('terms_and_conditions', e.target.value)}
            placeholder="Enter any specific terms and conditions for this quote..."
          />
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-4 border-t">
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
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Final Quote
            </>
          )}
        </Button>
      </div>
    </form>
  )
}