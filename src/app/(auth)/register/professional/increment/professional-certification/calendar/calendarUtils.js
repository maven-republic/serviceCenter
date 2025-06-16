// Date comparison utilities
export const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isSelected = (date, selectedDate) => {
  if (!date || !selectedDate) return false
  return date.toDateString() === selectedDate.toDateString()
}

export const isSameMonth = (date1, date2) => {
  if (!date1 || !date2) return false
  return date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear()
}

export const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

// Generate calendar grid for a given month
export const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []

  // Add days from previous month to fill starting empty cells
  const prevMonth = new Date(year, month - 1, 0)
  const prevMonthDays = prevMonth.getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    days.push({
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
      isPrevMonth: true
    })
  }

  // Add all days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
      isPrevMonth: false
    })
  }

  // Add days from next month to complete the 6-week grid (42 days total)
  const totalCells = 42 // Always show 6 weeks for consistent layout
  let nextMonthDay = 1
  for (let i = days.length; i < totalCells; i++) {
    days.push({
      date: new Date(year, month + 1, nextMonthDay),
      isCurrentMonth: false,
      isPrevMonth: false
    })
    nextMonthDay++
  }

  return days
}

// Date formatting utilities
export const formatDateISO = (date) => {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}

export const formatDateDisplay = (date, options = {}) => {
  if (!date) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const formatDateLong = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Date parsing utilities
export const parseDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

export const createDate = (year, month, day) => {
  return new Date(year, month, day)
}

// Date calculation utilities
export const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addMonths = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const addYears = (date, years) => {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export const getStartOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export const getEndOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export const getStartOfWeek = (date, startDay = 0) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day - startDay + 7) % 7
  result.setDate(result.getDate() - diff)
  return result
}

// Validation utilities
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime())
}

export const isDateInRange = (date, minDate, maxDate) => {
  if (!isValidDate(date)) return false
  
  if (minDate && date < minDate) return false
  if (maxDate && date > maxDate) return false
  
  return true
}

export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date > today
}

export const isPastDate = (date) => {
  if (!isValidDate(date)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// Calendar constants
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

// Year range generator
export const generateYearRange = (startYear, endYear) => {
  const years = []
  for (let year = startYear; year <= endYear; year++) {
    years.push(year)
  }
  return years
}

export const getYearRange = (centerYear = new Date().getFullYear(), range = 50) => {
  return generateYearRange(centerYear - range, centerYear + range)
}