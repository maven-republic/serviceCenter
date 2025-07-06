// ============ DayChart.jsx ============
import React from 'react';
import ChartBase from './shared/ChartBase';
import { generateEarnings, calculateDaysDiff, getBaseChartOptions, COLORS } from './shared/ChartUtils';

export default function DayChart({ hideEarnings, activeTimeline, dateRange, showPreview, setShowPreview }) {
  const hasBookings = false; // This would come from your app state/API

  // Generate daily chart data
  const generateDailyData = () => {
    if (!dateRange) {
      // Default data
      return {
        labels: ['Mon 25', 'Tue 26', 'Wed 27', 'Thu 28', 'Fri 29', 'Sat 30', 'Sun 31'],
        earnings: [450, 320, 580, 720, 650, 890, 420],
        colors: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#000000', '#e5e7eb']
      };
    }

    const daysDiff = calculateDaysDiff(dateRange.startDate, dateRange.endDate);
    
    if (daysDiff <= 1) {
      // Single day
      return {
        labels: ['Today'],
        earnings: [850],
        colors: ['#000000']
      };
    } else {
      // Multiple days
      const labels = [];
      const colors = [];
      
      for (let i = 0; i < Math.min(daysDiff, 31); i++) {
        const date = new Date(dateRange.startDate);
        date.setDate(date.getDate() + i);
        
        labels.push(date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          day: 'numeric' 
        }));
        
        colors.push(i % 3 === 0 ? COLORS.primary : COLORS.muted);
      }
      
      return {
        labels,
        earnings: generateEarnings(labels.length, 500),
        colors
      };
    }
  };

  const chartData = generateDailyData();

  // Daily chart configuration
  const chartConfig = {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.earnings,
        backgroundColor: showPreview 
          ? chartData.colors.map(color => color === COLORS.primary ? COLORS.preview : '#e2e8f0')
          : chartData.colors,
        borderRadius: 4,
        borderSkipped: false,
        opacity: showPreview ? 0.7 : 1
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
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <rect
              key={index}
              x={index * 16 + 10}
              y={60 - (Math.random() * 40 + 10)}
              width="12"
              height={Math.random() * 40 + 10}
              fill="#e2e8f0"
              rx="2"
              style={{
                animation: `chartPulse ${2 + index * 0.1}s ease-in-out infinite alternate`,
                opacity: '0.6'
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
        Your daily earnings chart is ready! 📊
      </h5>
      <p className="text-muted mb-4" style={{ maxWidth: '300px', color: '#94a3b8', fontSize: '14px' }}>
        Track your daily earnings once bookings start
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
      chartType="daily"
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