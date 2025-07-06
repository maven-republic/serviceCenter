// ============ WeekChart.jsx ============
import React from 'react';
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
    <div 
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '280px' }}
    >
      {/* Animated Chart Placeholder */}
      <div className="mb-4">
        <svg width="120" height="80" viewBox="0 0 120 80" style={{ opacity: 0.7 }}>
          {/* Weekly trend line simulation */}
          <polyline
            points="15,55 35,40 55,45 75,25 95,30"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
            style={{
              animation: 'chartPulse 2.5s ease-in-out infinite alternate',
              opacity: '0.6'
            }}
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
                style={{
                  animation: `chartPulse ${2.5 + index * 0.1}s ease-in-out infinite alternate`,
                  opacity: '0.7'
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
      <h5 className="text-muted mb-2" style={{ color: '#64748b' }}>
        Your weekly overview chart is ready! 📅
      </h5>
      <p className="text-muted mb-4" style={{ maxWidth: '300px', color: '#94a3b8', fontSize: '14px' }}>
        Monitor weekly progress and growth patterns
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