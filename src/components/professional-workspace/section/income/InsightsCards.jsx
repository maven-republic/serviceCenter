'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// 🔧 UPDATED: Accept real data props instead of hardcoded insights
export default function InsightsCards({ vector = null, professionalProfile = null }) {
  
  // 🆕 NEW: Generate real insights from vector data
  const generateInsights = () => {
    if (!vector) {
      return getDefaultInsights();
    }

    const insights = [];

    // 1. Best Performance Insight
    const bestPerformanceInsight = getBestPerformanceInsight();
    if (bestPerformanceInsight) insights.push(bestPerformanceInsight);

    // 2. Opportunity Insight  
    const opportunityInsight = getOpportunityInsight();
    if (opportunityInsight) insights.push(opportunityInsight);

    // 3. Goal/Progress Insight
    const goalInsight = getGoalInsight();
    if (goalInsight) insights.push(goalInsight);

    // If we don't have enough real insights, fill with defaults
    while (insights.length < 3) {
      const defaultInsights = getDefaultInsights();
      insights.push(defaultInsights[insights.length]);
    }

    return insights.slice(0, 3); // Ensure we only return 3 insights
  };

  // 🆕 NEW: Analyze best performance patterns
  const getBestPerformanceInsight = () => {
    // Check hourly patterns
    if (vector.hourlyData && vector.hourlyData.length > 0) {
      const peakHours = vector.hourlyData
        .filter(hour => hour.earnings > (vector.averageHourlyEarnings || 0))
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 3);

      if (peakHours.length > 0) {
        const timeRanges = categorizeTimeRanges(peakHours.map(h => h.hour));
        return {
          title: "Best Performance",
          subtitle: timeRanges,
          icon: "📈",
          bgColor: "bg-muted",
          borderColor: "border-green-200",
          iconBg: "bg-green-50",
          titleColor: "text-foreground",
          subtitleColor: "text-foreground",
        };
      }
    }

    // Check weekly patterns
    if (vector.weeklyData && vector.weeklyData.length > 0) {
      const bestWeeks = vector.weeklyData
        .filter(week => week.earnings > (vector.averageWeeklyEarnings || 0))
        .length;
      
      const performance = bestWeeks / vector.weeklyData.length;
      
      if (performance > 0.6) {
        return {
          title: "Consistent Growth",
          subtitle: `${Math.round(performance * 100)}% strong weeks`,
          icon: "🎯",
          bgColor: "bg-muted",
          borderColor: "border-green-200", 
          iconBg: "bg-green-50",
          titleColor: "text-foreground",
          subtitleColor: "text-foreground",
        };
      }
    }

    return null;
  };

  // 🆕 NEW: Find opportunity insights
  const getOpportunityInsight = () => {
    // Check for low-performing time slots
    if (vector.hourlyData && vector.hourlyData.length > 0) {
      const lowPerformingHours = vector.hourlyData
        .filter(hour => hour.earnings < (vector.averageHourlyEarnings || 0) * 0.5)
        .filter(hour => hour.hour >= 7 && hour.hour <= 19); // Business hours only

      if (lowPerformingHours.length > 0) {
        const timeRanges = categorizeTimeRanges(lowPerformingHours.map(h => h.hour));
        return {
          title: "Opportunity",
          subtitle: `Grow ${timeRanges}`,
          icon: "⭐",
          bgColor: "bg-muted",
          borderColor: "border-blue-300",
          iconBg: "bg-blue-50", 
          titleColor: "text-foreground",
          subtitleColor: "text-foreground",
        };
      }
    }

    // Check regional opportunities
    if (vector.regionAnalytics && vector.regionAnalytics.length > 0) {
      const highOpportunityRegions = vector.regionAnalytics
        .filter(region => region.market_opportunity > 0.8)
        .filter(region => region.distance_km < 50); // Within reasonable distance

      if (highOpportunityRegions.length > 0) {
        const topRegion = highOpportunityRegions[0];
        return {
          title: "Market Opportunity", 
          subtitle: `Expand to ${topRegion.region}`,
          icon: "🌟",
          bgColor: "bg-muted",
          borderColor: "border-blue-300",
          iconBg: "bg-blue-50",
          titleColor: "text-foreground", 
          subtitleColor: "text-foreground",
        };
      }
    }

    return null;
  };

  // 🆕 NEW: Generate goal/progress insights
  const getGoalInsight = () => {
    if (!vector.totalEarnings || vector.totalEarnings === 0) {
      return {
        title: "Getting Started",
        subtitle: "Ready for first booking",
        icon: "🚀",
        bgColor: "bg-muted",
        borderColor: "border-yellow-300",
        iconBg: "bg-yellow-50",
        titleColor: "text-foreground",
        subtitleColor: "text-foreground",
      };
    }

    // Calculate progress toward goals
    const monthlyTarget = getMonthlyTarget();
    const currentMonthlyEarnings = getCurrentMonthEarnings();
    
    if (monthlyTarget && currentMonthlyEarnings) {
      const progress = (currentMonthlyEarnings / monthlyTarget) * 100;
      
      if (progress >= 85) {
        return {
          title: "Monthly Goal",
          subtitle: `${Math.round(progress)}% achieved!`,
          icon: "🎯",
          bgColor: "bg-muted", 
          borderColor: "border-green-300",
          iconBg: "bg-green-50",
          titleColor: "text-foreground",
          subtitleColor: "text-foreground",
        };
      } else if (progress >= 50) {
        return {
          title: "Monthly Progress",
          subtitle: `${Math.round(progress)}% to goal`,
          icon: "📊",
          bgColor: "bg-muted",
          borderColor: "border-yellow-300", 
          iconBg: "bg-yellow-50",
          titleColor: "text-foreground",
          subtitleColor: "text-foreground",
        };
      }
    }

    // Growth insight
    if (vector.dailyData && vector.dailyData.length >= 7) {
      const recentWeek = vector.dailyData.slice(-7);
      const previousWeek = vector.dailyData.slice(-14, -7);
      
      if (previousWeek.length === 7) {
        const recentAvg = recentWeek.reduce((sum, d) => sum + d.earnings, 0) / 7;
        const previousAvg = previousWeek.reduce((sum, d) => sum + d.earnings, 0) / 7;
        
        if (recentAvg > previousAvg * 1.1) {
          const growth = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
          return {
            title: "Weekly Growth", 
            subtitle: `+${growth}% this week`,
            icon: "📈",
            bgColor: "bg-muted",
            borderColor: "border-green-300",
            iconBg: "bg-green-50", 
            titleColor: "text-foreground",
            subtitleColor: "text-foreground",
          };
        }
      }
    }

    return null;
  };

  // 🆕 NEW: Helper functions
  const categorizeTimeRanges = (hours) => {
    // Group consecutive hours into ranges
    hours.sort((a, b) => a - b);
    
    const ranges = [];
    let start = hours[0];
    let end = hours[0];
    
    for (let i = 1; i < hours.length; i++) {
      if (hours[i] === end + 1) {
        end = hours[i];
      } else {
        ranges.push(formatTimeRange(start, end));
        start = hours[i];
        end = hours[i];
      }
    }
    ranges.push(formatTimeRange(start, end));
    
    // Categorize by time of day
    const morningHours = hours.filter(h => h >= 6 && h < 12);
    const afternoonHours = hours.filter(h => h >= 12 && h < 17);
    const eveningHours = hours.filter(h => h >= 17 && h <= 21);
    
    if (eveningHours.length >= morningHours.length && eveningHours.length >= afternoonHours.length) {
      return "Evenings 5–9 PM";
    } else if (morningHours.length >= afternoonHours.length) {
      return "Mornings 7–11 AM";
    } else {
      return "Afternoons 12–5 PM";
    }
  };

  const formatTimeRange = (start, end) => {
    const formatHour = (hour) => {
      if (hour === 12) return '12 PM';
      if (hour > 12) return `${hour - 12} PM`;
      return `${hour} AM`;
    };
    
    if (start === end) {
      return formatHour(start);
    } else {
      return `${formatHour(start)}–${formatHour(end)}`;
    }
  };

  const getMonthlyTarget = () => {
    // Estimate monthly target based on service prices
    const services = professionalProfile?.professional_service || [];
    if (services.length > 0) {
      const avgServicePrice = services.reduce((sum, ps) => sum + (ps.service?.base_price || 0), 0) / services.length;
      // Assume 20 bookings per month as a reasonable target
      return avgServicePrice * 20;
    }
    return null;
  };

  const getCurrentMonthEarnings = () => {
    if (!vector.monthlyData || vector.monthlyData.length === 0) {
      return null;
    }
    
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthData = vector.monthlyData.find(m => m.month === currentMonth);
    return currentMonthData?.earnings || 0;
  };

  // 🔄 FALLBACK: Default insights when no data available
  const getDefaultInsights = () => [
    {
      title: "Best Performance",
      subtitle: "Weekends 6–9 PM",
      icon: "📈",
      bgColor: "bg-muted",
      borderColor: "border-green-200",
      iconBg: "bg-green-50",
      titleColor: "text-foreground",
      subtitleColor: "text-foreground",
    },
    {
      title: "Opportunity",
      subtitle: "Mornings 7–9 AM", 
      icon: "⭐",
      bgColor: "bg-muted",
      borderColor: "border-blue-300",
      iconBg: "bg-blue-50",
      titleColor: "text-foreground",
      subtitleColor: "text-foreground",
    },
    {
      title: "Weekly Goal",
      subtitle: "85% complete",
      icon: "🎯",
      bgColor: "bg-muted",
      borderColor: "border-yellow-300",
      iconBg: "bg-yellow-50", 
      titleColor: "text-foreground",
      subtitleColor: "text-foreground",
    },
  ];

  const insights = generateInsights();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
      {insights.map((insight, index) => (
        <Card
          key={index}
          className={`flex items-center space-x-4 p-4 rounded-lg ${insight.bgColor} ${insight.borderColor} border transition-all duration-200 hover:shadow-md`}
        >
          <div className={`w-8 h-8 ${insight.iconBg} rounded-full flex items-center justify-center`}>
            <span className="text-sm">{insight.icon}</span>
          </div>
          <div>
            <div className={`text-sm font-semibold ${insight.titleColor}`}>
              {insight.title}
            </div>
            <div className={`text-xs ${insight.subtitleColor}`}>
              {insight.subtitle}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}