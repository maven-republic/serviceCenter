import { Button } from '@/components/ui/button'

export function SlotButton({ 
  slot, 
  isSelected, 
  onClick, 
  index = 0,
  isMobile = false 
}) {
  const size = isMobile ? 'sm' : 'sm'
  const fontSize = isMobile ? 'text-xs' : 'text-sm'
  const height = isMobile ? '' : 'h-9'

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size={size}
      onClick={onClick}
      className={`${fontSize} ${height} transition-all duration-200 hover:scale-105`}
      style={{
        animationDelay: `${index * 50 + (isMobile ? 0 : 200)}ms`,
        animation: 'slideInUp 300ms ease-out forwards'
      }}
      aria-label={`${slot.time} time slot`}
      aria-pressed={isSelected}
    >
      {slot.time}
    </Button>
  )
}