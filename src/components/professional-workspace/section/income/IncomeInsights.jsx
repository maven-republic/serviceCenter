// ============ 3. IncomeInsights.jsx ============
import React, { useState } from 'react';
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
    <div className="row">
      <div className="col-lg-12">
        <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
          <InsightsHeader 
            hideEarnings={hideEarnings}
            setHideEarnings={setHideEarnings}
          />
          
          <TodaysIncome hideEarnings={hideEarnings} />
          
          {/* Timeline Selector */}
          <TimelineSelector
            activeTimeline={activeTimeline}
            setActiveTimeline={setActiveTimeline}
            onDateRangeChange={handleDateRangeChange}
          />
          
          <ChartTabs 
            activeChart={activeChart}
            setActiveChart={setActiveChart}
          />
          
          <InteractiveChart 
            activeChart={activeChart}
            hideEarnings={hideEarnings}
            activeTimeline={activeTimeline}
            dateRange={dateRange}
          />
          
          <InsightsCards />
          
          <ChartInstructions activeChart={activeChart} />
        </div>
      </div>
    </div>
  );
}