// src/components/customer-workspace/customer/appointments/AppointmentCard.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

export const AppointmentCard = ({ appointment }) => {
  const router = useRouter();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{appointment.title}</h3>
            <p className="text-sm text-muted-foreground">{appointment.service?.name}</p>
            <div className="text-sm text-muted-foreground">
              Status: <Badge variant="outline">{appointment.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Created: {new Date(appointment.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="space-x-2">
            <Button 
              size="sm"
              onClick={() => router.push(`/customer/appointments/${appointment.appointment_id}/interests`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Responses
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};