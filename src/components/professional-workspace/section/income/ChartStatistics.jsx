'use client'

export default function ChartStatistics({ activeChart, hideEarnings }) {
  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••'
    return `$${amount.toFixed(2)}`
  }

  const getStats = () => {
    switch (activeChart) {
      case 'daily':
        return [
          { label: 'Best Day', value: 'Sat 30', detail: formatEarnings(890), highlight: true },
          { label: 'Daily Average', value: formatEarnings(575), detail: 'This week', highlight: false },
          { label: 'Total Week', value: formatEarnings(4025), detail: '+8% vs last', highlight: true }
        ]
      case 'hourly':
        return [
          { label: 'Peak Hour', value: '8-9 PM', detail: `${formatEarnings(420)} avg`, highlight: true },
          { label: 'Hourly Average', value: formatEarnings(230), detail: 'All hours', highlight: false },
          { label: 'Best Window', value: '6-9 PM', detail: 'Weekends', highlight: true }
        ]
      case 'weekly':
        return [
          { label: 'This Month', value: formatEarnings(13750), detail: '4 weeks', highlight: false },
          { label: 'Best Week', value: formatEarnings(4100), detail: 'Week 3', highlight: true },
          { label: 'Growth', value: '+15%', detail: 'vs last month', highlight: true }
        ]
      case 'monthly':
        return [
          { label: 'Best Month', value: 'December', detail: formatEarnings(13200), highlight: true },
          { label: 'Monthly Average', value: formatEarnings(10250), detail: 'This year', highlight: false },
          { label: 'Year Total', value: formatEarnings(123000), detail: '+22% vs last year', highlight: true }
        ]
      default:
        return []
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 text-center mt-5 gap-y-4">
      {getStats().map((stat, index) => (
        <div key={index} className="space-y-1">
          <div className="text-sm text-muted-foreground">{stat.label}</div>
          <div className={`text-base ${stat.highlight ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.detail}</div>
        </div>
      ))}
    </div>
  )
}
