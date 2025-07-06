// ============ EndDateCalendar.jsx - End Date Component ============
import React from 'react';
import AnalyticsCalendar from './AnalyticsCalendar';

export default function EndDate({ 
  selectedDate, 
  onDateSelect, 
  startDate = null 
}) {
  
  const handleDateSelect = (date) => {
    // Ensure end date doesn't go before start date
    if (startDate && date < startDate) {
      // If selected end date is before start date, move start date back
      onDateSelect(date, date);
    } else {
      onDateSelect(startDate, date);
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
      backgroundColor: '#fef3c7',
      borderRadius: '6px',
      border: '1px solid #f59e0b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
    },
    selectedDisplay: {
      textAlign: 'center',
      marginTop: '8px',
      fontSize: '11px',
      color: '#d97706',
      fontWeight: '600',
      padding: '4px 8px',
      backgroundColor: '#fefbf3',
      borderRadius: '4px',
      border: '1px solid #fed7aa'
    },
    calendarWrapper: {
      position: 'relative'
    }
  };

  return (
    <div style={calendarStyles.container}>
      {/* End Date Header */}
      <div style={calendarStyles.header}>
        <span>📅</span>
        <span>End Date</span>
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
            Selected End:
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
        Click a date to set end
      </div>
    </div>
  );
}