import { Clock } from 'lucide-react'
import { ProfessionalHeader } from './ProfessionalHeader'
import { SlotButton } from './SlotButton'

export function ProfessionalSlots({ 
  professional,
  slots,
  selectedSlots,
  onSlotSelect,
  showHeader = true,
  isMobile = false
}) {
  const handleSlotClick = (slot) => {
    onSlotSelect(slot, professional)
  }

  const isSlotSelected = (slot) => {
    return selectedSlots[professional.id]?.datetime === slot.datetime
  }

  return (
    <div className="space-y-3">
      {/* Professional Header */}
      {showHeader && (
        <ProfessionalHeader 
          professional={professional}
          slotsCount={slots.length}
          isMobile={isMobile}
        />
      )}

      {/* Time Slots Grid */}
      {slots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot, index) => (
            <SlotButton
              key={index}
              slot={slot}
              isSelected={isSlotSelected(slot)}
              onClick={() => handleSlotClick(slot)}
              index={index}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No times available
          </p>
        </div>
      )}
    </div>
  )
}