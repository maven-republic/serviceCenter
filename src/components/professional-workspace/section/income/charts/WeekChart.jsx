import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import ChartBase from './shared/ChartBase';
import { getBaseChartOptions, COLORS } from './shared/ChartUtils';

export default function WeekChart({ 
  hideEarnings, 
  activeTimeline, 
  dateRange, 
  showPreview, 
  setShowPreview,
  vector,
  currencyService,
  professionalProfile
}) {
  // Check if professional has real bookings
  const hasBookings = vector?.bookings?.length > 0;

  // Get weekly earnings data from real analytics
  const getWeeklyData = () => {
    // If no real data, show preview/sample data
    if (!vector?.weeklyData || showPreview) {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        earnings: [3200, 2800, 4100, 3650],
        bookings: [12, 10, 16, 14],
        colors: [COLORS.muted, COLORS.primary, COLORS.muted, COLORS.primary],
        isPreview: true
      };
    }

    // Process real weekly data
    const weeklyStats = vector.weeklyData;
    const labels = [];
    const earnings = [];
    const bookings = [];
    const colors = [];

    // Process each week from the data
    weeklyStats.forEach((week, index) => {
      // Format week labels
      if (week.weekNumber) {
        labels.push(`Week ${week.weekNumber}`);
      } else if (week.startDate) {
        const startDate = new Date(week.startDate);
        const endDate = new Date(week.endDate);
        labels.push(`${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`);
      } else {
        labels.push(`Week ${index + 1}`);
      }

      earnings.push(week.earnings || 0);
      bookings.push(week.bookings || 0);
      
      // Highlight high-performing weeks
      const isHighPerforming = week.earnings > (vector.averageWeeklyEarnings || 0);
      colors.push(isHighPerforming ? COLORS.primary : COLORS.muted);
    });

    return {
      labels,
      earnings,
      bookings,
      colors,
      isPreview: false
    };
  };

  const chartData = getWeeklyData();

  // Format currency values for display
  const formatCurrency = (amount) => {
    if (!currencyService) return `$${amount}`;
    return currencyService.formatCurrency(amount);
  };

  // Calculate weekly insights
  const getWeeklyInsights = () => {
    if (chartData.isPreview) {
      return {
        bestWeek: 'Week 3',
        bestEarnings: formatCurrency(4100),
        totalBookings: 52,
        averagePerWeek: formatCurrency(3437),
        growthTrend: '+12%'
      };
    }

    const maxIndex = chartData.earnings.indexOf(Math.max(...chartData.earnings));
    const totalEarnings = chartData.earnings.reduce((sum, val) => sum + val, 0);
    const totalBookings = chartData.bookings.reduce((sum, val) => sum + val, 0);
    const averageEarnings = totalEarnings / chartData.earnings.length;
    
    // Calculate simple growth trend (last week vs first week)
    const firstWeek = chartData.earnings[0] || 0;
    const lastWeek = chartData.earnings[chartData.earnings.length - 1] || 0;
    const growth = firstWeek > 0 ? Math.round(((lastWeek - firstWeek) / firstWeek) * 100) : 0;
    
    return {
      bestWeek: chartData.labels[maxIndex],
      bestEarnings: formatCurrency(chartData.earnings[maxIndex]),
      totalBookings,
      averagePerWeek: formatCurrency(averageEarnings),
      growthTrend: growth >= 0 ? `+${growth}%` : `${growth}%`
    };
  };

  const insights = getWeeklyInsights();

  // Weekly chart configuration (line chart)
  const chartConfig = {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: hideEarnings ? chartData.bookings : chartData.earnings,
        borderColor: chartData.isPreview ? COLORS.preview : COLORS.primary,
        backgroundColor: chartData.isPreview ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 3,
        borderDash: chartData.isPreview ? [5, 5] : [],
        pointBackgroundColor: chartData.isPreview ? COLORS.preview : COLORS.primary,
        pointBorderColor: COLORS.background,
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      ...getBaseChartOptions(),
      plugins: {
        ...getBaseChartOptions().plugins,
        tooltip: {
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              const index = context.dataIndex;
              const earnings = chartData.earnings[index];
              const bookingCount = chartData.bookings[index];
              
              if (hideEarnings) {
                return `${bookingCount} bookings this week`;
              }
              
              return [
                `Earnings: ${formatCurrency(earnings)}`,
                `Bookings: ${bookingCount}`,
                `Avg per day: ${formatCurrency(earnings / 7)}`
              ];
            }
          }
        }
      }
    }
  };

  // Enhanced Empty State for new professionals
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
        Track Your Weekly Progress! 📅
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Once you have bookings, this chart will show your weekly growth patterns
      </p>
      
      {/* Preview Option */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="mb-6 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
      >
        {showPreview ? 'Hide Preview' : 'Show Weekly Preview'}
      </button>

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
            <span className="text-xs">Track growth</span>
          </Badge>
        </div>
      </div>
    </div>
  );

  // Chart with insights when data exists
  const chartWithInsights = (
    <div className="space-y-4">
      <ChartBase
        chartType="weekly"
        chartData={chartData}
        chartConfig={chartConfig}
        hideEarnings={hideEarnings}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        hasBookings={hasBookings}
        dateRange={dateRange}
        emptyStateComponent={null}
      />
      
      {/* Weekly Insights */}
      {(hasBookings || showPreview) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Best Week</div>
            <div className="text-lg font-semibold text-primary">{insights.bestWeek}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Peak Earnings</div>
            <div className="text-lg font-semibold text-green-600">
              {hideEarnings ? '***' : insights.bestEarnings}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Bookings</div>
            <div className="text-lg font-semibold">{insights.totalBookings}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Growth Trend</div>
            <div className={`text-lg font-semibold ${insights.growthTrend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {insights.growthTrend}
            </div>
          </div>
        </div>
      )}
      
      {/* Preview indicator */}
      {showPreview && (
        <div className="text-center">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Preview Mode - Sample Weekly Data
          </Badge>
        </div>
      )}
    </div>
  );

  // Return appropriate component based on data state
  if (!hasBookings && !showPreview) {
    return emptyStateComponent;
  }

  return chartWithInsights;
}