// src/components/professional-workspace/interests/forms/QuoteUpdate.jsx
"use client";

import { useState, useCallback } from 'react';
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
  Loader2
} from 'lucide-react';

const QuoteUpdateForm = ({
  interest,
  responseMessage,
  setResponseMessage,
  onSubmit,
  loading = false
}) => {
  const [quoteData, setQuoteData] = useState({
    amount: interest?.amount || '',
    duration_hours: interest?.estimated_duration_hours || '',
    update_reason: '',
    scope_changes: '',
    timeline_changes: ''
  });

  const [errors, setErrors] = useState({});

  // Calculate changes from original
  const originalAmount = interest?.amount || 0;
  const newAmount = parseFloat(quoteData.amount) || 0;
  const changeAmount = newAmount - originalAmount;
  const changePercent = originalAmount > 0 ? (changeAmount / originalAmount) * 100 : 0;
  const hasSignificantChange = Math.abs(changePercent) > 20;

  const handleQuoteChange = useCallback((field, value) => {
    setQuoteData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Amount validation
    if (!quoteData.amount || isNaN(quoteData.amount) || quoteData.amount <= 0) {
      newErrors.amount = 'Please provide a valid quote amount';
    }

    // Require justification for significant changes
    if (hasSignificantChange && !quoteData.update_reason.trim()) {
      newErrors.update_reason = 'Please explain why the quote has changed significantly';
    }

    // Duration validation
    if (quoteData.duration_hours && (isNaN(quoteData.duration_hours) || quoteData.duration_hours <= 0)) {
      newErrors.duration_hours = 'Duration must be a positive number';
    }

    // Prevent extreme increases
    if (changePercent > 50) {
      newErrors.amount = 'Quote increases over 50% are not permitted. Please contact customer directly.';
    }

    // Require message
    if (!responseMessage.trim()) {
      newErrors.responseMessage = 'Please provide a message to the customer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [quoteData, hasSignificantChange, changePercent, responseMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submissionData = {
      updated_quote: {
        amount: parseFloat(quoteData.amount),
        duration_hours: parseFloat(quoteData.duration_hours) || null,
        scope_changes: quoteData.scope_changes.trim() || null,
        timeline_changes: quoteData.timeline_changes.trim() || null
      },
      quote_update_reason: quoteData.update_reason.trim(),
      response_message: responseMessage.trim()
    };

    await onSubmit(submissionData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Current Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Quote Summary</CardTitle>
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
        </CardContent>
      </Card>

      {/* Updated Quote */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Updated Quote</span>
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
                value={quoteData.amount}
                onChange={(e) => handleQuoteChange('amount', e.target.value)}
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
                  {changeAmount > 0 ? '+' : ''}{formatCurrency(changeAmount)} 
                  ({changePercent.toFixed(1)}% {changeAmount > 0 ? 'increase' : 'decrease'})
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
                value={quoteData.duration_hours}
                onChange={(e) => handleQuoteChange('duration_hours', e.target.value)}
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
            Please provide a detailed explanation below.
          </AlertDescription>
        </Alert>
      )}

      {/* Update Justification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Explain Your Changes {hasSignificantChange && <span className="text-red-500">*</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Main Reason */}
          <div className="space-y-2">
            <Label htmlFor="update_reason">
              Main Reason for Quote Update {hasSignificantChange && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="update_reason"
              rows={3}
              value={quoteData.update_reason}
              onChange={(e) => handleQuoteChange('update_reason', e.target.value)}
              placeholder="e.g., Based on customer requirements, additional materials needed, timeline constraints..."
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
              value={quoteData.scope_changes}
              onChange={(e) => handleQuoteChange('scope_changes', e.target.value)}
              placeholder="Describe any changes to the project scope..."
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
              value={quoteData.timeline_changes}
              onChange={(e) => handleQuoteChange('timeline_changes', e.target.value)}
              placeholder="Describe any changes to the project timeline..."
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
              placeholder="Hi! I've reviewed the project details and need to update my quote. Here's what has changed and why..."
              className={errors.responseMessage ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.responseMessage && (
              <p className="text-sm text-destructive">{errors.responseMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Rules Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Quote Update Policy:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>• Quote increases over 20% require detailed justification</li>
            <li>• Quote increases over 50% are not permitted</li>
            <li>• Customer must approve all quote changes before proceeding</li>
            <li>• You can update your quote once after customer selection</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending Update...
            </>
          ) : (
            'Send Updated Quote'
          )}
        </Button>
      </div>
    </form>
  );
};

export default QuoteUpdateForm;