"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Star, 
  MapPin, 
  Shield, 
  MessageCircle, 
  Users,
  DollarSign
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
  viewMode = 'grid',
  isMobile = false
}) {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const { user } = useUserStore();
  const confirmedAddress = useSearchStore((state) => state.confirmedAddress);

  const {
    professional_id,
    first_name, 
    last_name,
    profile_picture_url,
    verification_status,
    hourly_rate,
    daily_rate,
    rating = 4.8,
    distance_km,
    account,
  } = data;

  const full_name = `${first_name ?? ''} ${last_name ?? ''}`.trim();

  // Get customer location
  const getCustomerLocation = useCallback(() => {
    if (confirmedAddress) return confirmedAddress;

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const lat = urlParams.get('lat');
      const lng = urlParams.get('lng');

      if (lat && lng) {
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          formatted_address: `Location: ${lat}, ${lng}`,
        };
      }
    }
    return null;
  }, [confirmedAddress]);

  // Format pricing
  const getPricing = () => {
    if (hourly_rate) return `$${hourly_rate}/hr`;
    if (daily_rate) return `$${daily_rate}/day`;
    return "Quote";
  };

  // Handle selection toggle
  const handleSelectionToggle = useCallback((checked) => {
    onToggleSelection?.(data);
  }, [data, onToggleSelection]);

  // Handle direct quote
  const handleDirectQuote = useCallback((e) => {
    e?.stopPropagation();
    
    if (!user) {
      alert('Please log in to request quotes');
      return;
    }

    const customerLocation = getCustomerLocation();
    if (!customerLocation) {
      alert('Unable to determine service location');
      return;
    }

    setIsAppointmentModalOpen(true);
  }, [user, getCustomerLocation]);

  // Handle card click
  const handleCardClick = useCallback(() => {
    if (selectionMode) {
      handleSelectionToggle();
    }
  }, [selectionMode, handleSelectionToggle]);

  // Prepare professional data for booking
  const professionalForBooking = {
    professional_id,
    account: { first_name, last_name, ...account },
    hourly_rate,
    daily_rate,
    verification_status
  };

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <>
        <Card 
          className={cn(
            "transition-all duration-200 cursor-pointer hover:shadow-md",
            isSelected && "ring-2 ring-primary bg-primary/5"
          )}
          onClick={handleCardClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              
              {/* Selection checkbox */}
              {selectionMode && (
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={handleSelectionToggle}
                  className="h-5 w-5"
                />
              )}

              {/* Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile_picture_url} alt={full_name} />
                <AvatarFallback>
                  {full_name?.substring(0, 2).toUpperCase() || 'PR'}
                </AvatarFallback>
              </Avatar>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{full_name}</h3>
                  {verification_status === "verified" && (
                    <Shield className="h-4 w-4 text-green-600" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {distance_km && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{distance_km.toFixed(1)} km</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{rating}</span>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col items-end gap-2">
                <div className="font-semibold text-primary">{getPricing()}</div>
                
                {selectionMode ? (
                  <Badge variant={isSelected ? "default" : "outline"}>
                    {isSelected ? "Selected" : "Select"}
                  </Badge>
                ) : (
                  <Button size="sm" onClick={handleDirectQuote}>
                    Quote
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          professional={professionalForBooking}
          serviceInformation={serviceInformation}
          location={getCustomerLocation()}
          variant="direct"
        />
      </>
    );
  }

  // GRID VIEW
  return (
    <>
      <Card 
        className={cn(
          "transition-all duration-200 cursor-pointer hover:shadow-md",
          isSelected && "ring-2 ring-primary bg-primary/5"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-6 text-center space-y-4">
          
          {/* Selection checkbox */}
          {selectionMode && (
            <div className="flex justify-between items-center">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={handleSelectionToggle}
                className="h-5 w-5"
              />
              {isSelected && <Badge variant="default">Selected</Badge>}
            </div>
          )}

          {/* Avatar */}
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage src={profile_picture_url} alt={full_name} />
            <AvatarFallback className="text-lg">
              {full_name?.substring(0, 2).toUpperCase() || 'PR'}
            </AvatarFallback>
          </Avatar>

          {/* Name and verification */}
          <div>
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-semibold">{full_name}</h3>
              {verification_status === "verified" && (
                <Shield className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            {distance_km && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{distance_km.toFixed(1)} km</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-center gap-1 font-semibold text-primary">
              <DollarSign className="h-4 w-4" />
              <span>{getPricing()}</span>
            </div>
          </div>

          {/* Action */}
          {selectionMode ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm">
                {isSelected ? 'Selected for quote' : 'Select for quote'}
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleDirectQuote}
                className="flex-1 gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Request Quote
              </Button>
              
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelection?.(data);
                }}
                className="px-3"
                title="Multi-select"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        professional={professionalForBooking}
        serviceInformation={serviceInformation}
        location={getCustomerLocation()}
        variant="direct"
      />
    </>
  );
}