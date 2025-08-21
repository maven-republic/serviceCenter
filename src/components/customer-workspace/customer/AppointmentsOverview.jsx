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

  // Show mobile-optimized loading state while checking authentication
  if (authLoading) {
    return (
      <div className="w-full">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="space-y-6">
            {/* Mobile-friendly loading header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-64 mt-2 animate-pulse"></div>
              </div>
              <div className="h-11 bg-muted rounded w-full sm:w-32 animate-pulse"></div>
            </div>

            {/* Mobile stats grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-muted rounded-lg p-3 sm:p-4 animate-pulse">
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded-lg mx-auto mb-2"></div>
                  <div className="h-6 bg-muted-foreground/20 rounded w-8 mx-auto mb-1"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Loading message */}
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Checking authentication...</p>
              <p className="text-xs text-muted-foreground mt-2">
                This should only take a moment
              </p>
            </div>
          </div>
        </div>
      </div>
    );
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