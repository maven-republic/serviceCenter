'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AppointmentLoadingState() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48 bg-muted" />
          <Skeleton className="h-8 w-24 bg-muted" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
      
       {/* Skeleton rows */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-background">
                <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32 bg-muted" />
                    <Skeleton className="h-6 w-16 bg-muted rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-48 bg-muted" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-24 bg-muted" />
                    <Skeleton className="h-3 w-20 bg-muted" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-16 bg-muted rounded" />
                  <Skeleton className="h-8 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AppointmentLoadingState
