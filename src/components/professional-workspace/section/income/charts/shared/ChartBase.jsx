// ============ ChartBase.jsx - FIXED ============
import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';
import ChartClickPopup from '../../ChartClickPopup';
import ChartStatistics from '../../ChartStatistics';
import { getChartTitle, getChartSubtitle } from './ChartUtils';

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

export default function ChartBase({ 
  chartType,
  chartData,
  chartConfig,
  hideEarnings,
  showPreview,
  setShowPreview,
  hasBookings = false,
  dateRange,
  emptyStateComponent
}) {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [selectedBarData, setSelectedBarData] = useState(null);

  // Chart click handler
  const handleChartClick = (event, elements) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      
      const clickedData = {
        label: chartData.labels[elementIndex],
        value: chartData.earnings[elementIndex],
        type: chartType
      };
      
      setSelectedBarData(clickedData);
      setTimeout(() => setSelectedBarData(null), 3000);
    }
  };

  // Update chart configuration with click handler
  const getChartConfigWithOptions = () => ({
    ...chartConfig,
    options: {
      ...chartConfig.options,
      onClick: handleChartClick,
      plugins: {
        ...chartConfig.options.plugins,
        tooltip: {
          ...chartConfig.options.plugins.tooltip,
          callbacks: {
            label: function(context) {
              return showPreview ? `Sample: $${context.parsed.y}` : `$${context.parsed.y}`;
            }
          }
        }
      }
    }
  });

  const updateChart = () => {
    if (!chartRef.current) return;
    
    // Clear any existing click data
    setSelectedBarData(null);
    
    // Destroy existing chart if it exists
    if (chart) {
      try {
        chart.destroy();
        setChart(null);
      } catch (error) {
        console.warn('Chart destruction error:', error);
      }
    }
    
    // Clean up any existing Chart.js instance on this canvas
    const canvas = chartRef.current;
    const existingChart = Chart.Chart.getChart(canvas);
    if (existingChart) {
      try {
        existingChart.destroy();
      } catch (error) {
        console.warn('Existing chart cleanup error:', error);
      }
    }
    
    // Only create new chart if we should show data
    if (hasBookings || showPreview) {
      // Small delay to ensure canvas is ready after cleanup
      setTimeout(() => {
        if (!chartRef.current) return;
        
        try {
          const newChart = new Chart.Chart(chartRef.current, getChartConfigWithOptions());
          setChart(newChart);
        } catch (error) {
          console.error('Error creating chart:', error);
          // If chart creation fails, clear the state and try again
          setChart(null);
        }
      }, 100);
    }
  };

  // Main effect: Triggers when chartData, showPreview, or dateRange changes
  useEffect(() => {
    if (chartRef.current) {
      // Small delay to prevent rapid re-renders
      const timer = setTimeout(updateChart, 150);
      return () => clearTimeout(timer);
    }
  }, [chartData, showPreview, dateRange]); // 🔧 Added dateRange dependency

  // Cleanup effect
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
        <h6 className="mb-0">{getChartTitle(chartType, hasBookings, showPreview)}</h6>
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
            {getChartSubtitle(chartType, hasBookings, showPreview, dateRange)}
          </span>
        </div>
      </div>

      {/* Chart Content */}
      <div style={{height: '320px', position: 'relative'}}>
        {!hasBookings && !showPreview ? (
          emptyStateComponent
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
          activeChart={chartType}
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