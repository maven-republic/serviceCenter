// ============ ChartBase.jsx - Tailwind + shadcn/ui Version ============
import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, BarChart3, Beaker } from 'lucide-react';
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
    <Card className="bg-muted/30 border-0">
      <CardContent className="p-5">
        {/* Chart Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              {getChartTitle(chartType, hasBookings, showPreview)}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {showPreview && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 gap-1 text-xs">
                <Eye className="h-3 w-3" />
                Preview Mode
              </Badge>
            )}
            
            {!hasBookings && (
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-500 gap-1 text-xs">
                <Beaker className="h-3 w-3" />
                Beta
              </Badge>
            )}
            
            <span className="text-xs text-muted-foreground">
              {getChartSubtitle(chartType, hasBookings, showPreview, dateRange)}
            </span>
          </div>
        </div>

        {/* Chart Content */}
        <div className="h-80 relative">
          {!hasBookings && !showPreview ? (
            emptyStateComponent
          ) : (
            <>
              <canvas ref={chartRef} className="w-full h-full"></canvas>
              
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
          <div className="flex justify-center mt-5">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2 text-xs"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  Hide preview
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  Preview with sample data
                </>
              )}
            </Button>
          </div>
        )}

        {/* Chart Statistics - only show when there's data or preview */}
        {(hasBookings || showPreview) && (
          <div className="mt-5">
            <ChartStatistics 
              activeChart={chartType}
              hideEarnings={hideEarnings}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}