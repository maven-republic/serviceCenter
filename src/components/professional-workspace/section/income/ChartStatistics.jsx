'use client'

// 🔧 UPDATED: Accept real data props instead of using hardcoded stats
export default function ChartStatistics({ activeChart, hideEarnings, vector = null, currencyService = null }) {
  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••'
    
    if (currencyService) {
      return currencyService.formatCurrency(amount);
    }
    
    // Fallback
    return `$${amount.toFixed(2)}`
  }

  // 🆕 NEW: Get real stats from vector data
  const getStats = () => {
    if (!vector) {
      // Fallback to sample data when no vector available
      return getDefaultStats();
    }

    switch (activeChart) {
      case 'daily':
        return getDailyStats();
      case 'hourly':
        return getHourlyStats();
      case 'weekly':
        return getWeeklyStats();
      case 'monthly':
        return getMonthlyStats();
      default:
        return getDefaultStats();
    }
  }

  // 🆕 NEW: Calculate real daily statistics
  const getDailyStats = () => {
    if (!vector.dailyData || vector.dailyData.length === 0) {
      return getDefaultDailyStats();
    }

    const dailyEarnings = vector.dailyData.map(day => day.earnings);
    const dailyBookings = vector.dailyData.map(day => day.bookings);
    
    const bestDay = vector.dailyData.reduce((max, day) => 
      day.earnings > max.earnings ? day : max, vector.dailyData[0]
    );
    
    const totalEarnings = dailyEarnings.reduce((sum, val) => sum + val, 0);
    const avgEarnings = totalEarnings / dailyEarnings.length;
    const totalBookings = dailyBookings.reduce((sum, val) => sum + val, 0);
    
    // Calculate growth (first half vs second half)
    const halfPoint = Math.floor(vector.dailyData.length / 2);
    const firstHalf = vector.dailyData.slice(0, halfPoint);
    const secondHalf = vector.dailyData.slice(halfPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.earnings, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.earnings, 0) / secondHalf.length;
    
    const growthPercent = firstHalfAvg > 0 ? 
      Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0;

    return [
      { 
        label: 'Best Day', 
        value: bestDay.date ? new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) : 'N/A', 
        detail: formatEarnings(bestDay.earnings), 
        highlight: true 
      },
      { 
        label: 'Daily Average', 
        value: formatEarnings(avgEarnings), 
        detail: `${Math.round(totalBookings / vector.dailyData.length)} bookings avg`, 
        highlight: false 
      },
      { 
        label: 'Period Total', 
        value: formatEarnings(totalEarnings), 
        detail: `${growthPercent >= 0 ? '+' : ''}${growthPercent}% trend`, 
        highlight: Math.abs(growthPercent) > 10 
      }
    ];
  }

  // 🆕 NEW: Calculate real hourly statistics
  const getHourlyStats = () => {
    if (!vector.hourlyData || vector.hourlyData.length === 0) {
      return getDefaultHourlyStats();
    }

    const peakHour = vector.hourlyData.reduce((max, hour) => 
      hour.earnings > max.earnings ? hour : max, vector.hourlyData[0]
    );
    
    const totalEarnings = vector.hourlyData.reduce((sum, hour) => sum + hour.earnings, 0);
    const avgEarnings = totalEarnings / vector.hourlyData.length;
    const totalBookings = vector.hourlyData.reduce((sum, hour) => sum + hour.bookings, 0);
    
    // Find peak window (3 consecutive hours with highest total)
    let bestWindow = { start: 6, end: 9, total: 0 };
    for (let i = 0; i < vector.hourlyData.length - 2; i++) {
      const windowTotal = vector.hourlyData.slice(i, i + 3).reduce((sum, h) => sum + h.earnings, 0);
      if (windowTotal > bestWindow.total) {
        const startHour = vector.hourlyData[i].hour;
        bestWindow = { 
          start: startHour, 
          end: startHour + 2, 
          total: windowTotal 
        };
      }
    }

    const formatHour = (hour) => {
      if (hour === 12) return '12 PM';
      if (hour > 12) return `${hour - 12} PM`;
      if (hour === 0) return '12 AM';
      return `${hour} AM`;
    };

    return [
      { 
        label: 'Peak Hour', 
        value: formatHour(peakHour.hour), 
        detail: `${formatEarnings(peakHour.earnings)} avg`, 
        highlight: true 
      },
      { 
        label: 'Hourly Average', 
        value: formatEarnings(avgEarnings), 
        detail: `${Math.round(totalBookings / vector.hourlyData.length)} bookings avg`, 
        highlight: false 
      },
      { 
        label: 'Best Window', 
        value: `${formatHour(bestWindow.start)}-${formatHour(bestWindow.end)}`, 
        detail: formatEarnings(bestWindow.total), 
        highlight: true 
      }
    ];
  }

  // 🆕 NEW: Calculate real weekly statistics
  const getWeeklyStats = () => {
    if (!vector.weeklyData || vector.weeklyData.length === 0) {
      return getDefaultWeeklyStats();
    }

    const bestWeek = vector.weeklyData.reduce((max, week) => 
      week.earnings > max.earnings ? week : max, vector.weeklyData[0]
    );
    
    const totalEarnings = vector.weeklyData.reduce((sum, week) => sum + week.earnings, 0);
    const avgEarnings = totalEarnings / vector.weeklyData.length;
    
    // Calculate growth rate
    const firstWeek = vector.weeklyData[0];
    const lastWeek = vector.weeklyData[vector.weeklyData.length - 1];
    const growthPercent = firstWeek.earnings > 0 ? 
      Math.round(((lastWeek.earnings - firstWeek.earnings) / firstWeek.earnings) * 100) : 0;

    return [
      { 
        label: 'Best Week', 
        value: `Week ${bestWeek.weekNumber || '1'}`, 
        detail: formatEarnings(bestWeek.earnings), 
        highlight: true 
      },
      { 
        label: 'Weekly Average', 
        value: formatEarnings(avgEarnings), 
        detail: `${vector.weeklyData.length} weeks`, 
        highlight: false 
      },
      { 
        label: 'Growth Rate', 
        value: `${growthPercent >= 0 ? '+' : ''}${growthPercent}%`, 
        detail: 'vs first week', 
        highlight: Math.abs(growthPercent) > 20 
      }
    ];
  }

  // 🆕 NEW: Calculate real monthly statistics  
  const getMonthlyStats = () => {
    if (!vector.monthlyData || vector.monthlyData.length === 0) {
      return getDefaultMonthlyStats();
    }

    const bestMonth = vector.monthlyData.reduce((max, month) => 
      month.earnings > max.earnings ? month : max, vector.monthlyData[0]
    );
    
    const totalEarnings = vector.monthlyData.reduce((sum, month) => sum + month.earnings, 0);
    const avgEarnings = totalEarnings / vector.monthlyData.length;
    
    // Calculate year-over-year if we have 12+ months
    let yoyGrowth = 'N/A';
    if (vector.monthlyData.length >= 12) {
      const firstHalf = vector.monthlyData.slice(0, 6).reduce((sum, m) => sum + m.earnings, 0);
      const secondHalf = vector.monthlyData.slice(-6).reduce((sum, m) => sum + m.earnings, 0);
      if (firstHalf > 0) {
        const growth = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
        yoyGrowth = `${growth >= 0 ? '+' : ''}${growth}%`;
      }
    }

    return [
      { 
        label: 'Best Month', 
        value: bestMonth.monthName || 'Month 1', 
        detail: formatEarnings(bestMonth.earnings), 
        highlight: true 
      },
      { 
        label: 'Monthly Average', 
        value: formatEarnings(avgEarnings), 
        detail: `${vector.monthlyData.length} months`, 
        highlight: false 
      },
      { 
        label: 'Year Growth', 
        value: yoyGrowth, 
        detail: totalEarnings > 0 ? formatEarnings(totalEarnings) : 'Total earnings', 
        highlight: yoyGrowth !== 'N/A' && !yoyGrowth.includes('-') 
      }
    ];
  }

  // 🔄 FALLBACK: Default stats when no data available
  const getDefaultStats = () => {
    switch (activeChart) {
      case 'daily':
        return getDefaultDailyStats();
      case 'hourly':
        return getDefaultHourlyStats();
      case 'weekly':
        return getDefaultWeeklyStats();
      case 'monthly':
        return getDefaultMonthlyStats();
      default:
        return [];
    }
  }

  const getDefaultDailyStats = () => [
    { label: 'Best Day', value: 'Sat 30', detail: formatEarnings(890), highlight: true },
    { label: 'Daily Average', value: formatEarnings(575), detail: 'This week', highlight: false },
    { label: 'Total Week', value: formatEarnings(4025), detail: '+8% vs last', highlight: true }
  ];

  const getDefaultHourlyStats = () => [
    { label: 'Peak Hour', value: '8-9 PM', detail: `${formatEarnings(420)} avg`, highlight: true },
    { label: 'Hourly Average', value: formatEarnings(230), detail: 'All hours', highlight: false },
    { label: 'Best Window', value: '6-9 PM', detail: 'Weekends', highlight: true }
  ];

  const getDefaultWeeklyStats = () => [
    { label: 'This Month', value: formatEarnings(13750), detail: '4 weeks', highlight: false },
    { label: 'Best Week', value: formatEarnings(4100), detail: 'Week 3', highlight: true },
    { label: 'Growth', value: '+15%', detail: 'vs last month', highlight: true }
  ];

  const getDefaultMonthlyStats = () => [
    { label: 'Best Month', value: 'December', detail: formatEarnings(13200), highlight: true },
    { label: 'Monthly Average', value: formatEarnings(10250), detail: 'This year', highlight: false },
    { label: 'Year Total', value: formatEarnings(123000), detail: '+22% vs last year', highlight: true }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 text-center mt-5 gap-y-4">
      {getStats().map((stat, index) => (
        <div key={index} className="space-y-1">
          <div className="text-sm text-muted-foreground">{stat.label}</div>
          <div className={`text-base ${stat.highlight ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.detail}</div>
        </div>
      ))}
    </div>
  )
}