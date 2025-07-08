// ============ TimelineSelector.jsx - Tailwind + shadcn/ui Version ============
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ChevronDown, 
  BarChart3, 
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
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

  return (
    <Card className="relative mb-6" data-timeline-selector>
      <CardContent className="p-5">
        {/* Compact Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-foreground">Timeline Selection</h3>
          <div className="flex gap-2 items-center">
            <Button
              variant={expandedView === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={(e) => handleActionButtonClick('calendar', e)}
              className="gap-1 text-xs"
            >
              <Calendar className="h-3 w-3" />
              Calendar
            </Button>
            <Button
              variant={mobileMenuOpen ? 'default' : 'outline'}
              size="sm"
              className="md:hidden gap-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
            >
              <ChevronDown className="h-3 w-3" />
              Menu
            </Button>
          </div>
        </div>

        {/* Unified Selection Area */}
        <div className="mb-4">
          {/* Desktop Quick Buttons */}
          <div className="hidden md:flex gap-2 flex-wrap items-center">
            {quickRanges.map((range) => (
              <Button
                key={range.key}
                variant={activeTimeline === range.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimelineSelect(range.key)}
                className="text-xs"
              >
                {range.shortLabel}
              </Button>
            ))}
            
            {activeTimeline === 'custom' && (
              <Button variant="default" size="sm" className="text-xs">
                Custom Range
              </Button>
            )}
          </div>

          {/* Mobile Select */}
          <div className="md:hidden">
            <select
              className="w-full p-2 text-sm border border-input bg-background rounded-md outline-none"
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
          <div className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-lg p-5 mt-2 shadow-lg max-w-full overflow-hidden">
            {!inputMode ? (
              // Visual Calendar Mode
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Start Date Calendar Component */}
                <div className="lg:col-span-1">
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
                </div>
                
                {/* End Date Calendar Component */}
                <div className="lg:col-span-1">
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
                </div>
                
                {/* Quick Shortcuts Panel */}
                <div className="lg:col-span-1 space-y-2">
                  <div className="text-xs font-semibold text-foreground mb-2">
                    Quick Shortcuts:
                  </div>
                  {calendarShortcuts.map((shortcut) => (
                    <Button
                      key={shortcut.key}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => handleShortcutSelect(shortcut)}
                    >
                      {shortcut.key === 'custom' ? '⌨️' : '•'} {shortcut.label}
                    </Button>
                  ))}
                  
                  {/* Range Preview */}
                  {customRange?.startDate && customRange?.endDate && (
                    <Card className="mt-4 bg-blue-50 border-blue-200">
                      <CardContent className="p-3">
                        <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          Selected Range:
                        </div>
                        <div className="text-xs text-blue-700">
                          {customRange.startDate.toLocaleDateString()} - {customRange.endDate.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.ceil((customRange.endDate - customRange.startDate) / (1000 * 60 * 60 * 24)) + 1} days
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              // Text Input Mode (within calendar)
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                    ⌨️ Type Exact Dates
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputMode(false)}
                    className="text-xs"
                  >
                    ← Back to Calendar
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      📅 Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full p-2 text-xs border border-input bg-background rounded-md outline-none"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="flex items-end pb-2 justify-center text-sm text-muted-foreground">
                    to
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      📅 End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full p-2 text-xs border border-input bg-background rounded-md outline-none"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="flex items-end pb-2 justify-center text-sm text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  
                  <Button
                    onClick={handleCustomDateSubmit}
                    className="text-xs"
                  >
                    Apply Dates
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md border border-border">
                  💡 Enter dates in YYYY-MM-DD format or use the date picker
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExpandedView(null);
                  setInputMode(false);
                }}
              >
                Cancel
              </Button>
              
              {customRange?.startDate && customRange?.endDate && !inputMode && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleCalendarRangeSelect(customRange);
                  }}
                >
                  Apply Selection
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Smart Status Bar */}
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-3 rounded-lg flex justify-between items-center flex-wrap gap-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Viewing: {getCurrentSelectionLabel()}
              {insights && ` (${insights.days} day${insights.days !== 1 ? 's' : ''})`}
            </div>
            {insights && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Data points: {insights.transactions.toLocaleString()} transactions found
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground italic flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Pro tip: Use calendar for visual or precise date selection
          </div>
        </div>
      </CardContent>
    </Card>
  );
}