// src/components/professional-workspace/appointments/AppointmentEmptyState.jsx
'use client'

import { Calendar, Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AppointmentEmptyState({ filters, onClearFilters }) {
  const hasActiveFilters = filters?.status !== 'all' || filters?.search

  return (
    <Card className="bg-card border-border">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-3 text-foreground text-center">
          {hasActiveFilters ? 'No matching appointments' : 'No appointments yet'}
        </h3>
        
        <p className="text-muted-foreground text-center max-w-md mb-6 leading-relaxed">
          {hasActiveFilters 
            ? `No appointments match your current filters. Try adjusting your search criteria or clearing filters to see all appointments.`
            : `You don't have any appointment requests yet. Once customers start booking your services, they'll appear here for you to review and manage.`
          }
        </p>

        <div className="flex items-center gap-3">
          {hasActiveFilters ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClearFilters}
                className="flex items-center gap-2 bg-background hover:bg-muted border-border"
              >
                <Filter className="h-4 w-4" />
                Clear filters
              </Button>
              <Button 
                variant="default"
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                View all appointments
              </Button>
            </>
          ) : (
            <Button 
              variant="default"
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Promote your services
            </Button>
          )}
        </div>

        {/* Professional tip */}
        {!hasActiveFilters && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border max-w-md">
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Pro tip:</strong> Complete your profile and add more services to attract more appointment requests.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AppointmentEmptyState
