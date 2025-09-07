import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Clock, 
  DollarSign, 
  Shield,
  MessageCircle,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const InterestSelectionCard = ({ 
  interest, 
  onSelect, 
  onReject, 
  onMessage, 
  onViewQuoteComparison,
  isLoading = false,
  showActions = true,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const professional = interest?.professional;
  const account = professional?.account;

  if (!professional || !account) {
    return (
      <Card className={`opacity-50 ${className}`}>
        <CardContent className="p-6 text-center text-gray-500">
          Professional information unavailable
        </CardContent>
      </Card>
    );
  }

  const handleSelect = async () => {
    setActionLoading(true);
    await onSelect?.(interest.interest_id);
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    await onReject?.(interest.interest_id, 'Not the right fit');
    setActionLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPricingTags = () => {
    const tags = [];
    
    // Assessment tags
    if (interest.assessment) {
      if (interest.fee > 0) {
        tags.push({ text: `Assessment ${formatCurrency(interest.fee)}`, type: 'assessment' });
      } else {
        tags.push({ text: 'Free Assessment', type: 'assessment' });
      }
    }
    
    // Quote type tags
    if (interest.status === 'updated') {
      tags.push({ text: 'Quote Changed', type: 'warning' });
    } else if (interest.amount && !interest.assessment) {
      tags.push({ text: 'Final Quote', type: 'success' });
    } else if (interest.amount && interest.assessment) {
      tags.push({ text: 'Preliminary', type: 'info' });
    } else if (interest.price_range_min && interest.price_range_max) {
      tags.push({ text: 'Site Visit Required', type: 'info' });
    } else {
      tags.push({ text: 'Quote Pending', type: 'neutral' });
    }
    
    return tags;
  };

  const getStatusConfig = (status) => {
    const configs = {
      interested: { 
        variant: 'secondary', 
        label: 'Interested',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      quoted: { 
        variant: 'default', 
        label: 'Quoted',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
      },
      selected: { 
        variant: 'default', 
        label: 'Selected',
        color: 'bg-green-50 text-green-700 border-green-200'
      },
      updated: { 
        variant: 'destructive', 
        label: 'Updated',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: RefreshCw
      },
      confirmed: { 
        variant: 'default', 
        label: 'Confirmed',
        color: 'bg-green-50 text-green-700 border-green-200'
      }
    };
    return configs[status] || { variant: 'secondary', label: status, color: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  const getPriceDisplay = () => {
    if (interest.status === 'updated') {
      const changeAmount = interest.amount - (interest.original_amount || 0);
      const isIncrease = changeAmount > 0;
      return (
        <div className="text-right">
          <div className="text-xl font-bold text-orange-600">
            {formatCurrency(interest.amount)}
          </div>
          <div className={`text-sm flex items-center justify-end gap-1 ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
            <span>{isIncrease ? '+' : ''}{formatCurrency(changeAmount)}</span>
          </div>
        </div>
      );
    }

    if (interest.amount) {
      return (
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(interest.amount)}
          </div>
          {interest.assessment && (
            <div className="text-sm text-gray-500">+ assessment</div>
          )}
        </div>
      );
    }

    if (interest.price_range_min && interest.price_range_max) {
      return (
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-700">
            {formatCurrency(interest.price_range_min)} - {formatCurrency(interest.price_range_max)}
          </div>
          <div className="text-sm text-gray-500">Estimate</div>
        </div>
      );
    }

    return (
      <div className="text-right">
        <div className="text-lg font-semibold text-gray-500">
          Quote pending
        </div>
      </div>
    );
  };

  const isQuoteUpdated = interest.status === 'updated';
  const isSelected = interest.selected_by_customer;
  const isConfirmed = interest.status === 'confirmed';
  const isInactive = ['rejected', 'withdrawn'].includes(interest.status);

  const getCardStyling = () => {
    if (isQuoteUpdated) return 'ring-2 ring-orange-200 bg-orange-50/30';
    if (isSelected && !isQuoteUpdated) return 'ring-2 ring-green-200 bg-green-50/30';
    if (isInactive) return 'opacity-60 bg-gray-50';
    return 'hover:shadow-lg hover:shadow-gray-200/50';
  };

  const statusConfig = getStatusConfig(interest.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`transition-all duration-300 ${getCardStyling()} ${className}`}>
      <CardContent className="p-0">
        {/* Main Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={account.profile_picture_url} />
                  <AvatarFallback className="text-sm font-medium bg-gray-100">
                    {`${account.first_name?.[0] || ''}${account.last_name?.[0] || ''}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {professional.verification_status === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}

                {isQuoteUpdated && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1 animate-pulse">
                    <RefreshCw className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {account.first_name} {account.last_name}
                  </h3>
                  <Badge className={`text-xs ${statusConfig.color} flex items-center gap-1`}>
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {professional.rating_average > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{professional.rating_average.toFixed(1)}</span>
                      <span className="text-gray-400">({professional.rating_count})</span>
                    </div>
                  )}
                  
                  {professional.experience && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{professional.experience} years</span>
                    </div>
                  )}
                </div>

                {/* Pricing Tags */}
                <div className="flex items-center gap-1 mt-2">
                  {getPricingTags().map((tag, index) => {
                    const tagColors = {
                      success: 'bg-green-100 text-green-700 border-green-200',
                      warning: 'bg-orange-100 text-orange-700 border-orange-200',
                      info: 'bg-blue-100 text-blue-700 border-blue-200',
                      assessment: 'bg-purple-100 text-purple-700 border-purple-200',
                      neutral: 'bg-gray-100 text-gray-600 border-gray-200'
                    };
                    
                    return (
                      <span 
                        key={index}
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${tagColors[tag.type]}`}
                      >
                        {tag.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {getPriceDisplay()}
          </div>

          {/* Quote Update Alert */}
          {isQuoteUpdated && (
            <div className="mb-4 p-3 bg-orange-100 border-l-4 border-orange-400 rounded-r">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Quote updated - review required</span>
              </div>
            </div>
          )}

          {/* Confirmed Alert */}
          {isConfirmed && (
            <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-400 rounded-r">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Project confirmed</span>
              </div>
            </div>
          )}

          {/* Message */}
          {interest.message && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 line-clamp-2">
                {interest.message}
              </p>
            </div>
          )}

          {/* Actions */}
          {showActions && !isInactive && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage?.(interest)}
                  disabled={isQuoteUpdated}
                  className="flex items-center gap-1"
                >
                  <MessageCircle className="h-3 w-3" />
                  Message
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1"
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  Details
                </Button>
              </div>
              
              {isQuoteUpdated ? (
                <Button
                  onClick={() => onViewQuoteComparison?.(interest)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Review Changes
                </Button>
              ) : !isSelected && !isConfirmed ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSelect}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {actionLoading ? 'Selecting...' : 'Select'}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Expanded Details */}
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
          <div className="px-6 pb-6 pt-0 border-t border-gray-100">
            <div className="pt-4 space-y-3">
              {professional.bio && (
                <div>
                  <span className="text-sm font-medium text-gray-600">About:</span>
                  <p className="text-sm text-gray-700 mt-1">{professional.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {professional.hourly_rate && (
                  <div>
                    <span className="text-gray-600">Hourly Rate:</span>
                    <p className="font-medium">{formatCurrency(professional.hourly_rate)}/hr</p>
                  </div>
                )}
                
                {professional.service_radius && (
                  <div>
                    <span className="text-gray-600">Service Area:</span>
                    <p className="font-medium">{professional.service_radius} miles</p>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-600">Interest Level:</span>
                  <p className="font-medium capitalize">{interest.intent}</p>
                </div>
                
                <div>
                  <span className="text-gray-600">Responded:</span>
                  <p className="font-medium">{new Date(interest.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterestSelectionCard;