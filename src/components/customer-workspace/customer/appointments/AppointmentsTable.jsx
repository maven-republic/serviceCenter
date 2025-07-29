// src/components/customer-workspace/customer/appointments/AppointmentsTable.jsx
"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import the new components
import { DataTable } from './data-table';
import { createColumns } from './columns';
import CustomerAppointmentDashboard from '../../interests/CustomerAppointmentDashboard';

const getStatusColor = (status) => {
  const colors = {
    'pending': 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950 dark:border-yellow-800',
    'interested': 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800', 
    'competing': 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950 dark:border-purple-800',
    'evaluating': 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950 dark:border-orange-800',
    'quoted': 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950 dark:border-green-800',
    'converted': 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800',
    'cancelled': 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800',
  };
  return colors[status] || 'text-muted-foreground bg-muted border-border';
};

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
    setSelectedAppointmentId(null);
  };

  const selectedAppointment = appointments.find(
    apt => apt.appointment_id === selectedAppointmentId
  );

  // Create columns with the view appointment handler
  const columns = createColumns(handleViewAppointment);

  return (
    <>
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your Appointments</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable 
            columns={columns}
            data={appointments}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {/* Appointment Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader className="pb-6 border-b">
            <div className="space-y-1">
              <SheetTitle className="text-xl">
                {selectedAppointment?.title || 'Appointment Details'}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <span>{selectedAppointment?.service?.name || 'Service Request'}</span>
                {selectedAppointment && (
                  <>
                    <span>•</span>
                    <Badge 
                      className={cn(
                        "border font-medium capitalize text-xs px-2 py-0.5",
                        getStatusColor(selectedAppointment.status)
                      )}
                      variant="outline"
                    >
                      {selectedAppointment.status.replace('_', ' ')}
                    </Badge>
                  </>
                )}
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* Render the appointment dashboard */}
          <div className="py-6">
            {selectedAppointmentId && (
              <CustomerAppointmentDashboard 
                appointmentId={selectedAppointmentId}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};