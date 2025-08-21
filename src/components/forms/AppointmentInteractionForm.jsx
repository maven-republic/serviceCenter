'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  X, 
  FileText,
  Loader2,
  Heart,
  Target,
  AlertTriangle,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function AppointmentInteractionForm({
  appointment,
  interest, // For update_interest mode
  action, // 'accept', 'decline', 'quote', 'express_interest', 'update_interest'
  mode = 'assigned', // 'available', 'interests', 'assigned'
  onSubmit,
  onCancel,
  loading = false
}) {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    scheduling: true,
    pricing: true,
    assessment: false,
    availability: false,
    additional: false
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize form data based on action and existing data
  const getInitialFormData = () => {
    const baseData = {
      // Response details
      professional_notes: '',
      estimated_duration: appointment?.service?.duration_minutes || 60,
      
      // Scheduling adjustments
      suggested_start: appointment?.session || '',
      suggested_end: '',
      
      // Pricing (for quotes)
      quoted_price: appointment?.service?.base_price || '',
      price_breakdown: '',
      
      // Additional details
      requirements: '',
      next_steps: '',
      
      // Decline reasons
      decline_reason: '',
      alternative_suggestions: '',

      // Interest-specific fields
      intent: 'standard',
      message: '',
      assessment: false,
      modality: 'none',
      fee: 0.00,
      amount: null,
      notes: '',
      earliest_start: '',
      latest_start: '',
      estimated_duration_hours: null
    }

    // Pre-populate for interest updates
    if (action === 'update_interest' && interest) {
      return {
        ...baseData,
        intent: interest.intent || 'standard',
        message: interest.message || '',
        assessment: interest.assessment || false,
        modality: interest.modality || 'none',
        fee: interest.fee || 0.00,
        amount: interest.amount || '',
        notes: interest.notes || '',
        earliest_start: interest.earliest_start || '',
        latest_start: interest.latest_start || '',
        estimated_duration_hours: interest.estimated_duration_hours || null
      }
    }

    return baseData
  }

  const [formData, setFormData] = useState(getInitialFormData())
  const [errors, setErrors] = useState({});

  // Toggle section expansion on mobile
  const toggleSection = useCallback((section) => {
    if (isMobile) {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  }, [isMobile]);

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

    if (action === 'express_interest') {
      if (!formData.message.trim()) {
        newErrors.message = 'Please provide a message expressing your interest';
      }

      if (formData.assessment && !['local', 'remote', 'phone'].includes(formData.modality)) {
        newErrors.modality = 'Please select assessment modality when assessment is required';
      }

      if (formData.assessment && formData.modality === 'local' && formData.fee < 0) {
        newErrors.fee = 'Assessment fee cannot be negative';
      }

      if (formData.amount && (isNaN(formData.amount) || formData.amount <= 0)) {
        newErrors.amount = 'Quote amount must be a valid positive number';
      }
    }

    if (action === 'update_interest') {
      if (formData.amount && (isNaN(formData.amount) || formData.amount <= 0)) {
        newErrors.amount = 'Quote amount must be a valid positive number';
      }

      if (formData.assessment && !['local', 'remote', 'phone'].includes(formData.modality)) {
        newErrors.modality = 'Please select assessment modality when assessment is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [action, formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Debug logging
    console.log('🔍 About to submit interest data:', formData);
    
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
      delete submissionData.intent;
      delete submissionData.message;
      delete submissionData.assessment;
      delete submissionData.modality;
      delete submissionData.fee;
      delete submissionData.amount;
    } else if (action === 'decline') {
      delete submissionData.quoted_price;
      delete submissionData.price_breakdown;
      delete submissionData.suggested_start;
      delete submissionData.suggested_end;
      delete submissionData.estimated_duration;
      delete submissionData.intent;
      delete submissionData.message;
      delete submissionData.assessment;
      delete submissionData.modality;
      delete submissionData.fee;
      delete submissionData.amount;
    } else if (action === 'quote') {
      delete submissionData.decline_reason;
      delete submissionData.alternative_suggestions;
      delete submissionData.intent;
      delete submissionData.message;
      delete submissionData.assessment;
      delete submissionData.modality;
      delete submissionData.fee;
      delete submissionData.amount;
    } else if (action === 'express_interest' || action === 'update_interest') {
      delete submissionData.decline_reason;
      delete submissionData.alternative_suggestions;
      delete submissionData.quoted_price;
      delete submissionData.price_breakdown;
      delete submissionData.suggested_start;
      delete submissionData.suggested_end;
      delete submissionData.estimated_duration;
      delete submissionData.requirements;
      delete submissionData.next_steps;
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
          icon: X,
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
      case 'express_interest':
        return {
          title: 'Express Interest',
          icon: Heart,
          color: 'default',
          variant: 'default',
          submitText: loading ? 'Expressing Interest...' : 'Express Interest'
        };
      case 'update_interest':
        return {
          title: 'Update Interest',
          icon: Target,
          color: 'default',
          variant: 'default',
          submitText: loading ? 'Updating Interest...' : 'Update Interest'
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

  // Collapsible Section Component for Mobile
  const CollapsibleSection = ({ title, children, section, icon: Icon, required = false }) => {
    const isExpanded = expandedSections[section];
    
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(section)}
          className={`w-full p-4 text-left bg-muted/30 hover:bg-muted/50 transition-colors ${isMobile ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!isMobile}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{title}</span>
              {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </div>
            {isMobile && (
              isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
        
        <div className={`transition-all duration-200 ${isMobile ? (isExpanded ? 'block' : 'hidden') : 'block'}`}>
          <div className="p-4 space-y-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {/* Form Header */}
      <CardHeader className={`space-y-4 ${isMobile ? 'px-4 py-4' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
            <ActionIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>{actionConfig.title}</CardTitle>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed`}>
              {action === 'express_interest' 
                ? `Express interest in "${appointment?.service?.name || appointment?.title}"`
                : action === 'update_interest'
                ? `Update your interest in "${appointment?.service?.name || appointment?.title}"`
                : `Respond to ${appointment?.customer?.account?.first_name}'s request for "${appointment?.service?.name || appointment?.title}"`
              }
            </p>
          </div>
        </div>

        {/* Competition Warning for Express Interest */}
        {action === 'express_interest' && appointment?.interest_summary?.total_count > 0 && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>{appointment.interest_summary.total_count} other professionals</strong> have already expressed interest in this project. 
              Make your proposal stand out!
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
          
          {/* Accept Form Fields */}
          {action === 'accept' && (
            <CollapsibleSection 
              title="Confirm Scheduling Details" 
              section="scheduling" 
              icon={Calendar}
              required
            >
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                <div className="space-y-2">
                  <Label htmlFor="suggested_start">Start Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    id="suggested_start"
                    value={formData.suggested_start}
                    onChange={(e) => handleChange('suggested_start', e.target.value)}
                    min={minDateTime}
                    required
                    className={`${errors.suggested_start ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}
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
                    className={`${errors.estimated_duration ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}
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
                  rows={isMobile ? 4 : 3}
                  value={formData.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  placeholder="Any requirements the customer should prepare before the appointment..."
                  className={isMobile ? 'min-h-[100px]' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_steps">Next Steps</Label>
                <Textarea
                  id="next_steps"
                  rows={isMobile ? 3 : 2}
                  value={formData.next_steps}
                  onChange={(e) => handleChange('next_steps', e.target.value)}
                  placeholder="What happens after you accept this appointment..."
                  className={isMobile ? 'min-h-[80px]' : ''}
                />
              </div>
            </CollapsibleSection>
          )}

          {/* Quote Form Fields */}
          {action === 'quote' && (
            <CollapsibleSection 
              title="Pricing & Quote Details" 
              section="pricing" 
              icon={DollarSign}
              required
            >
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
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
                      className={`pl-10 ${errors.quoted_price ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}
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
                      className={`pl-10 ${isMobile ? 'h-12' : ''}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_breakdown">Price Breakdown (Optional)</Label>
                <Textarea
                  id="price_breakdown"
                  rows={isMobile ? 4 : 3}
                  value={formData.price_breakdown}
                  onChange={(e) => handleChange('price_breakdown', e.target.value)}
                  placeholder="Labor: $X, Materials: $Y, etc..."
                  className={isMobile ? 'min-h-[100px]' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_notes">Quote Details & Notes *</Label>
                <Textarea
                  id="professional_notes"
                  rows={isMobile ? 5 : 4}
                  value={formData.professional_notes}
                  onChange={(e) => handleChange('professional_notes', e.target.value)}
                  placeholder="Explain what's included in your quote, timeline, terms, etc..."
                  required
                  className={`${errors.professional_notes ? 'border-destructive' : ''} ${isMobile ? 'min-h-[120px]' : ''}`}
                />
                {errors.professional_notes && (
                  <p className="text-sm text-destructive">{errors.professional_notes}</p>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Decline Form Fields */}
          {action === 'decline' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <X className="h-4 w-4" />
                <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>Decline Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="decline_reason">Reason for Declining *</Label>
                <Select 
                  value={formData.decline_reason} 
                  onValueChange={(value) => handleChange('decline_reason', value)}
                >
                  <SelectTrigger className={`${errors.decline_reason ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}>
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
                  rows={isMobile ? 4 : 3}
                  value={formData.professional_notes}
                  onChange={(e) => handleChange('professional_notes', e.target.value)}
                  placeholder="Provide more details about why you're declining..."
                  className={isMobile ? 'min-h-[100px]' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternative_suggestions">Alternative Suggestions</Label>
                <Textarea
                  id="alternative_suggestions"
                  rows={isMobile ? 4 : 3}
                  value={formData.alternative_suggestions}
                  onChange={(e) => handleChange('alternative_suggestions', e.target.value)}
                  placeholder="Suggest other professionals, different timing, or alternative approaches..."
                  className={isMobile ? 'min-h-[100px]' : ''}
                />
              </div>
            </div>
          )}

          {/* Express Interest Form Fields */}
          {action === 'express_interest' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-4 w-4" />
                <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>Express Your Interest</h3>
              </div>

              {/* Intent Level */}
              <div className="space-y-2">
                <Label htmlFor="intent">Interest Level</Label>
                <Select 
                  value={formData.intent} 
                  onValueChange={(value) => handleChange('intent', value)}
                >
                  <SelectTrigger className={isMobile ? 'h-12' : ''}>
                    <SelectValue placeholder="Select interest level..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="space-y-1">
                        <div className="font-medium">Low - Just exploring</div>
                        <div className="text-xs text-muted-foreground">Flexible timeline</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="standard">
                      <div className="space-y-1">
                        <div className="font-medium">Standard - Interested</div>
                        <div className="text-xs text-muted-foreground">Standard timeline</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="space-y-1">
                        <div className="font-medium">High - Very interested</div>
                        <div className="text-xs text-muted-foreground">Priority timeline</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Interest Message *</Label>
                <Textarea
                  id="message"
                  rows={isMobile ? 5 : 4}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Explain why you're interested in this project and what makes you the right professional for the job..."
                  required
                  className={`${errors.message ? 'border-destructive' : ''} ${isMobile ? 'min-h-[120px]' : ''}`}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
              </div>

              {/* Assessment Requirements */}
              <CollapsibleSection 
                title="Assessment Requirements" 
                section="assessment" 
                icon={AlertTriangle}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="assessment"
                      checked={formData.assessment}
                      onCheckedChange={(checked) => handleChange('assessment', checked)}
                    />
                    <Label htmlFor="assessment">Site assessment required</Label>
                  </div>

                  {formData.assessment && (
                    <div className="ml-6 space-y-4 p-4 border border-border rounded-md bg-muted/30">
                      <div className="space-y-2">
                        <Label htmlFor="modality">Assessment Method *</Label>
                        <Select 
                          value={formData.modality} 
                          onValueChange={(value) => handleChange('modality', value)}
                        >
                          <SelectTrigger className={`${errors.modality ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}>
                            <SelectValue placeholder="Select assessment method..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local visit</SelectItem>
                            <SelectItem value="remote">Remote assessment</SelectItem>
                            <SelectItem value="phone">Phone consultation</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.modality && (
                          <p className="text-sm text-destructive">{errors.modality}</p>
                        )}
                      </div>

                      {formData.modality === 'local' && (
                        <div className="space-y-2">
                          <Label htmlFor="fee">Assessment Fee (JMD)</Label>
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
                              className={`pl-10 ${errors.fee ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}
                            />
                          </div>
                          {errors.fee && (
                            <p className="text-sm text-destructive">{errors.fee}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Fee for traveling to customer location (can be deducted from final quote)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* Optional Quote */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Initial Quote (Optional)</Label>
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
                      className={`pl-10 ${errors.amount ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Provide an initial quote if you can estimate without assessment
                  </p>
                </div>
              </div>

              {/* Availability Window */}
              <CollapsibleSection 
                title="Availability Window (Optional)" 
                section="availability" 
                icon={Calendar}
              >
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                  <div className="space-y-2">
                    <Label htmlFor="earliest_start">Earliest Available</Label>
                    <Input
                      type="datetime-local"
                      id="earliest_start"
                      value={formData.earliest_start}
                      onChange={(e) => handleChange('earliest_start', e.target.value)}
                      min={minDateTime}
                      className={isMobile ? 'h-12' : ''}
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
                      className={isMobile ? 'h-12' : ''}
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  rows={isMobile ? 4 : 3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional information about your approach, experience, or special considerations..."
                  className={isMobile ? 'min-h-[100px]' : ''}
                />
              </div>
            </div>
          )}

          {/* Update Interest Form Fields */}
          {action === 'update_interest' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4" />
                <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>Update Your Interest</h3>
              </div>

              {/* Current Interest Status */}
              {interest && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Current status: <strong>{interest.status}</strong>
                    {interest.created_at && (
                      <span className="ml-2 text-muted-foreground">
                        (Expressed {new Date(interest.created_at).toLocaleDateString()})
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Updated Quote */}
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
                    className={`pl-10 ${errors.amount ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount}</p>
                )}
              </div>

              {/* Assessment Updates */}
              <CollapsibleSection 
                title="Assessment Updates" 
                section="assessment" 
                icon={AlertTriangle}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="assessment"
                      checked={formData.assessment}
                      onCheckedChange={(checked) => handleChange('assessment', checked)}
                    />
                    <Label htmlFor="assessment">Site assessment required</Label>
                  </div>

                  {formData.assessment && (
                    <div className="ml-6 space-y-4 p-4 border border-border rounded-md bg-muted/30">
                      <div className="space-y-2">
                        <Label htmlFor="modality">Assessment Method *</Label>
                        <Select 
                          value={formData.modality} 
                          onValueChange={(value) => handleChange('modality', value)}
                        >
                          <SelectTrigger className={`${errors.modality ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}>
                            <SelectValue placeholder="Select assessment method..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local visit</SelectItem>
                            <SelectItem value="remote">Remote assessment</SelectItem>
                            <SelectItem value="phone">Phone consultation</SelectItem>
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
                              className={`pl-10 ${errors.fee ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}
                            />
                          </div>
                          {errors.fee && (
                            <p className="text-sm text-destructive">{errors.fee}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* Updated Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Updated Message</Label>
                <Textarea
                  id="message"
                  rows={isMobile ? 5 : 4}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Update your interest message or provide additional information..."
                  className={isMobile ? 'min-h-[120px]' : ''}
                />
              </div>

              {/* Updated Availability */}
              <CollapsibleSection 
                title="Updated Availability" 
                section="availability" 
                icon={Calendar}
              >
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                  <div className="space-y-2">
                    <Label htmlFor="earliest_start">Earliest Available</Label>
                    <Input
                      type="datetime-local"
                      id="earliest_start"
                      value={formData.earliest_start}
                      onChange={(e) => handleChange('earliest_start', e.target.value)}
                      min={minDateTime}
                      className={isMobile ? 'h-12' : ''}
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
                      className={isMobile ? 'h-12' : ''}
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Updated Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Updated Notes</Label>
                <Textarea
                  id="notes"
                  rows={isMobile ? 4 : 3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any updates to your approach or additional information..."
                  className={isMobile ? 'min-h-[100px]' : ''}
                />
              </div>
            </div>
          )}

          {/* Common Notes Section (for accept and quote actions) */}
          {(action === 'accept' || action === 'quote') && (
            <>
              <Separator />
              <CollapsibleSection 
                title="Additional Notes" 
                section="additional" 
                icon={MessageSquare}
              >
                <div className="space-y-2">
                  <Label htmlFor="professional_notes">
                    {action === 'quote' ? 'Additional Information' : 'Professional Notes'}
                  </Label>
                  <Textarea
                    id="professional_notes"
                    rows={isMobile ? 4 : 3}
                    value={formData.professional_notes}
                    onChange={(e) => handleChange('professional_notes', e.target.value)}
                    placeholder={
                      action === 'accept' 
                        ? "Any additional information for the customer..."
                        : "Additional details about your response..."
                    }
                    className={isMobile ? 'min-h-[100px]' : ''}
                  />
                </div>
              </CollapsibleSection>
            </>
          )}
        </CardContent>

        {/* Fixed Mobile Footer / Desktop Form Actions */}
        <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-50' : 'flex justify-between items-center p-6 bg-muted/30 border-t'}`}>
          <div className={`${isMobile ? 'flex gap-2 w-full' : 'flex justify-between items-center w-full'}`}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className={isMobile ? 'flex-1 h-12' : ''}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant={actionConfig.variant}
              disabled={loading}
              className={`gap-2 ${isMobile ? 'flex-1 h-12' : ''}`}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <ActionIcon className="h-4 w-4" />
              <span className={isMobile ? 'text-sm' : ''}>{actionConfig.submitText}</span>
            </Button>
          </div>
        </div>

        {/* Mobile bottom padding to prevent content being hidden behind fixed footer */}
        {isMobile && <div className="h-20" />}
      </form>
    </Card>
  );
}