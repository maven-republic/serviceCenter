// src/components/customer-workspace/customer/appointments/AppointmentsHeader.jsx
"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const AppointmentsHeader = ({ customerInformation, appointmentsCount = 0 }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      {customerInformation && (
        <Alert className="border-primary/20 bg-primary/5">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            Welcome back, {customerInformation.first_name}! Manage your service appointments and bookings below.
          </AlertDescription>
        </Alert>
      )}


    </div>
  );
};