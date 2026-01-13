// src/components/customer-workspace/customer/appointments/timeline/TimelineAppointmentCard.jsx
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, MapPin, DollarSign, MessageSquare, Phone, Eye, User, Users } from 'lucide-react';

import { APPOINTMENT_PATHS } from '../shared/appointment-constants';
import {
  getAppointmentPath,
  getStatusVariant,
  getStatusDisplayText,
  getProfessionalName,
  getProfessionalInitials,
  getInterestCount,
  getQuotedInterestCount,
} from '../shared/appointment-utils';
import { formatTimelineTime, getTimelineDayOfWeek } from './timeline-utils';

/**
 * Twitter-style appointment card for timeline view
 */
export const TimelineAppointmentCard = ({ appointment, onClick }) => {
  const path = getAppointmentPath(appointment);
  const professional = appointment.professional;
  const account = professional?.account;

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/30 transition-all border-l-4"
      style={{
        borderLeftColor: path === APPOINTMENT_PATHS.DIRECT ? '#3b82f6' : '#a855f7'
      }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        
        {/* HEADER: Profile Section */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            {path === APPOINTMENT_PATHS.DIRECT && account?.profile_picture_url ? (
              <AvatarImage src={account.profile_picture_url} />
            ) : null}
            <AvatarFallback className="text-sm font-semibold">
              {path === APPOINTMENT_PATHS.DIRECT 
                ? getProfessionalInitials(appointment)
                : '🏪'
              }
            </AvatarFallback>
          </Avatar>

          {/* Name, Handle, Time */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {path === APPOINTMENT_PATHS.DIRECT 
                  ? getProfessionalName(appointment)
                  : 'Marketplace'
                }
              </span>
              
              {path === APPOINTMENT_PATHS.DIRECT && professional?.business_name && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    @{professional.business_name.toLowerCase().replace(/\s+/g, '_')}
                  </span>
                </>
              )}
              
              {path === APPOINTMENT_PATHS.MARKETPLACE && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {getInterestCount(appointment)} professional{getInterestCount(appointment) !== 1 ? 's' : ''} responded
                  </span>
                </>
              )}
              
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {getTimeAgo(appointment.created_at)}
              </span>
            </div>

            {/* Divider line */}
            <div className="h-px bg-border my-2"></div>
          </div>
        </div>

        {/* CONTENT: Service Title */}
        <div className="mb-3">
          <h3 className="font-semibold text-base mb-2">
            {appointment.service?.name || 'Service Request'}
          </h3>
        </div>

        {/* DETAILS CARD */}
        <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-2">
          {/* Location & Time */}
          <div className="flex items-start gap-4 text-sm flex-wrap">
            {appointment.address && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{appointment.address.city || appointment.address.street_address}</span>
              </div>
            )}
            
            {appointment.session && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>
                  {getTimelineDayOfWeek(appointment.session) === 'Today' 
                    ? 'Today' 
                    : getTimelineDayOfWeek(appointment.session)
                  } at {formatTimelineTime(appointment.session)}
                </span>
              </div>
            )}
            
            {appointment.booking?.final_price && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                <span>${appointment.booking.final_price.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant={path === APPOINTMENT_PATHS.DIRECT ? 'default' : 'outline'}
              className={`text-xs h-5 ${
                path === APPOINTMENT_PATHS.DIRECT 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-purple-300 text-purple-700'
              }`}
            >
              {path === APPOINTMENT_PATHS.DIRECT ? (
                <User className="h-3 w-3 mr-1" />
              ) : (
                <Users className="h-3 w-3 mr-1" />
              )}
              {path === APPOINTMENT_PATHS.DIRECT ? 'Direct' : 'Marketplace'}
            </Badge>

            <Badge 
              variant={getStatusVariant(appointment.status, path)} 
              className="text-xs h-5"
            >
              {getStatusDisplayText(appointment.status, path)}
            </Badge>

            {appointment.booking?.status && (
              <Badge variant="outline" className="text-xs h-5">
                {appointment.booking.status}
              </Badge>
            )}
          </div>
        </div>

        {/* DESCRIPTION/NOTES */}
        {(appointment.description || appointment.customer_message) && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              "{appointment.description || appointment.customer_message}"
            </p>
          </div>
        )}

        {/* MARKETPLACE: Quote Summary */}
        {path === APPOINTMENT_PATHS.MARKETPLACE && getQuotedInterestCount(appointment) > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2 text-sm">
              <div className="text-blue-600 dark:text-blue-400 font-medium">
                💡 {getQuotedInterestCount(appointment)} professional{getQuotedInterestCount(appointment) !== 1 ? 's' : ''} sent quote{getQuotedInterestCount(appointment) !== 1 ? 's' : ''}
              </div>
            </div>
            {appointment.interests?.filter(i => i.has_quote).slice(0, 2).map((interest, idx) => (
              <div key={idx} className="text-xs text-muted-foreground mt-1 ml-6">
                • Professional #{idx + 1} - Quote available
              </div>
            ))}
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 mt-2 text-blue-600 dark:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Compare All Quotes →
            </Button>
          </div>
        )}

        {/* MARKETPLACE: Pending State */}
        {path === APPOINTMENT_PATHS.MARKETPLACE && getQuotedInterestCount(appointment) === 0 && getInterestCount(appointment) > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              ⏳ {getInterestCount(appointment)} professional{getInterestCount(appointment) !== 1 ? 's are' : ' is'} reviewing your request
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              No quotes yet
            </div>
          </div>
        )}

        {/* DIVIDER */}
        <div className="h-px bg-border mb-3"></div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap">
          {path === APPOINTMENT_PATHS.DIRECT && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Message professional');
                }}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Message</span>
              </Button>
              
              {account?.phone && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Call professional');
                  }}
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Call</span>
                </Button>
              )}
            </>
          )}

          {path === APPOINTMENT_PATHS.MARKETPLACE && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Respond</span>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">View Details</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};