"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Timer
} from "lucide-react";
import AppointmentModal from "@/components/modal/AppointmentModal";
import { useUserStore } from "@/store/userStore";
import useSearchStore from "@/store/searchStore";
import { cn } from "@/lib/utils";

export default function ProfessionalManifest({ data, serviceInformation }) {
  const [showFullBio, setShowFullBio] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
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
      return `$${hourly_rate}/hr • $${daily_rate}/day`;
    } else if (hourly_rate) {
      return `$${hourly_rate}/hour`;
    } else if (daily_rate) {
      return `$${daily_rate}/day`;
    } else {
      return "Estimate";
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
    return `I'm a ${getJobTitle().toLowerCase()} and I've been providing quality services with ${rating} star ratings from ${review_count} satisfied customers.`;
  };

  // Handle booking button click
  const handleBookingClick = useCallback(() => {
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

  // Truncate bio text
  const bioText = getBioText();
  const truncatedBio = bioText.length > 120 ? bioText.slice(0, 120) + "..." : bioText;

  return (
    <>
      <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="text-center space-y-4 pb-4">
          {/* Profile Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-20 w-20 ring-2 ring-background shadow-lg">
              <AvatarImage src={profile_picture_url} alt={full_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {full_name?.substring(0, 2).toUpperCase() || 'PR'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name and Verification */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-semibold text-lg text-foreground">
                {full_name}
              </h3>
              {verification_status === "verified" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Shield className="h-3 w-3 text-green-600" />
                  Verified
                </Badge>
              )}
            </div>
           
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              asChild
            >
              <a href={`/call/${professional_id}`} title="Call">
                <Phone className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              asChild
            >
              <a href={`/messages/${professional_id}`} title="Message">
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              asChild
            >
              <a href={`/professional/${professional_id}`} title="View Profile">
                <User className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          

           {/* Pricing */}
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>{getPricingDisplay()}</span>
            </div>
          </div>

        

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Specialties</h4>
              <div className="flex flex-wrap gap-1">
                {specialties.slice(0, 3).map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{specialties.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Book Button */}
          <Button 
            onClick={handleBookingClick}
            className="w-full gap-2 group-hover:shadow-md transition-all duration-200"
            size="lg"
          >
            <Calendar className="h-4 w-4" />
            Book Appointment
          </Button>
        </CardContent>
      </Card>

      {/* Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseModal}
        professional={professionalForBooking}
        serviceInformation={serviceInformation}
        location={getCustomerLocation()}
      />
    </>
  );
}