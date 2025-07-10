// ============ TimelineSelector.jsx - Updated with TimelineInterface Integration ============
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Target,
  Lightbulb
} from 'lucide-react';
import TimelineInterface from './calendar/TimelineInterface';

export default function TimelineSelector({ activeTimeline, setActiveTimeline, onDateRangeChange }) {
  const [customRange, setCustomRange] = useState(null);

  // Predefined quick ranges
  const quickRanges = [
    { key: 'today', label: 'Today', shortLabel: 'Today', days: 1 },
    { key: 'last7days', label: '7 days', shortLabel: '7D', days: 7 },
    { key: 'last30days', label: '30 days', shortLabel: '30D', days: 30 },
    { key: 'thismonth', label: 'This month', shortLabel: 'This Mon', type: 'month' },
    { key: 'lastmonth', label: 'Last month', shortLabel: 'Last Mon', type: 'month' }
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

  // Handle timeline selection
  const handleTimelineSelect = (rangeKey) => {
    setActiveTimeline(rangeKey);
    
    const dateRange = getDateRange(rangeKey);
    if (dateRange && onDateRangeChange) {
      onDateRangeChange(dateRange);
    }
  };

  // Handle calendar range selection from TimelineInterface
  const handleCalendarRangeSelect = (range) => {
    setCustomRange(range);
    setActiveTimeline('custom');
    
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: range.startDate,
        endDate: range.endDate,
        label: range.label || `${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`
      });
    }
  };

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
    <Card className="professional-workspace relative mb-6">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-foreground">Timeline Selection</h3>
        </div>

        {/* Main Selection Area */}
        <div className="mb-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex gap-2 flex-wrap items-center justify-between">
            {/* Quick Range Buttons */}
            <div className="flex gap-2 flex-wrap">
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

            {/* Right-aligned TimelineInterface */}
            <TimelineInterface
              selectedRange={customRange}
              onRangeSelect={handleCalendarRangeSelect}
              onDateRangeChange={onDateRangeChange}
              placeholder="Custom range"
            />
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-3">
            {/* Mobile Select for Quick Ranges */}
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

            {/* Mobile TimelineInterface */}
            <TimelineInterface
              selectedRange={customRange}
              onRangeSelect={handleCalendarRangeSelect}
              onDateRangeChange={onDateRangeChange}
              placeholder="Select custom range"
              className="w-full"
            />
          </div>
        </div>

        {/* Smart Status Bar */}
        <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center flex-wrap gap-2">
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
            Pro tip: Use calendar dropdown for precise date selection
          </div>
        </div>

        {/* Active Selection Summary */}
        {activeTimeline && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-muted-foreground">Active Timeline:</span>
                <span className="font-medium text-foreground">
                  {getCurrentSelectionLabel()}
                </span>
              </div>
              
              {activeTimeline === 'custom' ? (
                <Badge variant="secondary" className="text-xs">
                  Custom Range
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Preset
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}