// src/components/customer-workspace/customer/AppointmentsOverviewSkeleton.jsx
import { Skeleton, SkeletonText, SkeletonButton } from '@/components/ui/skeleton';

export const AppointmentsOverviewSkeleton = () => {
  return (
    <div className="w-full">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <SkeletonButton className="w-full sm:w-32" />
          </div>

          {/* Stats grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-lg p-3 sm:p-4"
              >
                <Skeleton className="w-8 h-8 rounded-lg mx-auto mb-2" />
                <Skeleton className="h-6 w-8 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>

          {/* Appointments list skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};