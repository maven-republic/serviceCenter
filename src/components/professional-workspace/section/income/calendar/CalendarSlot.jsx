// ============ CalendarSlot.jsx - Calendar Slot ============
import React from 'react';
import { 
  isToday, 
  isSameDay, 
  isPastDate, 
  isDateInRange, 
  isRangeStart, 
  isRangeEnd,
  CALENDAR_COLORS 
} from './CalendarUtils';

export default function CalendarSlot({ 
  dayInfo, 
  selectedDate,               // Single selected date
  selectedRange,              // Range selection
  onDateClick,                // Click handler
  isSelectingRange = false,   // Range selection state
  rangeStart = null,          // Range selection start
  earningsData = null         // Future: earnings amount for this date
}) {
  const { date, isCurrentMonth, day } = dayInfo;

  // Date state checks
  const isSelected = selectedDate && isSameDay(date, selectedDate);
  const inRange = selectedRange && isDateInRange(date, selectedRange.startDate, selectedRange.endDate);
  const rangeStartDay = isRangeStart(date, selectedRange);
  const rangeEndDay = isRangeEnd(date, selectedRange);
  const todayDate = isToday(date);
  const pastDate = isPastDate(date);
  
  // Range selection highlighting
  const isRangeStartTemp = rangeStart && isSameDay(date, rangeStart);

  // Future: Earnings-based styling
  const hasEarnings = earningsData && earningsData > 0;
  const earningsLevel = hasEarnings ? getEarningsLevel(earningsData) : null;

  // Handle click
  const handleClick = () => {
    if (isCurrentMonth && onDateClick) {
      console.log('CalendarSlot clicked:', date); // Debug log
      onDateClick(date);
    }
  };

  // Get earnings level for color coding (future feature)
  function getEarningsLevel(amount) {
    if (amount >= 1000) return 'high';
    if (amount >= 500) return 'medium';
    if (amount >= 100) return 'low';
    return 'minimal';
  }

  // Dynamic cell styles
  const getCellStyles = () => {
    let backgroundColor = CALENDAR_COLORS.background;
    let color = '#374151';
    let border = '1px solid transparent';
    let fontWeight = '400';

    // Selected states (highest priority)
    if (isSelected || rangeStartDay || rangeEndDay || isRangeStartTemp) {
      backgroundColor = CALENDAR_COLORS.primary;
      color = CALENDAR_COLORS.background;
      fontWeight = '600';
    }
    // Range selection
    else if (inRange) {
      backgroundColor = CALENDAR_COLORS.range;
      border = '1px solid #e2e8f0';
    }
    // Today styling
    else if (todayDate) {
      backgroundColor = CALENDAR_COLORS.todayBg;
      color = CALENDAR_COLORS.today;
      border = `2px solid ${CALENDAR_COLORS.today}`;
      fontWeight = '600';
    }
    // Future: Earnings-based styling
    else if (hasEarnings && isCurrentMonth) {
      const earningsColors = {
        high: { bg: '#dcfce7', color: '#15803d', border: '#22c55e' },
        medium: { bg: '#fef3c7', color: '#d97706', border: '#f59e0b' },
        low: { bg: '#e0f2fe', color: '#0369a1', border: '#0ea5e9' },
        minimal: { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' }
      };
      
      const levelStyle = earningsColors[earningsLevel];
      backgroundColor = levelStyle.bg;
      color = levelStyle.color;
      border = `1px solid ${levelStyle.border}`;
    }

    // Other month dates
    if (!isCurrentMonth) {
      color = CALENDAR_COLORS.otherMonth;
      backgroundColor = 'transparent';
    }
    // Past dates
    else if (pastDate && !isSelected && !rangeStartDay && !rangeEndDay && !todayDate && !isRangeStartTemp) {
      color = CALENDAR_COLORS.past;
    }

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      fontSize: '13px',
      fontWeight,
      backgroundColor,
      color,
      border,
      borderRadius: '8px',
      cursor: isCurrentMonth ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      opacity: isCurrentMonth ? 1 : 0.5,
      position: 'relative',
      outline: 'none',
      // CSS Reset
      margin: 0,
      padding: 0,
      fontFamily: 'inherit',
      textAlign: 'center',
      userSelect: 'none'
    };
  };

  // Hover effect handlers
  const handleMouseEnter = (e) => {
    if (!isCurrentMonth) return;
    
    // Don't change hover for selected/range states
    if (isSelected || rangeStartDay || rangeEndDay || inRange || isRangeStartTemp) return;
    
    e.target.style.backgroundColor = '#f8fafc';
    e.target.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = (e) => {
    if (!isCurrentMonth) return;
    
    // Restore original background
    const originalStyles = getCellStyles();
    e.target.style.backgroundColor = originalStyles.backgroundColor;
    e.target.style.transform = 'scale(1)';
  };

  return (
    <button
      style={getCellStyles()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={isCurrentMonth ? date.toLocaleDateString() : ''}
      disabled={!isCurrentMonth}
    >
      {day}
      
      {/* Future: Earnings indicator dot */}
      {hasEarnings && isCurrentMonth && (
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: earningsLevel === 'high' ? '#22c55e' : 
                           earningsLevel === 'medium' ? '#f59e0b' : '#0ea5e9'
          }}
        />
      )}
    </button>
  );
}