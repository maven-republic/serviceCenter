// src/components/customer-workspace/customer/appointments/timeline/AppointmentsTimeline.jsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

import { TimelineSection } from './TimelineSection';
import { AppointmentDetailsSheet } from '../shared/AppointmentDetailsSheet';
import { groupAppointmentsByTimeline } from './timeline-utils';
import { TIMELINE_SECTIONS } from './timeline-constants';
import { ANIMATION_DURATIONS } from '../shared/appointment-constants';

/**
 * Main Timeline View Container
 * Displays appointments in chronological order with time-based grouping
 */
export const AppointmentsTimeline = ({ appointments }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Group appointments by timeline section
  const groupedAppointments = groupAppointmentsByTimeline(appointments);

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsSheetOpen(true);
  };

  // Handle sheet close
  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setSelectedAppointment(null);
    }, ANIMATION_DURATIONS.SHEET_CLOSE);
  };

  // Order of sections to display
  const sectionOrder = [
    TIMELINE_SECTIONS.OVERDUE,
    TIMELINE_SECTIONS.TODAY,
    TIMELINE_SECTIONS.TOMORROW,
    TIMELINE_SECTIONS.THIS_WEEK,
    TIMELINE_SECTIONS.NEXT_WEEK,
    TIMELINE_SECTIONS.LATER,
    TIMELINE_SECTIONS.UNSCHEDULED,
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Your Appointments</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {sectionOrder.map((sectionKey) => (
              <TimelineSection
                key={sectionKey}
                sectionKey={sectionKey}
                appointments={groupedAppointments[sectionKey]}
                onAppointmentClick={handleAppointmentClick}
              />
            ))}

            {/* Empty State */}
            {appointments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No appointments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Sheet */}
      <AppointmentDetailsSheet
        isOpen={isSheetOpen}
        onOpenChange={handleSheetClose}
        appointment={selectedAppointment}
      />
    </>
  );
};