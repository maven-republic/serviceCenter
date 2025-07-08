// ============ CalendarHeader.jsx - Month/year navigation ============
import React from 'react';
import { getMonthYearDisplay, navigateMonth } from './CalendarUtils';

export default function CalendarHeader({ currentMonth, onMonthChange }) {
  const headerStyles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    monthYear: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0,
      userSelect: 'none'
    },
    navButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '18px',
      color: '#64748b',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      outline: 'none',
      fontWeight: '600',
      lineHeight: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '36px',
      height: '36px'
    },
    todayButton: {
      backgroundColor: 'transparent',
      border: '1px solid #e2e8f0',
      fontSize: '12px',
      color: '#64748b',
      cursor: 'pointer',
      padding: '4px 12px',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      outline: 'none',
      fontWeight: '500'
    }
  };

  const handlePreviousMonth = () => {
    const newMonth = navigateMonth(currentMonth, -1);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = navigateMonth(currentMonth, 1);
    onMonthChange(newMonth);
  };

  const handleTodayClick = () => {
    onMonthChange(new Date());
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  return (
    <div style={headerStyles.container}>
      {/* Previous Month Button */}
      <button
        style={headerStyles.navButton}
        onClick={handlePreviousMonth}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f1f5f9';
          e.target.style.color = '#1f2937';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#64748b';
          e.target.style.transform = 'scale(1)';
        }}
        title="Previous month"
      >
        ‹
      </button>

      {/* Month/Year Display with Today Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={headerStyles.monthYear}>
          {getMonthYearDisplay(currentMonth)}
        </div>
        
        {!isCurrentMonth() && (
          <button
            style={headerStyles.todayButton}
            onClick={handleTodayClick}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#64748b';
              e.target.style.color = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.color = '#64748b';
            }}
            title="Go to current month"
          >
            Today
          </button>
        )}
      </div>

      {/* Next Month Button */}
      <button
        style={headerStyles.navButton}
        onClick={handleNextMonth}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f1f5f9';
          e.target.style.color = '#1f2937';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#64748b';
          e.target.style.transform = 'scale(1)';
        }}
        title="Next month"
      >
        ›
      </button>
    </div>
  );
}