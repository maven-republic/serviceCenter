// ============ StartDateCalendar.jsx - Start Date Component ============
import React from 'react';
import AnalyticsCalendar from './AnalyticsCalendar';

export default function StartDate({ 
  selectedDate, 
  onDateSelect, 
  endDate = null 
}) {
  
  const handleDateSelect = (date) => {
    // Ensure start date doesn't go beyond end date
    if (endDate && date > endDate) {
      // If selected start date is after end date, move end date forward
      onDateSelect(date, date);
    } else {
      onDateSelect(date, endDate);
    }
  };

  const calendarStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '280px'
    },
    header: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
      textAlign: 'center',
      padding: '8px',
      backgroundColor: '#e0f2fe',
      borderRadius: '6px',
      border: '1px solid #0ea5e9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
    },
    selectedDisplay: {
      textAlign: 'center',
      marginTop: '8px',
      fontSize: '11px',
      color: '#0369a1',
      fontWeight: '600',
      padding: '4px 8px',
      backgroundColor: '#f0f9ff',
      borderRadius: '4px',
      border: '1px solid #bae6fd'
    },
    calendarWrapper: {
      position: 'relative'
    }
  };

  return (
    <div style={calendarStyles.container}>
      {/* Start Date Header */}
      <div style={calendarStyles.header}>
        <span>📅</span>
        <span>Start Date</span>
      </div>

      {/* Calendar Component */}
      <div style={calendarStyles.calendarWrapper}>
        <AnalyticsCalendar 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          selectedRange={null}
          onRangeSelect={null}
          showRangeSelection={false}
          showLegend={false}
          compact={true}
        />
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div style={calendarStyles.selectedDisplay}>
          <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
            Selected Start:
          </div>
          <div style={{ fontWeight: '700' }}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div style={{
        fontSize: '10px',
        color: '#64748b',
        textAlign: 'center',
        marginTop: '8px',
        fontStyle: 'italic'
      }}>
        Click a date to set start
      </div>
    </div>
  );
}