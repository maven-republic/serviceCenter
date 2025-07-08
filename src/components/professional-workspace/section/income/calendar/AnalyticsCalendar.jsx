// ============ AnalyticsCalendar.jsx - Analytics Calendar ============
// Path: /src/components/professional-workspace/section/income/calendar/AnalyticsCalendar.jsx

import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarSlot from './CalendarSlot';
import { 
  generateCalendarDays, 
  WEEKDAYS,
  CALENDAR_COLORS,
  formatDateRange
} from './CalendarUtils';

export default function AnalyticsCalendar({ 
  selectedRange = null,
  selectedDate = null,        // NEW: For single date selection
  onRangeSelect = null,
  onDateSelect = null,        // NEW: For single date selection
  onClose = null,
  compact = false,
  showRangeSelection = true   // NEW: Toggle between range and single selection
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);

  // Handle date click for BOTH range selection AND single date selection
  const handleDateClick = (date) => {
    console.log('Date clicked:', date); // Debug log
    
    // Single date selection mode
    if (!showRangeSelection && onDateSelect) {
      console.log('Single date mode - calling onDateSelect'); // Debug log
      onDateSelect(date);
      return;
    }

    // Range selection mode
    if (showRangeSelection && onRangeSelect) {
      console.log('Range selection mode'); // Debug log
      
      if (!isSelectingRange) {
        // Start range selection
        setRangeStart(date);
        setIsSelectingRange(true);
        console.log('Started range selection with:', date); // Debug log
      } else {
        // Complete range selection
        const startDate = rangeStart;
        const endDate = date;
        
        // Ensure start <= end
        const finalRange = startDate <= endDate 
          ? { startDate, endDate }
          : { startDate: endDate, endDate: startDate };
        
        console.log('Completed range selection:', finalRange); // Debug log
        onRangeSelect(finalRange);
        setIsSelectingRange(false);
        setRangeStart(null);
      }
    }
  };

  // Handle month navigation
  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };

  // Generate calendar data
  const calendarDays = generateCalendarDays(currentMonth);

  const calendarStyles = {
    container: {
      backgroundColor: CALENDAR_COLORS.background,
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: compact ? '12px' : '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: 'inherit',
      width: compact ? '280px' : '320px',
      position: 'relative'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    title: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '16px',
      color: '#64748b',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.2s ease',
      outline: 'none'
    },
    weekdaysContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '2px',
      marginBottom: '6px'
    },
    weekdayHeader: {
      textAlign: 'center',
      fontSize: '10px',
      fontWeight: '600',
      color: CALENDAR_COLORS.secondary,
      padding: '6px 2px',
      userSelect: 'none'
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '2px',
      marginBottom: '12px'
    },
    footer: {
      borderTop: '1px solid #e2e8f0',
      paddingTop: '8px',
      fontSize: '11px',
      color: '#64748b'
    },
    rangeStatus: {
      padding: '6px 8px',
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '4px',
      fontSize: '11px',
      color: '#92400e',
      textAlign: 'center',
      marginBottom: '8px'
    },
    selectedRange: {
      padding: '6px 8px',
      backgroundColor: '#f0f9ff',
      border: '1px solid #0ea5e9',
      borderRadius: '4px',
      fontSize: '11px',
      color: '#0369a1',
      textAlign: 'center'
    }
  };

  return (
    <div style={calendarStyles.container}>
      {/* Calendar Header */}
      <div style={calendarStyles.header}>
        <h6 style={calendarStyles.title}>
          📅 {showRangeSelection ? 'Select Range' : 'Select Date'}
        </h6>
        {onClose && (
          <button
            style={calendarStyles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#1f2937'}
            onMouseLeave={(e) => e.target.style.color = '#64748b'}
            title="Close calendar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Month Navigation */}
      <CalendarHeader 
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
      />

      {/* Weekday Headers */}
      <div style={calendarStyles.weekdaysContainer}>
        {WEEKDAYS.map(day => (
          <div key={day} style={calendarStyles.weekdayHeader}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div style={calendarStyles.daysGrid}>
        {calendarDays.map((dayInfo, index) => (
          <CalendarSlot
            key={index}
            dayInfo={dayInfo}
            selectedDate={selectedDate}      // Pass single selected date
            selectedRange={selectedRange}    // Pass range
            onDateClick={handleDateClick}    // Unified click handler
            isSelectingRange={isSelectingRange}
            rangeStart={rangeStart}
          />
        ))}
      </div>

      {/* Range Selection Status (only for range mode) */}
      {showRangeSelection && isSelectingRange && (
        <div style={calendarStyles.rangeStatus}>
          Click end date to complete selection
        </div>
      )}

      {/* Selected Range Display (only for range mode) */}
      {showRangeSelection && selectedRange && selectedRange.startDate && selectedRange.endDate && !isSelectingRange && (
        <div style={calendarStyles.selectedRange}>
          Selected: {formatDateRange(selectedRange.startDate, selectedRange.endDate)}
        </div>
      )}

      {/* Selected Date Display (only for single date mode) */}
      {!showRangeSelection && selectedDate && (
        <div style={calendarStyles.selectedRange}>
          Selected: {selectedDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      )}

      {/* Footer Instructions */}
      <div style={calendarStyles.footer}>
        💡 {showRangeSelection ? 'Click start date, then end date to select range' : 'Click any date to select'}
      </div>
    </div>
  );
}