import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import ChartBase from './shared/ChartBase';
import { getBaseChartOptions, COLORS } from './shared/ChartUtils';

export default function MonthChart({ 
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

  // Get monthly earnings data from real analytics
  const getMonthlyData = () => {
    // If no real data, show preview/sample data
    if (!vector?.monthlyData || showPreview) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        earnings: [8500, 7200, 9800, 11200, 8900, 10500, 12300, 9700, 8800, 10900, 11800, 13200],
        bookings: [34, 28, 42, 48, 36, 45, 52, 41, 38, 47, 50, 56],
        colors: ['#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#000000'],
        isPreview: true
      };
    }

    // Process real monthly data
    const monthlyStats = vector.monthlyData;
    const labels = [];
    const earnings = [];
    const bookings = [];
    const colors = [];

    // Process each month from the data
    monthlyStats.forEach((month, index) => {
      // Format month labels
      if (month.monthName) {
        labels.push(month.monthName);
      } else if (month.date) {
        const date = new Date(month.date);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      } else if (month.year && month.month) {
        const date = new Date(month.year, month.month - 1, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      } else {
        // Fallback to index-based months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels.push(monthNames[index % 12]);
      }

      earnings.push(month.earnings || 0);
      bookings.push(month.bookings || 0);
      
      // Highlight high-performing months (above average)
      const isHighPerforming = month.earnings > (vector.averageMonthlyEarnings || 0);
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

  const chartData = getMonthlyData();

  // Format currency values for display
  const formatCurrency = (amount) => {
    if (!currencyService) return `$${amount}`;
    return currencyService.formatCurrency(amount);
  };

  // Calculate monthly insights
  const getMonthlyInsights = () => {
    if (chartData.isPreview) {
      return {
        bestMonth: 'December',
        bestEarnings: formatCurrency(13200),
        totalBookings: 517,
        averagePerMonth: formatCurrency(10250),
        yearOverYear: '+22%',
        seasonalTrend: 'Peak: Dec-Jan'
      };
    }

    const maxIndex = chartData.earnings.indexOf(Math.max(...chartData.earnings));
    const totalEarnings = chartData.earnings.reduce((sum, val) => sum + val, 0);
    const totalBookings = chartData.bookings.reduce((sum, val) => sum + val, 0);
    const averageEarnings = totalEarnings / chartData.earnings.length;
    
    // Calculate year-over-year growth if we have enough data
    let yearOverYear = 'N/A';
    if (chartData.earnings.length >= 12) {
      const firstHalf = chartData.earnings.slice(0, 6).reduce((sum, val) => sum + val, 0);
      const secondHalf = chartData.earnings.slice(-6).reduce((sum, val) => sum + val, 0);
      if (firstHalf > 0) {
        const growth = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
        yearOverYear = growth >= 0 ? `+${growth}%` : `${growth}%`;
      }
    }

    // Identify seasonal trend (find quarter with highest average)
    const getSeasonalTrend = () => {
      if (chartData.earnings.length < 12) return 'Analyzing...';
      
      const quarters = {
        'Q1 (Jan-Mar)': chartData.earnings.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3,
        'Q2 (Apr-Jun)': chartData.earnings.slice(3, 6).reduce((sum, val) => sum + val, 0) / 3,
        'Q3 (Jul-Sep)': chartData.earnings.slice(6, 9).reduce((sum, val) => sum + val, 0) / 3,
        'Q4 (Oct-Dec)': chartData.earnings.slice(9, 12).reduce((sum, val) => sum + val, 0) / 3
      };
      
      const bestQuarter = Object.keys(quarters).reduce((a, b) => quarters[a] > quarters[b] ? a : b);
      return `Peak: ${bestQuarter}`;
    };
    
    return {
      bestMonth: chartData.labels[maxIndex],
      bestEarnings: formatCurrency(chartData.earnings[maxIndex]),
      totalBookings,
      averagePerMonth: formatCurrency(averageEarnings),
      yearOverYear,
      seasonalTrend: getSeasonalTrend()
    };
  };

  const insights = getMonthlyInsights();

  // Monthly chart configuration (line chart with area fill)
  const chartConfig = {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: hideEarnings ? chartData.bookings : chartData.earnings,
        borderColor: chartData.isPreview ? COLORS.preview : COLORS.primary,
        backgroundColor: chartData.isPreview ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 4,
        borderDash: chartData.isPreview ? [5, 5] : [],
        pointBackgroundColor: chartData.isPreview ? COLORS.preview : COLORS.primary,
        pointBorderColor: COLORS.background,
        pointBorderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10,
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
                return `${bookingCount} bookings this month`;
              }
              
              return [
                `Earnings: ${formatCurrency(earnings)}`,
                `Bookings: ${bookingCount}`,
                `Avg per day: ${formatCurrency(earnings / 30)}`,
                `Avg per booking: ${formatCurrency(bookingCount > 0 ? earnings / bookingCount : 0)}`
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
          {/* Monthly trend line simulation */}
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
        Track Your Monthly Growth! 📈
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Monitor monthly revenue patterns and seasonal trends once you have booking history
      </p>
      
      {/* Preview Option */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="mb-6 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
      >
        {showPreview ? 'Hide Preview' : 'Show Monthly Preview'}
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
            <span className="text-xs">Build history</span>
          </Badge>
        </div>
      </div>
    </div>
  );

  // Chart with insights when data exists
  const chartWithInsights = (
    <div className="space-y-4">
      <ChartBase
        chartType="monthly"
        chartData={chartData}
        chartConfig={chartConfig}
        hideEarnings={hideEarnings}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        hasBookings={hasBookings}
        dateRange={dateRange}
        emptyStateComponent={null}
      />
      
      {/* Monthly Insights */}
      {(hasBookings || showPreview) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Best Month</div>
            <div className="text-lg font-semibold text-primary">{insights.bestMonth}</div>
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
            <div className="text-sm text-muted-foreground">Monthly Average</div>
            <div className="text-lg font-semibold text-blue-600">
              {hideEarnings ? '***' : insights.averagePerMonth}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Growth Trend</div>
            <div className={`text-lg font-semibold ${insights.yearOverYear.startsWith('+') ? 'text-green-600' : insights.yearOverYear.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
              {insights.yearOverYear}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Seasonal Pattern</div>
            <div className="text-sm font-medium text-purple-600">{insights.seasonalTrend}</div>
          </div>
        </div>
      )}
      
      {/* Preview indicator */}
      {showPreview && (
        <div className="text-center">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Preview Mode - Sample Monthly Data
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