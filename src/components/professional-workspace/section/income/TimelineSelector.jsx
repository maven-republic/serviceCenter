// ============ TimelineSelector.jsx - Enhanced Layout Structure ============
import React, { useState, useEffect } from 'react';
import AnalyticsCalendar from './calendar/AnalyticsCalendar';
import CalendarIcon from './calendar/CalendarIcon';
import StartDate from './calendar/StartDate';
import EndDate from './calendar/EndDate';

export default function TimelineSelector({ activeTimeline, setActiveTimeline, onDateRangeChange }) {
  const [expandedView, setExpandedView] = useState(null); // 'calendar', null
  const [inputMode, setInputMode] = useState(false); // Toggle between calendar and text inputs
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customRange, setCustomRange] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Predefined quick ranges
  const quickRanges = [
    { key: 'today', label: 'Today', shortLabel: 'Today', days: 1 },
    { key: 'last7days', label: '7 days', shortLabel: '7D', days: 7 },
    { key: 'last30days', label: '30 days', shortLabel: '30D', days: 30 },
    { key: 'thismonth', label: 'This month', shortLabel: 'This Mon', type: 'month' },
    { key: 'lastmonth', label: 'Last month', shortLabel: 'Last Mon', type: 'month' }
  ];

  // Calendar shortcuts for quick selection
  const calendarShortcuts = [
    { key: 'thisweek', label: 'This Week', action: () => getWeekRange(0) },
    { key: 'lastweek', label: 'Last Week', action: () => getWeekRange(-1) },
    { key: 'thismonth', label: 'This Month', action: () => getMonthRange(0) },
    { key: 'lastmonth', label: 'Last Month', action: () => getMonthRange(-1) },
    { key: 'thisquarter', label: 'This Quarter', action: () => getQuarterRange(0) },
    { key: 'custom', label: 'Custom Range', action: () => setExpandedView('custom') }
  ];

  // Generate date range based on selection
  const getDateRange = (rangeKey) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    switch (rangeKey) {
      case 'today':
        return { startDate: startOfToday, endDate: today, label: 'Today' };
      
      case 'last7days':
        const last7Start = new Date(startOfToday);
        last7Start.setDate(last7Start.getDate() - 6);
        return { startDate: last7Start, endDate: today, label: 'Last 7 days' };
      
      case 'last30days':
        const last30Start = new Date(startOfToday);
        last30Start.setDate(last30Start.getDate() - 29);
        return { startDate: last30Start, endDate: today, label: 'Last 30 days' };
      
      case 'thismonth':
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { startDate: thisMonthStart, endDate: today, label: 'This month' };
      
      case 'lastmonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return { startDate: lastMonthStart, endDate: lastMonthEnd, label: 'Last month' };
      
      case 'custom':
        if (customRange) {
          return {
            startDate: customRange.startDate,
            endDate: customRange.endDate,
            label: `${customRange.startDate.toLocaleDateString()} - ${customRange.endDate.toLocaleDateString()}`
          };
        }
        return null;
      
      default:
        return getDateRange('last30days');
    }
  };

  // Helper functions for calendar shortcuts
  const getWeekRange = (offset) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (offset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { startDate: startOfWeek, endDate: endOfWeek };
  };

  const getMonthRange = (offset) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
    return { startDate: startOfMonth, endDate: endOfMonth };
  };

  const getQuarterRange = (offset) => {
    const today = new Date();
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const startOfQuarter = new Date(today.getFullYear(), (currentQuarter + offset) * 3, 1);
    const endOfQuarter = new Date(today.getFullYear(), (currentQuarter + offset + 1) * 3, 0);
    return { startDate: startOfQuarter, endDate: endOfQuarter };
  };

  // Handle timeline selection
  const handleTimelineSelect = (rangeKey) => {
    setActiveTimeline(rangeKey);
    setExpandedView(null);
    setMobileMenuOpen(false);
    
    const dateRange = getDateRange(rangeKey);
    if (dateRange && onDateRangeChange) {
      onDateRangeChange(dateRange);
    }
  };

  // Handle calendar range selection
  const handleCalendarRangeSelect = (range) => {
    setCustomRange(range);
    setActiveTimeline('custom');
    setExpandedView(null);
    
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: range.startDate,
        endDate: range.endDate,
        label: `${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`
      });
    }
  };

  // Handle custom date submission (within calendar)
  const handleCustomDateSubmit = () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    if (new Date(customStartDate) > new Date(customEndDate)) {
      alert('Start date must be before end date');
      return;
    }
    
    const range = {
      startDate: new Date(customStartDate),
      endDate: new Date(customEndDate)
    };
    
    setCustomRange(range);
    setActiveTimeline('custom');
    setExpandedView(null);
    setInputMode(false);
    
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: range.startDate,
        endDate: range.endDate,
        label: `${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`
      });
    }
  };

  // Handle calendar shortcut selection
  const handleShortcutSelect = (shortcut) => {
    if (shortcut.key === 'custom') {
      setInputMode(true); // Switch to input mode within calendar
      return;
    }
    
    const range = shortcut.action();
    setCustomRange(range);
    setActiveTimeline('custom');
    setExpandedView(null);
    setInputMode(false);
    
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: range.startDate,
        endDate: range.endDate,
        label: shortcut.label
      });
    }
  };

  // Toggle expanded views
  const toggleExpandedView = (view) => {
    setExpandedView(expandedView === view ? null : view);
    setMobileMenuOpen(false);
  };

  // Handle button clicks with event prevention
  const handleActionButtonClick = (view, event) => {
    event.stopPropagation(); // Prevent event bubbling
    toggleExpandedView(view);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedView) {
        // Check if click is inside the timeline selector container
        const container = event.target.closest('[data-timeline-selector]');
        
        // Only close if clicking completely outside the container
        if (!container) {
          setExpandedView(null);
        }
      }
    };

    // Use 'mousedown' for better timing
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedView]);

  // Get current selection display
  const getCurrentSelectionLabel = () => {
    const range = quickRanges.find(r => r.key === activeTimeline);
    if (range && activeTimeline !== 'custom') {
      return range.label;
    }
    
    if (activeTimeline === 'custom' && customRange) {
      const start = customRange.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = customRange.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
    
    return 'Last 30 days';
  };

  // Calculate data insights
  const getDataInsights = () => {
    const range = getDateRange(activeTimeline);
    if (!range) return null;
    
    const days = Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24)) + 1;
    const transactions = Math.floor(Math.random() * 1000) + 100; // Sample data
    
    return { days, transactions };
  };

  // Set default timeline on mount
  useEffect(() => {
    if (!activeTimeline) {
      handleTimelineSelect('last30days');
    }
  }, []);

  const insights = getDataInsights();

  const styles = {
    container: {
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      backgroundColor: '#ffffff',
      position: 'relative' // Added for dropdown positioning
    },
    
    // Compact Header
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    headerTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    headerActions: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    actionButton: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: isActive ? '600' : '500',
      backgroundColor: isActive ? '#000000' : '#ffffff',
      color: isActive ? '#ffffff' : '#64748b',
      border: `1px solid ${isActive ? '#000000' : '#d1d5db'}`,
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }),
    
    // Unified Selection Area
    selectionArea: {
      marginBottom: '16px'
    },
    desktopButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    quickButton: (isActive) => ({
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: isActive ? '600' : '500',
      backgroundColor: isActive ? '#000000' : '#ffffff',
      color: isActive ? '#ffffff' : '#64748b',
      border: `1px solid ${isActive ? '#000000' : '#d1d5db'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }),
    mobileSelect: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      outline: 'none'
    },
    
    // Inline Calendar Area
    calendarArea: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      zIndex: 1000,
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      maxWidth: '100%',
      overflow: 'hidden'
    },
    calendarContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 200px',
      gap: '20px',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      }
    },
    shortcuts: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    shortcutButton: {
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#ffffff',
      color: '#64748b',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left'
    },
    calendarActions: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
      justifyContent: 'flex-end'
    },
    
    // Custom Date Inputs
    customArea: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      zIndex: 1000,
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
    },
    customGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr auto 120px auto 100px',
      gap: '12px',
      alignItems: 'end',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '12px'
      }
    },
    dateInput: {
      padding: '8px 12px',
      fontSize: '13px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    
    // Smart Status Bar
    statusBar: {
      background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
      padding: '12px 16px',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px'
    },
    statusLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    statusMain: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#1f2937'
    },
    statusSub: {
      fontSize: '11px',
      color: '#64748b'
    },
    statusRight: {
      fontSize: '11px',
      color: '#64748b',
      fontStyle: 'italic'
    }
  };

  return (
    <div style={styles.container} data-timeline-selector>
      {/* Compact Header */}
      <div style={styles.header}>
        <h6 style={styles.headerTitle}>Timeline Selection</h6>
        <div style={styles.headerActions}>
          <button
            style={styles.actionButton(expandedView === 'calendar')}
            onClick={(e) => handleActionButtonClick('calendar', e)}
            title="Visual calendar"
          >
            📅 Calendar
          </button>
          <button
            className="d-md-none"
            style={styles.actionButton(mobileMenuOpen)}
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            title="More options"
          >
            ≡ Menu
          </button>
        </div>
      </div>

      {/* Unified Selection Area */}
      <div style={styles.selectionArea}>
        {/* Desktop Quick Buttons */}
        <div className="d-none d-md-flex" style={styles.desktopButtons}>
          {quickRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => handleTimelineSelect(range.key)}
              style={styles.quickButton(activeTimeline === range.key)}
              onMouseEnter={(e) => {
                if (activeTimeline !== range.key) {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTimeline !== range.key) {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#d1d5db';
                }
              }}
            >
              {range.shortLabel}
            </button>
          ))}
          
          {activeTimeline === 'custom' && (
            <button style={styles.quickButton(true)}>
              Custom Range
            </button>
          )}
        </div>

        {/* Mobile Select */}
        <div className="d-md-none">
          <select
            style={styles.mobileSelect}
            value={activeTimeline || 'last30days'}
            onChange={(e) => handleTimelineSelect(e.target.value)}
          >
            {quickRanges.map((range) => (
              <option key={range.key} value={range.key}>
                {range.label}
              </option>
            ))}
            {activeTimeline === 'custom' && (
              <option value="custom">Custom Range</option>
            )}
          </select>
        </div>
      </div>

      {/* Enhanced Calendar View (when expanded) */}
      {expandedView === 'calendar' && (
        <div style={styles.calendarArea}>
          {!inputMode ? (
            // Visual Calendar Mode
            <div style={{
              display: 'grid',
              gridTemplateColumns: '280px 280px 200px',
              gap: '20px'
            }}>
              {/* Start Date Calendar Component */}
              <StartDate
                selectedDate={customRange?.startDate}
                endDate={customRange?.endDate}
                onDateSelect={(startDate, endDate) => {
                  setCustomRange({
                    startDate: startDate,
                    endDate: endDate || customRange?.endDate || startDate
                  });
                }}
              />
              
              {/* End Date Calendar Component */}
              <EndDate
                selectedDate={customRange?.endDate}
                startDate={customRange?.startDate}
                onDateSelect={(startDate, endDate) => {
                  setCustomRange({
                    startDate: startDate || customRange?.startDate || endDate,
                    endDate: endDate
                  });
                }}
              />
              
              {/* Quick Shortcuts Panel */}
              <div style={styles.shortcuts}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Quick Shortcuts:
                </div>
                {calendarShortcuts.map((shortcut) => (
                  <button
                    key={shortcut.key}
                    style={styles.shortcutButton}
                    onClick={() => handleShortcutSelect(shortcut)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    {shortcut.key === 'custom' ? '⌨️' : '•'} {shortcut.label}
                  </button>
                ))}
                
                {/* Range Preview */}
                {customRange?.startDate && customRange?.endDate && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
                      📊 Selected Range:
                    </div>
                    <div style={{ fontSize: '12px', color: '#0369a1' }}>
                      {customRange.startDate.toLocaleDateString()} - {customRange.endDate.toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                      {Math.ceil((customRange.endDate - customRange.startDate) / (1000 * 60 * 60 * 24)) + 1} days
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Text Input Mode (within calendar)
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <h6 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  ⌨️ Type Exact Dates
                </h6>
                <button
                  onClick={() => setInputMode(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ← Back to Calendar
                </button>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto 120px',
                gap: '12px',
                alignItems: 'end'
              }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    📅 Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={styles.dateInput}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                  to
                </div>
                
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    📅 End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={styles.dateInput}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                  →
                </div>
                
                <button
                  onClick={handleCustomDateSubmit}
                  style={{
                    ...styles.actionButton(false),
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: '1px solid #000000',
                    padding: '8px 16px'
                  }}
                >
                  Apply Dates
                </button>
              </div>
              
              <div style={{
                marginTop: '12px',
                fontSize: '11px',
                color: '#64748b',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                💡 Enter dates in YYYY-MM-DD format or use the date picker
              </div>
            </div>
          )}
          
          <div style={styles.calendarActions}>
            <button
              style={{
                ...styles.actionButton(false),
                padding: '6px 16px'
              }}
              onClick={() => {
                setExpandedView(null);
                setInputMode(false);
              }}
            >
              Cancel
            </button>
            
            {customRange?.startDate && customRange?.endDate && !inputMode && (
              <button
                style={{
                  ...styles.actionButton(false),
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '1px solid #000000',
                  padding: '6px 16px'
                }}
                onClick={() => {
                  handleCalendarRangeSelect(customRange);
                }}
              >
                Apply Selection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Smart Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusLeft}>
          <div style={styles.statusMain}>
            📊 Viewing: {getCurrentSelectionLabel()}
            {insights && ` (${insights.days} day${insights.days !== 1 ? 's' : ''})`}
          </div>
          {insights && (
            <div style={styles.statusSub}>
              🎯 Data points: {insights.transactions.toLocaleString()} transactions found
            </div>
          )}
        </div>
        
        <div style={styles.statusRight}>
          💡 Pro tip: Use 📅 calendar for visual or precise date selection
        </div>
      </div>
    </div>
  );
}