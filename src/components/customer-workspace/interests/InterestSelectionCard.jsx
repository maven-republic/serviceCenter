// src/components/customer-workspace/interests/InterestSelectionCard.jsx (Simplified)
"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Award,
  MessageCircle,
  Check,
  X,
  AlertCircle
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
  const [actionLoading, setActionLoading] = useState(false);

  const professional = interest?.professional;
  const account = professional?.account;

  if (!professional || !account) {
    return (
      <div className={`opacity-50 p-4 bg-muted/20 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Professional information unavailable</span>
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
      interested: { variant: 'secondary', label: 'Interested' },
      quoted: { variant: 'default', label: 'Quoted' },
      selected: { variant: 'default', label: 'Selected', className: 'bg-green-100 text-green-800' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      withdrawn: { variant: 'outline', label: 'Withdrawn' }
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

  return (
    <div className={`bg-background p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={account.profile_picture_url} />
            <AvatarFallback className="text-sm">
              {`${account.first_name?.[0] || ''}${account.last_name?.[0] || ''}`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-base">
              {professional.business_name || `${account.first_name} ${account.last_name}`}
            </h3>
            
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              {professional.rating_average > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{professional.rating_average.toFixed(1)}</span>
                  <span>({professional.rating_count} reviews)</span>
                </div>
              )}
              
              {professional.verification_status && (
                <div className="flex items-center space-x-1">
                  <Award className="h-3 w-3 text-blue-600" />
                  <span className="capitalize">{professional.verification_status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge(interest.status)}
        </div>
      </div>

      {/* Professional Details - Compact */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {professional.experience && (
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{professional.experience} years experience</span>
          </div>
        )}
        
        {professional.service_radius && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>Services {professional.service_radius} mile radius</span>
          </div>
        )}
      </div>

      {/* Pricing Information - Compact */}
      {(professional.hourly_rate || professional.daily_rate || interest.amount) && (
        <div className="bg-muted/30 rounded p-3">
          <div className="flex items-center space-x-4 text-sm">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            
            {professional.hourly_rate && (
              <span>
                <span className="text-muted-foreground">Hourly: </span>
                <span className="font-medium">
                  {formatCurrency(professional.hourly_rate, professional.rate_currency)}
                </span>
              </span>
            )}
            
            {interest.amount && (
              <span>
                <span className="text-muted-foreground">Quote: </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(interest.amount)}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interest Details */}
      {interest.message && (
        <div className="bg-blue-50 border-l-2 border-blue-200 p-3">
          <p className="text-sm text-blue-800">{interest.message}</p>
        </div>
      )}

      {/* Assessment Info */}
      {interest.assessment && (
        <div className="bg-orange-50 border-l-2 border-orange-200 p-3">
          <p className="text-sm text-orange-800">
            Assessment required before final quote
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && !interest.selected_by_customer && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage(interest)}
            className="flex items-center space-x-1"
          >
            <MessageCircle className="h-3 w-3" />
            <span>Message</span>
          </Button>
          
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
                Select
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
                  {actionLoading ? 'Selecting...' : 'Confirm'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestSelectionCard;