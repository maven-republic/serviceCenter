"use client";

import React from 'react';
import { TrendingUp, Eye, EyeOff, CheckCircle, Beaker } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateEarnings, calculateDaysDiff, formatEarnings } from './shared/ChartUtils';

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "#000000",
  },
};

export default function DayChart({ hideEarnings, activeTimeline, dateRange, showPreview, setShowPreview }) {
  const hasBookings = false; // This would come from your app state/API

  // Generate daily chart data for Recharts format
  const generateDailyData = () => {
    if (!dateRange) {
      // Default data - convert to Recharts format
      const defaultData = [
        { day: 'Mon 25', earnings: 450, fullDate: 'Monday, Dec 25' },
        { day: 'Tue 26', earnings: 320, fullDate: 'Tuesday, Dec 26' },
        { day: 'Wed 27', earnings: 580, fullDate: 'Wednesday, Dec 27' },
        { day: 'Thu 28', earnings: 720, fullDate: 'Thursday, Dec 28' },
        { day: 'Fri 29', earnings: 650, fullDate: 'Friday, Dec 29' },
        { day: 'Sat 30', earnings: 890, fullDate: 'Saturday, Dec 30' },
        { day: 'Sun 31', earnings: 420, fullDate: 'Sunday, Dec 31' }
      ];
      return defaultData;
    }

    const daysDiff = calculateDaysDiff(dateRange.startDate, dateRange.endDate);
    
    if (daysDiff <= 1) {
      // Single day
      return [
        { day: 'Today', earnings: 850, fullDate: 'Today' }
      ];
    } else {
      // Multiple days
      const data = [];
      const earnings = generateEarnings(Math.min(daysDiff, 31), 500);
      
      for (let i = 0; i < Math.min(daysDiff, 31); i++) {
        const date = new Date(dateRange.startDate);
        date.setDate(date.getDate() + i);
        
        const shortLabel = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          day: 'numeric' 
        });
        
        const fullDate = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long',
          day: 'numeric'
        });
        
        data.push({
          day: shortLabel,
          earnings: earnings[i],
          fullDate: fullDate
        });
      }
      
      return data;
    }
  };

  const chartData = generateDailyData();

  // Calculate stats for footer
  const totalEarnings = chartData.reduce((sum, item) => sum + item.earnings, 0);
  const avgEarnings = totalEarnings / chartData.length;
  const highestDay = chartData.reduce((max, item) => item.earnings > max.earnings ? item : max, chartData[0]);

  // Get date range for subtitle
  const getDateRangeText = () => {
    if (!dateRange) {
      return "Last 7 days";
    }
    
    if (calculateDaysDiff(dateRange.startDate, dateRange.endDate) <= 1) {
      return "Today";
    }
    
    const start = new Date(dateRange.startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const end = new Date(dateRange.endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${start} - ${end}`;
  };

  // Beta Empty State
  const emptyStateComponent = (
    <div className="flex flex-col items-center justify-center text-center min-h-[280px]">
      {/* Animated Chart Placeholder */}
      <div className="mb-4">
        <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-70">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <rect
              key={index}
              x={index * 16 + 10}
              y={60 - (Math.random() * 40 + 10)}
              width="12"
              height={Math.random() * 40 + 10}
              fill="#e2e8f0"
              rx="2"
              className="animate-pulse"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: '2s'
              }}
            />
          ))}
          
          {/* Axes */}
          <line x1="8" y1="70" x2="112" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
          <line x1="8" y1="10" x2="8" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
        </svg>
      </div>

      {/* Main Message */}
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Your daily earnings chart is ready! 📊
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Track your daily earnings once bookings start
      </p>

      {/* Steps Indicator */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-primary hover:bg-primary gap-1">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs">Profile setup</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-500 text-yellow-50 hover:bg-yellow-500 gap-1">
            <span className="text-xs font-bold">2</span>
            <span className="text-xs">Get first booking</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <span className="text-xs font-bold">3</span>
            <span className="text-xs">Watch earnings grow</span>
          </Badge>
        </div>
      </div>

      {/* Preview Toggle Button */}
      <div className="flex justify-center mt-6">
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
    </div>
  );

  // Custom tooltip formatter
  const tooltipLabelFormatter = (label, payload) => {
    if (payload && payload.length > 0) {
      const data = payload[0].payload;
      return data.fullDate;
    }
    return label;
  };

  const tooltipFormatter = (value, name) => {
    return [
      hideEarnings ? '••••' : `$${value}`,
      showPreview ? 'Sample Earnings' : 'Earnings'
    ];
  };

  // If no bookings and not showing preview, show empty state
  if (!hasBookings && !showPreview) {
    return (
      <Card className="bg-muted/30 border-0">
        <CardContent className="p-5">
          {emptyStateComponent}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30 border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Daily Earnings</CardTitle>
            {showPreview && (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground gap-1 text-xs">
                <Eye className="h-3 w-3" />
                Preview Mode
              </Badge>
            )}
            {!hasBookings && (
              <Badge variant="default" className="bg-primary hover:bg-primary gap-1 text-xs">
                <Beaker className="h-3 w-3" />
                Beta
              </Badge>
            )}
          </div>
          
          {!hasBookings && (
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
                  Preview
                </>
              )}
            </Button>
          )}
        </div>
        <CardDescription>
          {getDateRangeText()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig}>
          <BarChart
            width={700}
            height={500}
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent 
                labelFormatter={tooltipLabelFormatter}
                formatter={tooltipFormatter}
              />}
            />
            <Bar 
              dataKey="earnings" 
              fill={showPreview ? "#e2e8f0" : "#000000"}
              radius={8}
              opacity={showPreview ? 0.7 : 1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
        <div className="flex gap-2 font-medium leading-none">
          {hideEarnings ? (
            <span>Earnings data hidden</span>
          ) : (
            <>
              <span>
                {showPreview ? 'Sample: ' : ''}
                Peak day: {formatEarnings(highestDay.earnings, hideEarnings)} on {highestDay.day}
              </span>
              <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          {hideEarnings ? (
            'Toggle visibility to see earnings details'
          ) : (
            <>
              {showPreview ? 'Sample data: ' : ''}
              Total: {formatEarnings(totalEarnings, hideEarnings)} • 
              Average: {formatEarnings(Math.round(avgEarnings), hideEarnings)} per day
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}