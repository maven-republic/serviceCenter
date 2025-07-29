// src/components/customer-workspace/customer/appointments/AppointmentsHeader.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

export const AppointmentsHeader = ({ customerInformation }) => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your service requests and professional responses
          </p>
        </div>
        <Button onClick={() => router.push('/customer/workspace')}>
          Create New Appointment
        </Button>
      </div>

      
    </div>
  );
};