// ============ MonthChart.jsx ============
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import ChartBase from './shared/ChartBase';
import { generateEarnings, calculateDaysDiff, getBaseChartOptions, COLORS } from './shared/ChartUtils';

export default function MonthChart({ hideEarnings, activeTimeline, dateRange, showPreview, setShowPreview }) {
  const hasBookings = false; // This would come from your app state/API

  // Generate monthly chart data
  const generateMonthlyData = () => {
    if (!dateRange) {
      // Default data - full year
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        earnings: [8500, 7200, 9800, 11200, 8900, 10500, 12300, 9700, 8800, 10900, 11800, 13200],
        colors: ['#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#000000']
      };
    }

    const daysDiff = calculateDaysDiff(dateRange.startDate, dateRange.endDate);
    
    if (daysDiff <= 31) {
      // Single month view
      const monthName = dateRange.startDate.toLocaleDateString('en-US', { month: 'short' });
      return {
        labels: [monthName],
        earnings: [daysDiff * 400 + Math.random() * 2000],
        colors: [COLORS.primary]
      };
    } else {
      // Multiple months
      const startMonth = dateRange.startDate.getMonth();
      const startYear = dateRange.startDate.getFullYear();
      const monthsDiff = Math.ceil(daysDiff / 30);
      
      const labels = [];
      const colors = [];
      
      for (let i = 0; i < Math.min(monthsDiff, 12); i++) {
        const monthDate = new Date(startYear, startMonth + i, 1);
        labels.push(monthDate.toLocaleDateString('en-US', { month: 'short' }));
        colors.push(i % 3 === 0 ? COLORS.primary : COLORS.muted);
      }
      
      return {
        labels,
        earnings: generateEarnings(labels.length, 10000),
        colors
      };
    }
  };

  const chartData = generateMonthlyData();

  // Monthly chart configuration (line chart)
  const chartConfig = {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.earnings,
        borderColor: showPreview ? COLORS.preview : COLORS.primary,
        backgroundColor: showPreview ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 4,
        borderDash: showPreview ? [5, 5] : [],
        pointBackgroundColor: showPreview ? COLORS.preview : COLORS.primary,
        pointBorderColor: COLORS.background,
        pointBorderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10,
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
          {/* Line chart simulation */}
          <polyline
            points="10,60 25,45 40,50 55,30 70,35 85,20 100,25"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
            className="animate-pulse"
            style={{ animationDuration: '2s' }}
          />
          
          {/* Data points */}
          {[10, 25, 40, 55, 70, 85, 100].map((x, index) => (
            <circle
              key={index}
              cx={x}
              cy={60 - index * 5 - Math.random() * 15}
              r="3"
              fill="#cbd5e1"
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
        Your monthly earnings chart is ready! 📈
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Analyze monthly revenue patterns and year-over-year growth
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
      chartType="monthly"
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