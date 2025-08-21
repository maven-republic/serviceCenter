// src/components/customer-workspace/customer/appointments/AppointmentsTable.jsx
"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Calendar, X, Clock, MessageSquare, User, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import the new responsive components
import { DataTable } from './data-table';
import { createColumns } from './columns';
import CustomerAppointmentDashboard from '../../interests/CustomerAppointmentDashboard';

const getStatusColor = (status) => {
  const colors = {
    'pending': 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950 dark:border-yellow-800',
    'interested': 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800', 
    'competing': 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950 dark:border-purple-800',
    'evaluating': 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950 dark:border-orange-800',
    'quoted': 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950 dark:border-green-800',
    'converted': 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800',
    'cancelled': 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800',
  };
  return colors[status] || 'text-muted-foreground bg-muted border-border';
};

// Mobile-optimized appointment details component
const AppointmentDetailsContent = ({ appointment }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!appointment) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading appointment details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Info Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status & ID Card */}
        <Card className="bg-muted/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge 
                  className={cn(
                    "text-xs px-2 py-1 font-medium capitalize",
                    getStatusColor(appointment.status)
                  )}
                  variant="outline"
                >
                  {appointment.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">ID</span>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  #{appointment.appointment_id.slice(0, 12)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Card */}
        <Card className="bg-muted/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(appointment.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(appointment.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Info Card */}
        <Card className="sm:col-span-2 bg-primary/5">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Service Requested</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {appointment.service?.name || 'General Service Request'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Details */}
      {appointment.customer_message && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {appointment.customer_message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Professional Responses</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {appointment.interest_summary?.total_interests || 0}
              </div>
              <div className="text-xs text-blue-600">Total Responses</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {appointment.interest_summary?.active_interests || 0}
              </div>
              <div className="text-xs text-green-600">Active Quotes</div>
            </div>
          </div>
          
          {/* Placeholder for response details */}
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">
              {appointment.interest_summary?.total_interests > 0 
                ? 'Professional responses and quotes will appear below'
                : 'No responses yet. Professionals will be notified about your request.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CustomerAppointmentDashboard Integration */}
      <div className="border-t pt-6">
        <CustomerAppointmentDashboard 
          appointmentId={appointment.appointment_id}
        />
      </div>
    </div>
  );
};

export const AppointmentsTable = ({ appointments }) => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewAppointment = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsDrawerOpen(true);
  };

  const handleRowClick = (appointment) => {
    handleViewAppointment(appointment.appointment_id);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Small delay to prevent flash
    setTimeout(() => setSelectedAppointmentId(null), 200);
  };

  const selectedAppointment = appointments.find(
    apt => apt.appointment_id === selectedAppointmentId
  );

  // Create columns with the view appointment handler
  const columns = createColumns(handleViewAppointment);

  return (
    <>
      {/* Main Table Card */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your Appointments</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable 
            columns={columns}
            data={appointments}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {/* Mobile-Optimized Appointment Details Sheet */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-0 customer-workspace">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-background border-b z-10">
            <SheetHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <SheetTitle className="text-lg sm:text-xl text-left line-clamp-2">
                    {selectedAppointment?.title || 'Appointment Details'}
                  </SheetTitle>
                  <SheetDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-left">
                    <span className="text-sm">
                      {selectedAppointment?.service?.name || 'Service Request'}
                    </span>
                    {selectedAppointment && (
                      <>
                        <span className="hidden sm:inline text-muted-foreground">•</span>
                        <Badge 
                          className={cn(
                            "text-xs px-2 py-0.5 font-medium capitalize w-fit",
                            getStatusColor(selectedAppointment.status)
                          )}
                          variant="outline"
                        >
                          {selectedAppointment.status.replace('_', ' ')}
                        </Badge>
                      </>
                    )}
                  </SheetDescription>
                </div>
                
                {/* Mobile-friendly close button */}
                <SheetClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 sm:p-6">
            <AppointmentDetailsContent appointment={selectedAppointment} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};