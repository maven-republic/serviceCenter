// src/components/customer-workspace/customer/appointments/AppointmentsTable.jsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

// Import the updated minimal components
import { DataTable } from './data-table';
import { createColumns } from './columns';
import { AppointmentDetailsSheet } from './AppointmentDetailsSheet';

export const AppointmentsTable = ({ appointments }) => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewAppointment = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsDrawerOpen(true);
  };

  const handleRowClick = (appointment) => {
    handleViewAppointment(appointment.appointment_id);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedAppointmentId(null), 200);
  };

  const selectedAppointment = appointments.find(
    apt => apt.appointment_id === selectedAppointmentId
  );

  // Create columns with the view appointment handler
  const columns = createColumns(handleViewAppointment);

  return (
    <>
      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5" />
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

      {/* Appointment Details Sheet */}
      <AppointmentDetailsSheet
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        appointment={selectedAppointment}
      />
    </>
  );
};