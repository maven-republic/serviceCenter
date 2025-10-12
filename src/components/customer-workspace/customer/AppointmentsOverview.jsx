// src/components/customer-workspace/customer/AppointmentsOverview.jsx
"use client";

import { RefreshCw } from 'lucide-react';
import { useCustomerAuth } from '@/primitives/customer/useCustomerAuth';
import { useAppointments } from '@/primitives/customer/useAppointments';
import { Authentication } from './auth/Authentication';
import { AppointmentsHeader } from './appointments/AppointmentsHeader';
import { AppointmentsList } from './appointments/AppointmentsList';
import { AppointmentsOverviewSkeleton } from './AppointmentsOverviewSkeleton';

export const AppointmentsOverview = () => {
  const { 
    loading: authLoading, 
    hasValidSession, 
    sessionError, 
    customerInformation,
    refreshAuth 
  } = useCustomerAuth();

  // FIX: Use the correct property name for customer ID
  const customerId = customerInformation?.id || customerInformation?.customer_id;
  
  const { 
    appointments, 
    loading: appointmentsLoading, 
    error: appointmentsError,
    refetch: refetchAppointments 
  } = useAppointments(customerId);

  // Debug logging to help troubleshoot
  console.log('🔍 AppointmentsOverview Debug:', {
    authLoading,
    hasValidSession,
    sessionError,
    customerInformation,
    customerId,
    appointmentsLoading,
    appointmentsCount: appointments?.length,
    appointmentsError
  });

  // Show skeleton loader while checking authentication
  if (authLoading) {
    return <AppointmentsOverviewSkeleton />;
  }

  // Show mobile-optimized login required if no valid session
  if (!hasValidSession) {
    console.log('❌ No valid session, showing authentication form');
    return (
      <div className="w-full">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <Authentication 
            sessionError={sessionError}
            onRetry={refreshAuth}
            onRefreshAuth={refreshAuth}
          />
        </div>
      </div>
    );
  }

  // Check if we have customer information
  if (!customerInformation) {
    console.log('❌ No customer information found');
    return (
      <div className="w-full">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <Authentication 
            sessionError="Customer profile not found. Please contact support."
            onRetry={refreshAuth}
            onRefreshAuth={refreshAuth}
          />
        </div>
      </div>
    );
  }

  // Valid session and customer info - show mobile-responsive appointments
  console.log('✅ Valid session and customer info, showing appointments');
  
  return (
    <div className="w-full">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="space-y-6">
          {/* <AppointmentsHeader customerInformation={customerInformation} /> */}
          
          <AppointmentsList 
            appointments={appointments}
            loading={appointmentsLoading}
            error={appointmentsError}
            onRetry={refetchAppointments}
            lastUpdated={new Date()} // You might want to track this properly
          />
        </div>
      </div>
    </div>
  );
};