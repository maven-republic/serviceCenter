// src/components/customer-workspace/customer/appointments/AppointmentCard.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, User, Users, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// ✅ PATH DETECTION (matches database logic)
// ============================================
const getAppointmentPath = (appointment) => {
  // PATH B: Once interests exist, it's PATH B forever (immutable)
  if (appointment.interests && appointment.interests.length > 0) {
    return 'PATH_B';
  }
  
  // PATH A: professional_id is set AND no interests exist
  if (appointment.professional_id) {
    return 'PATH_A';
  }
  
  return 'UNKNOWN';
};

// ============================================
// ✅ PATH-AWARE STATUS VARIANTS
// ============================================
const getStatusVariant = (status, path) => {
  // PATH A specific statuses (from booking trigger)
  if (path === 'PATH_A') {
    const pathAVariants = {
      'pending': 'secondary',
      'scheduled': 'default',
      'assessing': 'secondary',
      'assessed': 'default',
      'cancelled': 'destructive',
    };
    if (pathAVariants[status]) return pathAVariants[status];
  }
  
  // PATH B and common statuses
  const variants = {
    'pending': 'secondary',
    'interested': 'default',
    'competing': 'outline',
    'evaluating': 'secondary',
    'proposed': 'outline',
    'scheduled': 'default',
    'assessing': 'secondary',
    'assessed': 'default',
    'quoted': 'default',
    'comparing': 'outline',
    'approved': 'default',
    'converting': 'secondary',
    'converted': 'default',
    'declined': 'destructive',
    'cancelled': 'destructive',
  };
  
  return variants[status] || 'outline';
};

// ============================================
// ✅ PATH-AWARE STATUS DISPLAY TEXT
// ============================================
const getStatusDisplayText = (status, path) => {
  if (path === 'PATH_A') {
    const pathATexts = {
      'pending': 'Awaiting Acceptance',
      'scheduled': 'Scheduled',
      'assessing': 'In Progress',
      'assessed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return pathATexts[status] || toProperCase(status);
  }
  
  return toProperCase(status);
};

// ============================================
// ✅ GET BOOKING STATUS
// ============================================
const getBookingStatus = (appointment) => {
  if (appointment.booking && appointment.booking.status) {
    return appointment.booking.status;
  }
  return null;
};

// Utility function
const toProperCase = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ============================================
// ✅ ENHANCED APPOINTMENT CARD COMPONENT
// ============================================
export const AppointmentCard = ({ appointment }) => {
  const router = useRouter();
  const path = getAppointmentPath(appointment);
  const bookingStatus = getBookingStatus(appointment);

  // ✅ PATH-AWARE ROUTING
  const handleViewClick = () => {
    if (path === 'PATH_A') {
      // Direct booking - go to appointment detail
      router.push(`/customer/appointments/${appointment.appointment_id}`);
    } else if (path === 'PATH_B') {
      // Marketplace - go to interests/responses
      router.push(`/customer/appointments/${appointment.appointment_id}/interests`);
    } else {
      // Fallback
      router.push(`/customer/appointments/${appointment.appointment_id}`);
    }
  };

  // ✅ Get professional name for PATH A
  const getProfessionalName = () => {
    if (appointment.professional?.account) {
      const first = appointment.professional.account.first_name || '';
      const last = appointment.professional.account.last_name || '';
      return `${first} ${last}`.trim() || 'Professional';
    }
    return 'Professional';
  };

  // ✅ Get interest count for PATH B
  const getInterestCount = () => {
    return appointment.interest_summary?.total_interests || 
           appointment.interests?.length || 
           0;
  };

  const getActiveInterestCount = () => {
    return appointment.interest_summary?.active_interests || 0;
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          
          {/* Left Side - Main Info */}
          <div className="flex-1 min-w-0 space-y-3">
            
            {/* Service Name + ID */}
            <div>
              <h3 className="font-semibold text-base truncate">{appointment.service?.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground font-mono">
                  #{appointment.appointment_id.slice(0, 8)}
                </p>
              </div>
            </div>

            {/* ✅ PATH INDICATOR BADGE */}
            <div className="flex items-center gap-2 flex-wrap">
              {path === 'PATH_A' ? (
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Direct Booking
                </Badge>
              ) : path === 'PATH_B' ? (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Marketplace
                </Badge>
              ) : null}
            </div>

            {/* ✅ STATUS DISPLAY */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={getStatusVariant(appointment.status, path)} className="text-xs">
                  {getStatusDisplayText(appointment.status, path)}
                </Badge>
                
                {/* ✅ Show booking detail for PATH A */}
                {path === 'PATH_A' && bookingStatus && (
                  <span className="text-xs text-muted-foreground">
                    ({toProperCase(bookingStatus)})
                  </span>
                )}
              </div>

              {/* ✅ PATH-SPECIFIC INFO */}
              {path === 'PATH_A' && appointment.professional ? (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Professional:</span>
                  <span className="font-medium">{getProfessionalName()}</span>
                </div>
              ) : path === 'PATH_B' ? (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {getInterestCount()} response{getInterestCount() !== 1 ? 's' : ''}
                    {getActiveInterestCount() > 0 && (
                      <span className="ml-1">
                        ({getActiveInterestCount()} active)
                      </span>
                    )}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Created Date */}
            <p className="text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 inline mr-1" />
              Created: {new Date(appointment.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          
          {/* Right Side - Action Button */}
          <div className="flex flex-col items-end justify-between h-full">
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewClick();
              }}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {path === 'PATH_A' ? 'View Booking' : 'View Responses'}
              <ArrowRight className="h-3 w-3" />
            </Button>
            
            {/* Additional visual indicator for PATH */}
            <div className={cn(
              "mt-2 w-20 h-1 rounded-full",
              path === 'PATH_A' ? "bg-blue-500" : path === 'PATH_B' ? "bg-purple-500" : "bg-gray-300"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};