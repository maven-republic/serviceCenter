// ============ ChartUtils.js ============
// Shared utilities for all chart components

// Generate earnings data (sample random data)
export const generateEarnings = (count, baseAmount) => {
  return Array.from({ length: count }, () => 
    Math.floor(baseAmount + (Math.random() - 0.5) * baseAmount * 0.4)
  );
};

// Generate labels and colors based on date range
export const generateLabels = (dateRange, type, count) => {
  const labels = [];
  const colors = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(dateRange.startDate);
    date.setDate(date.getDate() + i);
    
    if (type === 'daily') {
      labels.push(date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric' 
      }));
    } else if (type === 'weekly') {
      const weekNum = Math.floor(i / 7) + 1;
      labels.push(`Week ${weekNum}`);
    } else if (type === 'monthly') {
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    } else if (type === 'hourly') {
      labels.push(`${6 + i}${(6 + i) >= 12 ? 'PM' : 'AM'}`);
    }
    
    // Alternate color pattern
    colors.push(i % 3 === 0 ? '#000000' : '#e5e7eb');
  }
  
  return { labels, colors };
};

// Calculate days difference between two dates
export const calculateDaysDiff = (startDate, endDate) => {
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
};

// Format date for display
export const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};

// Format earnings for display (NEW FUNCTION)
export const formatEarnings = (amount, hide = false) => {
  if (hide) return '••••';
  if (typeof amount !== 'number') return '$0';
  return `$${amount.toLocaleString()}`;
};

// Get chart title based on type and state
export const getChartTitle = (chartType, hasBookings, showPreview) => {
  const titles = {
    daily: hasBookings || showPreview ? 'Day to Day Earnings' : 'Daily Performance',
    hourly: hasBookings || showPreview ? 'Hourly Earnings' : 'Hourly Trends',
    weekly: hasBookings || showPreview ? 'Weekly Earnings' : 'Weekly Overview',
    monthly: hasBookings || showPreview ? 'Monthly Earnings' : 'Monthly Performance'
  };
  return titles[chartType] || 'Performance Chart';
};

// Get chart subtitle
export const getChartSubtitle = (chartType, hasBookings, showPreview, dateRange) => {
  if (hasBookings || showPreview) {
    if (dateRange) {
      return `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`;
    }
    const subtitles = {
      daily: 'Last 7 days',
      hourly: 'Peak earning hours',
      weekly: 'Monthly progression',
      monthly: 'Year overview'
    };
    return subtitles[chartType] || '';
  } else {
    const betaSubtitles = {
      daily: 'Track daily earnings once bookings start',
      hourly: 'Discover your peak earning hours',
      weekly: 'Monitor weekly progress and growth',
      monthly: 'Analyze monthly revenue patterns'
    };
    return betaSubtitles[chartType] || 'Analytics will appear here';
  }
};

// Default chart options for Chart.js
export const getBaseChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
backgroundColor: "hsl(var(--muted))",
      backgroundColor: 'hsl(var(--popover))',
  titleColor: 'hsl(var(--popover-foreground))',
  bodyColor: 'hsl(var(--popover-foreground))',
  borderColor: 'hsl(var(--border))',
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f3f4f6', borderColor: '#e5e7eb' },
      ticks: {
        color: '#6b7280',
        font: { size: 12 },
        callback: function(value) { return '$' + value; }
      }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#6b7280', font: { size: 12 } }
    }
  },
  animation: { duration: 800, easing: 'easeOutQuart' }
});

export const COLORS = {
  primary: 'hsl(var(--foreground))',
  secondary: 'hsl(var(--muted-foreground))', 
  background: 'hsl(var(--background))',
  muted: 'hsl(var(--muted))',
  preview: 'hsl(var(--muted-foreground))'
}