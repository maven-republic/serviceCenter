// src/components/customer-workspace/customer/appointments/AppointmentsList.jsx
"use client";

import { useState, useCallback } from 'react';
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
  lastUpdated // Add this prop to track when data was last fetched
}) => {
  const [localLoading, setLocalLoading] = useState(false);

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

  // Error Display
  if (error) {
    return (
      <div className="space-y-4">
        <LiveUpdates 
          onRefresh={handleRefresh}
          isLoading={loading || localLoading}
          lastUpdated={lastUpdated}
          autoRefreshInterval={60000} // Slower refresh when there's an error
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
          autoRefreshInterval={30000}
        />
        <AppointmentsTableSkeleton rowCount={5} />
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
          autoRefreshInterval={45000} // Slower refresh when empty
        />
        <AppointmentsEmpty />
      </div>
    );
  }

  // Appointments Table with Live Updates
  return (
    <div className="space-y-4">
      {/* Live Updates Component */}
      <LiveUpdates 
        onRefresh={handleRefresh}
        isLoading={loading || localLoading}
        lastUpdated={lastUpdated}
        autoRefreshInterval={30000} // 30 seconds for active data
        enableNotifications={true}
      />

      {/* Loading Overlay */}
      {(loading || localLoading) && appointments && (
        <div className="relative">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Updating...</span>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Table */}
      <div className={loading || localLoading ? 'opacity-75 pointer-events-none' : ''}>
        <AppointmentsTable appointments={appointments} />
      </div>
    </div>
  );
};