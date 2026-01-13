// src/components/customer-workspace/customer/appointments/data-table.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, User, Users, Calendar, Clock, Eye } from 'lucide-react';

import { APPOINTMENT_PATHS, COLUMN_WIDTHS, MOBILE_BREAKPOINT } from '../shared/appointment-constants';
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
  getPathBadgeConfig,
  getActionButtonText,
  isTerminalState,
} from '../shared/appointment-utils';

// ============================================
// MOBILE CARD COMPONENT (INLINE)
// ============================================
const AppointmentMobileCard = ({ appointment, onClick }) => {
  const path = getAppointmentPath(appointment);
  const pathBadge = getPathBadgeConfig(path);
  const bookingStatus = getBookingStatus(appointment);
  const buttonText = getActionButtonText(appointment, path);

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          
          {/* Left Side - Main Info */}
          <div className="flex-1 min-w-0 space-y-2">
            
            {/* Service Name */}
            <div className="font-semibold text-sm text-foreground">
              {appointment.service?.name || 'Service Request'}
            </div>
            
            {/* Path Badge + ID */}
            <div className="flex items-center gap-2 flex-wrap">
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
              
              <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                #{appointment.appointment_id.slice(0, 8)}
              </div>
            </div>
            
            {/* Professional Name (DIRECT) or Response Count (MARKETPLACE) */}
            {path === APPOINTMENT_PATHS.DIRECT && appointment.professional ? (
              <div className="text-sm text-muted-foreground">
                {getProfessionalName(appointment)}
              </div>
            ) : path === APPOINTMENT_PATHS.MARKETPLACE ? (
              <div className="text-sm text-muted-foreground">
                {getInterestCount(appointment)} response{getInterestCount(appointment) !== 1 ? 's' : ''}
                {getQuotedInterestCount(appointment) > 0 && (
                  <span className="ml-1 text-green-600 font-medium">
                    ({getQuotedInterestCount(appointment)} quoted)
                  </span>
                )}
              </div>
            ) : null}
            
            {/* Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={getStatusVariant(appointment.status, path)} 
                className="text-xs"
              >
                {getStatusDisplayText(appointment.status, path)}
              </Badge>
              
              {/* Booking Detail for DIRECT */}
              {path === APPOINTMENT_PATHS.DIRECT && bookingStatus && (
                <span className="text-xs text-muted-foreground">
                  ({toProperCase(bookingStatus)})
                </span>
              )}
            </div>
          </div>
          
          {/* Right Side - Date */}
          <div className="text-xs text-muted-foreground text-right space-y-1">
            {appointment.session ? (
              <>
                <div className="font-medium">{formatDateShort(appointment.session)}</div>
                <div>{formatTime(appointment.session)}</div>
              </>
            ) : (
              <div>{formatDateShort(appointment.created_at)}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN DATA TABLE COMPONENT
// ============================================
export function DataTable({
  columns,
  data,
  onRowClick,
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter function - searches across multiple fields
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    
    const searchTerm = globalFilter.toLowerCase();
    
    return data.filter((item) => {
      const searchableText = [
        item.title,
        item.service?.name,
        item.status,
        item.customer_message,
        item.description,
        item.appointment_id,
        item.professional?.account?.first_name,
        item.professional?.account?.last_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  }, [data, globalFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const directCount = data.filter(a => 
      getAppointmentPath(a) === APPOINTMENT_PATHS.DIRECT
    ).length;
    const marketplaceCount = data.filter(a => 
      getAppointmentPath(a) === APPOINTMENT_PATHS.MARKETPLACE
    ).length;
    return { directCount, marketplaceCount };
  }, [data]);

  return (
    <div className="w-full space-y-4">
      
      {/* ========================================
          SEARCH BAR
          ======================================== */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="Search appointments..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredData.length} of {data.length}
        </div>
      </div>

      {/* ========================================
          MOBILE VIEW - CARD LAYOUT
          ======================================== */}
      {isMobile ? (
        <div className="space-y-3">
          {filteredData.length ? (
            filteredData.map((appointment) => (
              <AppointmentMobileCard
                key={appointment.appointment_id}
                appointment={appointment}
                onClick={() => onRowClick?.(appointment)}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {globalFilter ? 'No appointments match your search.' : 'No appointments found.'}
              </p>
            </Card>
          )}
        </div>
      ) : (
        
        /* ========================================
           DESKTOP VIEW - TABLE LAYOUT
           ======================================== */
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="border-b bg-muted/30">
              <tr>
                <th 
                  className="p-3 text-left text-sm font-medium text-muted-foreground" 
                  style={{width: COLUMN_WIDTHS.SERVICE_DETAILS}}
                >
                  Service & Details
                </th>
                <th 
                  className="p-3 text-left text-sm font-medium text-muted-foreground" 
                  style={{width: COLUMN_WIDTHS.STATUS}}
                >
                  Status
                </th>
                <th 
                  className="p-3 text-left text-sm font-medium text-muted-foreground" 
                  style={{width: COLUMN_WIDTHS.DATE_TIME}}
                >
                  Date & Time
                </th>
                <th 
                  className="p-3 text-right text-sm font-medium text-muted-foreground" 
                  style={{width: COLUMN_WIDTHS.ACTIONS}}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length ? (
                filteredData.map((row) => {
                  const path = getAppointmentPath(row);
                  const pathBadge = getPathBadgeConfig(path);
                  const bookingStatus = getBookingStatus(row);
                  const buttonText = getActionButtonText(row, path);
                  const isTerminal = isTerminalState(row);
                  
                  return (
                    <tr 
                      key={row.appointment_id}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onRowClick?.(row)}
                    >
                      
                      {/* SERVICE & DETAILS COLUMN */}
                      <td className="p-3" style={{width: COLUMN_WIDTHS.SERVICE_DETAILS}}>
                        <div className="space-y-2">
                          {/* Service Name */}
                          <div className="font-semibold text-sm text-foreground">
                            {row.service?.name || 'Service Request'}
                          </div>
                          
                          {/* Path Badge + ID */}
                          <div className="flex items-center gap-2 flex-wrap">
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
                            
                            <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                              #{row.appointment_id.slice(0, 8)}
                            </div>
                          </div>
                          
                          {/* Professional Name or Response Count */}
                          {path === APPOINTMENT_PATHS.DIRECT && row.professional ? (
                            <div className="text-sm text-muted-foreground">
                              With: <span className="font-medium text-foreground">
                                {getProfessionalName(row)}
                              </span>
                            </div>
                          ) : path === APPOINTMENT_PATHS.MARKETPLACE ? (
                            <div className="text-sm text-muted-foreground">
                              {getInterestCount(row)} response{getInterestCount(row) !== 1 ? 's' : ''}
                              {getQuotedInterestCount(row) > 0 && (
                                <span className="ml-1 text-green-600 font-medium">
                                  ({getQuotedInterestCount(row)} quoted)
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="p-3" style={{width: COLUMN_WIDTHS.STATUS}}>
                        <div className="space-y-2">
                          <Badge 
                            variant={getStatusVariant(row.status, path)} 
                            className="text-xs"
                          >
                            {getStatusDisplayText(row.status, path)}
                          </Badge>
                          
                          {/* Booking Detail for DIRECT */}
                          {path === APPOINTMENT_PATHS.DIRECT && bookingStatus && (
                            <div className="text-xs text-muted-foreground">
                              Booking: {toProperCase(bookingStatus)}
                            </div>
                          )}
                          
                          {/* Interest Summary for MARKETPLACE */}
                          {path === APPOINTMENT_PATHS.MARKETPLACE && 
                           ['interested', 'competing', 'quoted'].includes(row.status) && (
                            <div className="text-xs text-muted-foreground">
                              {getQuotedInterestCount(row) > 0 
                                ? `${getQuotedInterestCount(row)} quotes available`
                                : 'Awaiting quotes'
                              }
                            </div>
                          )}
                        </div>
                      </td>

                      {/* DATE & TIME COLUMN */}
                      <td className="p-3" style={{width: COLUMN_WIDTHS.DATE_TIME}}>
                        <div className="space-y-1">
                          {row.session ? (
                            <>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-medium">
                                  {formatDate(row.session)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(row.session)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm text-muted-foreground">
                                Not scheduled
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Created: {formatDateShort(row.created_at)}
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="p-3 text-right" style={{width: COLUMN_WIDTHS.ACTIONS}}>
                        <div className="flex items-center gap-2 justify-end">
                          <Button 
                            size="sm"
                            variant={
                              path === APPOINTMENT_PATHS.DIRECT && row.status === 'converted' 
                                ? 'default' 
                                : 'outline'
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowClick?.(row);
                            }}
                          >
                            {buttonText}
                          </Button>
                          
                          {/* Secondary Actions (Desktop) */}
                          {path === APPOINTMENT_PATHS.DIRECT && 
                           row.status === 'scheduled' && 
                           !isTerminal && (
                            <Button 
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Reschedule:', row.appointment_id);
                              }}
                            >
                              Reschedule
                            </Button>
                          )}
                          
                          {!isTerminal && (
                            <Button 
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Cancel:', row.appointment_id);
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    {globalFilter ? 'No appointments match your search.' : 'No appointments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================
          SUMMARY FOOTER
          ======================================== */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div>
            Showing {filteredData.length} appointment{filteredData.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{stats.directCount} direct</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{stats.marketplaceCount} marketplace</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}