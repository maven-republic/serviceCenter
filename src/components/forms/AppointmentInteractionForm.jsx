'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  FileText,
  Loader2
} from "lucide-react";

export default function AppointmentInteractionForm({
  appointment,
  action, // 'accept', 'decline', 'quote'
  onSubmit,
  onCancel,
  loading = false
}) {
  const [formData, setFormData] = useState({
    // Response details
    professional_notes: '',
    estimated_duration: appointment?.service?.duration_minutes || 60,
    
    // Scheduling adjustments
    suggested_start: appointment?.preferred_start || '',
    suggested_end: '',
    
    // Pricing (for quotes)
    quoted_price: appointment?.service?.base_price || '',
    price_breakdown: '',
    
    // Additional details
    requirements: '',
    next_steps: '',
    
    // Decline reasons
    decline_reason: '',
    alternative_suggestions: ''
  });
  
  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Auto-calculate end time when duration changes
    if (field === 'estimated_duration' || field === 'suggested_start') {
      const startTime = field === 'suggested_start' ? value : formData.suggested_start;
      const duration = field === 'estimated_duration' ? value : formData.estimated_duration;
      
      if (startTime && duration) {
        const endTime = new Date(new Date(startTime).getTime() + duration * 60000);
        setFormData(prev => ({
          ...prev,
          suggested_end: endTime.toISOString().slice(0, 16)
        }));
      }
    }
  }, [formData.suggested_start, formData.estimated_duration, errors]);

  // Validate form based on action
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (action === 'accept') {
      if (!formData.suggested_start) {
        newErrors.suggested_start = 'Please confirm or adjust the start time';
      }
      
      if (!formData.estimated_duration || formData.estimated_duration < 15) {
        newErrors.estimated_duration = 'Duration must be at least 15 minutes';
      }
      
      // Validate start time is in the future
      if (formData.suggested_start) {
        const startDate = new Date(formData.suggested_start);
        if (startDate <= new Date()) {
          newErrors.suggested_start = 'Start time must be in the future';
        }
      }
    }
    
    if (action === 'quote') {
      if (!formData.quoted_price || isNaN(formData.quoted_price) || formData.quoted_price <= 0) {
        newErrors.quoted_price = 'Please provide a valid quoted price';
      }
      
      if (!formData.professional_notes.trim()) {
        newErrors.professional_notes = 'Please provide details about your quote';
      }
    }
    
    if (action === 'decline') {
      if (!formData.decline_reason.trim()) {
        newErrors.decline_reason = 'Please provide a reason for declining';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [action, formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare submission data based on action
    const submissionData = {
      action,
      appointment_id: appointment.appointment_id,
      ...formData
    };
    
    // Clean up data based on action
    if (action === 'accept') {
      delete submissionData.decline_reason;
      delete submissionData.alternative_suggestions;
      delete submissionData.quoted_price;
      delete submissionData.price_breakdown;
    } else if (action === 'decline') {
      delete submissionData.quoted_price;
      delete submissionData.price_breakdown;
      delete submissionData.suggested_start;
      delete submissionData.suggested_end;
      delete submissionData.estimated_duration;
    } else if (action === 'quote') {
      delete submissionData.decline_reason;
      delete submissionData.alternative_suggestions;
    }
    
    await onSubmit(submissionData);
  }, [action, appointment.appointment_id, formData, onSubmit, validateForm]);

  // Get minimum datetime (now)
  const minDateTime = useMemo(() => {
    return new Date().toISOString().slice(0, 16);
  }, []);

  // Get action-specific styling and content
  const getActionConfig = () => {
    switch (action) {
      case 'accept':
        return {
          title: 'Accept Appointment',
          icon: CheckCircle,
          color: 'default',
          variant: 'default',
          submitText: loading ? 'Accepting...' : 'Accept & Create Booking'
        };
      case 'decline':
        return {
          title: 'Decline Appointment',
          icon: XCircle,
          color: 'destructive',
          variant: 'destructive',
          submitText: loading ? 'Declining...' : 'Decline Appointment'
        };
      case 'quote':
        return {
          title: 'Send Quote',
          icon: FileText,
          color: 'secondary',
          variant: 'default',
          submitText: loading ? 'Sending Quote...' : 'Send Quote to Customer'
        };
      default:
        return {
          title: 'Respond to Appointment',
          icon: MessageSquare,
          color: 'default',
          variant: 'default',
          submitText: 'Submit Response'
        };
    }
  };

  const actionConfig = getActionConfig();
  const ActionIcon = actionConfig.icon;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {/* Form Header */}
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ActionIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl">{actionConfig.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Respond to {appointment?.customer?.account?.first_name}'s request for "{appointment?.service?.name || appointment?.title}"
            </p>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-6">
          
          {/* Accept Form Fields */}
          {action === 'accept' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4" />
                <h3 className="text-lg font-medium">Confirm Scheduling Details</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="suggested_start">Start Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    id="suggested_start"
                    value={formData.suggested_start}
                    onChange={(e) => handleChange('suggested_start', e.target.value)}
                    min={minDateTime}
                    required
                    className={errors.suggested_start ? 'border-destructive' : ''}
                  />
                  {errors.suggested_start && (
                    <p className="text-sm text-destructive">{errors.suggested_start}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Estimated Duration (minutes) *</Label>
                  <Input
                    type="number"
                    id="estimated_duration"
                    value={formData.estimated_duration}
                    onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value))}
                    min="15"
                    max="480"
                    step="15"
                    required
                    className={errors.estimated_duration ? 'border-destructive' : ''}
                  />
                  {errors.estimated_duration && (
                    <p className="text-sm text-destructive">{errors.estimated_duration}</p>
                  )}
                  {formData.suggested_end && (
                    <p className="text-xs text-muted-foreground">
                      Estimated end time: {new Date(formData.suggested_end).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements & Preparation</Label>
                <Textarea
                  id="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  placeholder="Any requirements the customer should prepare before the appointment..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_steps">Next Steps</Label>
                <Textarea
                  id="next_steps"
                  rows={2}
                  value={formData.next_steps}
                  onChange={(e) => handleChange('next_steps', e.target.value)}
                  placeholder="What happens after you accept this appointment..."
                />
              </div>
            </div>
          )}

          {/* Quote Form Fields */}
          {action === 'quote' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4" />
                <h3 className="text-lg font-medium">Pricing & Quote Details</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quoted_price">Quoted Price (JMD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      id="quoted_price"
                      value={formData.quoted_price}
                      onChange={(e) => handleChange('quoted_price', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                      className={`pl-10 ${errors.quoted_price ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.quoted_price && (
                    <p className="text-sm text-destructive">{errors.quoted_price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      id="estimated_duration"
                      value={formData.estimated_duration}
                      onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value))}
                      min="15"
                      max="480"
                      step="15"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_breakdown">Price Breakdown (Optional)</Label>
                <Textarea
                  id="price_breakdown"
                  rows={3}
                  value={formData.price_breakdown}
                  onChange={(e) => handleChange('price_breakdown', e.target.value)}
                  placeholder="Labor: $X, Materials: $Y, etc..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_notes">Quote Details & Notes *</Label>
                <Textarea
                  id="professional_notes"
                  rows={4}
                  value={formData.professional_notes}
                  onChange={(e) => handleChange('professional_notes', e.target.value)}
                  placeholder="Explain what's included in your quote, timeline, terms, etc..."
                  required
                  className={errors.professional_notes ? 'border-destructive' : ''}
                />
                {errors.professional_notes && (
                  <p className="text-sm text-destructive">{errors.professional_notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Decline Form Fields */}
          {action === 'decline' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-4 w-4" />
                <h3 className="text-lg font-medium">Decline Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="decline_reason">Reason for Declining *</Label>
                <Select 
                  value={formData.decline_reason} 
                  onValueChange={(value) => handleChange('decline_reason', value)}
                >
                  <SelectTrigger className={errors.decline_reason ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schedule_conflict">Schedule conflict</SelectItem>
                    <SelectItem value="outside_service_area">Outside service area</SelectItem>
                    <SelectItem value="insufficient_information">Need more information</SelectItem>
                    <SelectItem value="not_my_expertise">Not my area of expertise</SelectItem>
                    <SelectItem value="too_complex">Project too complex</SelectItem>
                    <SelectItem value="too_small">Project too small</SelectItem>
                    <SelectItem value="pricing_mismatch">Budget/pricing mismatch</SelectItem>
                    <SelectItem value="other">Other reason</SelectItem>
                  </SelectContent>
                </Select>
                {errors.decline_reason && (
                  <p className="text-sm text-destructive">{errors.decline_reason}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_notes">Additional Notes</Label>
                <Textarea
                  id="professional_notes"
                  rows={3}
                  value={formData.professional_notes}
                  onChange={(e) => handleChange('professional_notes', e.target.value)}
                  placeholder="Provide more details about why you're declining..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternative_suggestions">Alternative Suggestions</Label>
                <Textarea
                  id="alternative_suggestions"
                  rows={3}
                  value={formData.alternative_suggestions}
                  onChange={(e) => handleChange('alternative_suggestions', e.target.value)}
                  placeholder="Suggest other professionals, different timing, or alternative approaches..."
                />
              </div>
            </div>
          )}

          {/* Common Notes Section (for accept and quote actions) */}
          {action !== 'decline' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Additional Notes</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="professional_notes">
                    {action === 'quote' ? 'Additional Information' : 'Professional Notes'}
                  </Label>
                  <Textarea
                    id="professional_notes"
                    rows={3}
                    value={formData.professional_notes}
                    onChange={(e) => handleChange('professional_notes', e.target.value)}
                    placeholder={
                      action === 'accept' 
                        ? "Any additional information for the customer..."
                        : "Additional details about your response..."
                    }
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>

        {/* Form Actions */}
        <div className="flex justify-between items-center p-6 bg-muted/30 border-t">
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
            variant={actionConfig.variant}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <ActionIcon className="h-4 w-4" />
            {actionConfig.submitText}
          </Button>
        </div>
      </form>
    </Card>
  );
}