// ============ HourChart.jsx ============
import React from 'react';
import ChartBase from './shared/ChartBase';
import { generateEarnings, getBaseChartOptions, COLORS } from './shared/ChartUtils';

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
    <div 
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '280px' }}
    >
      {/* Animated Chart Placeholder */}
      <div className="mb-4">
        <svg width="120" height="80" viewBox="0 0 120 80" style={{ opacity: 0.7 }}>
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
        Your hourly trends chart is ready! ⏰
      </h5>
      <p className="text-muted mb-4" style={{ maxWidth: '300px', color: '#94a3b8', fontSize: '14px' }}>
        Discover your peak earning hours and optimize your schedule
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