import { Card, CardContent } from '@/components/ui/card'
import { CalendarDay } from './CalendarDay'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_MOBILE = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CalendarGrid({ 
  days, 
  loading,
  onDateSelect, 
  isMobile = false 
}) {
  const weekdays = isMobile ? WEEKDAYS_MOBILE : WEEKDAYS
  const headerHeight = isMobile ? 'h-8' : 'h-10'
  const headerFontSize = isMobile ? 'text-xs' : 'text-sm'

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-3">
        <div className="space-y-1">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map((day, index) => (
              <div 
                key={`weekday-${index}`} 
                className={`${headerHeight} ${headerFontSize} flex items-center justify-center text-muted-foreground font-medium`}
              >
                {isMobile ? day : day.slice(0, 2)}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => (
              <CalendarDay
                key={day.date}
                day={day}
                loading={loading}
                onSelect={onDateSelect}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}