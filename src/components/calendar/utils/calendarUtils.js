// src/components/calendar/utils/calendarUtils.js

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Check if date is today
 */
export function isToday(date) {
  const today = new Date()
  return formatDate(date) === formatDate(today)
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

/**
 * Generate calendar days for a given month
 * Returns 42 days (6 weeks) starting from the first visible day
 */
export function generateCalendarDays(currentMonth, availableDates = [], selectedDate = null, slotsByDate = {}) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const current = new Date(startDate)
  
  for (let week = 0; week < 6; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(current)
      const dateStr = formatDate(date)
      const isCurrentMonth = date.getMonth() === month
      const isAvailable = availableDates.includes(dateStr)
      const isTodayDate = isToday(date)
      const isPastDate = isPast(date)
      
      days.push({
        date: dateStr,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isAvailable,
        isToday: isTodayDate,
        isPast: isPastDate,
        isSelected: selectedDate === dateStr,
        slotsCount: slotsByDate[dateStr]?.length || 0
      })
      
      current.setDate(current.getDate() + 1)
    }
  }
  
  return days
}

/**
 * Get professional display name from professional object
 */
export function getProfessionalName(professional) {
  const firstName = professional.first_name || professional.account?.first_name || ''
  const lastName = professional.last_name || professional.account?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || `Professional ${professional.professional_id?.slice(0, 8) || ''}`
}

/**
 * Get professional rating
 */
export function getProfessionalRating(professional) {
  return professional.rating || professional.average_rating || 4.8
}

/**
 * Get professional price display
 */
export function getProfessionalPrice(professional) {
  if (professional.hourly_rate) return `$${professional.hourly_rate}/hr`
  if (professional.daily_rate) return `$${professional.daily_rate}/day`
  return 'Quote'
}