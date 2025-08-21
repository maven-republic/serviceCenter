"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  Calendar, 
  MessageCircle, 
  Phone, 
  Mail,
  User,
  DollarSign,
  Award,
  Timer,
  CheckCircle,
  Circle,
  ChevronRight,
  MoreVertical,
  Users
} from "lucide-react";
import AppointmentModal from "@/components/modal/AppointmentModal";
import { useUserStore } from "@/store/userStore";
import useSearchStore from "@/store/searchStore";
import { cn } from "@/lib/utils";

export default function ProfessionalManifest({ 
  data, 
  serviceInformation,
  isSelected = false,
  onToggleSelection = null,
  selectionMode = false,
  viewMode = 'grid', // 'grid' or 'list'
  isMobile = false,
  // New props for hybrid approach
  selectedCount = 0,
  onDirectQuote = null,
  enableMultiSelect = true
}) {
  const [showFullBio, setShowFullBio] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [localSelectionMode, setLocalSelectionMode] = useState(false);
  const { user } = useUserStore();
  const confirmedAddress = useSearchStore((state) => state.confirmedAddress);

  const {
    professional_id,
    first_name, 
    last_name,
    profile_picture_url,
    bio,
    verification_status,
    service_name,
    specialties = [],
    hourly_rate,
    daily_rate,
    experience,
    service_radius,
    rating = 4.8,
    review_count = 23,
    distance_km,
    response_time = "2 hours",
    completion_rate = 95,
    account,
  } = data;

  const full_name = `${first_name ?? ''} ${last_name ?? ''}`.trim();

  // Determine if we're in any kind of selection mode
  const isInSelectionMode = selectionMode || localSelectionMode || selectedCount > 0;

  // Get customer's confirmed address with fallback to URL coordinates
  const getCustomerLocation = useCallback(() => {
    if (confirmedAddress) {
      return confirmedAddress;
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const lat = urlParams.get('lat');
      const lng = urlParams.get('lng');

      if (lat && lng) {
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          street_address: '',
          city: '',
          parish: '',
          community: '',
          landmark: '',
          is_rural: false,
          formatted_address: `Location: ${lat}, ${lng}`,
          place_id: null,
        };
      }
    }

    return null;
  }, [confirmedAddress]);

  // Format pricing display
  const getPricingDisplay = () => {
    if (hourly_rate && daily_rate) {
      return isMobile && viewMode === 'list' 
        ? `${hourly_rate}/hr` 
        : `${hourly_rate}/hr • ${daily_rate}/day`;
    } else if (hourly_rate) {
      return `${hourly_rate}/hour`;
    } else if (daily_rate) {
      return `${daily_rate}/day`;
    } else {
      return "Quote";
    }
  };

  // Format experience as title
  const getJobTitle = () => {
    const expMap = {
      '1': 'Junior',
      '2': 'Mid-level', 
      '3': 'Experienced',
      '5': 'Senior',
      '10': 'Expert'
    };
    const expLevel = expMap[experience] || 'Professional';
    return service_name ? `${expLevel} ${service_name}` : `${expLevel} Service Provider`;
  };

  // Get bio or default description
  const getBioText = () => {
    if (bio) return bio;
    return `I'm a ${getJobTitle().toLowerCase()} with ${rating} star ratings from ${review_count} satisfied customers.`;
  };

  // Handle direct quote request (single professional)
  const handleDirectQuote = useCallback((e) => {
    e?.stopPropagation();
    
    if (!user) {
      alert('Please log in to request quotes');
      return;
    }

    if (user.primaryRole !== 'customer') {
      alert('Only customers can request quotes');
      return;
    }

    const customerLocation = getCustomerLocation();
    if (!customerLocation) {
      alert('Unable to determine service location. Please refresh and try again.');
      return;
    }

    // Call parent callback if provided, otherwise open modal
    if (onDirectQuote) {
      onDirectQuote([data], serviceInformation, customerLocation);
    } else {
      setIsAppointmentModalOpen(true);
    }
  }, [user, getCustomerLocation, onDirectQuote, data, serviceInformation]);

  // Handle booking button click (for appointment modal)
  const handleBookingClick = useCallback((e) => {
    e?.stopPropagation();
    
    if (!user) {
      alert('Please log in to book services');
      return;
    }

    if (user.primaryRole !== 'customer') {
      alert('Only customers can book services');
      return;
    }

    const customerLocation = getCustomerLocation();
    if (!customerLocation) {
      alert('Unable to determine service location. Please refresh and try again.');
      return;
    }

    setIsAppointmentModalOpen(true);
  }, [user, getCustomerLocation]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsAppointmentModalOpen(false);
  }, []);

  // Handle selection toggle (for selection mode)
  const handleSelectionToggle = useCallback((e) => {
    e?.stopPropagation();
    onToggleSelection?.(data);
  }, [data, onToggleSelection]);

  // Handle enabling multi-select mode
  const handleEnableMultiSelect = useCallback((e) => {
    e?.stopPropagation();
    setLocalSelectionMode(true);
    onToggleSelection?.(data); // Select this professional
  }, [data, onToggleSelection]);

  // Handle card click
  const handleCardClick = useCallback(() => {
    if (isInSelectionMode) {
      handleSelectionToggle();
    }
  }, [isInSelectionMode, handleSelectionToggle]);

  // Prepare professional data for booking modal
  const professionalForBooking = {
    professional_id,
    account: {
      first_name,
      last_name,
      ...account
    },
    hourly_rate,
    daily_rate,
    bio,
    verification_status,
    experience
  };

  // Truncate bio text based on view mode
  const bioText = getBioText();
  const truncateLength = viewMode === 'list' ? 60 : 120;
  const truncatedBio = bioText.length > truncateLength ? bioText.slice(0, truncateLength) + "..." : bioText;

  // Quick Actions Component (Mobile optimized)
  const QuickActions = ({ className = "" }) => (
    <div className={cn("flex gap-1 sm:gap-2", className)}>
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        className={cn(
          "rounded-full",
          isMobile ? "h-8 w-8 p-0" : "h-8 w-8"
        )}
        asChild
        onClick={(e) => e.stopPropagation()}
      >
        <a href={`/call/${professional_id}`} title="Call">
          <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
        </a>
      </Button>
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        className={cn(
          "rounded-full",
          isMobile ? "h-8 w-8 p-0" : "h-8 w-8"
        )}
        asChild
        onClick={(e) => e.stopPropagation()}
      >
        <a href={`/messages/${professional_id}`} title="Message">
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
        </a>
      </Button>
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        className={cn(
          "rounded-full",
          isMobile ? "h-8 w-8 p-0" : "h-8 w-8"
        )}
        asChild
        onClick={(e) => e.stopPropagation()}
      >
        <a href={`/professional/${professional_id}`} title="View Profile">
          <User className="h-3 w-3 sm:h-4 sm:w-4" />
        </a>
      </Button>
    </div>
  );

  // Rating Display Component - Simplified
  const RatingDisplay = ({ size = "default" }) => (
    <div className={cn(
      "flex items-center gap-1",
      size === "small" && "text-xs",
      size === "default" && "text-sm"
    )}>
      <Star className={cn(
        "fill-yellow-400 text-yellow-400",
        size === "small" ? "h-3 w-3" : "h-4 w-4"
      )} />
      <span className="font-semibold">{rating}</span>
    </div>
  );

  // Pricing Display Component
  const PricingDisplay = ({ size = "default", variant = "badge" }) => {
    const price = getPricingDisplay();
    
    if (variant === "badge") {
      return (
        <Badge variant="secondary" className={cn(
          "gap-1",
          size === "small" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
        )}>
          <DollarSign className={cn(
            size === "small" ? "h-3 w-3" : "h-4 w-4"
          )} />
          {price}
        </Badge>
      );
    }

    return (
      <div className={cn(
        "flex items-center gap-1 font-semibold text-primary",
        size === "small" ? "text-sm" : "text-base"
      )}>
        <DollarSign className={cn(
          size === "small" ? "h-3 w-3" : "h-4 w-4"
        )} />
        <span>{price}</span>
      </div>
    );
  };

  // Action Buttons Component - Hybrid approach
  const ActionButtons = () => {
    // If we're in any selection mode, show selection controls
    if (isInSelectionMode) {
      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={handleSelectionToggle}
              className="h-4 w-4 sm:h-5 sm:w-5"
              onClick={(e) => e.stopPropagation()}
            />
            <span className={cn(
              "font-medium",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {isSelected ? 'Selected for quote' : 'Select for quote'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isSelected ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      );
    }

    // Not in selection mode - show direct action buttons
    return (
      <div className="flex gap-2 w-full">
        <Button 
          onClick={handleDirectQuote}
          className={cn(
            "flex-1 gap-2",
            isMobile ? "h-10 text-sm" : "h-11 text-base"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          Request Quote
        </Button>
        
        {enableMultiSelect && (
          <Button
            variant="outline"
            onClick={handleEnableMultiSelect}
            className={cn(
              "gap-1",
              isMobile ? "h-10 px-3 text-xs" : "h-11 px-4 text-sm"
            )}
            title="Select multiple professionals"
          >
            <Users className="h-4 w-4" />
            {!isMobile && "Multi"}
          </Button>
        )}
      </div>
    );
  };

  // LIST VIEW LAYOUT (Mobile-optimized horizontal layout)
  if (viewMode === 'list') {
    return (
      <>
        <Card 
          className={cn(
            "group transition-all duration-200 overflow-hidden",
            selectionMode && "cursor-pointer hover:shadow-md hover:bg-accent/50",
            !selectionMode && "hover:shadow-md",
            isSelected && "ring-2 ring-primary bg-primary/5 shadow-md"
          )}
          onClick={handleCardClick}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Selection Checkbox (Mobile) */}
              {selectionMode && (
                <div className="flex-shrink-0">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={handleSelectionToggle}
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-1 ring-border">
                  <AvatarImage src={profile_picture_url} alt={full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {full_name?.substring(0, 2).toUpperCase() || 'PR'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                {/* Name and Verification */}
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                    {full_name}
                  </h3>
                  {verification_status === "verified" && (
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                  )}
                </div>

                {/* Distance Only */}
                {distance_km && (
                  <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                    <MapPin className="h-3 w-3" />
                    <span>{distance_km.toFixed(1)} km away</span>
                  </div>
                )}

                {/* Specialties (Mobile - show max 2) */}
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {specialties.slice(0, isMobile ? 2 : 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                        {specialty}
                      </Badge>
                    ))}
                    {specialties.length > (isMobile ? 2 : 3) && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        +{specialties.length - (isMobile ? 2 : 3)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side Actions */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2 sm:gap-3">
                {/* Pricing */}
                <PricingDisplay size="small" variant="text" />

                {/* Hybrid Action Buttons */}
                <div className="flex gap-1">
                  {isInSelectionMode ? (
                    <div className="flex items-center gap-1">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={handleSelectionToggle}
                        className="h-4 w-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={handleDirectQuote}
                        size="sm"
                        className="text-xs px-3 py-1.5 h-auto"
                      >
                        Quote
                      </Button>
                      {enableMultiSelect && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEnableMultiSelect}
                          className="h-7 w-7 p-0"
                          title="Multi-select"
                        >
                          <Users className="h-3 w-3" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Direct Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseModal}
        professional={professionalForBooking}
        serviceInformation={serviceInformation}
        location={getCustomerLocation()}
        variant="direct"
        isMobile={isMobile}
      />
      </>
    );
  }

  // GRID VIEW LAYOUT (Enhanced mobile-responsive vertical layout)
  return (
    <>
      <Card 
        className={cn(
          "group h-full transition-all duration-300 overflow-hidden",
          selectionMode && "cursor-pointer hover:shadow-lg hover:-translate-y-1",
          !selectionMode && "hover:shadow-lg hover:-translate-y-1",
          isSelected && "ring-2 ring-primary bg-primary/5 shadow-md"
        )}
        onClick={handleCardClick}
      >
        <CardHeader className={cn(
          "text-center space-y-3 sm:space-y-4",
          isMobile ? "pb-3 px-3 pt-3" : "pb-4 px-6 pt-6"
        )}>
          {/* Selection Mode Header */}
          {selectionMode && (
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={handleSelectionToggle}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs sm:text-sm font-medium">
                  {isSelected ? 'Selected' : 'Select'}
                </span>
              </div>
              {isSelected && (
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
          )}

          {/* Profile Avatar */}
          <div className="flex justify-center">
            <Avatar className={cn(
              "ring-2 ring-background shadow-lg",
              isMobile ? "h-16 w-16" : "h-20 w-20"
            )}>
              <AvatarImage src={profile_picture_url} alt={full_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {full_name?.substring(0, 2).toUpperCase() || 'PR'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name and Verification */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h3 className={cn(
                "font-semibold text-foreground",
                isMobile ? "text-base" : "text-lg"
              )}>
                {full_name}
              </h3>
              {verification_status === "verified" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Shield className="h-3 w-3 text-green-600" />
                  {!isMobile && "Verified"}
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Actions - Only show when NOT in selection mode and not mobile */}
          {!selectionMode && !isMobile && (
            <QuickActions className="justify-center" />
          )}
        </CardHeader>

        <CardContent className={cn(
          "space-y-3 sm:space-y-4",
          isMobile ? "pb-4 px-3" : "pb-6 px-6"
        )}>
          {/* Pricing */}
          <div className={cn(
            "text-center p-2 sm:p-3 bg-primary/5 rounded-lg",
            isMobile && "py-2"
          )}>
            <PricingDisplay size={isMobile ? "small" : "default"} variant="text" />
          </div>

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Specialties</h4>
              <div className="flex flex-wrap gap-1">
                {specialties.slice(0, isMobile ? 2 : 3).map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {specialties.length > (isMobile ? 2 : 3) && (
                  <Badge variant="outline" className="text-xs">
                    +{specialties.length - (isMobile ? 2 : 3)} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Mobile Quick Actions - Show in grid view for mobile */}
          {!selectionMode && isMobile && (
            <div className="pt-2 border-t">
              <QuickActions className="justify-center" />
            </div>
          )}

          {/* Footer Actions - Hybrid approach */}
          <div className="pt-2 border-t">
            <ActionButtons />
          </div>
        </CardContent>
      </Card>

      {/* Direct Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseModal}
        professional={professionalForBooking}
        serviceInformation={serviceInformation}
        location={getCustomerLocation()}
        variant="direct"
        isMobile={isMobile}
      />
    </>
  );
}