// src/components/customer-workspace/customer/appointments/AppointmentsTableSkeleton.jsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const AppointmentsTableSkeleton = ({ rowCount = 5, isMobile: propIsMobile }) => {
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setInternalIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use prop if provided, otherwise use internal detection
  const shouldShowMobile = propIsMobile !== undefined ? propIsMobile : internalIsMobile;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Calendar className="h-5 w-5" />
          <div>
            <h3 className="text-lg font-semibold">Your Appointments</h3>
            <div className="text-sm text-muted-foreground font-normal">
              <div className="h-4 w-24 mt-1 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-4">
          {/* Simple Search Skeleton */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <div className="w-full h-10 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          {shouldShowMobile ? (
            // Mobile Card Layout
            <div className="space-y-3">
              {Array.from({ length: rowCount }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-muted rounded animate-pulse"></div>
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div>
                          <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table Layout
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-3 text-sm font-medium text-muted-foreground">Service</th>
                    <th className="p-3 text-sm font-medium text-muted-foreground">Request</th>
                    <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="p-3 text-sm font-medium text-muted-foreground">Responses</th>
                    <th className="p-3 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }).map((_, index) => (
                    <tr key={index} className="border-b">
                      {/* Service Column */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                        </div>
                      </td>
                      {/* Request Column */}
                      <td className="p-3">
                        <div className="space-y-1 max-w-[300px]">
                          <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                        </div>
                      </td>
                      {/* Status Column */}
                      <td className="p-3">
                        <div className="h-5 w-20 bg-muted rounded-full animate-pulse"></div>
                      </td>
                      {/* Date Column */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                        </div>
                      </td>
                      {/* Responses Column */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="h-4 w-6 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
                        </div>
                      </td>
                      {/* Actions Column */}
                      <td className="p-3">
                        <div className="h-9 w-16 bg-muted rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Simple Summary Skeleton */}
          {rowCount > 0 && (
            <div className="flex items-center justify-between text-sm border-t pt-4">
              <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};