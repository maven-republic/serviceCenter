'use client'

// 🔧 UPDATED: Accept real data props for dynamic thresholds and messages
export default function ChartClickPopup({ 
  selectedBarData, 
  setSelectedBarData, 
  hideEarnings, 
  vector = null, 
  currencyService = null 
}) {
  if (!selectedBarData) return null;

  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••'
    
    if (currencyService) {
      return currencyService.formatCurrency(amount);
    }
    
    return `$${amount.toFixed(2)}`
  }

  // 🆕 NEW: Get dynamic thresholds based on real data
  const getThresholds = (type) => {
    if (!vector) {
      return getDefaultThresholds(type);
    }
    
    switch (type) {
      case 'daily':
        return getDailyThresholds();
      case 'hourly':
        return getHourlyThresholds();
      case 'weekly':
        return getWeeklyThresholds();
      case 'monthly':
        return getMonthlyThresholds();
      default:
        return getDefaultThresholds(type);
    }
  };

  // 🆕 NEW: Calculate dynamic daily thresholds
  const getDailyThresholds = () => {
    if (!vector.dailyData || vector.dailyData.length === 0) {
      return { excellent: 600, good: 400 };
    }
    
    const earnings = vector.dailyData.map(day => day.earnings);
    const average = earnings.reduce((sum, val) => sum + val, 0) / earnings.length;
    
    return {
      excellent: average * 1.5,
      good: average * 1.1
    };
  };

  // 🆕 NEW: Calculate dynamic hourly thresholds
  const getHourlyThresholds = () => {
    if (!vector.hourlyData || vector.hourlyData.length === 0) {
      return { excellent: 300, good: 200 };
    }
    
    const average = vector.averageHourlyEarnings || 
      (vector.hourlyData.reduce((sum, hour) => sum + hour.earnings, 0) / vector.hourlyData.length);
    
    return {
      excellent: average * 1.4,
      good: average * 1.1
    };
  };

  // 🆕 NEW: Calculate dynamic weekly thresholds
  const getWeeklyThresholds = () => {
    if (!vector.weeklyData || vector.weeklyData.length === 0) {
      return { excellent: 3500, good: 3000 };
    }
    
    const average = vector.averageWeeklyEarnings ||
      (vector.weeklyData.reduce((sum, week) => sum + week.earnings, 0) / vector.weeklyData.length);
    
    return {
      excellent: average * 1.3,
      good: average * 1.1
    };
  };

  // 🆕 NEW: Calculate dynamic monthly thresholds
  const getMonthlyThresholds = () => {
    if (!vector.monthlyData || vector.monthlyData.length === 0) {
      return { excellent: 15000, good: 12000 };
    }
    
    const average = vector.averageMonthlyEarnings ||
      (vector.monthlyData.reduce((sum, month) => sum + month.earnings, 0) / vector.monthlyData.length);
    
    return {
      excellent: average * 1.3,
      good: average * 1.1
    };
  };

  // 🆕 NEW: Fallback thresholds when no real data available
  const getDefaultThresholds = (type) => {
    const defaults = {
      daily: { excellent: 600, good: 400 },
      hourly: { excellent: 300, good: 200 },
      weekly: { excellent: 3500, good: 3000 },
      monthly: { excellent: 15000, good: 12000 }
    };
    return defaults[type] || { excellent: 500, good: 300 };
  };

  // 🆕 NEW: Get contextual message based on real performance
  const getContextMessage = () => {
    const { type, value, bookings } = selectedBarData;
    const thresholds = getThresholds(type);
    
    // Performance level calculation
    const isExcellent = value >= thresholds.excellent;
    const isGood = value >= thresholds.good;
    
    // Get period-specific insights
    const periodInsights = getPeriodSpecificInsights(type, selectedBarData);
    
    if (hideEarnings) {
      return getBookingsMessage(bookings, type);
    }
    
    if (isExcellent) {
      return getExcellentMessage(type, value, bookings, periodInsights);
    } else if (isGood) {
      return getGoodMessage(type, value, bookings, periodInsights);
    } else {
      return getImprovementMessage(type, value, bookings, periodInsights);
    }
  };

  // 🆕 NEW: Bookings-focused messages when earnings hidden
  const getBookingsMessage = (bookings, type) => {
    if (!bookings || bookings === 0) {
      return {
        emoji: '💡',
        title: 'No bookings yet',
        message: `This ${type.slice(0, -2)} had no completed bookings.`,
        tip: 'Focus marketing efforts during this period!'
      };
    }

    const isHighBookings = bookings >= getBookingThreshold(type);
    
    return {
      emoji: isHighBookings ? '🔥' : '👍',
      title: `${bookings} booking${bookings === 1 ? '' : 's'}`,
      message: isHighBookings ? 
        `Excellent booking volume for this ${type.slice(0, -2)}!` :
        `Good activity with ${bookings} booking${bookings === 1 ? '' : 's'}.`,
      tip: isHighBookings ? 
        'Keep up the great work!' : 
        'Room to grow - consider promotional strategies.'
    };
  };

  // 🆕 NEW: Excellent performance messages
  const getExcellentMessage = (type, value, bookings, insights) => {
    const messages = {
      daily: [
        '🔥 Outstanding day! This was one of your best performances.',
        '⭐ Exceptional earning day! You maximized your potential.',
        '🚀 Incredible performance! This day shows what you\'re capable of.'
      ],
      hourly: [
        '⚡ Peak performance hour! This is your optimal working time.',
        '🎯 Perfect timing! This hour consistently delivers results.',
        '💪 Power hour achieved! This is when you shine brightest.'
      ],
      weekly: [
        '🏆 Fantastic week! You maintained excellent momentum.',
        '📈 Stellar weekly performance! This is benchmark success.',
        '🌟 Week of excellence! You dominated this period.'
      ],
      monthly: [
        '👑 Outstanding month! This represents your peak potential.',
        '🎊 Exceptional monthly performance! You set a new standard.',
        '💎 Diamond month! This level of consistency is remarkable.'
      ]
    };

    const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];
    
    return {
      emoji: '🔥',
      title: 'Excellent Performance!',
      message: randomMessage,
      tip: insights.tip || 'Analyze what made this period successful and replicate it!'
    };
  };

  // 🆕 NEW: Good performance messages
  const getGoodMessage = (type, value, bookings, insights) => {
    const messages = {
      daily: [
        '👍 Solid day! You\'re on the right track.',
        '✅ Good performance! Consistent progress being made.',
        '💚 Nice work! This day contributed well to your goals.'
      ],
      hourly: [
        '⭐ Productive hour! Good earnings during this time.',
        '👌 Solid performance! This hour is working well for you.',
        '📊 Good results! This timeframe shows potential.'
      ],
      weekly: [
        '📈 Good week! You maintained steady progress.',
        '✨ Positive momentum! This week contributed to your growth.',
        '🎯 On track! This week shows consistent effort paying off.'
      ],
      monthly: [
        '📊 Solid month! You maintained good momentum.',
        '🌱 Growing strong! This month shows positive trends.',
        '⭐ Good foundation! Building toward excellent performance.'
      ]
    };

    const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];
    
    return {
      emoji: '👍',
      title: 'Good Performance!',
      message: randomMessage,
      tip: insights.tip || 'You\'re doing well! Look for opportunities to reach the next level.'
    };
  };

  // 🆕 NEW: Improvement opportunity messages
  const getImprovementMessage = (type, value, bookings, insights) => {
    if (value === 0 || !bookings) {
      return {
        emoji: '💡',
        title: 'Opportunity ahead',
        message: `This ${type.slice(0, -2)} had no activity. Perfect chance to focus efforts here!`,
        tip: insights.tip || 'Consider targeted marketing or schedule adjustments for this period.'
      };
    }

    const messages = {
      daily: [
        '💡 Room for growth! This day has untapped potential.',
        '🌱 Building momentum! Every day is a step toward your goals.',
        '🎯 Opportunity day! Focus efforts here for better results.'
      ],
      hourly: [
        '⚡ Growth potential! This hour could perform much better.',
        '🔧 Optimization time! Consider adjusting your approach for this hour.',
        '💡 Hidden opportunity! This timeframe needs attention.'
      ],
      weekly: [
        '🌱 Growth week ahead! This period shows improvement potential.',
        '📈 Building phase! Use this week to strengthen your approach.',
        '🎯 Focus opportunity! This week needs strategic attention.'
      ],
      monthly: [
        '🌱 Foundation month! Building toward stronger performance.',
        '📊 Development period! This month is part of your growth journey.',
        '💪 Improvement phase! Every month is a step toward excellence.'
      ]
    };

    const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];
    
    return {
      emoji: '💡',
      title: 'Growth Opportunity',
      message: randomMessage,
      tip: insights.tip || 'Analyze successful periods and apply those strategies here.'
    };
  };

  // 🆕 NEW: Get period-specific insights and tips
  const getPeriodSpecificInsights = (type, data) => {
    const insights = {
      daily: getDailyInsights(data),
      hourly: getHourlyInsights(data),
      weekly: getWeeklyInsights(data),
      monthly: getMonthlyInsights(data)
    };
    
    return insights[type] || { tip: 'Keep analyzing your performance for continuous improvement!' };
  };

  // 🆕 NEW: Daily-specific insights
  const getDailyInsights = (data) => {
    const dayName = data.day || data.label;
    const dayTips = {
      'Monday': 'Start strong! Mondays set the tone for the week.',
      'Tuesday': 'Maintain momentum from Monday\'s energy.',
      'Wednesday': 'Mid-week opportunities often have less competition.',
      'Thursday': 'Thursday work often converts to weekend bookings.',
      'Friday': 'End the week strong and prep for weekend demand.',
      'Saturday': 'Weekend peak! Maximize high-demand periods.',
      'Sunday': 'Sunday prep day or leisure service opportunities.'
    };
    
    return {
      tip: dayTips[dayName] || 'Every day is an opportunity to grow your business!'
    };
  };

  // 🆕 NEW: Hourly-specific insights
  const getHourlyInsights = (data) => {
    const hour = data.hour || parseInt(data.label);
    
    if (hour >= 6 && hour <= 9) {
      return { tip: 'Morning hours - great for early risers and preparation services!' };
    } else if (hour >= 10 && hour <= 14) {
      return { tip: 'Midday peak - high activity period with good conversion rates!' };
    } else if (hour >= 15 && hour <= 18) {
      return { tip: 'Afternoon rush - professionals finishing work seek services!' };
    } else if (hour >= 19 && hour <= 21) {
      return { tip: 'Evening demand - people have time after work for services!' };
    }
    
    return { tip: 'Analyze your peak hours and schedule accordingly!' };
  };

  // 🆕 NEW: Weekly-specific insights
  const getWeeklyInsights = (data) => {
    return {
      tip: 'Weekly patterns help forecast demand and plan resources effectively!'
    };
  };

  // 🆕 NEW: Monthly-specific insights
  const getMonthlyInsights = (data) => {
    const month = data.monthName || data.label;
    const seasonalTips = {
      'January': 'New Year, new goals! People invest in improvements.',
      'February': 'Valentine\'s prep and post-holiday recovery services.',
      'March': 'Spring preparation - cleaning, maintenance, renewals.',
      'April': 'Easter and spring activity increase.',
      'May': 'Graduation season and summer preparation.',
      'June': 'Wedding season and vacation prep services.',
      'July': 'Summer peak activity period.',
      'August': 'Back-to-school preparation season.',
      'September': 'Fall renewal and preparation services.',
      'October': 'Holiday preparation begins.',
      'November': 'Pre-holiday rush and Thanksgiving prep.',
      'December': 'Holiday peak season for many services.'
    };
    
    return {
      tip: seasonalTips[month] || 'Monthly trends help you plan seasonal strategies!'
    };
  };

  // 🆕 NEW: Get booking thresholds for different periods
  const getBookingThreshold = (type) => {
    const thresholds = {
      daily: 3,
      hourly: 2,
      weekly: 15,
      monthly: 50
    };
    return thresholds[type] || 2;
  };

  // Get the contextual message
  const contextData = getContextMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{contextData.emoji}</span>
            <h3 className="font-semibold text-lg">{contextData.title}</h3>
          </div>
          <button
            onClick={() => setSelectedBarData(null)}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">
              {selectedBarData.type.charAt(0).toUpperCase() + selectedBarData.type.slice(1)} Performance
            </div>
            <div className="font-semibold">
              {hideEarnings ? 
                `${selectedBarData.bookings || 0} bookings` : 
                formatEarnings(selectedBarData.value)
              }
            </div>
            {!hideEarnings && selectedBarData.bookings && (
              <div className="text-sm text-gray-500">
                {selectedBarData.bookings} booking{selectedBarData.bookings === 1 ? '' : 's'}
              </div>
            )}
          </div>
          
          <p className="text-gray-700">{contextData.message}</p>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-800 mb-1">💡 Pro Tip</div>
            <div className="text-sm text-blue-700">{contextData.tip}</div>
          </div>
        </div>
        
        <button
          onClick={() => setSelectedBarData(null)}
          className="w-full mt-4 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}