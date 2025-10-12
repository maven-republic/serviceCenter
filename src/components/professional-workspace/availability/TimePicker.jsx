'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Clock, ChevronUp, ChevronDown } from 'lucide-react'

export default function TimePicker({ value, onChange, id, className = '', align = 'start' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState('09')
  const [minutes, setMinutes] = useState('00')
  const [period, setPeriod] = useState('AM')

  // Parse value (HH:MM format) into hours, minutes, period
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      const hour24 = parseInt(h, 10)
      const hour12 = hour24 % 12 || 12
      const ampm = hour24 >= 12 ? 'PM' : 'AM'
      
      setHours(hour12.toString().padStart(2, '0'))
      setMinutes(m)
      setPeriod(ampm)
    }
  }, [value])

  // Convert to 24-hour format and call onChange
  const updateTime = (h, m, p) => {
    let hour24 = parseInt(h, 10)
    if (p === 'PM' && hour24 !== 12) hour24 += 12
    if (p === 'AM' && hour24 === 12) hour24 = 0
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${m}`
    onChange(timeString)
  }

  const incrementHours = () => {
    const newHours = (parseInt(hours, 10) % 12) + 1
    const formatted = newHours.toString().padStart(2, '0')
    setHours(formatted)
    updateTime(formatted, minutes, period)
  }

  const decrementHours = () => {
    const current = parseInt(hours, 10)
    const newHours = current === 1 ? 12 : current - 1
    const formatted = newHours.toString().padStart(2, '0')
    setHours(formatted)
    updateTime(formatted, minutes, period)
  }

  const incrementMinutes = () => {
    const newMinutes = (parseInt(minutes, 10) + 15) % 60
    const formatted = newMinutes.toString().padStart(2, '0')
    setMinutes(formatted)
    updateTime(hours, formatted, period)
  }

  const decrementMinutes = () => {
    const current = parseInt(minutes, 10)
    const newMinutes = current === 0 ? 45 : current - 15
    const formatted = newMinutes.toString().padStart(2, '0')
    setMinutes(formatted)
    updateTime(hours, formatted, period)
  }

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM'
    setPeriod(newPeriod)
    updateTime(hours, minutes, newPeriod)
  }

  const formatDisplayTime = () => {
    return `${hours}:${minutes} ${period}`
  }

  const quickTimes = [
    { label: '9 AM', value: '09:00' },
    { label: '12 PM', value: '12:00' },
    { label: '1 PM', value: '13:00' },
    { label: '5 PM', value: '17:00' },
    { label: '6 PM', value: '18:00' },
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={`w-full h-9 justify-start text-left font-normal ${className}`}
        >
          <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm truncate">{formatDisplayTime()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
  className="w-[260px] p-3 z-[60]"  // Changed from no z-index to z-[60]
        align={align}
        side="bottom"
        sideOffset={5}
      >
        <div className="space-y-3">
          {/* Time Picker Controls */}
          <div className="flex items-center justify-center gap-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={incrementHours}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div className="w-10 h-10 flex items-center justify-center text-xl font-semibold">
                {hours}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={decrementHours}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Separator */}
            <div className="text-xl font-semibold pt-1">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={incrementMinutes}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div className="w-10 h-10 flex items-center justify-center text-xl font-semibold">
                {minutes}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={decrementMinutes}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* AM/PM Toggle */}
            <div className="flex flex-col gap-1 ml-1">
              <Button
                variant={period === 'AM' ? 'default' : 'outline'}
                size="sm"
                className="h-7 w-11 text-xs px-2"
                onClick={togglePeriod}
              >
                AM
              </Button>
              <Button
                variant={period === 'PM' ? 'default' : 'outline'}
                size="sm"
                className="h-7 w-11 text-xs px-2"
                onClick={togglePeriod}
              >
                PM
              </Button>
            </div>
          </div>

          {/* Quick Select Times */}
          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground mb-2">Quick select</p>
            <div className="grid grid-cols-3 gap-1.5">
              {quickTimes.map((time) => (
                <Button
                  key={time.value}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2"
                  onClick={() => {
                    onChange(time.value)
                    setIsOpen(false)
                  }}
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <Button
            className="w-full h-9"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}