// src/components/customer-workspace/customer/appointments/data-table.jsx
"use client";

import React from "react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Simplified status variant mapping
const getStatusVariant = (status) => {
  const variants = {
    'pending': 'secondary',
    'interested': 'default', 
    'competing': 'outline',
    'evaluating': 'secondary',
    'quoted': 'default',
    'converted': 'default',
    'cancelled': 'destructive',
  };
  return variants[status] || 'outline';
};

// Utility function to convert status to proper case
const toProperCase = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Minimal Mobile Card Component
const AppointmentMobileCard = ({ appointment, onViewAppointment }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onViewAppointment(appointment.appointment_id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-sm text-primary truncate">
                {appointment.service?.name}
              </div>
              <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                #{appointment.appointment_id.slice(0, 8)}
              </div>
            </div>
            <div className="font-medium text-sm truncate">
              {appointment.title || 'Draft'}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(appointment.status)} className="text-xs">
                {toProperCase(appointment.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {appointment.interest_summary?.total_interests || 0} responses
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right space-y-1">
            <div>{formatDate(appointment.created_at)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function DataTable({
  columns,
  data,
  onRowClick,
}) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simple filter function
  const filteredData = React.useMemo(() => {
    if (!globalFilter) return data;
    
    return data.filter((item) => {
      const searchableText = [
        item.title,
        item.service?.name,
        item.status,
        item.customer_message,
        item.appointment_id
      ].join(' ').toLowerCase();
      
      return searchableText.includes(globalFilter.toLowerCase());
    });
  }, [data, globalFilter]);

  return (
    <div className="w-full space-y-4">
      {/* Simple Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="Search appointments..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredData.length} of {data.length}
        </div>
      </div>

      {/* Content */}
      {isMobile ? (
        // Mobile Card Layout
        <div className="space-y-3">
          {filteredData.length ? (
            filteredData.map((appointment) => (
              <AppointmentMobileCard
                key={appointment.appointment_id}
                appointment={appointment}
                onViewAppointment={(appointmentId) => {
                  const appointment = data.find(apt => apt.appointment_id === appointmentId);
                  if (appointment) onRowClick?.(appointment);
                }}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No appointments found.</p>
            </Card>
          )}
        </div>
      ) : (
        // Desktop Table Layout with Fixed Column Widths
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="border-b bg-muted/30">
  <tr>
    <th className="p-3 text-left text-sm font-medium text-muted-foreground" style={{width: '30%'}}>
      Overview
    </th>
    <th className="p-3 text-left text-sm font-medium text-muted-foreground" style={{width: '20%'}}>
      Status
    </th>
    <th className="p-3 text-left text-sm font-medium text-muted-foreground" style={{width: '20%'}}>
      Date
    </th>
    <th className="p-3 text-center text-sm font-medium text-muted-foreground" style={{width: '20%'}}>
      Responses
    </th>
    <th className="p-3 text-center text-sm font-medium text-muted-foreground" style={{width: '10%'}}>

      View
    </th>
  </tr>
</thead>
            <tbody>
              {filteredData.length ? (
                filteredData.map((row) => (
                  <tr 
                    key={row.appointment_id}
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onRowClick?.(row)}
                  >
                    {/* Overview Column */}
                    <td className="p-3" style={{width: '35%'}}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-sm text-primary truncate">
                            {row.service?.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded flex-shrink-0">
                            #{row.appointment_id.slice(0, 8)}
                          </div>
                        </div>
                        <div className="font-medium text-sm text-foreground truncate">

                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="p-3" style={{width: '20%'}}>
                      <Badge variant={getStatusVariant(row.status)} className="text-xs">
                        {toProperCase(row.status)}
                      </Badge>
                    </td>

                    {/* Date Column */}
                    <td className="p-3" style={{width: '25%'}}>
                      <div className="space-y-1 text-sm">
                        <div>
                          {new Date(row.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>

                    {/* Responses Column */}
                    <td className="p-3 text-center" style={{width: '15%'}}>
                      <div className="text-sm space-y-1">
                        <div className="font-medium">
                          {row.interest_summary?.total_interests || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.interest_summary?.active_interests || 0} active
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="p-3 text-center" style={{width: '5%'}}>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick?.(row);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple Summary */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div>
            Showing {filteredData.length} appointment{filteredData.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <span>{data.filter(a => a.status === 'pending').length} pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{data.filter(a => a.status === 'converted').length} completed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}