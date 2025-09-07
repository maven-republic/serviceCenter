// src/components/customer-workspace/customer/appointments/columns.jsx
"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Clock, MessageSquare } from 'lucide-react';

// Simplified status variant mapping using shadcn's standard Badge variants
const getStatusVariant = (status) => {
  const variants = {
    'pending': 'secondary',
    'interested': 'default', 
    'competing': 'outline',
    'evaluating': 'secondary',
    'quoted': 'default',
    'converted': 'default',
    'cancelled': 'destructive',
  };
  return variants[status] || 'outline';
};

// Simplified utility functions
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

export const createColumns = (onViewAppointment) => [
  {
    accessorKey: "service",
    header: "Service",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const serviceA = rowA.original.service?.name || '';
      const serviceB = rowB.original.service?.name || '';
      return serviceA.localeCompare(serviceB);
    },
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">
            {appointment.service?.name || 'Service Request'}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            #{appointment.appointment_id.slice(0, 8)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Request",
    enableSorting: false,
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="max-w-[300px] space-y-1">
          <div className="font-medium text-sm truncate">
            {appointment.title || 'Untitled Request'}
          </div>
          {appointment.customer_message && (
            <div className="text-xs text-muted-foreground truncate">
              {appointment.customer_message.length > 80 
                ? `${appointment.customer_message.substring(0, 80)}...` 
                : appointment.customer_message
              }
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ getValue }) => {
      const status = getValue();
      return (
        <Badge variant={getStatusVariant(status)} className="text-xs">
          {status.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue("created_at"));
      const dateB = new Date(rowB.getValue("created_at"));
      return dateA.getTime() - dateB.getTime();
    },
    cell: ({ getValue }) => {
      const dateString = getValue();
      return (
        <div className="space-y-1 text-sm">
          <div>{formatDate(dateString)}</div>
          <div className="text-xs text-muted-foreground">
            {formatTime(dateString)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "interest_summary",
    header: "Responses",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const totalA = rowA.original.interest_summary?.total_interests || 0;
      const totalB = rowB.original.interest_summary?.total_interests || 0;
      return totalA - totalB;
    },
    cell: ({ row }) => {
      const interestSummary = row.original.interest_summary;
      return (
        <div className="text-sm space-y-1">
          <div className="font-medium">
            {interestSummary?.total_interests || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            {interestSummary?.active_interests || 0} active
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <Button 
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onViewAppointment(appointment.appointment_id);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      );
    },
  },
];