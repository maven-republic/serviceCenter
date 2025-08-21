// src/components/customer-workspace/customer/appointments/AppointmentsHeader.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp,
  Loader2
} from 'lucide-react';

export const AppointmentsHeader = ({ customerInformation }) => {
  const router = useRouter();

  // Extract customer name safely
  const customerName = customerInformation?.first_name || customerInformation?.account?.first_name;

  return (
    <div className="space-y-4 mb-6">
      {/* Welcome Message - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {customerName ? `${customerName}'s Appointments` : 'Your Appointments'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your service requests and view responses from professionals
          </p>
        </div>
        
        <Button 
          onClick={() => router.push('/customer/workspace')}
          className="w-full sm:w-auto gap-2 h-11 touch-target btn-responsive"
        >
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </Button>
      </div>


      {/* Quick Action Buttons - Mobile Optimized */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 h-9 touch-target btn-responsive-sm"
          onClick={() => router.push('/customer/explore')}
        >
          <Users className="h-3 w-3" />
          <span className="hidden sm:inline">Find</span> Professionals
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 h-9 touch-target btn-responsive-sm"
          onClick={() => router.push('/customer/workspace')}
        >
          <Calendar className="h-3 w-3" />
          <span className="hidden sm:inline">Browse</span> Services
        </Button>
      </div>

     
    </div>
  );
};