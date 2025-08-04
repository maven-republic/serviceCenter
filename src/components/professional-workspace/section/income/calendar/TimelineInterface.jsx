// ============ Updated TimelineInterface.jsx - Real Data Integration ============
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Target,
  Clock,
  ArrowRight,
  Beaker,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnalyticsCalendar from './AnalyticsCalendar';
import StartDate from './StartDate';
import EndDate from './EndDate';

export default function TimelineInterface({
  selectedRange = null,
  onRangeSelect = null,
  onDateRangeChange = null,
  className = "",
  placeholder = "Select dates",
  // 🆕 NEW: Real data props
  vector = null,              // Real analytics data
  currencyService = null,     // Currency formatting service
  hideEarnings = false,       // Privacy toggle
  professionalProfile = null  // User context
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [tempStartDate, setTempStartDate] = useState(selectedRange?.startDate || null);
  const [tempEndDate, setTempEndDate] = useState(selectedRange?.endDate || null);

  // Handle range selection from main calendar
  const handleRangeSelect = (range) => {
    setTempStartDate(range.startDate);
    setTempEndDate(range.endDate);
    
    // Auto-apply for main calendar selections
    const finalRange = {
      startDate: range.startDate,
      endDate: range.endDate,
      label: formatDateRange(range.startDate, range.endDate)
    };
    
    onRangeSelect?.(finalRange);
    onDateRangeChange?.(finalRange);
    setIsOpen(false);
  };

  // Handle individual date changes from start/end components
  const handleStartDateSelect = (startDate, endDate) => {
    setTempStartDate(startDate);
    if (endDate) setTempEndDate(endDate);
  };

  const handleEndDateSelect = (startDate, endDate) => {
    if (startDate) setTempStartDate(startDate);
    setTempEndDate(endDate);
  };

  // Apply the manually selected range
  const handleApplyRange = () => {
    if (tempStartDate && tempEndDate) {
      const finalRange = {
        startDate: tempStartDate,
        endDate: tempEndDate,
        label: formatDateRange(tempStartDate, tempEndDate)
      };
      
      onRangeSelect?.(finalRange);
      onDateRangeChange?.(finalRange);
      setIsOpen(false);
    }
  };

  // Reset to original values
  const handleCancel = () => {
    setTempStartDate(selectedRange?.startDate || null);
    setTempEndDate(selectedRange?.endDate || null);
    setIsOpen(false);
  };

  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
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

  // Calculate days in range
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  // Get display text for trigger button
  const getDisplayText = () => {
    if (selectedRange?.startDate && selectedRange?.endDate) {
      return formatDateRange(selectedRange.startDate, selectedRange.endDate);
    }
    return placeholder;
  };

  // Check if we have a valid temp range for manual selection
  const hasValidTempRange = tempStartDate && tempEndDate && tempStartDate <= tempEndDate;
  const tempDays = calculateDays(tempStartDate, tempEndDate);

  // 🆕 NEW: Get data availability status
  const getDataStatus = () => {
    if (!vector) return { hasData: false, type: 'none' };
    if (vector.isPreview) return { hasData: true, type: 'preview' };
    return { hasData: true, type: 'live' };
  };

  const dataStatus = getDataStatus();

  return (
    <div className={cn("professional-workspace", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-64 justify-between"
            data-professional="true"
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {getDisplayText()}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {/* 🆕 NEW: Data availability indicator */}
              {dataStatus.hasData && (
                <Badge 
                  variant={dataStatus.type === 'live' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {dataStatus.type === 'live' ? (
                    <BarChart3 className="h-2 w-2 mr-1" />
                  ) : (
                    <Beaker className="h-2 w-2 mr-1" />
                  )}
                  {dataStatus.type === 'live' ? 'Data' : 'Preview'}
                </Badge>
              )}
              
              {selectedRange?.startDate && selectedRange?.endDate && (
                <Badge variant="secondary" className="text-xs">
                  {calculateDays(selectedRange.startDate, selectedRange.endDate)} days
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-[480px] p-0"
          data-professional="true"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Select Date Range</CardTitle>
                  
                  {/* 🆕 NEW: Data mode indicator in header */}
                  {dataStatus.hasData && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-background border-border"
                    >
                      {dataStatus.type === 'live' ? (
                        <>
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Live Analytics
                        </>
                      ) : (
                        <>
                          <Beaker className="h-3 w-3 mr-1" />
                          Preview Mode
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* 🆕 NEW: Data context description */}
              {dataStatus.hasData && (
                <p className="text-xs text-muted-foreground mt-1">
                  {dataStatus.type === 'live' ? 
                    `Calendar shows real booking data${!hideEarnings ? ' with earnings indicators' : ''}` :
                    'Preview calendar with sample earning patterns'
                  }
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calendar" className="text-xs">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Quick Select
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    Precise Dates
                  </TabsTrigger>
                </TabsList>
                
                {/* Quick Calendar Selection */}
                <TabsContent value="calendar" className="space-y-4">
                  <div className="text-xs text-muted-foreground text-center">
                    Click start date, then end date to select range
                    {dataStatus.hasData && !hideEarnings && (
                      <span className="text-primary"> • Dots show earnings days</span>
                    )}
                  </div>
                  
                  {/* 🆕 UPDATED: AnalyticsCalendar with real data props */}
                  <AnalyticsCalendar
                    selectedRange={null}
                    onRangeSelect={handleRangeSelect}
                    showRangeSelection={true}
                    compact={true}
                    vector={vector}                    // 🆕 Real analytics data
                    currencyService={currencyService}  // 🆕 Currency formatting
                    hideEarnings={hideEarnings}        // 🆕 Privacy toggle
                    professionalProfile={professionalProfile} // 🆕 User context
                    showLegend={false}                 // Compact mode, hide legend
                  />
                </TabsContent>
                
                {/* Manual Date Selection */}
                <TabsContent value="manual" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <StartDate
                      selectedDate={tempStartDate}
                      onDateSelect={handleStartDateSelect}
                      endDate={tempEndDate}
                      compact={true}
                      showHelper={false}
                    />
                    
                    <EndDate
                      selectedDate={tempEndDate}
                      onDateSelect={handleEndDateSelect}
                      startDate={tempStartDate}
                      compact={true}
                      showHelper={false}
                    />
                  </div>
                  
                  {/* Range Summary */}
                  {hasValidTempRange && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="font-medium text-primary">Range Preview</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {tempDays} day{tempDays !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-foreground">
                        {formatDateRange(tempStartDate, tempEndDate)}
                      </div>
                    </div>
                  )}
                  
                  {/* Manual Selection Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCancel}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={handleApplyRange}
                      disabled={!hasValidTempRange}
                      className="text-xs"
                    >
                      Apply Range
                      {hasValidTempRange && (
                        <ArrowRight className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Current Selection Status */}
              {selectedRange?.startDate && selectedRange?.endDate && (
                <div className="p-2 bg-muted/50 border border-border rounded-md">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground">Current Selection:</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs font-medium text-foreground">
                    {formatDateRange(selectedRange.startDate, selectedRange.endDate)}
                  </div>
                </div>
              )}
              
              {/* Quick Presets */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-foreground">Quick Presets:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Last 7 days', days: 7 },
                    { label: 'Last 30 days', days: 30 },
                    { label: 'Last 90 days', days: 90 }
                  ].map((preset) => (
                    <Button
                      key={preset.days}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => {
                        const endDate = new Date();
                        const startDate = new Date();
                        startDate.setDate(endDate.getDate() - preset.days + 1);
                        handleRangeSelect({ startDate, endDate });
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 🆕 NEW: No Data State */}
              {!dataStatus.hasData && (
                <div className="p-3 bg-muted/30 border border-border rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Calendar Preview</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Date selection is available. Earnings indicators will appear once you have booking data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}