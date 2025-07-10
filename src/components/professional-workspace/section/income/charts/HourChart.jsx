import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import ChartBase from './shared/ChartBase';
import { generateEarnings, calculateDaysDiff, getBaseChartOptions, COLORS } from './shared/ChartUtils';

export default function HourChart({ hideEarnings, activeTimeline, dateRange, showPreview, setShowPreview }) {
  const hasBookings = false; // This would come from your app state/API

  // Generate hourly chart data
  const generateHourlyData = () => {
    // Hourly data is typically consistent regardless of date range
    // Shows peak earning hours throughout the day
    return {
      labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'],
      earnings: dateRange 
        ? generateEarnings(16, 150) 
        : [45, 120, 180, 220, 150, 130, 200, 280, 160, 140, 180, 250, 320, 380, 420, 350],
      colors: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000']
    };
  };

  const chartData = generateHourlyData();

  // Hourly chart configuration (bar chart)
  const chartConfig = {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.earnings,
        backgroundColor: showPreview 
          ? chartData.colors.map(color => color === COLORS.primary ? COLORS.preview : '#e2e8f0')
          : chartData.colors,
        borderRadius: 3,
        borderSkipped: false,
        opacity: showPreview ? 0.7 : 1
      }]
    },
    options: getBaseChartOptions()
  };

  // Beta Empty State
  const emptyStateComponent = (
    <div className="flex flex-col items-center justify-center text-center min-h-[280px]">
      {/* Animated Chart Placeholder */}
      <div className="mb-4">
        <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-70">
          {/* Hourly bars simulation */}
          {Array.from({ length: 8 }, (_, index) => (
            <rect
              key={index}
              x={index * 14 + 8}
              y={60 - (Math.sin(index * 0.5) * 20 + 20)}
              width="10"
              height={Math.sin(index * 0.5) * 20 + 25}
              fill="#e2e8f0"
              rx="1"
              className="animate-pulse"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: '2s'
              }}
            />
          ))}
          
          {/* Axes */}
          <line x1="8" y1="70" x2="112" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
          <line x1="8" y1="10" x2="8" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
        </svg>
      </div>

      {/* Main Message */}
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Your hourly trends chart is ready! ⏰
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Discover your peak earning hours and optimize your schedule
      </p>

      {/* Steps Indicator */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-primary hover:bg-primary gap-1">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs">Profile setup</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-500 text-yellow-50 hover:bg-yellow-500 gap-1">
            <span className="text-xs font-bold">2</span>
            <span className="text-xs">Get first booking</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <span className="text-xs font-bold">3</span>
            <span className="text-xs">Watch earnings grow</span>
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <ChartBase
      chartType="hourly"
      chartData={chartData}
      chartConfig={chartConfig}
      hideEarnings={hideEarnings}
      showPreview={showPreview}
      setShowPreview={setShowPreview}
      hasBookings={hasBookings}
      dateRange={dateRange}
      emptyStateComponent={emptyStateComponent}
    />
  );
}