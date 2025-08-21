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

  console.log('🖼️ Skeleton Debug:', {
    propIsMobile,
    internalIsMobile,
    shouldShowMobile,
    isClient,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR'
  });

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
              <div className="h-4 w-24 mt-1 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full space-y-4">
          {/* Toolbar Skeleton */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative w-full sm:max-w-sm">
                <div className="w-full h-11 sm:h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-full sm:w-auto h-11 sm:h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="hidden sm:flex h-11 sm:h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Responsive Content */}
          {shouldShowMobile ? (
            // Mobile Card Layout
            <div className="space-y-3">
              {Array.from({ length: rowCount }).map((_, index) => (
                <Card key={index} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-2">
                        <div className="h-4 w-3/4 mb-1 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 mb-2 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="mb-3 p-3 bg-muted/30 rounded-md">
                      <div className="flex items-start gap-2">
                        <div className="h-3 w-3 mt-0.5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-3 w-12 mb-1 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table Layout
            <div className="rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Service
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Request Details
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Created
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                      Responses
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {Array.from({ length: rowCount }).map((_, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      {/* Service Column */}
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1.5">
                          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </td>
                      {/* Request Details Column */}
                      <td className="p-4 align-middle max-w-[300px]">
                        <div className="flex flex-col gap-1.5">
                          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                          <div className="flex items-start gap-2">
                            <div className="h-3 w-3 mt-0.5 bg-gray-200 rounded animate-pulse"></div>
                            <div className="flex-1 space-y-1">
                              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Status Column */}
                      <td className="p-4 align-middle">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </td>
                      {/* Created Column */}
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      {/* Responses Column */}
                      <td className="p-4 align-middle text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <div className="h-4 w-6 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </td>
                      {/* Actions Column */}
                      <td className="p-4 align-middle text-right">
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-2 py-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8 order-1 sm:order-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center space-x-1">
                <div className="hidden sm:flex h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="hidden sm:flex h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-muted/20 px-4 sm:px-6 py-3 sm:py-4 mt-0 rounded-b-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-3 w-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};