// ============ WeekChart.jsx ============
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import ChartBase from './shared/ChartBase';
import { generateEarnings, calculateDaysDiff, getBaseChartOptions, COLORS } from './shared/ChartUtils';

export default function WeekChart({ hideEarnings, activeTimeline, dateRange, showPreview, setShowPreview }) {
  const hasBookings = false; // This would come from your app state/API

  // Generate weekly chart data
  const generateWeeklyData = () => {
    if (!dateRange) {
      // Default data - current month weeks
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        earnings: [3200, 2800, 4100, 3650],
        colors: [COLORS.muted, COLORS.primary, COLORS.muted, COLORS.primary]
      };
    }

    const daysDiff = calculateDaysDiff(dateRange.startDate, dateRange.endDate);
    
    if (daysDiff <= 7) {
      // Single week view
      return {
        labels: ['This Week'],
        earnings: [5950],
        colors: [COLORS.primary]
      };
    } else {
      // Multiple weeks
      const weekCount = Math.ceil(daysDiff / 7);
      const labels = Array.from({ length: Math.min(weekCount, 12) }, (_, i) => `Week ${i + 1}`);
      const colors = labels.map((_, i) => i % 2 === 0 ? COLORS.primary : COLORS.muted);
      
      return {
        labels,
        earnings: generateEarnings(labels.length, 3000),
        colors
      };
    }
  };

  const chartData = generateWeeklyData();

  // Weekly chart configuration (line chart)
  const chartConfig = {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.earnings,
        borderColor: showPreview ? COLORS.preview : COLORS.primary,
        backgroundColor: showPreview ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 3,
        borderDash: showPreview ? [5, 5] : [],
        pointBackgroundColor: showPreview ? COLORS.preview : COLORS.primary,
        pointBorderColor: COLORS.background,
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4
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
          {/* Weekly trend line simulation */}
          <polyline
            points="15,55 35,40 55,45 75,25 95,30"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
            className="animate-pulse"
            style={{ animationDuration: '2.5s' }}
          />
          
          {/* Data points */}
          {[15, 35, 55, 75, 95].map((x, index) => {
            const y = [55, 40, 45, 25, 30][index];
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#cbd5e1"
                className="animate-pulse"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '2.5s'
                }}
              />
            );
          })}
          
          {/* Axes */}
          <line x1="8" y1="70" x2="112" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
          <line x1="8" y1="10" x2="8" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
        </svg>
      </div>

      {/* Main Message */}
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Your weekly overview chart is ready! 📅
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Monitor weekly progress and growth patterns
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
      chartType="weekly"
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