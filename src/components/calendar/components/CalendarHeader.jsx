import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarHeader({ 
  monthName, 
  onPrevious, 
  onNext, 
  loading = false 
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-lg">{monthName}</h3>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={loading}
          className="h-8 w-8"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={loading}
          className="h-8 w-8"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}