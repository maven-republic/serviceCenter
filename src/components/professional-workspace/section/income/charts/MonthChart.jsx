// ============ MonthChart.jsx ============
import React from 'react';
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
    <div 
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '280px' }}
    >
      {/* Animated Chart Placeholder */}
      <div className="mb-4">
        <svg width="120" height="80" viewBox="0 0 120 80" style={{ opacity: 0.7 }}>
          {/* Line chart simulation */}
          <polyline
            points="10,60 25,45 40,50 55,30 70,35 85,20 100,25"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
            style={{
              animation: 'chartPulse 2s ease-in-out infinite alternate',
              opacity: '0.6'
            }}
          />
          
          {/* Data points */}
          {[10, 25, 40, 55, 70, 85, 100].map((x, index) => (
            <circle
              key={index}
              cx={x}
              cy={60 - index * 5 - Math.random() * 15}
              r="3"
              fill="#cbd5e1"
              style={{
                animation: `chartPulse ${2 + index * 0.1}s ease-in-out infinite alternate`,
                opacity: '0.7'
              }}
            />
          ))}
          
          {/* Axes */}
          <line x1="8" y1="70" x2="112" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
          <line x1="8" y1="10" x2="8" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
        </svg>
      </div>

      {/* Main Message */}
      <h5 className="text-muted mb-2" style={{ color: '#64748b' }}>
        Your monthly earnings chart is ready! 📈
      </h5>
      <p className="text-muted mb-4" style={{ maxWidth: '300px', color: '#94a3b8', fontSize: '14px' }}>
        Analyze monthly revenue patterns and year-over-year growth
      </p>

      {/* Steps Indicator */}
      <div className="d-flex align-items-center gap-3" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle me-2 d-flex align-items-center justify-content-center"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '12px'
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: '12px', color: '#10b981' }}>Profile setup</span>
        </div>
        
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle me-2 d-flex align-items-center justify-content-center"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              fontSize: '12px'
            }}
          >
            2
          </div>
          <span style={{ fontSize: '12px', color: '#f59e0b' }}>Get first booking</span>
        </div>
        
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle me-2 d-flex align-items-center justify-content-center"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#6b7280',
              color: 'white',
              fontSize: '12px'
            }}
          >
            3
          </div>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Watch earnings grow</span>
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