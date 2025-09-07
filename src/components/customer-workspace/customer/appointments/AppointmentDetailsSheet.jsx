// src/components/customer-workspace/customer/appointments/AppointmentDetailsSheet.jsx
"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Calendar, X, Clock, MessageSquare, User } from 'lucide-react';
import CustomerAppointmentDashboard from '../../interests/CustomerAppointmentDashboard';

// Utility function to convert status to proper case
const toProperCase = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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

// Appointment details content component
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
     

      {/* Customer Appointment Dashboard Integration */}
      <div className="border-t pt-6">
        <CustomerAppointmentDashboard 
          appointmentId={appointment.appointment_id}
        />
      </div>
    </div>
  );
};

export const AppointmentDetailsSheet = ({ 
  isOpen, 
  onOpenChange, 
  appointment 
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex-1 min-w-0">
            <SheetTitle className="line-clamp-2">
              {appointment?.title || 'Appointment Details'}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 mt-2">
              <span>{appointment?.service?.name || 'Service Request'}</span>
              {appointment && (
                <>
                  <span>•</span>
                  <Badge variant={getStatusVariant(appointment.status)}>
                    {toProperCase(appointment.status)}
                  </Badge>
                </>
              )}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <AppointmentDetailsContent appointment={appointment} />
        </div>
      </SheetContent>
    </Sheet>
  );
};