// src/app/(customer-workspace)/customer/appointments/[id]/interests/page.jsx
"use client";

import { use } from 'react';
import CustomerAppointmentDashboard from '@/components/customer-workspace/interests/CustomerAppointmentDashboard';

export default function AppointmentInterestsPage({ params }) {
  const resolvedParams = use(params);
  const { id: appointmentId } = resolvedParams;

  return (
    <div className="space-y-6">
      <CustomerAppointmentDashboard appointmentId={appointmentId} />
    </div>
  );
}