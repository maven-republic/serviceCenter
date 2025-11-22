// src/components/customer-workspace/customer/appointments/AppointmentsEmpty.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export const AppointmentsEmpty = () => {
  const router = useRouter();

  return (
    <Alert>
      <Calendar className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          No appointments found. Create your first appointment to get started.
        </span>
        <Button 
          onClick={() => router.push('/customer/workspace')}
          variant="outline" 
          size="sm"
          className="ml-4"
        >
          Create Appointment
        </Button>
      </AlertDescription>
    </Alert>
  );
};