// ============ TimelineSelector.jsx - Rewritten with Real Data Integration ============
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Target,
  Lightbulb,
  Calendar,
  Clock,
  TrendingUp,
  MapPin,
  Beaker,
  Eye,
  EyeOff
} from 'lucide-react';
import TimelineInterface from './calendar/TimelineInterface';

export default function TimelineSelector({ 
  activeTimeline, 
  setActiveTimeline, 
  onDateRangeChange,
  // 🆕 NEW: Real data props
  vector = null,
  currencyService = null,
  hideEarnings = false,
  professionalProfile = null
}) {
  const [customRange, setCustomRange] = useState(null);

  // Predefined quick ranges
  const quickRanges = [
    { key: 'today', label: 'Today', shortLabel: 'Today', days: 1, icon: Clock },
    { key: 'last7days', label: '7 days', shortLabel: '7D', days: 7, icon: Calendar },
    { key: 'last30days', label: '30 days', shortLabel: '30D', days: 30, icon: BarChart3 },
    { key: 'thismonth', label: 'This month', shortLabel: 'This Month', type: 'month', icon: Target },
    { key: 'lastmonth', label: 'Last month', shortLabel: 'Last Month', type: 'month', icon: TrendingUp }
  ];

  // 🆕 NEW: Get data status for current timeline
  const getDataStatus = () => {
    if (!vector) return { hasData: false, type: 'none' };
    
    const range = getDateRange(activeTimeline);
    if (!range) return { hasData: false, type: 'none' };
    
    // Check if we have data for this date range
    const hasDataForRange = vector.dailyData?.some(day => {
      const dayDate = new Date(day.date);
      return dayDate >= range.startDate && dayDate <= range.endDate;
    });
    
    return {
      hasData: hasDataForRange || vector.isPreview,
      type: vector.isPreview ? 'preview' : 'live',
      dataPoints: hasDataForRange ? vector.dailyData?.length || 0 : 0
    };
  };

  // 🆕 NEW: Get insights for current timeline selection
  const getTimelineInsights = () => {
    if (!vector) return null;
    
    const range = getDateRange(activeTimeline);
    if (!range) return null;
    
    const days = Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Filter data for selected range
    const rangeData = vector.dailyData?.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= range.startDate && dayDate <= range.endDate;
    }) || [];
    
    const totalEarnings = rangeData.reduce((sum, day) => sum + day.earnings, 0);
    const totalBookings = rangeData.reduce((sum, day) => sum + day.bookings, 0);
    const activeDays = rangeData.filter(day => day.earnings > 0).length;
    
    return {
      days,
      totalEarnings,
      totalBookings,
      activeDays,
      averagePerDay: activeDays > 0 ? totalEarnings / activeDays : 0,
      dataAvailability: (rangeData.length / days) * 100
    };
  };

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

  // 🆕 NEW: Format currency with real service
  const formatCurrency = (amount) => {
    if (hideEarnings) return '••••';
    
    if (currencyService) {
      return currencyService.formatCurrency(amount);
    }
    
    return `$${amount.toFixed(0)}`;
  };

  // 🆕 NEW: Get location display
  const getLocationDisplay = () => {
    if (!professionalProfile?.address) return null;
    
    const address = professionalProfile.address;
    const country = address.country || 'Unknown';
    const region = address.parish || address.state || address.province || address.city;
    
    return region ? `${region}, ${country}` : country;
  };

  // Set default timeline on mount
  useEffect(() => {
    if (!activeTimeline) {
      handleTimelineSelect('last30days');
    }
  }, []);

  const dataStatus = getDataStatus();
  const insights = getTimelineInsights();
  const locationDisplay = getLocationDisplay();

  return (
    <Card className="professional-workspace relative mb-6">
      <CardContent className="p-5">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Timeline Selection</h3>
            
            {/* 🆕 NEW: Data mode indicator */}
            {dataStatus.hasData && (
              <Badge 
                variant={dataStatus.type === 'live' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {dataStatus.type === 'live' ? (
                  <>
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Live Data
                  </>
                ) : (
                  <>
                    <Beaker className="h-3 w-3 mr-1" />
                    Preview
                  </>
                )}
              </Badge>
            )}
            
            {/* 🆕 NEW: Location indicator */}
            {locationDisplay && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {locationDisplay}
              </Badge>
            )}
          </div>

          {/* 🆕 NEW: Privacy toggle indicator */}
          <div className="flex items-center gap-2">
            {hideEarnings ? (
              <Badge variant="secondary" className="text-xs">
                <EyeOff className="h-3 w-3 mr-1" />
                Private
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Public
              </Badge>
            )}
          </div>
        </div>

        {/* Main Selection Area */}
        <div className="mb-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex gap-2 flex-wrap items-center justify-between">
            {/* Quick Range Buttons with icons */}
            <div className="flex gap-2 flex-wrap">
              {quickRanges.map((range) => {
                const IconComponent = range.icon;
                const isActive = activeTimeline === range.key;
                
                return (
                  <Button
                    key={range.key}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimelineSelect(range.key)}
                    className="text-xs flex items-center gap-1"
                  >
                    <IconComponent className="h-3 w-3" />
                    {range.shortLabel}
                  </Button>
                );
              })}
              
              {activeTimeline === 'custom' && (
                <Button variant="default" size="sm" className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Custom Range
                </Button>
              )}
            </div>

            {/* Right-aligned TimelineInterface with real data */}
            <TimelineInterface
              selectedRange={customRange}
              onRangeSelect={handleCalendarRangeSelect}
              onDateRangeChange={onDateRangeChange}
              vector={vector}
              currencyService={currencyService}
              hideEarnings={hideEarnings}
              professionalProfile={professionalProfile}
              placeholder="Select analytics period"
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

            {/* Mobile TimelineInterface with real data */}
            <TimelineInterface
              selectedRange={customRange}
              onRangeSelect={handleCalendarRangeSelect}
              onDateRangeChange={onDateRangeChange}
              vector={vector}
              currencyService={currencyService}
              hideEarnings={hideEarnings}
              professionalProfile={professionalProfile}
              placeholder="Select custom range"
              className="w-full"
            />
          </div>
        </div>

        {/* 🆕 NEW: Enhanced Smart Status Bar with Real Data */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="space-y-3">
            {/* Primary Status Line */}
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Viewing: {getCurrentSelectionLabel()}
                  {insights && ` (${insights.days} day${insights.days !== 1 ? 's' : ''})`}
                </div>
                
                {/* 🆕 NEW: Real data insights */}
                {insights && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {!hideEarnings && insights.totalEarnings > 0 && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Total: {formatCurrency(insights.totalEarnings)}
                      </span>
                    )}
                    
                    {insights.totalBookings > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {insights.totalBookings} booking{insights.totalBookings !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {insights.activeDays > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {insights.activeDays} active day{insights.activeDays !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* 🆕 NEW: Data availability indicator */}
              {dataStatus.hasData && (
                <Badge 
                  variant={dataStatus.type === 'live' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {dataStatus.type === 'live' ? 
                    `${dataStatus.dataPoints} data points` : 
                    'Sample data'
                  }
                </Badge>
              )}
            </div>

            {/* 🆕 NEW: Performance indicators */}
            {insights && insights.totalBookings > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Avg/Day:</span>
                    <span className="ml-1 font-medium">
                      {!hideEarnings ? formatCurrency(insights.averagePerDay) : '••••'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Activity:</span>
                    <span className="ml-1 font-medium">
                      {Math.round((insights.activeDays / insights.days) * 100)}%
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <span className="ml-1 font-medium">
                      {Math.round(insights.dataAvailability)}% coverage
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`ml-1 font-medium ${
                      dataStatus.type === 'live' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {dataStatus.type === 'live' ? 'Real data' : 'Preview'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pro tip */}
            <div className="text-xs text-muted-foreground italic flex items-center gap-1 pt-2 border-t border-border">
              <Lightbulb className="h-3 w-3" />
              Pro tip: Use calendar dropdown for precise date selection
              {dataStatus.type === 'preview' && (
                <span className="text-blue-600"> • Real data will appear after your first booking</span>
              )}
            </div>
          </div>
        </div>

        {/* Active Selection Summary */}
        {activeTimeline && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  dataStatus.type === 'live' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="text-muted-foreground">Active Timeline:</span>
                <span className="font-medium text-foreground">
                  {getCurrentSelectionLabel()}
                </span>
                
                {/* 🆕 NEW: Quick stats in summary */}
                {insights && insights.totalBookings > 0 && (
                  <span className="text-muted-foreground">
                    • {insights.totalBookings} booking{insights.totalBookings !== 1 ? 's' : ''}
                    {!hideEarnings && ` • ${formatCurrency(insights.totalEarnings)}`}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {activeTimeline === 'custom' ? (
                  <Badge variant="secondary" className="text-xs">
                    Custom Range
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Preset
                  </Badge>
                )}
                
                {dataStatus.hasData && (
                  <Badge 
                    variant={dataStatus.type === 'live' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {dataStatus.type === 'live' ? 'Live' : 'Preview'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🆕 NEW: No Data State */}
        {!dataStatus.hasData && (
          <div className="mt-3 p-3 bg-muted/30 border border-border rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">No Data Available</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Timeline selection is ready. Analytics will appear once you have booking data for the selected period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}