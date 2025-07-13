// ============ IncomeInsights.jsx - UPDATED to pass real data ============
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import InsightsHeader from './InsightsHeader';
import TodaysIncome from './TodaysIncome';
import ChartTabs from './ChartTabs';
import InteractiveChart from './InteractiveChart';
import InsightsCards from './InsightsCards';
import ChartInstructions from './ChartInstructions';

// 🔧 UPDATED: Accept real data props from Tensor.jsx
export default function IncomeInsights({
  vector = null,
  currencyService = null,
  professionalProfile = null,
  hideEarnings = false,
  onHideEarningsChange = null
}) {
  // 🔄 UPDATED: Use prop if provided, otherwise local state
  const [localHideEarnings, setLocalHideEarnings] = useState(false);
  const [activeChart, setActiveChart] = useState('daily');
  const [activeTimeline, setActiveTimeline] = useState('last30days');
  const [dateRange, setDateRange] = useState(null);

  // Use prop or local state for hideEarnings
  const currentHideEarnings = onHideEarningsChange ? hideEarnings : localHideEarnings;
  const setCurrentHideEarnings = onHideEarningsChange ? onHideEarningsChange : setLocalHideEarnings;

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    console.log('Date range changed:', newDateRange);
    // 🆕 TODO: This will eventually trigger new database queries in Tensor.jsx
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Header Section */}
        <InsightsHeader 
          hideEarnings={currentHideEarnings}
          setHideEarnings={setCurrentHideEarnings}
        />
        
        {/* Chart Navigation Tabs */}
        <ChartTabs 
          activeChart={activeChart}
          setActiveChart={setActiveChart}
        />
        
        {/* 🔧 UPDATED: Main Chart Component with real data */}
        <InteractiveChart 
          activeChart={activeChart}
          hideEarnings={currentHideEarnings}
          activeTimeline={activeTimeline}
          dateRange={dateRange}
          vector={vector}
          currencyService={currencyService}
          professionalProfile={professionalProfile}
        />
        
        {/* Additional Insights Cards */}
        <InsightsCards />
        
        {/* Chart Help/Instructions */}
        <ChartInstructions activeChart={activeChart} />
      </CardContent>
    </Card>
  );
}