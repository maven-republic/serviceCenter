// src/components/customer-workspace/customer/AppointmentsOverview.jsx
"use client";

import { RefreshCw } from 'lucide-react';
import { useCustomerAuth } from '@/primitives/customer/useCustomerAuth';
import { useAppointments } from '@/primitives/customer/useAppointments';
import { Authentication } from './auth/Authentication';
import { AppointmentsHeader } from './appointments/AppointmentsHeader';
import { AppointmentsList } from './appointments/AppointmentsList';

export const AppointmentsOverview = () => {
  const { 
    loading: authLoading, 
    hasValidSession, 
    sessionError, 
    customerInformation,
    refreshAuth 
  } = useCustomerAuth();

  const { 
    appointments, 
    loading: appointmentsLoading, 
    error: appointmentsError,
    refetch: refetchAppointments 
  } = useAppointments(customerInformation?.customer_id);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login required if no valid session
  if (!hasValidSession) {
    return (
      <Authentication 
        sessionError={sessionError}
        onRetry={refreshAuth}
        onRefreshAuth={refreshAuth}
      />
    );
  }

  // Valid session - show appointments
  return (
    <div className="space-y-6">
      {/* <AppointmentsHeader customerInformation={customerInformation} /> */}
      
      <AppointmentsList 
        appointments={appointments}
        loading={appointmentsLoading}
        error={appointmentsError}
        onRetry={refetchAppointments}
      />
    </div>
  );
};