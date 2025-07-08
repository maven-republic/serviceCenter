// ============ CalendarUtils.js - Date calculations and helpers ============

// Get number of days in a month
export const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
export const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Check if two dates are the same day
export const isSameDay = (date1, date2) => {
  return date1 && date2 && date1.toDateString() === date2.toDateString();
};

// Check if date is in the past
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Check if date is in a given range
export const isDateInRange = (date, startDate, endDate) => {
  if (!startDate || !endDate) return false;
  return date >= startDate && date <= endDate;
};

// Check if date is range start
export const isRangeStart = (date, range) => {
  return range && range.startDate && isSameDay(date, range.startDate);
};

// Check if date is range end
export const isRangeEnd = (date, range) => {
  return range && range.endDate && isSameDay(date, range.endDate);
};

// Generate calendar days for a month (including previous/next month days)
export const generateCalendarDays = (currentMonth) => {
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const prevDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -i);
    days.push({
      date: prevDate,
      isCurrentMonth: false,
      day: prevDate.getDate()
    });
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    days.push({
      date,
      isCurrentMonth: true,
      day
    });
  }

  // Next month's leading days to fill the grid (6 rows × 7 days = 42 cells)
  const remainingCells = 42 - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
    days.push({
      date: nextDate,
      isCurrentMonth: false,
      day: nextDate.getDate()
    });
  }

  return days;
};

// Format date for display
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: startDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
  
  const end = endDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
  
  return `${start} - ${end}`;
};

// Calculate days between two dates
export const daysBetween = (startDate, endDate) => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
};

// Get month name and year for display
export const getMonthYearDisplay = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

// Navigate to previous/next month
export const navigateMonth = (currentDate, direction) => {
  const newDate = new Date(currentDate);
  newDate.setMonth(currentDate.getMonth() + direction);
  return newDate;
};

// Weekday names for calendar header
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Calendar color constants
export const CALENDAR_COLORS = {
  primary: '#000000',        // Black for selected dates
  secondary: '#64748b',      // Gray for secondary text
  background: '#ffffff',     // White background
  muted: '#e5e7eb',         // Light gray for muted elements
  today: '#0ea5e9',         // Blue for today indicator
  todayBg: '#e0f2fe',       // Light blue background for today
  range: '#f1f5f9',         // Light gray for range selection
  rangeActive: '#fef3c7',   // Yellow for active range selection
  past: '#94a3b8',          // Muted gray for past dates
  otherMonth: '#cbd5e1'     // Light gray for other month dates
};