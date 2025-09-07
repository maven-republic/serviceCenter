// src/components/customer-workspace/customer/appointments/AppointmentsHeader.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar } from 'lucide-react';

export const AppointmentsHeader = ({ customerInformation }) => {
  const router = useRouter();

  // Extract customer name safely
  const customerName = customerInformation?.first_name || customerInformation?.account?.first_name;

  return (
    <div className="space-y-4 mb-6">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {customerName ? `${customerName}'s Appointments` : 'Your Appointments'}
          </h1>
          <p className="text-muted-foreground">
            Manage your service requests and view responses from professionals
          </p>
        </div>
        
        <Button 
          onClick={() => router.push('/customer/workspace')}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Simple Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/customer/explore')}
        >
          <Users className="h-4 w-4 mr-2" />
          Find Professionals
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/customer/workspace')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Browse Services
        </Button>
      </div>
    </div>
  );
};
