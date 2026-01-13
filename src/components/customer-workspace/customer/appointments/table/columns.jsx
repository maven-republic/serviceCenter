// src/components/customer-workspace/customer/appointments/columns.jsx
"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Users, Eye } from 'lucide-react';

import { APPOINTMENT_PATHS, COLUMN_WIDTHS } from '../shared/appointment-constants';

import {
  getAppointmentPath,
  getStatusVariant,
  getStatusDisplayText,
  getBookingStatus,
  getProfessionalName,
  getInterestCount,
  getQuotedInterestCount,
  formatDate,
  formatTime,
  formatDateShort,
  toProperCase,
  truncateText,
  getPathBadgeConfig,
  getActionButtonText,
  isTerminalState,
} from '../shared/appointment-utils';
/**
 * Creates column definitions for the appointments table
 * @param {Function} onViewAppointment - Callback when view button clicked
 * @returns {Array} Column definitions
 */
export const createColumns = (onViewAppointment) => [
  
  // ========================================
  // COLUMN 1: SERVICE & DETAILS (30%)
  // ========================================
  {
    accessorKey: "service",
    header: "Service & Details",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const serviceA = rowA.original.service?.name || '';
      const serviceB = rowB.original.service?.name || '';
      return serviceA.localeCompare(serviceB);
    },
    cell: ({ row }) => {
      const appointment = row.original;
      const path = getAppointmentPath(appointment);
      const pathBadge = getPathBadgeConfig(path);
      
      return (
        <div className="space-y-2 max-w-full">
          {/* Service Name */}
          <div className="font-semibold text-sm text-foreground">
            {appointment.service?.name || 'Service Request'}
          </div>
          
          {/* Path Badge + Appointment ID */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Path Badge */}
            <Badge 
              variant={pathBadge.variant}
              className={`text-xs h-5 ${pathBadge.className}`}
            >
              {path === APPOINTMENT_PATHS.DIRECT ? (
                <User className="h-3 w-3 mr-1" />
              ) : path === APPOINTMENT_PATHS.MARKETPLACE ? (
                <Users className="h-3 w-3 mr-1" />
              ) : null}
              {pathBadge.label}
            </Badge>
            
            {/* Appointment ID */}
            <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
              #{appointment.appointment_id.slice(0, 8)}
            </div>
          </div>
          
          {/* DIRECT: Professional Name */}
          {path === APPOINTMENT_PATHS.DIRECT && appointment.professional && (
            <div className="text-sm text-muted-foreground">
              With: <span className="font-medium text-foreground">
                {getProfessionalName(appointment)}
              </span>
            </div>
          )}
          
          {/* MARKETPLACE: Response Count */}
          {path === APPOINTMENT_PATHS.MARKETPLACE && (
            <div className="text-sm text-muted-foreground">
              {getInterestCount(appointment)} response{getInterestCount(appointment) !== 1 ? 's' : ''}
              {getQuotedInterestCount(appointment) > 0 && (
                <span className="ml-1 text-green-600 font-medium">
                  ({getQuotedInterestCount(appointment)} quoted)
                </span>
              )}
            </div>
          )}
          
          {/* Description (if available) */}
          {appointment.description && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {truncateText(appointment.description, 80)}
            </div>
          )}
        </div>
      );
    },
  },

  // ========================================
  // COLUMN 2: STATUS (20%)
  // ========================================
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      const appointment = row.original;
      const status = appointment.status;
      const path = getAppointmentPath(appointment);
      const bookingStatus = getBookingStatus(appointment);
      
      return (
        <div className="space-y-2">
          {/* Main Status Badge */}
          <Badge 
            variant={getStatusVariant(status, path)} 
            className="text-xs whitespace-nowrap"
          >
            {getStatusDisplayText(status, path)}
          </Badge>
          
          {/* DIRECT: Show Booking Detail */}
          {path === APPOINTMENT_PATHS.DIRECT && bookingStatus && (
            <div className="text-xs text-muted-foreground">
              Booking: {toProperCase(bookingStatus)}
            </div>
          )}
          
          {/* MARKETPLACE: Show Interest Summary */}
          {path === APPOINTMENT_PATHS.MARKETPLACE && ['interested', 'competing', 'quoted'].includes(status) && (
            <div className="text-xs text-muted-foreground">
              {getQuotedInterestCount(appointment) > 0 
                ? `${getQuotedInterestCount(appointment)} quotes available`
                : 'Awaiting quotes'
              }
            </div>
          )}
        </div>
      );
    },
  },

  // ========================================
  // COLUMN 3: DATE & TIME (20%)
  // ========================================
  {
    accessorKey: "session",
    header: "Date & Time",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.session || rowA.original.created_at);
      const dateB = new Date(rowB.original.session || rowB.original.created_at);
      return dateA.getTime() - dateB.getTime();
    },
    cell: ({ row }) => {
      const appointment = row.original;
      const sessionDate = appointment.session;
      
      return (
        <div className="space-y-1">
          {/* Session Date/Time (if scheduled) */}
          {sessionDate ? (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium">
                  {formatDate(sessionDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {formatTime(sessionDate)}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Created Date (fallback) */}
              <div className="text-sm text-muted-foreground">
                Not scheduled
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {formatDateShort(appointment.created_at)}
              </div>
            </>
          )}
        </div>
      );
    },
  },

  // ========================================
  // COLUMN 4: ACTIONS (30%)
  // ========================================
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original;
      const path = getAppointmentPath(appointment);
      const buttonText = getActionButtonText(appointment, path);
      const isTerminal = isTerminalState(appointment);
      
      return (
        <div className="flex items-center gap-2 justify-end">
          {/* Primary Action Button */}
          <Button 
            size="sm"
            variant={
              path === APPOINTMENT_PATHS.DIRECT && appointment.status === 'converted' 
                ? 'default' 
                : 'outline'
            }
            onClick={(e) => {
              e.stopPropagation();
              onViewAppointment(appointment.appointment_id);
            }}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">{buttonText}</span>
            <span className="sm:hidden">View</span>
          </Button>
          
          {/* Secondary Actions (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Reschedule Button (DIRECT + scheduled) */}
            {path === APPOINTMENT_PATHS.DIRECT && 
             appointment.status === 'scheduled' && 
             !isTerminal && (
              <Button 
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement reschedule handler
                  console.log('Reschedule:', appointment.appointment_id);
                }}
              >
                Reschedule
              </Button>
            )}
            
            {/* Cancel Button (not in terminal state) */}
            {!isTerminal && (
              <Button 
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement cancel handler
                  console.log('Cancel:', appointment.appointment_id);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      );
    },
  },
];