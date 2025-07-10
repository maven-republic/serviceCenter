'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Clock, 
  Zap, 
  Calendar, 
  Flame,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const URGENCY_OPTIONS = [
  {
    id: 'standard',
    title: 'Standard',
    description: 'Normal timeline',
    timeframe: '5-7 business days',
    priceMultiplier: 1.0,
    icon: Calendar,
    color: 'blue',
    badge: null
  },
  {
    id: 'priority',
    title: 'Priority',
    description: 'Faster completion',
    timeframe: '2-3 business days',
    priceMultiplier: 1.25,
    icon: Clock,
    color: 'orange',
    badge: '+25%'
  },
  {
    id: 'urgent',
    title: 'Urgent',
    description: 'Rush service',
    timeframe: '24-48 hours',
    priceMultiplier: 1.5,
    icon: Zap,
    color: 'red',
    badge: '+50%'
  },
  {
    id: 'emergency',
    title: 'Emergency',
    description: 'Immediate attention',
    timeframe: 'Same day',
    priceMultiplier: 2.0,
    icon: Flame,
    color: 'purple',
    badge: '+100%'
  }
]

export default function UrgencySelector({
  onUrgencySelect,
  selectedUrgency = 'standard',
  basePrice = 0,
  className = ''
}) {
  const [selected, setSelected] = useState(selectedUrgency)

  const handleUrgencyChange = useCallback((urgencyId) => {
    setSelected(urgencyId)
    const selectedOption = URGENCY_OPTIONS.find(option => option.id === urgencyId)
    onUrgencySelect?.(selectedOption)
  }, [onUrgencySelect])

  const getColorClasses = (color, isSelected) => {
    const baseClasses = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-blue-200',
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        icon: isSelected ? 'text-blue-600' : 'text-blue-500',
        title: isSelected ? 'text-blue-900' : 'text-blue-800',
        ring: 'ring-blue-500/20'
      },
      orange: {
        border: isSelected ? 'border-orange-500' : 'border-orange-200',
        bg: isSelected ? 'bg-orange-50' : 'bg-white',
        icon: isSelected ? 'text-orange-600' : 'text-orange-500',
        title: isSelected ? 'text-orange-900' : 'text-orange-800',
        ring: 'ring-orange-500/20'
      },
      red: {
        border: isSelected ? 'border-red-500' : 'border-red-200',
        bg: isSelected ? 'bg-red-50' : 'bg-white',
        icon: isSelected ? 'text-red-600' : 'text-red-500',
        title: isSelected ? 'text-red-900' : 'text-red-800',
        ring: 'ring-red-500/20'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-purple-200',
        bg: isSelected ? 'bg-purple-50' : 'bg-white',
        icon: isSelected ? 'text-purple-600' : 'text-purple-500',
        title: isSelected ? 'text-purple-900' : 'text-purple-800',
        ring: 'ring-purple-500/20'
      }
    }
    return baseClasses[color]
  }

  const getBadgeVariant = (color) => {
    const variants = {
      blue: 'secondary',
      orange: 'secondary',
      red: 'destructive',
      purple: 'secondary'
    }
    return variants[color] || 'secondary'
  }

  const selectedOption = URGENCY_OPTIONS.find(option => option.id === selected)
  const calculatedPrice = basePrice * (selectedOption?.priceMultiplier || 1)

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Header */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Service Urgency</Label>
        <p className="text-sm text-muted-foreground">
          Choose how quickly you need this service completed
        </p>
      </div>

      {/* Urgency Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {URGENCY_OPTIONS.map((option) => {
          const isSelected = selected === option.id
          const colors = getColorClasses(option.color, isSelected)
          const IconComponent = option.icon

          return (
            <Card
              key={option.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                colors.border,
                colors.bg,
                isSelected && `ring-2 ${colors.ring}`
              )}
              onClick={() => handleUrgencyChange(option.id)}
            >
              <CardContent className="p-4 space-y-3">
                
                {/* Header with Icon and Badge */}
                <div className="flex items-start justify-between">
                  <div className={cn("p-2 rounded-lg", 
                    isSelected ? 'bg-white/50' : 'bg-gray-50'
                  )}>
                    <IconComponent className={cn("h-5 w-5", colors.icon)} />
                  </div>
                  
                  {isSelected && (
                    <CheckCircle className={cn("h-5 w-5", colors.icon)} />
                  )}
                  
                  {option.badge && (
                    <Badge 
                      variant={getBadgeVariant(option.color)}
                      className="text-xs font-medium"
                    >
                      {option.badge}
                    </Badge>
                  )}
                </div>

                {/* Title and Description */}
                <div className="space-y-1">
                  <h3 className={cn("font-semibold text-sm", colors.title)}>
                    {option.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>

                {/* Timeframe */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-muted-foreground">
                    {option.timeframe}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Price Preview */}
      {basePrice > 0 && selectedOption && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Estimated Price</p>
                <p className="text-xs text-muted-foreground">
                  {selectedOption.title} service • {selectedOption.timeframe}
                </p>
              </div>
              <div className="text-right space-y-1">
                {selectedOption.priceMultiplier > 1 ? (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground line-through">
                      ${basePrice.toFixed(2)}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ${calculatedPrice.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-foreground">
                    ${calculatedPrice.toFixed(2)}
                  </p>
                )}
                {selectedOption.badge && (
                  <Badge variant="outline" className="text-xs">
                    {selectedOption.badge} fee
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <p className="font-medium mb-1">💡 Need help choosing?</p>
        <ul className="space-y-0.5 text-xs">
          <li>• <strong>Standard:</strong> Most common choice for regular projects</li>
          <li>• <strong>Priority:</strong> When you need it done faster than usual</li>
          <li>• <strong>Urgent:</strong> For time-sensitive projects</li>
          <li>• <strong>Emergency:</strong> Critical situations requiring immediate attention</li>
        </ul>
      </div>
    </div>
  )
}