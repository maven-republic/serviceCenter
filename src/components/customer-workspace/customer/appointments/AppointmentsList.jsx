// src/components/customer-workspace/customer/appointments/AppointmentsList.jsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { AppointmentsError } from './AppointmentsError';
import { AppointmentsEmpty } from './AppointmentsEmpty';
import { AppointmentsTable } from './AppointmentsTable';
import { AppointmentsTableSkeleton } from './AppointmentsTableSkeleton';
import { LiveUpdates } from './LiveUpdates';

export const AppointmentsList = ({ 
  appointments, 
  loading, 
  error, 
  onRetry,
  lastUpdated 
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [minimumLoadingTime, setMinimumLoadingTime] = useState(false); // NEW: Ensure skeleton shows

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔥 NEW: Minimum loading time effect to ensure skeleton visibility
  useEffect(() => {
    if (loading && !appointments) {
      console.log('🎬 Starting minimum loading timer...');
      setMinimumLoadingTime(true);
      
      // Ensure skeleton shows for at least 800ms
      const timer = setTimeout(() => {
        console.log('⏰ Minimum loading time completed');
        setMinimumLoadingTime(false);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setMinimumLoadingTime(false);
    }
  }, [loading, appointments]);

  // Enhanced retry handler that shows local loading state
  const handleRefresh = useCallback(async () => {
    if (!onRetry || loading || localLoading) return;
    
    setLocalLoading(true);
    try {
      await onRetry();
    } finally {
      // Add small delay to prevent flashing
      setTimeout(() => setLocalLoading(false), 500);
    }
  }, [onRetry, loading, localLoading]);

  // 🔥 UPDATED: Show skeleton if loading OR during minimum time
  const shouldShowSkeleton = (loading && !appointments) || minimumLoadingTime;

  console.log('🧪 AppointmentsList Debug:', {
    loading,
    hasAppointments: !!appointments,
    appointmentsLength: appointments?.length,
    isMobile,
    error: !!error,
    minimumLoadingTime,
    shouldShowSkeleton
  });

  // Error Display - Mobile Optimized
  if (error) {
    return (
      <div className="space-y-4">
        <LiveUpdates 
          onRefresh={handleRefresh}
          isLoading={loading || localLoading}
          lastUpdated={lastUpdated}
          autoRefreshInterval={60000}
        />
        <AppointmentsError error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  // 🔥 UPDATED: Use shouldShowSkeleton instead of just loading
  if (shouldShowSkeleton) {
    console.log('🖼️ SHOWING SKELETON - isMobile:', isMobile, 'minimumTime:', minimumLoadingTime);
    return (
      <div className="space-y-4">
        <LiveUpdates 
          onRefresh={handleRefresh}
          isLoading={true}
          lastUpdated={lastUpdated}
          autoRefreshInterval={30000}
        />
        <AppointmentsTableSkeleton 
          rowCount={isMobile ? 3 : 5} 
          isMobile={isMobile}
        />
      </div>
    );
  }

  // Empty State - Mobile Optimized
  if (!appointments || appointments.length === 0) {
    return (
      <div className="space-y-4">
        <LiveUpdates 
          onRefresh={handleRefresh}
          isLoading={loading || localLoading}
          lastUpdated={lastUpdated}
          autoRefreshInterval={45000}
        />
        <AppointmentsEmpty />
      </div>
    );
  }

  // Appointments Table with Live Updates - Mobile Responsive
  return (
    <div className="space-y-4">
      {/* Live Updates Component - Mobile Optimized */}
      <LiveUpdates 
        onRefresh={handleRefresh}
        isLoading={loading || localLoading}
        lastUpdated={lastUpdated}
        autoRefreshInterval={30000}
        enableNotifications={true}
      />

      {/* Mobile Loading Overlay */}
      {(loading || localLoading) && appointments && (
        <div className="relative">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-sm">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">
                {isMobile ? 'Updating...' : 'Updating appointments...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Table - Now Mobile Responsive */}
      <div className={loading || localLoading ? 'opacity-75 pointer-events-none' : ''}>
        <AppointmentsTable appointments={appointments} />
      </div>

      {/* Mobile-specific quick stats summary */}
      {isMobile && appointments.length > 0 && (
        <div className="mt-4 p-4 bg-muted/20 rounded-lg border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quick Summary:</span>
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">
                {appointments.length} total
              </span>
              <span className="text-yellow-600">
                {appointments.filter(apt => apt.status === 'pending').length} pending
              </span>
              <span className="text-green-600">
                {appointments.filter(apt => apt.status === 'converted').length} completed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};