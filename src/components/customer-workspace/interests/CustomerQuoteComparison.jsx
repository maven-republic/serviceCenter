// src/components/customer-workspace/interests/CustomerQuoteComparison.jsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertTriangle,
  DollarSign, 
  Clock, 
  Calendar,
  Shield,
  CheckCircle,
  X,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Info,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Percent
} from 'lucide-react';

const CustomerQuoteComparison = ({ 
  interest, 
  onApprove, 
  onDecline, 
  isLoading = false 
}) => {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const professional = interest?.professional;
  const account = professional?.account;

  // Extract original and updated values using single-word fields
  const originalAmount = interest.base || interest.amount;
  const updatedAmount = interest.amount;
  const originalDuration = interest.hours || interest.estimated_duration_hours;
  const updatedDuration = interest.estimated_duration_hours;

  if (!professional || !account) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load professional information for quote comparison.
        </AlertDescription>
      </Alert>
    );
  }

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const result = await onApprove(interest.interest_id, customerNotes);
      if (result.success) {
        setShowApprovalDialog(false);
        setCustomerNotes('');
      }
    } catch (error) {
      console.error('Error approving quote:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      const result = await onDecline(interest.interest_id, customerNotes);
      if (result.success) {
        setShowDeclineDialog(false);
        setCustomerNotes('');
      }
    } catch (error) {
      console.error('Error declining quote:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculatePriceChange = () => {
    if (!originalAmount || !updatedAmount) return null;
    
    const difference = updatedAmount - originalAmount;
    const percentage = ((difference / originalAmount) * 100).toFixed(1);
    
    return {
      difference,
      percentage: Math.abs(percentage),
      isIncrease: difference > 0,
      isDecrease: difference < 0,
      noChange: difference === 0
    };
  };

  const calculateDurationChange = () => {
    if (!originalDuration || !updatedDuration) return null;
    
    const difference = updatedDuration - originalDuration;
    const percentage = ((difference / originalDuration) * 100).toFixed(1);
    
    return {
      difference,
      percentage: Math.abs(percentage),
      isIncrease: difference > 0,
      isDecrease: difference < 0,
      noChange: difference === 0
    };
  };

  const priceChange = calculatePriceChange();
  const durationChange = calculateDurationChange();

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className="bg-orange-50 border-orange-300">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>Quote Updated - Your Approval Required</strong>
              <p className="text-sm mt-1">
                {professional.business_name || `${account.first_name} ${account.last_name}`} has updated their quote and needs your approval to proceed.
              </p>
            </div>
            <Badge className="bg-orange-100 text-orange-800 border-orange-300">
              Action Required
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Main Comparison Card */}
      <Card className="border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={account.profile_picture_url} />
                  <AvatarFallback className="text-lg font-medium">
                    {`${account.first_name?.[0] || ''}${account.last_name?.[0] || ''}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {professional.verification_status === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold">
                    {professional.business_name || `${account.first_name} ${account.last_name}`}
                  </h2>
                  {professional.verification_status === 'verified' && (
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">Updated Quote Comparison</p>
              </div>
            </div>
            
            <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-lg px-3 py-1">
              Updated Quote
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quote Comparison Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Quote */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h3 className="font-semibold text-gray-700">Original Quote</h3>
              </div>
              
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {originalAmount ? formatCurrency(originalAmount) : 'Not specified'}
                    </div>
                    <p className="text-sm text-gray-600">Original Price</p>
                  </div>
                  
                  {originalDuration && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{originalDuration} hours estimated</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Updated Quote */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold text-orange-700">Updated Quote</h3>
              </div>
              
              <Card className="bg-orange-50 border-orange-200 ring-2 ring-orange-300">
                <CardContent className="p-4 space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-700">
                      {updatedAmount ? formatCurrency(updatedAmount) : 'Not specified'}
                    </div>
                    <p className="text-sm text-orange-600">New Price</p>
                  </div>
                  
                  {updatedDuration && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span>{updatedDuration} hours estimated</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Change Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
              <ArrowRight className="h-4 w-4" />
              <span>Summary of Changes</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Change */}
              {priceChange && !priceChange.noChange && (
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    priceChange.isIncrease 
                      ? 'bg-red-100' 
                      : 'bg-green-100'
                  }`}>
                    {priceChange.isIncrease ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  
                  <div>
                    <div className={`font-semibold ${
                      priceChange.isIncrease ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {priceChange.isIncrease ? '+' : ''}{formatCurrency(priceChange.difference)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {priceChange.percentage}% {priceChange.isIncrease ? 'increase' : 'decrease'}
                    </div>
                  </div>
                </div>
              )}

              {/* Duration Change */}
              {durationChange && !durationChange.noChange && (
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    durationChange.isIncrease 
                      ? 'bg-yellow-100' 
                      : 'bg-blue-100'
                  }`}>
                    <Clock className={`h-4 w-4 ${
                      durationChange.isIncrease ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-700">
                      {durationChange.isIncrease ? '+' : ''}{durationChange.difference} hours
                    </div>
                    <div className="text-sm text-blue-600">
                      {durationChange.percentage}% {durationChange.isIncrease ? 'longer' : 'shorter'}
                    </div>
                  </div>
                </div>
              )}

              {/* No Changes */}
              {priceChange?.noChange && durationChange?.noChange && (
                <div className="col-span-2 text-center text-gray-600">
                  <Info className="h-5 w-5 mx-auto mb-2" />
                  <p>Price and duration remain the same. Other project details may have been updated.</p>
                </div>
              )}
            </div>
          </div>

          {/* Professional's Update Message */}
          {interest.message && (
            <div className="bg-blue-50 border-l-4 border-blue-300 p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Why This Changed</span>
              </h4>
              <p className="text-blue-700">{interest.message}</p>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Message Professional</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeclineDialog(true)}
                disabled={isLoading || actionLoading}
                className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                <ThumbsDown className="h-4 w-4" />
                <span>Decline Changes</span>
              </Button>
              
              <Button
                onClick={() => setShowApprovalDialog(true)}
                disabled={isLoading || actionLoading}
                className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Approve Updated Quote</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Approve Updated Quote</span>
            </DialogTitle>
            <DialogDescription>
              You're about to approve the updated quote from {professional.business_name || `${account.first_name} ${account.last_name}`}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700">New Price:</span>
                  <p className="text-lg font-bold text-green-800">{formatCurrency(updatedAmount)}</p>
                </div>
                {updatedDuration && (
                  <div>
                    <span className="font-medium text-green-700">Duration:</span>
                    <p className="text-lg font-bold text-green-800">{updatedDuration} hours</p>
                  </div>
                )}
              </div>
              
              {priceChange && !priceChange.noChange && (
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="text-sm text-green-700">
                    This is a <strong>{formatCurrency(Math.abs(priceChange.difference))}</strong> {priceChange.isIncrease ? 'increase' : 'decrease'} 
                    ({priceChange.percentage}%) from the original quote.
                  </p>
                </div>
              )}
            </div>

            {/* Optional Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Additional Notes (Optional)
              </label>
              <Textarea
                placeholder="Any additional comments or requirements..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                By approving this quote, you confirm the project details and the professional will be assigned to your appointment.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? 'Approving...' : 'Approve Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-600" />
              <span>Decline Updated Quote</span>
            </DialogTitle>
            <DialogDescription>
              You're about to decline the updated quote. The professional will need to provide a new response.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Declining this quote will return the interest to a "quoted" status, and the professional may submit a new response.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reason for Declining (Optional)
              </label>
              <Textarea
                placeholder="Let the professional know why you're declining this update..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeclineDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDecline}
              disabled={actionLoading}
            >
              {actionLoading ? 'Declining...' : 'Decline Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerQuoteComparison;