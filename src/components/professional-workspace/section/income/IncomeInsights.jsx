// ============ IncomeInsights.jsx - Tailwind + shadcn/ui Version ============
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import InsightsHeader from './InsightsHeader';
import TodaysIncome from './TodaysIncome';
import ChartTabs from './ChartTabs';
import InteractiveChart from './InteractiveChart';
import InsightsCards from './InsightsCards';
import ChartInstructions from './ChartInstructions';
import TimelineSelector from './TimelineSelector';

export default function IncomeInsights() {
  const [hideEarnings, setHideEarnings] = useState(false);
  const [activeChart, setActiveChart] = useState('daily');
  const [activeTimeline, setActiveTimeline] = useState('last30days');
  const [dateRange, setDateRange] = useState(null);

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    console.log('Date range changed:', newDateRange);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Header Section */}
        <InsightsHeader 
          hideEarnings={hideEarnings}
          setHideEarnings={setHideEarnings}
        />
        
        {/* Today's Income Summary */}
        <TodaysIncome hideEarnings={hideEarnings} />
        
        {/* Timeline Selector */}
        <TimelineSelector
          activeTimeline={activeTimeline}
          setActiveTimeline={setActiveTimeline}
          onDateRangeChange={handleDateRangeChange}
        />
        
        {/* Chart Navigation Tabs */}
        <ChartTabs 
          activeChart={activeChart}
          setActiveChart={setActiveChart}
        />
        
        {/* Main Chart Component */}
        <InteractiveChart 
          activeChart={activeChart}
          hideEarnings={hideEarnings}
          activeTimeline={activeTimeline}
          dateRange={dateRange}
        />
        
        {/* Additional Insights Cards */}
        <InsightsCards />
        
        {/* Chart Help/Instructions */}
        <ChartInstructions activeChart={activeChart} />
      </CardContent>
    </Card>
  );
}