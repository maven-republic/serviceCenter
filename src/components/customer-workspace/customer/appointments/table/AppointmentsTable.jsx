// src/components/customer-workspace/customer/appointments/table/AppointmentsTable.jsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

import { DataTable } from './data-table';
import { createColumns } from './columns';
import { AppointmentDetailsSheet } from '../shared/AppointmentDetailsSheet';
import { isValidAppointment } from '../shared/appointment-utils';
import { ANIMATION_DURATIONS } from '../shared/appointment-constants';

/**
 * Main wrapper component for appointments table
 * Manages selected appointment state and sheet visibility
 */
export const AppointmentsTable = ({ appointments }) => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // ============================================
  // VALIDATION & DEBUG (Development only)
  // ============================================
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('📋 AppointmentsTable - Data Validation');
      console.log('Total appointments:', appointments.length);
      console.log('Appointment IDs:', appointments.map(a => a.appointment_id));
      
      // Validate all appointments
      const invalidAppointments = appointments.filter(a => !isValidAppointment(a));
      if (invalidAppointments.length > 0) {
        console.warn('⚠️ Invalid appointments found:', invalidAppointments);
      } else {
        console.log('✅ All appointments valid');
      }
      
      // Log first appointment structure
      if (appointments[0]) {
        console.log('First appointment structure:', {
          id: appointments[0].appointment_id,
          service: appointments[0].service?.name,
          status: appointments[0].status,
          professional_id: appointments[0].professional_id,
          interests_count: appointments[0].interests?.length || 0,
          has_booking: !!appointments[0].booking,
        });
      }
      
      console.groupEnd();
    }
  }, [appointments]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handles viewing an appointment (from action button)
   * @param {string} appointmentId - Appointment ID
   */
  const handleViewAppointment = (appointmentId) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👁️ View appointment:', appointmentId);
    }

    if (!appointmentId) {
      console.error('❌ Cannot view appointment: Invalid ID');
      return;
    }

    setSelectedAppointmentId(appointmentId);
    setIsSheetOpen(true);
  };

  /**
   * Handles row click (from table row)
   * @param {Object} appointment - Full appointment object
   */
  const handleRowClick = (appointment) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Row clicked:', {
        id: appointment.appointment_id,
        service: appointment.service?.name,
      });
    }

    if (!appointment.appointment_id) {
      console.error('❌ Cannot open details: Missing appointment_id', appointment);
      return;
    }

    handleViewAppointment(appointment.appointment_id);
  };

  /**
   * Handles sheet close
   * Clears selected appointment after animation completes
   */
  const handleSheetClose = () => {
    setIsSheetOpen(false);
    
    // Clear selected ID after close animation
    setTimeout(() => {
      setSelectedAppointmentId(null);
    }, ANIMATION_DURATIONS.SHEET_CLOSE);
  };

  // ============================================
  // DERIVED STATE
  // ============================================

  // Find selected appointment from data
  const selectedAppointment = selectedAppointmentId 
    ? appointments.find(apt => apt.appointment_id === selectedAppointmentId)
    : null;

  // Debug selected appointment changes
  useEffect(() => {
    if (selectedAppointmentId && process.env.NODE_ENV === 'development') {
      console.log('🔍 Selected appointment changed:', {
        id: selectedAppointmentId,
        found: !!selectedAppointment,
        service: selectedAppointment?.service?.name,
        status: selectedAppointment?.status,
      });
      
      if (!selectedAppointment) {
        console.warn('⚠️ Selected appointment not found in data');
      }
    }
  }, [selectedAppointmentId, selectedAppointment]);

  // Create columns with view handler
  const columns = createColumns(handleViewAppointment);

  // ============================================
  // RENDER
  // ============================================

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
          <DataTable 
            columns={columns}
            data={appointments}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {/* Appointment Details Slide-out Sheet */}
      <AppointmentDetailsSheet
        isOpen={isSheetOpen}
        onOpenChange={handleSheetClose}
        appointment={selectedAppointment}
      />
    </>
  );
};