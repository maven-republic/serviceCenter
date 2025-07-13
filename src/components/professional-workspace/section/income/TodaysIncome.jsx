// ============ TodaysIncome.jsx - UPDATED with Real Database Integration ============
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Clock, DollarSign, TrendingUp, Calendar } from 'lucide-react';

// 🔧 UPDATED: Now accepts real data props
export default function TodaysIncome({ 
  hideEarnings, 
  vector = null, 
  currencyService = null,
  professionalProfile = null 
}) {
  
  // 🆕 NEW: Calculate real today's earnings from analytics data
  const todaysData = useMemo(() => {
    if (!vector || !vector.dailyData) {
      return { earnings: 0, bookings: 0, hasData: false };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayEntry = vector.dailyData.find(day => day.date === today);
    
    if (!todayEntry) {
      return { earnings: 0, bookings: 0, hasData: false };
    }

    return {
      earnings: todayEntry.earnings || 0,
      bookings: todayEntry.bookings || 0,
      hasData: true,
      details: todayEntry.details || []
    };
  }, [vector]);

  // 🆕 NEW: Calculate comparison with yesterday
  const comparisonData = useMemo(() => {
    if (!vector || !vector.dailyData) {
      return { percentage: 0, isIncrease: true };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    const yesterdayEntry = vector.dailyData.find(day => day.date === yesterdayDate);
    const yesterdayEarnings = yesterdayEntry?.earnings || 0;
    
    if (yesterdayEarnings === 0) {
      return { percentage: todaysData.earnings > 0 ? 100 : 0, isIncrease: true };
    }
    
    const difference = todaysData.earnings - yesterdayEarnings;
    const percentage = Math.round(Math.abs(difference / yesterdayEarnings) * 100);
    
    return {
      percentage,
      isIncrease: difference >= 0,
      difference: Math.abs(difference)
    };
  }, [vector, todaysData.earnings]);

  // 🔄 UPDATED: Use real currency service
  const formatCurrency = (amount) => {
    if (hideEarnings) return '••••';
    
    if (currencyService) {
      return currencyService.formatCurrency(amount);
    }
    
    // Fallback formatting
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 🆕 NEW: Calculate active hours (estimate based on bookings)
  const getActiveHours = () => {
    if (!todaysData.hasData || todaysData.bookings === 0) {
      return 0;
    }
    
    // Estimate: each booking = ~1.5 hours of work
    const estimatedHours = todaysData.bookings * 1.5;
    return Math.min(estimatedHours, 12); // Cap at 12 hours
  };

  // 🆕 NEW: Check if user has any bookings ever
  const hasAnyBookings = vector?.totalBookings > 0 && !vector?.isPreview;

  // Beta Empty State - when no bookings exist
  if (!hasAnyBookings) {
    return (
      <div className="max-w-2xl">
        <Card className="border-2 border-dashed border-muted bg-muted from-muted/20 to-muted/40 transition-all duration-300 hover:border-muted-foreground/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Today's Earnings</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-20 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40 rounded animate-pulse" />
                  <DollarSign className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <p className="text-xs text-muted-foreground/80">Waiting for your first booking</p>
              </div>
              
              <div className="text-right space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Time Online</p>
                <div className="flex items-center gap-2 justify-end">
                  <Clock className="h-6 w-6 text-muted-foreground/60" />
                  <div className="h-6 w-12 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main component - when user has booking data (real or sample)
  return (
    <div className="max-w-2xl">
      <Card className="bg-card transition-all duration-300 border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  Today's Earnings
                </p>
                {vector?.isPreview && (
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                    {professionalProfile?.address?.country || 'Sample'} Preview
                  </Badge>
                )}
                {!vector?.isPreview && todaysData.hasData && (
                  <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(todaysData.earnings)}
                </p>
                <DollarSign className="h-5 w-5 text-foreground/80" />
              </div>
              
              {/* 🆕 NEW: Real comparison with yesterday */}
              <div className="flex items-center gap-1 text-foreground/90">
                <TrendingUp className={`h-3 w-3 ${comparisonData.isIncrease ? 'text-green-600' : 'text-red-600'}`} />
                <p className="text-sm">
                  {comparisonData.isIncrease ? '+' : '-'}{comparisonData.percentage}% from yesterday
                  {vector?.isPreview && ' (sample)'}
                </p>
              </div>

              {/* 🆕 NEW: Today's booking count */}
              {todaysData.bookings > 0 && (
                <div className="text-xs text-muted-foreground">
                  {todaysData.bookings} booking{todaysData.bookings !== 1 ? 's' : ''} completed today
                </div>
              )}
            </div>
            
            <div className="text-right space-y-2">
              <p className="text-sm font-medium text-foreground">Active Hours</p>
              <div className="flex items-center gap-2 justify-end">
                <Clock className="h-5 w-5 text-foreground/80" />
                <p className="text-2xl font-bold text-foreground">
                  {todaysData.hasData ? `${getActiveHours()}h` : '0h'}
                </p>
              </div>
              
              {/* 🆕 NEW: Status indicator */}
              {todaysData.hasData ? (
                <div className="text-xs text-green-600 font-medium">
                  Active Today
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No bookings yet
                </div>
              )}
            </div>
          </div>

          {/* 🆕 NEW: Today's booking details (when not hidden) */}
          {!hideEarnings && todaysData.details && todaysData.details.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-medium text-foreground mb-2">Today's Activity:</div>
              <div className="space-y-1">
                {todaysData.details.slice(0, 3).map((detail, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {detail.time} • {detail.service_name}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(detail.amount)}
                    </span>
                  </div>
                ))}
                {todaysData.details.length > 3 && (
                  <div className="text-xs text-muted-foreground italic">
                    +{todaysData.details.length - 3} more booking{todaysData.details.length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🆕 NEW: Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {hasAnyBookings ? (
            vector?.isPreview ? 
              `📊 Preview Mode: ${professionalProfile?.address?.country || 'Unknown'} Market Data` :
              `✅ Live Data: ${todaysData.bookings} bookings, ${formatCurrency(todaysData.earnings)}`
          ) : (
            '🆕 New Professional: Waiting for first booking'
          )}
        </div>
      )}
    </div>
  );
}