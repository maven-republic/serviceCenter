// src/components/customer-workspace/customer/appointments/columns/appointments-columns.jsx
"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MessageSquare,
  ArrowUpDown,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Status styling helper
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

// Text truncation helper
const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Date formatting helpers
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

export const appointmentsColumns = [
  {
    accessorKey: "service",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-muted-foreground hover:text-foreground"
        >
          Service
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-muted-foreground hover:text-foreground"
        >
          Request Details
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-muted-foreground hover:text-foreground"
        >
          Status
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge 
          className={cn(
            "border font-medium capitalize text-xs px-2.5 py-1",
            getStatusColor(status)
          )}
          variant="outline"
        >
          {status?.replace('_', ' ')}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-muted-foreground hover:text-foreground"
        >
          Created
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at");
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDate(createdAt)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(createdAt)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "interest_summary",
    header: () => (
      <div className="text-center font-semibold text-muted-foreground">
        Responses
      </div>
    ),
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="flex flex-col gap-1 text-center">
          <div className="text-sm font-semibold text-foreground">
            {appointment.interest_summary?.total_interests || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            {appointment.interest_summary?.active_interests || 0} active
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const appointment = row.original;
      
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  // This will be handled by the parent component
                  // via onRowClick or custom handler
                  console.log('View appointment:', appointment.appointment_id);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log('View responses:', appointment.appointment_id);
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                View Responses
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// Column visibility options
export const defaultColumnVisibility = {
  interest_summary: true,
  created_at: true,
  status: true,
  title: true,
  service: true,
  actions: true,
};

// Status filter options
export const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "interested", label: "Interested" },
  { value: "competing", label: "Competing" },
  { value: "evaluating", label: "Evaluating" },
  { value: "quoted", label: "Quoted" },
  { value: "converted", label: "Converted" },
  { value: "cancelled", label: "Cancelled" },
];