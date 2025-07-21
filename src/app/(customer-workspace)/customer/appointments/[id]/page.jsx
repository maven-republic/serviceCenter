// src/app/(customer-workspace)/customer/appointments/[id]/page.jsx
"use client";

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import CustomerAppointmentDashboard from '@/components/customer-workspace/interests/CustomerAppointmentDashboard';

export default function AppointmentDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id: appointmentId } = resolvedParams;

  return (
    <div className="space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </Button>
        
        <Button
          onClick={() => router.push(`/customer/appointments/${appointmentId}/interests`)}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          View Responses
        </Button>
      </div>

      {/* Main appointment dashboard */}
      <CustomerAppointmentDashboard appointmentId={appointmentId} />
    </div>
  );
}