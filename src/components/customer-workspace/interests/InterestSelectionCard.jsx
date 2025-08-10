// Enhanced InterestSelectionCard.jsx - Now supports quote update approval flow
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Award,
  MessageCircle,
  Check,
  X,
  AlertCircle,
  Shield,
  Calendar,
  TrendingUp,
  Info,
  Eye,
  Phone,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  History,
  Zap,
  FileText
} from 'lucide-react';

const InterestSelectionCard = ({ 
  interest, 
  onSelect, 
  onReject, 
  onMessage, 
  onViewQuoteComparison, // NEW: Function to show quote comparison
  isLoading = false,
  showActions = true,
  className = ""
}) => {
  const [showConfirmSelect, setShowConfirmSelect] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const professional = interest?.professional;
  const account = professional?.account;

  if (!professional || !account) {
    return (
      <Card className={`opacity-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Professional information unavailable</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSelect = async () => {
    setActionLoading(true);
    const result = await onSelect(interest.interest_id);
    if (result.success) {
      setShowConfirmSelect(false);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    const result = await onReject(interest.interest_id, 'Not the right fit');
    if (result.success) {
      setShowConfirmReject(false);
    }
    setActionLoading(false);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // ✅ ENHANCED: Updated status badge with new quote update statuses
  const getStatusBadge = (status) => {
    const statusConfig = {
      interested: { 
        variant: 'secondary', 
        label: 'Interested',
        className: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      quoted: { 
        variant: 'default', 
        label: 'Quoted',
        className: 'bg-purple-100 text-purple-800 border-purple-300'
      },
      selected: { 
        variant: 'default', 
        label: '✅ Selected', 
        className: 'bg-green-100 text-green-800 border-green-300'
      },
      // 🔥 NEW: Updated status for quote changes
      updated: { 
        variant: 'destructive', 
        label: '⚠️ Quote Updated', 
        className: 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse',
        icon: RefreshCw
      },
      confirmed: { 
        variant: 'default', 
        label: '🎉 Confirmed', 
        className: 'bg-green-100 text-green-800 border-green-300'
      },
      rejected: { 
        variant: 'destructive', 
        label: 'Not Selected',
        className: 'bg-red-100 text-red-800 border-red-300'
      },
      withdrawn: { 
        variant: 'outline', 
        label: 'Withdrawn',
        className: 'bg-gray-100 text-gray-600 border-gray-300'
      },
      declined_by_professional: { 
        variant: 'outline', 
        label: 'Declined',
        className: 'bg-gray-100 text-gray-600 border-gray-300'
      }
    };

    const config = statusConfig[status] || { 
      variant: 'secondary', 
      label: status,
      className: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    const StatusIcon = config.icon;
    
    return (
      <Badge 
        variant={config.variant} 
        className={`${config.className} flex items-center space-x-1`}
      >
        {StatusIcon && <StatusIcon className="h-3 w-3" />}
        <span>{config.label}</span>
      </Badge>
    );
  };

  // 🔥 ENHANCED: Pricing section with quote update handling
  const getPricingSection = () => {
    // Helper function to determine if assessment is needed
    const hasAssessment = interest.assessment === true || 
                         interest.modality || 
                         interest.fee > 0 || 
                         interest.assessment_justification || 
                         interest.price_range_min || 
                         interest.price_range_max;

    // 🔥 NEW: Handle updated quote status - HIGHEST PRIORITY
    if (interest.status === 'updated') {
      const originalAmount = interest.original_amount || 0;
      const newAmount = interest.amount || 0;
      const changeAmount = newAmount - originalAmount;
      const changePercent = originalAmount > 0 ? ((changeAmount / originalAmount) * 100) : 0;

      return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 relative overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-orange-50/50 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-orange-200 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-orange-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800 flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Quote Updated - Your Approval Required</span>
                  </h4>
                  <p className="text-sm text-orange-700">Professional has updated their quote and needs your approval</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-orange-700">
                  {formatCurrency(newAmount)}
                </div>
                <Badge className="bg-orange-200 text-orange-800 border-orange-300 mt-1">
                  <Zap className="h-3 w-3 mr-1" />
                  Needs Review
                </Badge>
              </div>
            </div>
            
            {/* Change indicator */}
            {originalAmount > 0 && changeAmount !== 0 && (
              <div className="bg-white/80 border border-orange-200 rounded p-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-700">Price Change:</span>
                  <div className={`flex items-center space-x-1 font-semibold ${
                    changeAmount > 0 ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {changeAmount > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>
                      {changeAmount > 0 ? '+' : ''}{formatCurrency(changeAmount)} 
                      ({Math.abs(changePercent).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Duration info */}
            {interest.estimated_duration_hours && (
              <div className="text-sm text-orange-600 mb-3 flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Duration: {interest.estimated_duration_hours} hours</span>
              </div>
            )}

            {/* Update reason */}
            {interest.update_justification && (
              <div className="bg-white/80 border border-orange-200 rounded p-3 mb-3">
                <h5 className="font-medium text-orange-700 mb-1 flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Reason for Update:</span>
                </h5>
                <p className="text-sm text-orange-600">{interest.update_justification}</p>
              </div>
            )}

            {/* Action prompt */}
            <Alert className="bg-orange-100 border-orange-300">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                <strong>Action Required:</strong> Please review the updated quote details. 
                Click "View Quote Comparison" below to see the full comparison and approve/decline the changes.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    // ✅ NEW: Handle confirmed status
    if (interest.status === 'confirmed') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Project Confirmed</h4>
                <p className="text-sm text-green-700">Quote approved and professional assigned</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(interest.amount)}
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Final Price
              </Badge>
            </div>
          </div>
        </div>
      );
    }

    // Scenario 1: Exact quote provided (no assessment needed)
    if (interest.amount && !hasAssessment) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Fixed Quote</h4>
                <p className="text-sm text-green-700">Ready to proceed immediately</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(interest.amount)}
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Final Price
              </Badge>
            </div>
          </div>
        </div>
      );
    }

    // Scenario 2: Assessment required with preliminary quote
    if (hasAssessment && interest.amount) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-800">Preliminary Quote + Assessment</h4>
                <p className="text-sm text-blue-700">Site visit required for final pricing</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-700">
                {formatCurrency(interest.amount)}
              </div>
              <Badge variant="secondary">Preliminary</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Assessment:</span>
              <p className="capitalize">{interest.modality || 'Site visit'}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Assessment Fee:</span>
              <p>{interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}</p>
            </div>
          </div>
          
          {interest.fee > 0 && (
            <p className="text-xs text-blue-600 mt-2">
              💡 Assessment fee applied to final project cost
            </p>
          )}
        </div>
      );
    }

    // Scenario 3: Price range (assessment required, no preliminary quote)
    if (hasAssessment && interest.price_range_min && interest.price_range_max) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800">Price Range + Assessment Required</h4>
                <p className="text-sm text-amber-700">Site assessment needed before final quote</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-700">
                {formatCurrency(interest.price_range_min)} - {formatCurrency(interest.price_range_max)}
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                Estimated Range
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span className="text-amber-600 font-medium">Assessment:</span>
              <p className="capitalize">{interest.modality || 'Site visit'}</p>
            </div>
            <div>
              <span className="text-amber-600 font-medium">Assessment Fee:</span>
              <p>{interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}</p>
            </div>
          </div>

          {/* Assessment Justification */}
          {interest.assessment_justification && (
            <Alert className="bg-amber-100 border-amber-300">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Why assessment is needed:</strong> {interest.assessment_justification}
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    // Scenario 4: Assessment only (no pricing info yet)
    if (hasAssessment && !interest.amount && !interest.price_range_min) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <div>
              <h4 className="font-semibold text-orange-800">Assessment Required</h4>
              <p className="text-sm text-orange-700">Quote will be provided after site visit</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
            <div>
              <span className="text-orange-600 font-medium">Assessment:</span>
              <p className="capitalize">{interest.modality || 'Site visit'}</p>
            </div>
            <div>
              <span className="text-orange-600 font-medium">Fee:</span>
              <p>{interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}</p>
            </div>
          </div>
        </div>
      );
    }

    // Scenario 5: Quote pending
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <div>
            <h4 className="font-semibold text-gray-800">Quote Pending</h4>
            <p className="text-sm text-gray-700">Professional is preparing your quote</p>
          </div>
        </div>
      </div>
    );
  };

  // ✅ NEW: Determine card styling and interaction states
  const isQuoteUpdatePending = interest.status === 'updated';
  const isConfirmedOrCompleted = ['confirmed', 'completed'].includes(interest.status);
  const isInactive = ['rejected', 'withdrawn', 'declined_by_professional'].includes(interest.status);

  // 🔥 NEW: Get card border and background styling
  const getCardStyling = () => {
    if (isQuoteUpdatePending) {
      return 'ring-2 ring-orange-300 bg-orange-50/30 border-orange-200';
    }
    if (interest.selected_by_customer && !isQuoteUpdatePending) {
      return 'ring-2 ring-green-300 bg-green-50/30 border-green-200';
    }
    if (isInactive) {
      return 'opacity-60 bg-gray-50 border-gray-200';
    }
    return 'hover:shadow-md border-gray-200';
  };

  return (
    <Card className={`transition-all ${getCardStyling()} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={account.profile_picture_url} />
                <AvatarFallback className="text-sm font-medium">
                  {`${account.first_name?.[0] || ''}${account.last_name?.[0] || ''}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {professional.verification_status === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}

              {/* 🔥 NEW: Quote update indicator */}
              {isQuoteUpdatePending && (
                <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1 animate-pulse">
                  <RefreshCw className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">
                  {professional.business_name || `${account.first_name} ${account.last_name}`}
                </h3>
                {professional.verification_status === 'verified' && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {professional.rating_average > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{professional.rating_average.toFixed(1)}</span>
                    <span>({professional.rating_count} reviews)</span>
                  </div>
                )}
                
                {professional.experience && (
                  <div className="flex items-center space-x-1">
                    <Award className="h-3 w-3" />
                    <span>{professional.experience} years experience</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(interest.status)}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullDetails(!showFullDetails)}
            >
              <Eye className="h-3 w-3 mr-1" />
              {showFullDetails ? 'Less' : 'Details'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 🔥 NEW: Quote update priority alert */}
        {isQuoteUpdatePending && (
          <Alert className="bg-orange-100 border-orange-300 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Urgent:</strong> This professional has updated their quote and needs your immediate approval. 
              Assessment scheduling is blocked until you review the changes.
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Section - The main enhancement */}
        {getPricingSection()}

        {/* Professional's Message */}
        {interest.message && (
          <div className="bg-blue-50 border-l-4 border-blue-200 p-3">
            <h4 className="font-medium text-blue-800 mb-1">Professional's Message:</h4>
            <p className="text-sm text-blue-700">{interest.message}</p>
          </div>
        )}

        {/* 🔥 NEW: Quote update history indicator */}
        {interest.original_amount && interest.amount !== interest.original_amount && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <History className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-800">Quote History</h4>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-700">Original quote:</span>
                <span className="font-medium">{formatCurrency(interest.original_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Updated quote:</span>
                <span className="font-medium">{formatCurrency(interest.amount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {showFullDetails && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {professional.hourly_rate && (
                <div>
                  <span className="font-medium text-muted-foreground">Hourly Rate:</span>
                  <p>{formatCurrency(professional.hourly_rate, professional.rate_currency)}/hr</p>
                </div>
              )}
              
              {professional.service_radius && (
                <div>
                  <span className="font-medium text-muted-foreground">Service Area:</span>
                  <p>{professional.service_radius} mile radius</p>
                </div>
              )}
              
              <div>
                <span className="font-medium text-muted-foreground">Interest Level:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {interest.intent}
                </Badge>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Response Time:</span>
                <p>{new Date(interest.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {professional.bio && (
              <div>
                <span className="font-medium text-muted-foreground">About:</span>
                <p className="text-sm mt-1">{professional.bio}</p>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        {showActions && !isInactive && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessage(interest)}
                className="flex items-center space-x-1"
                disabled={isQuoteUpdatePending}
              >
                <MessageCircle className="h-3 w-3" />
                <span>Message</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                disabled={isQuoteUpdatePending}
              >
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </Button>
            </div>
            
            {/* 🔥 NEW: Conditional action buttons based on status */}
            {isQuoteUpdatePending ? (
              // Quote update pending - show review button
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onViewQuoteComparison?.(interest)}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Review Quote Changes</span>
                </Button>
              </div>
            ) : !interest.selected_by_customer && !isConfirmedOrCompleted ? (
              // Normal selection buttons
              <div className="flex items-center space-x-2">
                {!showConfirmReject ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmReject(true)}
                    disabled={isLoading || actionLoading}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfirmReject(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Rejecting...' : 'Confirm'}
                    </Button>
                  </div>
                )}
                
                {!showConfirmSelect ? (
                  <Button
                    size="sm"
                    onClick={() => setShowConfirmSelect(true)}
                    disabled={isLoading || actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Select Professional
                  </Button>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfirmSelect(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSelect}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading ? 'Selecting...' : 'Confirm Selection'}
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Selected Professional Message */}
        {interest.selected_by_customer && !isQuoteUpdatePending && !isConfirmedOrCompleted && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✅ Professional Selected!</strong> 
              {interest.assessment ? ' Next step: Schedule your assessment.' : ' You can now proceed with this project.'}
            </AlertDescription>
          </Alert>
        )}

        {/* ✅ NEW: Confirmed Project Message */}
        {isConfirmedOrCompleted && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🎉 Project Confirmed!</strong> Your quote has been approved and the professional is ready to begin work.
            </AlertDescription>
          </Alert>
        )}

        {/* ✅ NEW: Inactive status message */}
        {isInactive && (
          <Alert className="bg-gray-50 border-gray-200">
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-800">
              This interest is no longer active. 
              {interest.status === 'rejected' && 'You selected a different professional for this project.'}
              {interest.status === 'withdrawn' && 'The professional has withdrawn their interest.'}
              {interest.status === 'declined_by_professional' && 'The professional declined to work on this project.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default InterestSelectionCard;