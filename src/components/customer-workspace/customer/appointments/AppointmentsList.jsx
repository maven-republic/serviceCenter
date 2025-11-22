// src/components/customer-workspace/customer/appointments/AppointmentsList.jsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table2, Clock } from 'lucide-react';

import { AppointmentsTableView } from './views/AppointmentsTableView';
import { AppointmentsTimelineView } from './views/AppointmentsTimelineView';
import { AppointmentsTableSkeleton } from './table/AppointmentsTableSkeleton';
import { AppointmentsEmpty } from './shared/AppointmentsEmpty';
import { AppointmentsError } from './shared/AppointmentsError';

/**
 * Main Appointments List Controller
 * Manages view switching and data flow
 */
export const AppointmentsList = ({ 
  appointments, 
  isLoading, 
  error,
  onRetry 
}) => {
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'timeline'

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return <AppointmentsTableSkeleton rowCount={5} />;
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return <AppointmentsError error={error} onRetry={onRetry} />;
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  if (!appointments || appointments.length === 0) {
    return <AppointmentsEmpty />;
  }

  // ============================================
  // VIEW TOGGLE HANDLER
  // ============================================
  const handleViewChange = (view) => {
    setCurrentView(view);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Switched to ${view} view`);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-4">
      
      {/* View Toggle Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={currentView === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('table')}
            className="gap-2"
          >
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </Button>

          <Button
            variant={currentView === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('timeline')}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Current View */}
      {currentView === 'table' ? (
        <AppointmentsTableView appointments={appointments} />
      ) : (
        <AppointmentsTimelineView appointments={appointments} />
      )}
    </div>
  );
};