// src/components/customer-workspace/customer/appointments/AppointmentsTableSkeleton.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from 'lucide-react';

const SkeletonRow = () => (
  <TableRow className="hover:bg-transparent border-border/50">
    {/* Service Column */}
    <TableCell className="py-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" /> {/* Service name */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-16 rounded" /> {/* ID badge */}
        </div>
      </div>
    </TableCell>
    
    {/* Request Details Column */}
    <TableCell className="py-4 max-w-[300px]">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-48" /> {/* Title */}
        <div className="flex items-start gap-2">
          <Skeleton className="h-3 w-3 mt-0.5 rounded" /> {/* Message icon */}
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-full" /> {/* Message line 1 */}
            <Skeleton className="h-3 w-3/4" /> {/* Message line 2 */}
          </div>
        </div>
      </div>
    </TableCell>
    
    {/* Status Column */}
    <TableCell className="py-4">
      <Skeleton className="h-6 w-20 rounded-full" /> {/* Status badge */}
    </TableCell>
    
    {/* Created Column */}
    <TableCell className="py-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded" /> {/* Calendar icon */}
          <Skeleton className="h-4 w-20" /> {/* Date */}
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded" /> {/* Clock icon */}
          <Skeleton className="h-3 w-16" /> {/* Time */}
        </div>
      </div>
    </TableCell>
    
    {/* Responses Column */}
    <TableCell className="py-4 text-center">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-6 mx-auto" /> {/* Total count */}
        <Skeleton className="h-3 w-12 mx-auto" /> {/* Active count */}
      </div>
    </TableCell>
    
    {/* Actions Column */}
    <TableCell className="py-4 text-right">
      <Skeleton className="h-8 w-16 ml-auto" /> {/* View button */}
    </TableCell>
  </TableRow>
);

const SkeletonToolbar = () => (
  <div className="w-full space-y-4">
    {/* Toolbar */}
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Global Search */}
        <div className="relative w-full max-w-sm">
          <Skeleton className="h-10 w-full" /> {/* Search input */}
        </div>
        
        {/* Status Filter */}
        <Skeleton className="h-10 w-24" /> {/* Status dropdown */}
      </div>

      {/* Column Visibility */}
      <Skeleton className="h-10 w-20" /> {/* View button */}
    </div>
  </div>
);

const SkeletonPagination = () => (
  <div className="flex items-center justify-between space-x-2 py-4">
    <div className="flex-1">
      <Skeleton className="h-4 w-40" /> {/* Selected rows text */}
    </div>
    <div className="flex items-center space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-20" /> {/* "Rows per page" */}
        <Skeleton className="h-8 w-16" /> {/* Page size select */}
      </div>
      <Skeleton className="h-4 w-24" /> {/* Page indicator */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8" /> {/* First page */}
        <Skeleton className="h-8 w-8" /> {/* Previous page */}
        <Skeleton className="h-8 w-8" /> {/* Next page */}
        <Skeleton className="h-8 w-8" /> {/* Last page */}
      </div>
    </div>
  </div>
);

const SkeletonFooter = () => (
  <div className="border-t border-border bg-muted/20 px-6 py-4 mt-0">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="w-1.5 h-1.5 rounded-full" />
        <Skeleton className="h-4 w-32" /> {/* Results text */}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const AppointmentsTableSkeleton = ({ rowCount = 5 }) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Your Appointments</h3>
            <div className="text-sm text-muted-foreground font-normal">
              <Skeleton className="h-4 w-24 mt-1" /> {/* Loading count */}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full space-y-4">
          {/* Skeleton Toolbar */}
          <SkeletonToolbar />

          {/* Skeleton Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-semibold text-muted-foreground">
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    <Skeleton className="h-4 w-12" />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground">
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rowCount }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Skeleton Pagination */}
          <SkeletonPagination />

          {/* Skeleton Footer */}
          <SkeletonFooter />
        </div>
      </CardContent>
    </Card>
  );
};