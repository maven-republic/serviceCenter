import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfessionalSlots } from './ProfessionalSlots'

export function TimeSlotsPanel({ 
  isVisible,
  selectedDate,
  dayViewData,
  loading,
  selectedSlots,
  onSlotSelect,
  isDirect = false,
  isMobile = false
}) {
  if (!isVisible) return null

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: isMobile ? undefined : 'numeric'
  })

  // Mobile Layout
  if (isMobile) {
    return (
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isVisible 
            ? "max-h-[600px] opacity-100 transform translate-y-0" 
            : "max-h-0 opacity-0 transform -translate-y-4"
        )}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Available Times</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formattedDate}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <TimeSlotsContent 
              loading={loading}
              dayViewData={dayViewData}
              selectedSlots={selectedSlots}
              onSlotSelect={onSlotSelect}
              isDirect={isDirect}
              isMobile={true}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div 
      className={cn(
        "w-1/2 flex-shrink-0 space-y-4 transition-all duration-500 ease-in-out",
        isVisible 
          ? "opacity-100 transform translate-x-0" 
          : "opacity-0 transform translate-x-8"
      )}
      style={{
        animation: 'slideInFromRight 500ms ease-out forwards'
      }}
    >
      <div>
        <h3 className="font-semibold text-lg">Available Times</h3>
        <p className="text-sm text-muted-foreground">
          {formattedDate}
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <TimeSlotsContent 
            loading={loading}
            dayViewData={dayViewData}
            selectedSlots={selectedSlots}
            onSlotSelect={onSlotSelect}
            isDirect={isDirect}
            isMobile={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Shared content component for both mobile and desktop
function TimeSlotsContent({ 
  loading, 
  dayViewData, 
  selectedSlots,
  onSlotSelect,
  isDirect,
  isMobile 
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 md:py-8">
        <Loader2 className={cn("animate-spin mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
        <span className="text-sm text-muted-foreground">
          {isMobile ? "Loading..." : "Loading times..."}
        </span>
      </div>
    )
  }

  if (!dayViewData || dayViewData.professionals.length === 0) {
    return (
      <div className="text-center py-4 md:py-8">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          No availability on this date
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Try selecting a different date
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {dayViewData.professionals.map((item) => (
        <ProfessionalSlots
          key={item.professional.id}
          professional={item.professional}
          slots={item.slots}
          selectedSlots={selectedSlots}
          onSlotSelect={onSlotSelect}
          showHeader={!isDirect}
          isMobile={isMobile}
        />
      ))}
    </div>
  )
}