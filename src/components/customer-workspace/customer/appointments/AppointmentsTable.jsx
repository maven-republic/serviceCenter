// src/components/customer-workspace/customer/appointments/AppointmentsTable.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Calendar, Clock, MessageSquare, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const getStatusVariant = (status) => {
  const variants = {
    'pending': 'default',
    'interested': 'secondary', 
    'competing': 'outline',
    'evaluating': 'secondary',
    'quoted': 'default',
    'converted': 'default',
    'cancelled': 'destructive',
  };
  return variants[status] || 'outline';
};

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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const AppointmentsTable = ({ appointments }) => {
  const router = useRouter();

  return (
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
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-semibold text-muted-foreground">Service</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Request Details</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Created</TableHead>
                <TableHead className="font-semibold text-muted-foreground text-center">Responses</TableHead>
                <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment, index) => (
                <TableRow 
                  key={appointment.appointment_id} 
                  className={cn(
                    "group cursor-pointer transition-colors hover:bg-muted/30",
                    "border-border/50"
                  )}
                  onClick={() => router.push(`/customer/appointments/${appointment.appointment_id}/interests`)}
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="font-medium text-sm text-foreground">
                        {appointment.service?.name || 'Service Request'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">
                          #{appointment.appointment_id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4 max-w-[300px]">
                    <div className="flex flex-col gap-1.5">
                      <div className="font-medium text-sm text-foreground line-clamp-1">
                        {appointment.title || 'Untitled Request'}
                      </div>
                      {appointment.customer_message && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {truncateText(appointment.customer_message, 120)}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <Badge 
                      className={cn(
                        "border font-medium capitalize text-xs px-2.5 py-1",
                        getStatusColor(appointment.status)
                      )}
                      variant="outline"
                    >
                      {appointment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(appointment.created_at)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(appointment.created_at)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4 text-center">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-semibold text-foreground">
                        {appointment.interest_summary?.total_interests || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.interest_summary?.active_interests || 0} active
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4 text-right">
                    <Button 
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 text-primary hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/customer/appointments/${appointment.appointment_id}/interests`);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Enhanced Footer */}
        <div className="border-t border-border bg-muted/20 px-6 py-4 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-muted-foreground">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};