// ============ 7. InteractiveChart.jsx ============
import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';
import ChartClickPopup from './ChartClickPopup';
import ChartStatistics from './ChartStatistics';

// Register Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.BarElement,
  Chart.BarController,
  Chart.LineElement,
  Chart.LineController,
  Chart.PointElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend
);

export default function InteractiveChart({ activeChart, hideEarnings }) {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [selectedBarData, setSelectedBarData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Beta state - set to true when user has actual bookings
  const hasBookings = false; // This would come from your app state/API

  // Sample data (for preview mode or when hasBookings = true)
  const chartData = {
    daily: {
      labels: ['Mon 25', 'Tue 26', 'Wed 27', 'Thu 28', 'Fri 29', 'Sat 30', 'Sun 31'],
      earnings: [450, 320, 580, 720, 650, 890, 420],
      colors: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#000000', '#e5e7eb']
    },
    hourly: {
      labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'],
      earnings: [45, 120, 180, 220, 150, 130, 200, 280, 160, 140, 180, 250, 320, 380, 420, 350],
      colors: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000', '#e5e7eb', '#000000', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#000000']
    },
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      earnings: [3200, 2800, 4100, 3650]
    }
  };

  const getChartTitle = () => {
    switch (activeChart) {
      case 'daily': return hasBookings || showPreview ? 'Day to Day Earnings' : 'Daily Performance';
      case 'hourly': return hasBookings || showPreview ? 'Hourly Earnings' : 'Hourly Trends';
      case 'weekly': return hasBookings || showPreview ? 'Weekly Earnings' : 'Weekly Overview';
      default: return 'Performance Chart';
    }
  };

  const getChartSubtitle = () => {
    if (hasBookings || showPreview) {
      switch (activeChart) {
        case 'daily': return 'Last 7 days';
        case 'hourly': return 'Peak earning hours';
        case 'weekly': return 'Monthly progression';
        default: return '';
      }
    } else {
      switch (activeChart) {
        case 'daily': return 'Track daily earnings once bookings start';
        case 'hourly': return 'Discover your peak earning hours';
        case 'weekly': return 'Monitor weekly progress and growth';
        default: return 'Analytics will appear here';
      }
    }
  };

  // Beta Empty State Component (without the toggle button)
  const BetaEmptyState = () => (
    <div 
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '280px' }}
    >
      {/* Animated Chart Placeholder */}
      <div className="mb-4">
        <svg width="120" height="80" viewBox="0 0 120 80" style={{ opacity: 0.7 }}>
          {/* Animated bars */}
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
        Your earnings chart is ready! 📊
      </h5>
      <p className="text-muted mb-4" style={{ maxWidth: '300px', color: '#94a3b8', fontSize: '14px' }}>
        {getChartSubtitle()}
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const data = chartData[activeChart];
        
        const clickedData = {
          label: data.labels[elementIndex],
          value: data.earnings[elementIndex],
          type: activeChart
        };
        
        setSelectedBarData(clickedData);
        setTimeout(() => setSelectedBarData(null), 3000);
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return showPreview ? `Sample: $${context.parsed.y}` : `$${context.parsed.y}`;
          }
        }
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
  };

  const getChartConfig = () => {
    const data = chartData[activeChart];
    
    if (activeChart === 'weekly') {
      return {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.earnings,
            borderColor: showPreview ? '#94a3b8' : '#000000',
            backgroundColor: showPreview ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 3,
            borderDash: showPreview ? [5, 5] : [],
            pointBackgroundColor: showPreview ? '#94a3b8' : '#000000',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            fill: true,
            tension: 0.4
          }]
        }
      };
    }
    
    return {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.earnings,
          backgroundColor: showPreview 
            ? data.colors.map(color => color === '#000000' ? '#94a3b8' : '#e2e8f0')
            : (activeChart === 'daily' || activeChart === 'hourly') ? data.colors : '#000000',
          borderRadius: activeChart === 'daily' ? 4 : 3,
          borderSkipped: false,
          opacity: showPreview ? 0.7 : 1
        }]
      }
    };
  };

  const updateChart = () => {
    if (!chartRef.current) return;
    
    setSelectedBarData(null);
    
    // Always clean up existing chart
    if (chart) {
      try {
        chart.destroy();
      } catch (error) {
        console.warn('Chart destruction error:', error);
      }
    }
    
    // Clear Chart.js registry for this canvas
    const canvas = chartRef.current;
    const existingChart = Chart.Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    
    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Remove any references
    if (canvas.chart) {
      delete canvas.chart;
    }
    
    setChart(null);

    // Only create new chart if we should show data
    if (hasBookings || showPreview) {
      requestAnimationFrame(() => {
        if (!chartRef.current) return;
        
        try {
          const newChart = new Chart.Chart(chartRef.current, {
            ...getChartConfig(),
            options: chartOptions
          });
          setChart(newChart);
        } catch (error) {
          console.error('Error creating chart:', error);
        }
      });
    }
  };

  useEffect(() => {
    // Update chart when activeChart changes OR when showPreview changes
    if (chartRef.current) {
      const timer = setTimeout(updateChart, 50);
      return () => clearTimeout(timer);
    }
  }, [activeChart, showPreview]);

  useEffect(() => {
    if (hasBookings || showPreview) {
      const timer = setTimeout(() => {
        if (chartRef.current) updateChart();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showPreview]);

  useEffect(() => {
    return () => {
      if (chart) {
        try {
          chart.destroy();
        } catch (error) {
          console.warn('Cleanup error:', error);
        }
        setChart(null);
      }
    };
  }, []);

  return (
    <div className="p20" style={{backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
      {/* Chart Header */}
      <div className="d-flex justify-content-between align-items-center mb20">
        <h6 className="mb-0">{getChartTitle()}</h6>
        <div className="d-flex align-items-center gap-2">
          {showPreview && (
            <span 
              className="badge" 
              style={{ 
                backgroundColor: '#fbbf24', 
                color: '#92400e',
                fontSize: '10px'
              }}
            >
              Preview Mode
            </span>
          )}
          {!hasBookings && (
            <span 
              className="badge" 
              style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white',
                fontSize: '10px'
              }}
            >
              Beta
            </span>
          )}
          <span className="text fz14" style={{ color: '#6b7280' }}>
            {getChartSubtitle()}
          </span>
        </div>
      </div>

      {/* Chart Content */}
      <div style={{height: '320px', position: 'relative'}}>
        {!hasBookings && !showPreview ? (
          <BetaEmptyState />
        ) : (
          <>
            <canvas ref={chartRef}></canvas>
            
            <ChartClickPopup 
              selectedBarData={selectedBarData}
              setSelectedBarData={setSelectedBarData}
              hideEarnings={hideEarnings}
            />
          </>
        )}
      </div>

      {/* Preview Toggle Button - Always visible in beta mode */}
      {!hasBookings && (
        <div className="text-center mt20">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="btn btn-outline-primary btn-sm"
            style={{ fontSize: '12px', padding: '6px 16px' }}
          >
            {showPreview ? '🙈 Hide preview' : '👁️ Preview with sample data'}
          </button>
        </div>
      )}

      {/* Chart Statistics - only show when there's data or preview */}
      {(hasBookings || showPreview) && (
        <ChartStatistics 
          activeChart={activeChart}
          hideEarnings={hideEarnings}
        />
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes chartPulse {
          0% { opacity: 0.4; transform: scaleY(0.8); }
          100% { opacity: 0.8; transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
}