// src/components/customer-workspace/interests/InterestSelectionCard.jsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <Card className={`opacity-50 ${className}`}>
        <CardContent className="p-6">
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
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={account.profile_picture_url} />
              <AvatarFallback>
                {`${account.first_name?.[0] || ''}${account.last_name?.[0] || ''}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {professional.business_name || `${account.first_name} ${account.last_name}`}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {professional.rating_average > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{professional.rating_average.toFixed(1)}</span>
                    <span>({professional.rating_count} reviews)</span>
                  </div>
                )}
                
                {professional.verification_status && (
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-blue-600" />
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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Professional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {professional.bio && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {professional.bio}
              </p>
            </div>
          )}
          
          {professional.experience && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{professional.experience} years experience</span>
            </div>
          )}
          
          {professional.service_radius && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Services {professional.service_radius} mile radius</span>
            </div>
          )}
        </div>

        {/* Pricing Information */}
        {(professional.hourly_rate || professional.daily_rate || interest.amount) && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Pricing Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {professional.hourly_rate && (
                <div>
                  <span className="text-muted-foreground">Hourly: </span>
                  <span className="font-medium">
                    {formatCurrency(professional.hourly_rate, professional.rate_currency)}
                  </span>
                </div>
              )}
              
              {professional.daily_rate && (
                <div>
                  <span className="text-muted-foreground">Daily: </span>
                  <span className="font-medium">
                    {formatCurrency(professional.daily_rate, professional.rate_currency)}
                  </span>
                </div>
              )}
              
              {interest.amount && (
                <div>
                  <span className="text-muted-foreground">Quote: </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(interest.amount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interest Details */}
        {interest.message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-blue-900">Professional's Message</h4>
            <p className="text-sm text-blue-800">{interest.message}</p>
          </div>
        )}

        {/* Assessment Info */}
        {interest.assessment && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-orange-900">
              Assessment Required
            </h4>
            <p className="text-sm text-orange-800">
              This professional needs to assess your project before providing a final quote.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && !interest.selected_by_customer && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMessage(interest)}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
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
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
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
                    {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
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
                  <Check className="h-4 w-4 mr-1" />
                  Select
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
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
                    {actionLoading ? 'Selecting...' : 'Confirm Select'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InterestSelectionCard;