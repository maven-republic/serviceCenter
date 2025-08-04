// ============ InteractiveChart.jsx - FIXED with consistent prop passing ============
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import DayChart from './charts/DayChart';
import HourChart from './charts/HourChart';
import WeekChart from './charts/WeekChart';
import MonthChart from './charts/MonthChart';

// 🔧 UPDATED: Accept real data props
export default function InteractiveChart({ 
  activeChart, 
  hideEarnings, 
  activeTimeline, 
  dateRange,
  vector = null,
  currencyService = null,
  professionalProfile = null
}) {
  // Each chart type needs its own preview state
  const [previewStates, setPreviewStates] = useState({
    daily: false,
    hourly: false,
    weekly: false,
    monthly: false
  });

  // Get current chart's preview state
  const showPreview = previewStates[activeChart] || false;

  // Set preview state for current chart
  const setShowPreview = (value) => {
    setPreviewStates(prev => ({
      ...prev,
      [activeChart]: value
    }));
  };

  // 🆕 NEW: Common props to pass to all chart components (with real data)
  const commonProps = {
    hideEarnings,
    activeTimeline,
    dateRange,
    showPreview,
    setShowPreview,
    vector,
    currencyService,
    professionalProfile
  };

  // Chart type metadata for header display
  const chartMetadata = {
    daily: {
      title: 'Day to Day Analytics',
      description: 'Track daily income patterns and trends',
      icon: BarChart3,
      color: 'text-primary',
      borderColor: 'border-blue-200'
    },
    hourly: {
      title: 'Hourly Breakdown',
      description: 'Identify peak earning hours throughout the day',
      icon: Clock,
      color: 'text-primary',
      borderColor: 'border-green-200'
    },
    weekly: {
      title: 'Weekly Overview',
      description: 'Monitor weekly performance and growth trends',
      icon: TrendingUp,
      color: 'text-primary',
      borderColor: 'border-purple-200'
    },
    monthly: {
      title: 'Monthly Summary',
      description: 'Review monthly earnings and seasonal patterns',
      icon: Calendar,
      color: 'text-primary',
      borderColor: 'border-orange-200'
    }
  };

  // Get current chart metadata
  const currentChart = chartMetadata[activeChart] || chartMetadata.daily;
  const IconComponent = currentChart.icon;

  // 🔧 FIXED: Render the appropriate chart component with consistent props
  const renderChart = () => {
    switch(activeChart) {
      case 'daily':
        return <DayChart {...commonProps} />;
        
      case 'hourly':
        return <HourChart {...commonProps} />;
        
      case 'weekly':
        return <WeekChart {...commonProps} />;
        
      case 'monthly':
        return <MonthChart {...commonProps} />;
        
      default:
        return <DayChart {...commonProps} />;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        {/* Chart Header */}
        <div className={`
          flex items-center justify-between p-4 border-b border-border
          ${currentChart.bgColor} ${currentChart.borderColor}
        `}>
          <div className="flex items-center gap-3">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-lg
              ${currentChart.bgColor} border ${currentChart.borderColor}
            `}>
              <IconComponent className={`h-5 w-5 ${currentChart.color}`} />
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {currentChart.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {currentChart.description}
              </p>
            </div>
          </div>

          {/* Chart Status Indicators */}
          <div className="flex items-center gap-2">
            {showPreview && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Eye className="h-3 w-3" />
                Preview Mode
              </Badge>
            )}
            
            {hideEarnings && (
              <Badge variant="outline" className="gap-1 text-xs">
                <EyeOff className="h-3 w-3" />
                Hidden
              </Badge>
            )}
            
            {/* 🆕 NEW: Show data type indicator */}
            {vector && (
              <Badge variant="default" className="text-xs">
                {vector.isPreview ? 
                  `${professionalProfile?.address?.country || 'Sample'} Preview` : 
                  'Live Data'
                }
              </Badge>
            )}
            
            <Badge variant="default" className="text-xs capitalize">
              {activeTimeline || 'last30days'}
            </Badge>
          </div>
        </div>

        {/* Chart Content Container */}
        <div className="relative min-h-[400px]">
          {renderChart()}
        </div>

        {/* Chart Footer with Context */}
        <div className="px-4 py-3 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Chart Type: {currentChart.title}</span>
              {dateRange && (
                <span>
                  Range: {dateRange.startDate?.toLocaleDateString()} - {dateRange.endDate?.toLocaleDateString()}
                </span>
              )}
              {/* 🆕 NEW: Show data source */}
              {vector && (
                <span>
                  Source: {vector.isPreview ? 'Sample Data' : 'Real Bookings'}
                  {!vector.isPreview && vector.totalBookings && (
                    ` (${vector.totalBookings} bookings)`
                  )}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>
                {vector?.isPreview ? 'Preview' : 'Live'} Analytics
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}