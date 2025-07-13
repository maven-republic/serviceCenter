"use client";

import React, { useMemo, useState } from 'react';
import { TrendingUp, Eye, EyeOff, CheckCircle, Beaker } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Cell } from "recharts";
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

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "#000000",
  },
  bookings: {
    label: "Bookings",
    color: "#3b82f6",
  },
};

// 🔧 UPDATED: Now accepts real data props with improved design
export default function DayChart({ 
  hideEarnings, 
  activeTimeline, 
  dateRange, 
  showPreview, 
  setShowPreview,
  vector = null,
  currencyService = null,
  professionalProfile = null
}) {
  
  // 🆕 NEW: Click interaction state
  const [selectedDay, setSelectedDay] = useState(null);
  
  // 🆕 NEW: Check if user has any real bookings
  const hasRealBookings = vector?.totalBookings > 0 && !vector?.isPreview;

  // 🆕 NEW: Transform real analytics data to Recharts format with enhanced data
  const chartData = useMemo(() => {
    if (!vector || !vector.dailyData) {
      return [];
    }

    const data = vector.dailyData.map(day => {
      const date = new Date(day.date);
      const shortLabel = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric' 
      });
      
      const fullDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long',
        day: 'numeric'
      });

      return {
        day: shortLabel,
        earnings: day.earnings || 0,
        bookings: day.bookings || 0,
        fullDate: fullDate,
        details: day.details || [],
        date: day.date
      };
    });

    // 🆕 NEW: Calculate average for color coding
    const avgEarnings = data.reduce((sum, d) => sum + d.earnings, 0) / data.length;
    
    // 🆕 NEW: Add color and performance indicators
    return data.map(item => ({
      ...item,
      isAboveAverage: item.earnings > avgEarnings,
      isPeakDay: item.earnings === Math.max(...data.map(d => d.earnings)),
      performanceLevel: item.earnings > avgEarnings * 1.5 ? 'excellent' : 
                       item.earnings > avgEarnings ? 'good' : 
                       item.earnings > 0 ? 'fair' : 'none'
    }));
  }, [vector]);

  // 🆕 NEW: Calculate comprehensive stats
  const chartStats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        totalEarnings: 0,
        avgEarnings: 0,
        highestDay: null,
        totalBookings: 0,
        growthTrend: 0,
        activeDays: 0
      };
    }

    const totalEarnings = chartData.reduce((sum, item) => sum + item.earnings, 0);
    const totalBookings = chartData.reduce((sum, item) => sum + item.bookings, 0);
    const avgEarnings = totalEarnings / chartData.length;
    const activeDays = chartData.filter(day => day.earnings > 0).length;
    
    const highestDay = chartData.reduce((max, item) => 
      item.earnings > max.earnings ? item : max, chartData[0]
    );

    // Calculate growth trend (first half vs second half)
    const halfPoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, halfPoint);
    const secondHalf = chartData.slice(halfPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.earnings, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.earnings, 0) / secondHalf.length;
    
    const growthTrend = firstHalfAvg > 0 ? 
      Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0;

    return {
      totalEarnings,
      avgEarnings,
      highestDay,
      totalBookings,
      growthTrend,
      activeDays
    };
  }, [chartData]);

  // 🔄 UPDATED: Use real currency service
  const formatCurrency = (amount) => {
    if (hideEarnings) return '••••';
    
    if (currencyService) {
      return currencyService.formatCurrency(amount);
    }
    
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 🆕 NEW: Get bar color based on performance
  const getBarColor = (item, index) => {
    if (vector?.isPreview) {
      return item.isPeakDay ? "#94a3b8" : "#e2e8f0";
    }
    
    if (hideEarnings) {
      // Show booking count colors when earnings hidden
      return item.bookings > 2 ? "#3b82f6" : 
             item.bookings > 0 ? "#60a5fa" : "#e2e8f0";
    }
    
    // Performance-based colors for earnings
    switch (item.performanceLevel) {
      case 'excellent': return "#10b981"; // Green
      case 'good': return "#000000";      // Black (primary)
      case 'fair': return "#6b7280";      // Gray
      default: return "#e5e7eb";          // Light gray
    }
  };

  // 🆕 NEW: Click handler for bar interactions
  const handleBarClick = (data, index) => {
    setSelectedDay(data);
    // Auto-hide after 3 seconds
    setTimeout(() => setSelectedDay(null), 3000);
  };

  // 🆕 NEW: Get date range text from real data
  const getDateRangeText = () => {
    if (chartData.length === 0) {
      return "No data available";
    }

    if (chartData.length === 1) {
      return chartData[0].fullDate;
    }
    
    return `${chartData[0].day} - ${chartData[chartData.length - 1].day}`;
  };

  // Beta Empty State
  const emptyStateComponent = (
    <div className="flex flex-col items-center justify-center text-center min-h-[280px]">
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
          
          <line x1="8" y1="70" x2="112" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
          <line x1="8" y1="10" x2="8" y2="70" stroke="#cbd5e1" strokeWidth="1"/>
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Your daily earnings chart is ready! 📊
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Track your daily earnings once bookings start
      </p>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Badge variant="default" className="bg-primary hover:bg-primary gap-1">
          <CheckCircle className="h-3 w-3" />
          <span className="text-xs">Profile setup</span>
        </Badge>
        <Badge variant="secondary" className="bg-yellow-500 text-yellow-50 hover:bg-yellow-500 gap-1">
          <span className="text-xs font-bold">2</span>
          <span className="text-xs">Get first booking</span>
        </Badge>
        <Badge variant="outline" className="gap-1">
          <span className="text-xs font-bold">3</span>
          <span className="text-xs">Watch earnings grow</span>
        </Badge>
      </div>

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

  // 🆕 NEW: Enhanced tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{data.fullDate}</p>
          <div className="mt-1 space-y-1">
            {!hideEarnings && (
              <p className="text-sm">
                <span className="text-muted-foreground">Earnings:</span>{' '}
                <span className="font-medium">{formatCurrency(data.earnings)}</span>
              </p>
            )}
            <p className="text-sm">
              <span className="text-muted-foreground">Bookings:</span>{' '}
              <span className="font-medium">{data.bookings}</span>
            </p>
            {data.details && data.details.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Details:</p>
                {data.details.slice(0, 2).map((detail, idx) => (
                  <p key={idx} className="text-xs">
                    {detail.time} • {detail.service_name} • {!hideEarnings && formatCurrency(detail.amount)}
                  </p>
                ))}
                {data.details.length > 2 && (
                  <p className="text-xs text-muted-foreground">+{data.details.length - 2} more</p>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // If no real bookings and not showing preview, show empty state
  if (!hasRealBookings && !showPreview) {
    return (
      <Card className="bg-muted/30 border-0">
        <CardContent className="p-5">
          {emptyStateComponent}
        </CardContent>
      </Card>
    );
  }

  // If no data to display
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-muted/30 border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Daily Earnings</CardTitle>
              <Badge variant="outline" className="gap-1 text-xs">No Data</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
            <p className="text-sm text-muted-foreground">No earnings data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30 border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">
              {hideEarnings ? 'Daily Bookings' : 'Daily Earnings'}
            </CardTitle>
            {vector?.isPreview && (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground gap-1 text-xs">
                <Eye className="h-3 w-3" />
                {professionalProfile?.address?.country || 'Sample'} Preview
              </Badge>
            )}
            {!hasRealBookings && (
              <Badge variant="default" className="bg-primary hover:bg-primary gap-1 text-xs">
                <Beaker className="h-3 w-3" />
                Beta
              </Badge>
            )}
            {hasRealBookings && (
              <Badge variant="default" className="bg-green-600 text-white gap-1 text-xs">
                <CheckCircle className="h-3 w-3" />
                Live Data
              </Badge>
            )}
          </div>
          
          {!hasRealBookings && (
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
      
      <CardContent className="pb-4 relative">
        {/* 🆕 NEW: Click popup */}
        {selectedDay && (
          <div className="absolute top-4 right-4 z-10 bg-background border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{selectedDay.fullDate}</p>
                <p className="text-lg font-bold mt-1">
                  {hideEarnings ? 
                    `${selectedDay.bookings} booking${selectedDay.bookings !== 1 ? 's' : ''}` :
                    formatCurrency(selectedDay.earnings)
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedDay.performanceLevel === 'excellent' ? '🔥 Excellent day!' :
                   selectedDay.performanceLevel === 'good' ? '✅ Good performance' :
                   selectedDay.performanceLevel === 'fair' ? '📈 Fair activity' :
                   '💡 Room for growth'}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 🔧 FIXED: Responsive chart container */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={hideEarnings ? "bookings" : "earnings"}
                radius={8}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry, index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🆕 NEW: Performance insights */}
        {(hasRealBookings || showPreview) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Active Days</div>
              <div className="text-lg font-semibold">{chartStats.activeDays}/{chartData.length}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Growth Trend</div>
              <div className={`text-lg font-semibold ${chartStats.growthTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {chartStats.growthTrend >= 0 ? '+' : ''}{chartStats.growthTrend}%
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Best Day</div>
              <div className="text-lg font-semibold text-primary">
                {chartStats.highestDay?.day || 'N/A'}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Daily Avg</div>
              <div className="text-lg font-semibold text-blue-600">
                {hideEarnings ? 
                  `${Math.round(chartStats.totalBookings / chartData.length)} bookings` :
                  formatCurrency(Math.round(chartStats.avgEarnings))
                }
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
        <div className="flex gap-2 font-medium leading-none">
          {hideEarnings ? (
            <span>Booking data • Click bars for details</span>
          ) : (
            <>
              <span>
                {vector?.isPreview ? 'Sample: ' : ''}
                {chartStats.highestDay ? (
                  <>Peak: {formatCurrency(chartStats.highestDay.earnings)} on {chartStats.highestDay.day}</>
                ) : (
                  'No peak day data'
                )}
              </span>
              <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          {hideEarnings ? (
            `Total: ${chartStats.totalBookings} bookings • Click any bar for details`
          ) : (
            <>
              {vector?.isPreview ? 'Sample data: ' : ''}
              Total: {formatCurrency(chartStats.totalEarnings)} • 
              Average: {formatCurrency(Math.round(chartStats.avgEarnings))} per day
              {chartStats.totalBookings > 0 && (
                <> • {chartStats.totalBookings} booking{chartStats.totalBookings !== 1 ? 's' : ''}</>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}