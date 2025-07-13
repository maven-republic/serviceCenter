import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import ChartBase from './shared/ChartBase';
import { getBaseChartOptions, COLORS } from './shared/ChartUtils';

export default function HourChart({ 
  hideEarnings, 
  activeTimeline, 
  dateRange, 
  showPreview, 
  setShowPreview,
  vector,
  currencyService 
}) {
  // Check if professional has real bookings
  const hasBookings = vector?.bookings?.length > 0;

  // Get hourly earnings data from real analytics
  const getHourlyData = () => {
    // If no real data, show preview/sample data
    if (!vector?.hourlyData || showPreview) {
      return {
        labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'],
        earnings: [450, 1200, 1800, 2200, 1500, 1300, 2000, 2800, 1600, 1400, 1800, 2500, 3200, 3800, 4200, 3500],
        bookings: [2, 4, 6, 8, 5, 4, 7, 10, 6, 5, 6, 9, 12, 14, 15, 13],
        colors: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000'],
        isPreview: true
      };
    }

    // Process real hourly data
    const hourlyStats = vector.hourlyData;
    const labels = [];
    const earnings = [];
    const bookings = [];
    const colors = [];

    // Generate 16 hour slots (6AM to 9PM)
    for (let hour = 6; hour <= 21; hour++) {
      const timeLabel = hour <= 12 ? `${hour}AM` : `${hour - 12}PM`;
      if (hour === 12) labels.push('12PM');
      else labels.push(timeLabel);

      const hourData = hourlyStats.find(h => h.hour === hour) || { earnings: 0, bookings: 0 };
      earnings.push(hourData.earnings || 0);
      bookings.push(hourData.bookings || 0);
      
      // Highlight peak hours (highest earning hours)
      const isPeakHour = hourData.earnings > (vector.averageHourlyEarnings || 0);
      colors.push(isPeakHour ? COLORS.primary : COLORS.muted);
    }

    return {
      labels,
      earnings,
      bookings,
      colors,
      isPreview: false
    };
  };

  const chartData = getHourlyData();

  // Format currency values for display
  const formatCurrency = (amount) => {
    if (!currencyService) return `$${amount}`;
    return currencyService.formatCurrency(amount);
  };

  // Calculate hourly insights
  const getHourlyInsights = () => {
    if (chartData.isPreview) {
      return {
        peakHour: '4PM',
        peakEarnings: formatCurrency(4200),
        totalBookings: 124,
        averagePerHour: formatCurrency(2100)
      };
    }

    const maxIndex = chartData.earnings.indexOf(Math.max(...chartData.earnings));
    const totalEarnings = chartData.earnings.reduce((sum, val) => sum + val, 0);
    const totalBookings = chartData.bookings.reduce((sum, val) => sum + val, 0);
    
    return {
      peakHour: chartData.labels[maxIndex],
      peakEarnings: formatCurrency(chartData.earnings[maxIndex]),
      totalBookings,
      averagePerHour: formatCurrency(totalEarnings / chartData.earnings.length)
    };
  };

  const insights = getHourlyInsights();

  // Hourly chart configuration (bar chart)
  const chartConfig = {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: hideEarnings ? chartData.bookings : chartData.earnings,
        backgroundColor: chartData.isPreview 
          ? chartData.colors.map(color => color === COLORS.primary ? COLORS.preview : '#e2e8f0')
          : chartData.colors,
        borderRadius: 3,
        borderSkipped: false,
        opacity: chartData.isPreview ? 0.7 : 1
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
                return `${bookingCount} bookings`;
              }
              
              return [
                `Earnings: ${formatCurrency(earnings)}`,
                `Bookings: ${bookingCount}`
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
        Discover Your Peak Hours! ⏰
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Once you start getting bookings, this chart will show your most profitable hours
      </p>
      
      {/* Preview Option */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="mb-6 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
      >
        {showPreview ? 'Hide Preview' : 'Show Preview Example'}
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
            <span className="text-xs">Optimize schedule</span>
          </Badge>
        </div>
      </div>
    </div>
  );

  // Chart with insights when data exists
  const chartWithInsights = (
    <div className="space-y-4">
      <ChartBase
        chartType="hourly"
        chartData={chartData}
        chartConfig={chartConfig}
        hideEarnings={hideEarnings}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        hasBookings={hasBookings}
        dateRange={dateRange}
        emptyStateComponent={null}
      />
      
      {/* Hourly Insights */}
      {(hasBookings || showPreview) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Peak Hour</div>
            <div className="text-lg font-semibold text-primary">{insights.peakHour}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Peak Earnings</div>
            <div className="text-lg font-semibold text-green-600">
              {hideEarnings ? '***' : insights.peakEarnings}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Bookings</div>
            <div className="text-lg font-semibold">{insights.totalBookings}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Avg/Hour</div>
            <div className="text-lg font-semibold text-blue-600">
              {hideEarnings ? '***' : insights.averagePerHour}
            </div>
          </div>
        </div>
      )}
      
      {/* Preview indicator */}
      {showPreview && (
        <div className="text-center">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Preview Mode - Sample Data
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