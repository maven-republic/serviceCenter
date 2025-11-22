// src/components/customer-workspace/customer/appointments/AppointmentDetailsSheet.jsx
"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  User, 
  FileText, 
  DollarSign, 
  Users,
  Phone,
  Mail,
  Star,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

import CustomerAppointmentDashboard from '../../../interests/CustomerAppointmentDashboard';
import { APPOINTMENT_PATHS } from './appointment-constants';
import {
  getAppointmentPath,
  getStatusVariant,
  getStatusDisplayText,
  getBookingStatus,
  getProfessionalName,
  getProfessionalInitials,
  getInterestCount,
  getActiveInterestCount,
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  toProperCase,
} from './appointment-utils';

// ============================================
// LEFT SIDEBAR COMPONENT
// ============================================
const LeftSidebar = ({ appointment, path }) => {
  const professional = appointment.professional;
  const account = professional?.account;
  
  return (
    <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
      
      {/* DIRECT: Professional Card */}
      {path === APPOINTMENT_PATHS.DIRECT && professional ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Professional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center space-y-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={account?.profile_picture_url} />
                <AvatarFallback className="text-lg">
                  {getProfessionalInitials(appointment)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {getProfessionalName(appointment)}
                </p>
                {professional.business_name && (
                  <p className="text-sm text-muted-foreground">
                    {professional.business_name}
                  </p>
                )}
              </div>
              
              {/* Rating */}
              {professional.average_rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{professional.average_rating}</span>
                  {professional.total_reviews && (
                    <span className="text-muted-foreground">
                      ({professional.total_reviews})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              {account?.phone && (
                <Button variant="outline" className="w-full" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : path === APPOINTMENT_PATHS.MARKETPLACE ? (
        
        /* MARKETPLACE: Info Card */
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Marketplace Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Multiple professionals are responding to your request. Review responses in the main area.
            </p>
            <div className="mt-3 p-2 bg-muted rounded-md">
              <div className="text-sm font-medium">
                {getInterestCount(appointment)} Total Responses
              </div>
              <div className="text-xs text-muted-foreground">
                {getActiveInterestCount(appointment)} active
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Quick Stats */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Quick Stats
        </p>
        
        {/* Status */}
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Badge variant={getStatusVariant(appointment.status, path)}>
              {getStatusDisplayText(appointment.status, path)}
            </Badge>
          </CardContent>
        </Card>

        {/* Time Until (if scheduled) */}
        {appointment.session && (
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Time Until</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getRelativeTime(appointment.session)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pricing */}
        {(appointment.estimated_cost || appointment.booking?.final_price) && (
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Pricing</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {appointment.booking?.final_price 
                  ? `$${appointment.booking.final_price}`
                  : appointment.estimated_cost || 'TBD'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Actions
        </p>
        <div className="space-y-2">
          {path === APPOINTMENT_PATHS.DIRECT && appointment.status === 'scheduled' && (
            <Button variant="outline" className="w-full" size="sm">
              Reschedule
            </Button>
          )}
          <Button variant="outline" className="w-full text-destructive" size="sm">
            Cancel
          </Button>
          <Button variant="ghost" className="w-full" size="sm">
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN CONTENT AREA COMPONENT
// ============================================
const MainContent = ({ appointment, path }) => {
  const bookingStatus = getBookingStatus(appointment);
  
  return (
    <div className="flex-1 space-y-6 min-w-0">
      
      {/* Appointment Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service */}
          <div>
            <p className="text-sm font-medium mb-1">Service</p>
            <p className="text-sm text-muted-foreground">
              {appointment.service?.name || 'Not specified'}
            </p>
          </div>

          {/* Title */}
          {appointment.title && (
            <div>
              <p className="text-sm font-medium mb-1">Title</p>
              <p className="text-sm text-muted-foreground">{appointment.title}</p>
            </div>
          )}

          {/* Description */}
          {appointment.description && (
            <div>
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {appointment.description}
              </p>
            </div>
          )}

          {/* Customer Message */}
          {appointment.customer_message && (
            <div>
              <p className="text-sm font-medium mb-1">Additional Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {appointment.customer_message}
              </p>
            </div>
          )}

          {/* Urgency */}
          {appointment.urgency && (
            <div>
              <p className="text-sm font-medium mb-1">Urgency</p>
              <Badge variant="outline">{toProperCase(appointment.urgency)}</Badge>
            </div>
          )}
          
          {/* Booking Status (DIRECT) */}
          {path === APPOINTMENT_PATHS.DIRECT && bookingStatus && (
            <div>
              <p className="text-sm font-medium mb-1">Booking Status</p>
              <Badge variant="default">{toProperCase(bookingStatus)}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* When & Where Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            When & Where
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date & Time */}
          {appointment.session && (
            <div>
              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(appointment.session)}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2 ml-6">
                <Clock className="h-4 w-4" />
                {formatTime(appointment.session)}
                {appointment.booking?.end_datetime && 
                  ` - ${formatTime(appointment.booking.end_datetime)}`
                }
              </p>
            </div>
          )}

          {/* Deadline */}
          {appointment.deadline && (
            <div>
              <p className="text-sm font-medium mb-1">Deadline</p>
              <p className="text-sm text-muted-foreground">{formatDate(appointment.deadline)}</p>
            </div>
          )}

          <Separator />

          {/* Location */}
          {appointment.address && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </p>
              <p className="text-sm text-muted-foreground ml-6">
                {appointment.address.formatted_address || 
                 `${appointment.address.street_address}, ${appointment.address.city}, ${appointment.address.parish}`}
              </p>
              <div className="mt-3 ml-6 flex gap-2">
                <Button variant="outline" size="sm">
                  Get Directions
                </Button>
                <Button variant="ghost" size="sm">
                  Add to Calendar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {/* Created */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              <div>
                <p className="font-medium">{formatDate(appointment.created_at)}</p>
                <p className="text-muted-foreground">Appointment created</p>
              </div>
            </div>
            
            {/* DIRECT: Booking milestones */}
            {path === APPOINTMENT_PATHS.DIRECT && appointment.booking && (
              <>
                {appointment.booking.accepted_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="font-medium">{formatDate(appointment.booking.accepted_at)}</p>
                      <p className="text-muted-foreground">Professional accepted</p>
                    </div>
                  </div>
                )}
                
                {appointment.booking.confirmed_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="font-medium">{formatDate(appointment.booking.confirmed_at)}</p>
                      <p className="text-muted-foreground">Booking confirmed</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Scheduled start */}
            {appointment.session && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
                <div>
                  <p className="font-medium">{formatDate(appointment.session)}</p>
                  <p className="text-muted-foreground">Scheduled start</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MARKETPLACE: Professional Responses */}
      {path === APPOINTMENT_PATHS.MARKETPLACE && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Professional Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerAppointmentDashboard 
              appointmentId={appointment.appointment_id}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ============================================
// MAIN SHEET COMPONENT
// ============================================
export const AppointmentDetailsSheet = ({ 
  isOpen, 
  onOpenChange, 
  appointment 
}) => {
  if (!appointment) return null;

  const path = getAppointmentPath(appointment);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-full lg:max-w-6xl overflow-y-auto p-0">
        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <SheetTitle>
            {appointment.title || appointment.service?.name || 'Appointment Details'}
          </SheetTitle>
        </VisuallyHidden>

        {/* Split View Content */}
        <div className="flex flex-col lg:flex-row gap-6 p-6">
          <LeftSidebar appointment={appointment} path={path} />
          <MainContent appointment={appointment} path={path} />
        </div>
      </SheetContent>
    </Sheet>
  );
};