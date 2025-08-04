// src/components/customer-workspace/customer/appointments/columns.jsx
"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Utility functions (moved from AppointmentsTable)
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
      );
    },
  },
  {
    accessorKey: "title",
    header: "Request Details",
    enableSorting: false,
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="flex flex-col gap-1.5 max-w-[300px]">
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
        <Badge 
          className={cn(
            "border font-medium capitalize text-xs px-2.5 py-1",
            getStatusColor(status)
          )}
          variant="outline"
        >
          {status.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue("created_at"));
      const dateB = new Date(rowB.getValue("created_at"));
      return dateA.getTime() - dateB.getTime();
    },
    cell: ({ getValue }) => {
      const dateString = getValue();
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDate(dateString)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(dateString)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "interest_summary",
    header: () => <div className="text-center">Responses</div>,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const totalA = rowA.original.interest_summary?.total_interests || 0;
      const totalB = rowB.original.interest_summary?.total_interests || 0;
      return totalA - totalB;
    },
    cell: ({ row }) => {
      const interestSummary = row.original.interest_summary;
      return (
        <div className="flex flex-col gap-1 text-center">
          <div className="text-sm font-semibold text-foreground">
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
    header: () => <div className="text-right">Actions</div>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="text-right">
          <Button 
            size="sm"
            variant="ghost"
            className="hover:bg-primary/10 text-primary hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onViewAppointment(appointment.appointment_id);
            }}
          >
            <Eye className="h-3 w-3 mr-1.5" />
            View
          </Button>
        </div>
      );
    },
  },
];