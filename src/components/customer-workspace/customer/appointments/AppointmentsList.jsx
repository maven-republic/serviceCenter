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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced retry handler
  const handleRefresh = useCallback(async () => {
    if (!onRetry || loading || localLoading) return;
    
    setLocalLoading(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setLocalLoading(false), 300);
    }
  }, [onRetry, loading, localLoading]);

  // Error Display
  if (error) {
    return (
      <div className="space-y-4">
        <LiveUpdates 
          onRefresh={handleRefresh}
          isLoading={loading || localLoading}
          lastUpdated={lastUpdated}
        />
        <AppointmentsError error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  // Loading State
  if (loading && !appointments) {
    return (
      <div className="space-y-4">
        <LiveUpdates 
          onRefresh={handleRefresh}
          isLoading={true}
          lastUpdated={lastUpdated}
        />
        <AppointmentsTableSkeleton 
          rowCount={isMobile ? 3 : 5} 
          isMobile={isMobile}
        />
      </div>
    );
  }

  // Empty State
  if (!appointments || appointments.length === 0) {
    return (
      <div className="space-y-4">
        <LiveUpdates 
          onRefresh={handleRefresh}
          isLoading={loading || localLoading}
          lastUpdated={lastUpdated}
        />
        <AppointmentsEmpty />
      </div>
    );
  }

  // Main Content with Simple Loading Overlay
  return (
    <div className="space-y-4">
      {/* Live Updates */}
      <LiveUpdates 
        onRefresh={handleRefresh}
        isLoading={loading || localLoading}
        lastUpdated={lastUpdated}
      />

      {/* Simple Loading Overlay */}
      <div className="relative">
        {(loading || localLoading) && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Updating...</span>
            </div>
          </div>
        )}

        {/* Appointments Table */}
        <div className={loading || localLoading ? 'opacity-60' : ''}>
          <AppointmentsTable appointments={appointments} />
        </div>
      </div>

      {/* Simple Summary for Mobile */}
      {isMobile && appointments.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {appointments.length} total • {appointments.filter(apt => apt.status === 'pending').length} pending
            </span>
            <span>
              {appointments.filter(apt => apt.status === 'converted').length} completed
            </span>
          </div>
        </div>
      )}
    </div>
  );
};