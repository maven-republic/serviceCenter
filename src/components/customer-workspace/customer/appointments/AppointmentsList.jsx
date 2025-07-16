// src/components/customer-workspace/customer/appointments/AppointmentsList.jsx
"use client";

import { RefreshCw } from 'lucide-react';
import { AppointmentsError } from './AppointmentsError';
import { AppointmentsEmpty } from './AppointmentsEmpty';
import { AppointmentsTable } from './AppointmentsTable';

export const AppointmentsList = ({ 
  appointments, 
  loading, 
  error, 
  onRetry 
}) => {
  // Error Display
  if (error) {
    return <AppointmentsError error={error} onRetry={onRetry} />;
  }

  // Loading State
  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  // Empty State
  if (!appointments || appointments.length === 0) {
    return <AppointmentsEmpty />;
  }

  // Appointments Table
  return (
    <div className="space-y-4">
      <AppointmentsTable appointments={appointments} />
    </div>
  );
};