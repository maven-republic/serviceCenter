// Minimalist InterestSelectionCard.jsx - Clean design with rounded edges, thin borders, no shadows
"use client";

import { useState } from 'react';
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
  Phone
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
      <div className={`border border-gray-200 rounded-lg bg-white opacity-50 ${className}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Professional information unavailable</span>
          </div>
        </div>
      </div>
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      interested: { label: 'Interested', className: 'text-blue-600 border-blue-200 bg-blue-50' },
      quoted: { label: 'Quoted', className: 'text-green-600 border-green-200 bg-green-50' },
      selected: { label: '✅ Selected', className: 'text-green-700 border-green-300 bg-green-100' },
      rejected: { label: 'Rejected', className: 'text-red-600 border-red-200 bg-red-50' },
      withdrawn: { label: 'Withdrawn', className: 'text-gray-600 border-gray-200 bg-gray-50' }
    };

    const config = statusConfig[status] || { label: status, className: 'text-gray-600 border-gray-200 bg-gray-50' };
    
    return (
      <div className={`text-xs font-medium px-2 py-1 border rounded-md ${config.className}`}>
        {config.label}
      </div>
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

    // Scenario 1: Exact quote provided (no assessment needed)
    if (interest.amount && !hasAssessment) {
      return (
        <div className="border-l-2 border-green-500 pl-4 bg-green-50/30 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Fixed Quote</div>
                <p className="text-xs text-green-700">Ready to proceed immediately</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-light text-green-700">
                {formatCurrency(interest.amount)}
              </div>
              <div className="text-xs text-green-600 font-medium px-2 py-1 border border-green-200 bg-green-100 rounded-md">
                Final Price
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Scenario 2: Assessment required with preliminary quote
    if (hasAssessment && interest.amount) {
      return (
        <div className="border-l-2 border-blue-500 pl-4 bg-blue-50/30 rounded-r-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Preliminary Quote + Assessment</div>
                <p className="text-xs text-blue-700">Site visit required for final pricing</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-light text-blue-700">
                {formatCurrency(interest.amount)}
              </div>
              <div className="text-xs text-blue-600 font-medium px-2 py-1 border border-blue-200 bg-blue-100 rounded-md">
                Preliminary
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-blue-600 font-medium">Assessment:</span>
              <p className="text-gray-700">{interest.modality || 'Site visit'}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Assessment Fee:</span>
              <p className="text-gray-700">{interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}</p>
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
        <div className="border-l-2 border-amber-500 pl-4 bg-amber-50/30 rounded-r-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Price Range + Assessment Required</div>
                <p className="text-xs text-amber-700">Site assessment needed before final quote</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-light text-amber-700">
                {formatCurrency(interest.price_range_min)} - {formatCurrency(interest.price_range_max)}
              </div>
              <div className="text-xs text-amber-600 font-medium px-2 py-1 border border-amber-200 bg-amber-100 rounded-md">
                Estimated Range
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <span className="text-amber-600 font-medium">Assessment:</span>
              <p className="text-gray-700">{interest.modality || 'Site visit'}</p>
            </div>
            <div>
              <span className="text-amber-600 font-medium">Assessment Fee:</span>
              <p className="text-gray-700">{interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}</p>
            </div>
          </div>

          {/* Assessment Justification */}
          {interest.assessment_justification && (
            <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <span className="font-medium">Why assessment is needed:</span> {interest.assessment_justification}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Scenario 4: Assessment only (no pricing info yet)
    if (hasAssessment && !interest.amount && !interest.price_range_min) {
      return (
        <div className="border-l-2 border-orange-500 pl-4 bg-orange-50/30 rounded-r-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Assessment Required</div>
              <p className="text-xs text-orange-700">Quote will be provided after site visit</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs mt-3">
            <div>
              <span className="text-orange-600 font-medium">Assessment:</span>
              <p className="text-gray-700">{interest.modality || 'Site visit'}</p>
            </div>
            <div>
              <span className="text-orange-600 font-medium">Fee:</span>
              <p className="text-gray-700">{interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}</p>
            </div>
          </div>
        </div>
      );
    }

    // Scenario 5: Quote pending
    return (
      <div className="border-l-2 border-gray-300 pl-4 bg-gray-50/30 rounded-r-lg">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Quote Pending</div>
            <p className="text-xs text-gray-700">Professional is preparing your quote</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`border border-gray-200 rounded-lg bg-white transition-all duration-200 hover:border-gray-300 ${interest.selected_by_customer ? 'ring-1 ring-green-300' : ''} ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                {account.profile_picture_url ? (
                  <img 
                    src={account.profile_picture_url} 
                    alt={`${account.first_name} ${account.last_name}`}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {`${account.first_name?.[0] || ''}${account.last_name?.[0] || ''}`.toUpperCase()}
                  </span>
                )}
              </div>
              
              {professional.verification_status === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">
                  {professional.business_name || `${account.first_name} ${account.last_name}`}
                </h3>
                {professional.verification_status === 'verified' && (
                  <div className="text-xs text-green-600 font-medium px-2 py-1 border border-green-200 bg-green-50 rounded-md">
                    Verified
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
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
            
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-md transition-colors"
            >
              <Eye className="h-3 w-3 mr-1 inline" />
              {showFullDetails ? 'Less' : 'Details'}
            </button>
          </div>
        </div>

        {/* Pricing Section - The main enhancement */}
        <div className="mt-4">
          {getPricingSection()}
        </div>

        {/* Professional's Message */}
        {interest.message && (
          <div className="mt-4 p-3 bg-gray-50 border-l-2 border-gray-200 rounded-r-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Professional's Message</div>
            <p className="text-sm text-gray-700">{interest.message}</p>
          </div>
        )}

        {/* Expanded Details */}
        {showFullDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-xs">
              {professional.hourly_rate && (
                <div>
                  <span className="text-gray-500 uppercase tracking-wide font-medium">Hourly Rate</span>
                  <p className="mt-1 text-gray-700">{formatCurrency(professional.hourly_rate, professional.rate_currency)}/hr</p>
                </div>
              )}
              
              {professional.service_radius && (
                <div>
                  <span className="text-gray-500 uppercase tracking-wide font-medium">Service Area</span>
                  <p className="mt-1 text-gray-700">{professional.service_radius} mile radius</p>
                </div>
              )}
              
              <div>
                <span className="text-gray-500 uppercase tracking-wide font-medium">Interest Level</span>
                <div className="mt-1 text-xs text-gray-600 font-medium px-2 py-1 border border-gray-200 bg-gray-50 rounded-md inline-block">
                  {interest.intent}
                </div>
              </div>
              
              <div>
                <span className="text-gray-500 uppercase tracking-wide font-medium">Response Time</span>
                <p className="mt-1 text-gray-700">{new Date(interest.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {professional.bio && (
              <div className="mt-4">
                <span className="text-gray-500 uppercase tracking-wide font-medium text-xs">About</span>
                <p className="text-sm mt-1 text-gray-700">{professional.bio}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 border-t border-gray-100"></div>

        {/* Action Buttons */}
        {showActions && !interest.selected_by_customer && (
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onMessage(interest)}
                className="flex items-center space-x-1 px-3 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md transition-colors"
              >
                <MessageCircle className="h-3 w-3" />
                <span>Message</span>
              </button>
              
              <button className="flex items-center space-x-1 px-3 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md transition-colors">
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {!showConfirmReject ? (
                <button
                  onClick={() => setShowConfirmReject(true)}
                  disabled={isLoading || actionLoading}
                  className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  <X className="h-3 w-3 mr-1 inline" />
                  Reject
                </button>
              ) : (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setShowConfirmReject(false)}
                    className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-3 py-2 text-xs text-white bg-red-600 hover:bg-red-700 border border-red-600 rounded-md transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Rejecting...' : 'Confirm'}
                  </button>
                </div>
              )}
              
              {!showConfirmSelect ? (
                <button
                  onClick={() => setShowConfirmSelect(true)}
                  disabled={isLoading || actionLoading}
                  className="px-4 py-2 text-xs bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                >
                  <Check className="h-3 w-3 mr-1 inline" />
                  Select Professional
                </button>
              ) : (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setShowConfirmSelect(false)}
                    className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSelect}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Selecting...' : 'Confirm Selection'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Professional Message */}
        {interest.selected_by_customer && (
          <div className="mt-4 bg-green-50/50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <span className="font-medium">✅ Professional Selected!</span>
                {interest.assessment ? ' Next step: Schedule your assessment.' : ' You can now proceed with this project.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestSelectionCard;