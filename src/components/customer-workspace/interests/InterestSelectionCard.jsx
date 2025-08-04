// Enhanced InterestSelectionCard.jsx - Now supports price ranges and quote updates
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
  CheckCircle
} from 'lucide-react';

const InterestSelectionCard = ({ 
  interest, 
  onSelect, 
  onReject, 
  onMessage, 
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
      interested: { variant: 'secondary', label: 'Interested' },
      quoted: { variant: 'default', label: 'Quoted' },
      selected: { variant: 'default', label: '✅ Selected', className: 'bg-green-100 text-green-800' },
      updated_quote: { 
        variant: 'destructive', 
        label: '⚠️ Quote Updated', 
        className: 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse' 
      },
      confirmed: { 
        variant: 'default', 
        label: '✅ Confirmed', 
        className: 'bg-green-100 text-green-800' 
      },
      rejected: { variant: 'destructive', label: 'Rejected' },
      withdrawn: { variant: 'outline', label: 'Withdrawn' },
      declined_by_professional: { variant: 'outline', label: 'Declined' }
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    
    return (
      <Badge 
        variant={config.variant} 
        className={config.className}
      >
        {config.label}
      </Badge>
    );
  };

  const getPricingSection = () => {
    // Helper function to determine if assessment is needed
    const hasAssessment = interest.assessment === true || 
                         interest.modality || 
                         interest.fee > 0 || 
                         interest.assessment_justification || 
                         interest.price_range_min || 
                         interest.price_range_max;

    // ✅ NEW: Handle quote update status
    if (interest.status === 'updated_quote') {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-800">Quote Updated - Approval Required</h4>
                <p className="text-sm text-orange-700">Professional has updated their quote and needs your approval</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-orange-700">
                {formatCurrency(interest.amount)}
              </div>
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                Updated Quote
              </Badge>
            </div>
          </div>
          
          {interest.estimated_duration_hours && (
            <div className="text-sm text-orange-600 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Estimated Duration: {interest.estimated_duration_hours} hours
            </div>
          )}

          <Alert className="bg-orange-100 border-orange-300">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-sm">
              <strong>Action Required:</strong> This quote has been updated and requires your approval before proceeding.
              Please review the changes in the detailed comparison view.
            </AlertDescription>
          </Alert>
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

  // ✅ NEW: Determine if actions should be disabled for quote updates
  const isQuoteUpdatePending = interest.status === 'updated_quote';
  const isConfirmedOrCompleted = ['confirmed', 'completed'].includes(interest.status);

  return (
    <Card className={`transition-all hover:shadow-md ${
      interest.selected_by_customer ? 'ring-2 ring-green-300' : ''
    } ${
      isQuoteUpdatePending ? 'ring-2 ring-orange-300 bg-orange-50/30' : ''
    } ${className}`}>
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
        {/* ✅ NEW: Quote update alert */}
        {isQuoteUpdatePending && (
          <Alert className="bg-orange-100 border-orange-300">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Quote Update Pending:</strong> This professional has updated their quote. 
              Please review the changes in the detailed comparison view above before making a decision.
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
        {showActions && !interest.selected_by_customer && !isConfirmedOrCompleted && (
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
            
            {/* ✅ NEW: Conditional action buttons based on status */}
            {!isQuoteUpdatePending ? (
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
            ) : (
              <Alert className="bg-orange-100 border-orange-300 flex-1 max-w-md">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-sm">
                  Please review the updated quote above before taking action.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Selected Professional Message */}
        {interest.selected_by_customer && !isQuoteUpdatePending && (
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
      </CardContent>
    </Card>
  );
};

export default InterestSelectionCard;