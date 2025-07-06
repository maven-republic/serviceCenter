// ============ InteractiveChart.jsx - Fixed Container ============
import React, { useState } from 'react';
import DayChart from './charts/DayChart';
import HourChart from './charts/HourChart';
import WeekChart from './charts/WeekChart';
import MonthChart from './charts/MonthChart';

export default function InteractiveChart({ activeChart, hideEarnings, activeTimeline, dateRange }) {
  // Each chart type needs its own preview state
  const [previewStates, setPreviewStates] = useState({
    daily: false,
    hourly: false,
    weekly: false,
    monthly: false
  });

  // Get current chart's preview state
  const showPreview = previewStates[activeChart] || false;

  // Set preview state for current chart
  const setShowPreview = (value) => {
    setPreviewStates(prev => ({
      ...prev,
      [activeChart]: value
    }));
  };

  // Common props to pass to all chart components
  const commonProps = {
    hideEarnings,
    activeTimeline,
    dateRange,
    showPreview,
    setShowPreview
  };

  // Render the appropriate chart component based on activeChart
  const renderChart = () => {
    switch(activeChart) {
      case 'daily':
        return <DayChart {...commonProps} />;
        
      case 'hourly':
        return <HourChart {...commonProps} />;
        
      case 'weekly':
        return <WeekChart {...commonProps} />;
        
      case 'monthly':
        return <MonthChart {...commonProps} />;
        
      default:
        return <DayChart {...commonProps} />;
    }
  };

  return renderChart();
}