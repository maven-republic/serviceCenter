// src/components/professional-workspace/interests/forms/QuoteUpdate.jsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  Loader2,
  CheckCircle,
  Send
} from 'lucide-react';

const QuoteUpdate = ({
  interest,
  responseMessage,
  setResponseMessage,
  onSubmit,
  loading = false
}) => {
  // 🔧 FIXED: Proper form state management
  const [formData, setFormData] = useState({
    amount: interest?.amount || '',
    duration_hours: interest?.estimated_duration_hours || '',
    update_reason: '',
    scope_changes: '',
    timeline_changes: ''
  });

  const [errors, setErrors] = useState({});

  // Initialize form with current interest data
  useEffect(() => {
    if (interest) {
      setFormData({
        amount: interest.amount || '',
        duration_hours: interest.estimated_duration_hours || '',
        update_reason: '',
        scope_changes: '',
        timeline_changes: ''
      });
    }
  }, [interest]);

  // Calculate changes from original
  const originalAmount = parseFloat(interest?.amount) || 0;
  const newAmount = parseFloat(formData.amount) || 0;
  const changeAmount = newAmount - originalAmount;
  const changePercent = originalAmount > 0 ? (changeAmount / originalAmount) * 100 : 0;
  const hasSignificantChange = Math.abs(changePercent) > 20;

  // Handle field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Amount validation
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      newErrors.amount = 'Please provide a valid quote amount';
    }

    // Check for extreme increases
    if (changePercent > 50) {
      newErrors.amount = 'Quote increases over 50% require customer contact. Please reach out directly.';
    }

    // Require justification for significant changes
    if (hasSignificantChange && !formData.update_reason.trim()) {
      newErrors.update_reason = 'Please explain why the quote has changed significantly (>20%)';
    }

    // Duration validation
    if (formData.duration_hours && (isNaN(formData.duration_hours) || formData.duration_hours <= 0)) {
      newErrors.duration_hours = 'Duration must be a positive number';
    }

    // Message validation
    if (!responseMessage?.trim()) {
      newErrors.responseMessage = 'Please provide a message to the customer';
    }

    // Require some justification for any update
    if (!formData.update_reason.trim() && !formData.scope_changes.trim() && !formData.timeline_changes.trim()) {
      newErrors.update_reason = 'Please provide at least one reason for the quote update';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, hasSignificantChange, changePercent, responseMessage]);

  // 🔧 FIXED: Proper form submission with correct data format
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 QuoteUpdate form submitting...');
    console.log('🔍 Current form data:', formData);
    console.log('🔍 Response message:', responseMessage);
    console.log('🔍 Interest:', interest);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed:', errors);
      return;
    }

    // 🔥 CRITICAL FIX: Format data exactly as API expects
    const submissionData = {
      updated_quote: {
        amount: parseFloat(formData.amount),
        duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null,
        scope_changes: formData.scope_changes.trim() || null,
        timeline_changes: formData.timeline_changes.trim() || null
      },
      quote_update_reason: formData.update_reason.trim(),
      response_message: responseMessage.trim()
    };

    console.log('📤 Calling onSubmit with properly formatted data:', submissionData);
    
    try {
      // This calls handleUpdateQuote from useProfessionalResponseHandlers.js
      await onSubmit(submissionData);
    } catch (error) {
      console.error('❌ Form submission error:', error);
    }
  };

  // Format currency display
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      
      {/* Current Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Current Quote Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Current Amount:</span>
              <p className="text-lg font-semibold">{formatCurrency(originalAmount)}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Current Duration:</span>
              <p>{interest?.estimated_duration_hours || 'Not specified'} hours</p>
            </div>
          </div>
          
          {interest?.message && (
            <div className="pt-2 border-t">
              <span className="font-medium text-muted-foreground text-sm">Original Message:</span>
              <p className="text-sm bg-muted/30 p-2 rounded-md mt-1 italic">
                "{interest.message}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Update Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Updated Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Updated Quote Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Updated Amount (USD) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleFieldChange('amount', e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`pl-10 ${errors.amount ? 'border-destructive' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}

              {/* Change Indicator */}
              {newAmount > 0 && changeAmount !== 0 && (
                <div className={`flex items-center space-x-2 text-sm ${
                  changeAmount > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {changeAmount > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {changeAmount > 0 ? '+' : ''}{formatCurrency(Math.abs(changeAmount))} 
                    ({Math.abs(changePercent).toFixed(1)}% {changeAmount > 0 ? 'increase' : 'decrease'})
                  </span>
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">
                Updated Duration (Hours)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  id="duration"
                  value={formData.duration_hours}
                  onChange={(e) => handleFieldChange('duration_hours', e.target.value)}
                  min="0"
                  step="0.5"
                  placeholder="0.0"
                  className={`pl-10 ${errors.duration_hours ? 'border-destructive' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.duration_hours && (
                <p className="text-sm text-destructive">{errors.duration_hours}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Significant Change Warning */}
        {hasSignificantChange && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Significant Change Detected:</strong> Your quote has changed by {Math.abs(changePercent).toFixed(1)}%. 
              Please provide a detailed explanation below to help the customer understand.
            </AlertDescription>
          </Alert>
        )}

        {/* Update Justification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Explain Your Updates {hasSignificantChange && <span className="text-red-500">*</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Main Reason */}
            <div className="space-y-2">
              <Label htmlFor="update_reason">
                Primary Reason for Quote Update {hasSignificantChange && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="update_reason"
                rows={3}
                value={formData.update_reason}
                onChange={(e) => handleFieldChange('update_reason', e.target.value)}
                placeholder="e.g., After reviewing customer requirements in detail, additional materials and time are needed..."
                className={errors.update_reason ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.update_reason && (
                <p className="text-sm text-destructive">{errors.update_reason}</p>
              )}
            </div>

            {/* Scope Changes */}
            <div className="space-y-2">
              <Label htmlFor="scope_changes">
                Scope Changes (Optional)
              </Label>
              <Textarea
                id="scope_changes"
                rows={2}
                value={formData.scope_changes}
                onChange={(e) => handleFieldChange('scope_changes', e.target.value)}
                placeholder="Describe any changes to what's included in the project..."
                disabled={loading}
              />
            </div>

            {/* Timeline Changes */}
            <div className="space-y-2">
              <Label htmlFor="timeline_changes">
                Timeline Changes (Optional)
              </Label>
              <Textarea
                id="timeline_changes"
                rows={2}
                value={formData.timeline_changes}
                onChange={(e) => handleFieldChange('timeline_changes', e.target.value)}
                placeholder="Describe any changes to the project timeline or schedule..."
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Message to Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message to Customer *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">
                Explain the update to your customer
              </Label>
              <Textarea
                id="message"
                rows={4}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Hi! I've carefully reviewed your project details and need to update my quote. Here's what has changed and why..."
                className={errors.responseMessage ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.responseMessage && (
                <p className="text-sm text-destructive">{errors.responseMessage}</p>
              )}
              <p className="text-xs text-muted-foreground">
                💡 Tip: Be transparent about changes and focus on the value you'll provide
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Rules Info */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Quote Update Policy:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Quote increases over 20% require detailed justification</li>
              <li>• Quote increases over 50% should be discussed directly with customer</li>
              <li>• Customer must approve all quote changes before project proceeds</li>
              <li>• You can update your quote once after customer selection</li>
              <li>• Be honest and transparent about reasons for changes</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[200px] bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Update...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Updated Quote
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuoteUpdate;