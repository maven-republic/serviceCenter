export default function ChartStatistics({ activeChart, hideEarnings }) {
  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••';
    return `$${amount.toFixed(2)}`;
  };

  const getStats = () => {
    switch (activeChart) {
      case 'daily':
        return [
          { label: 'Best Day', value: 'Sat 30', detail: formatEarnings(890), highlight: true },
          { label: 'Daily Average', value: formatEarnings(575), detail: 'This week', highlight: false },
          { label: 'Total Week', value: formatEarnings(4025), detail: '+8% vs last', highlight: true }
        ];
      case 'hourly':
        return [
          { label: 'Peak Hour', value: '8-9 PM', detail: formatEarnings(420) + ' avg', highlight: true },
          { label: 'Hourly Average', value: formatEarnings(230), detail: 'All hours', highlight: false },
          { label: 'Best Window', value: '6-9 PM', detail: 'Weekends', highlight: true }
        ];
      case 'weekly':
        return [
          { label: 'This Month', value: formatEarnings(13750), detail: '4 weeks', highlight: false },
          { label: 'Best Week', value: formatEarnings(4100), detail: 'Week 3', highlight: true },
          { label: 'Growth', value: '+15%', detail: 'vs last month', highlight: true }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="row mt20 text-center">
      {getStats().map((stat, index) => (
        <div key={index} className="col-md-4">
          <div 
            className="fz14" 
            style={{ color: '#64748b' }}
          >
            {stat.label}
          </div>
          <div 
            className="h5" 
            style={{ 
              color: stat.highlight ? '#000000' : '#64748b',
              fontWeight: stat.highlight ? '600' : '500'
            }}
          >
            {stat.value}
          </div>
          <div 
            className="fz14" 
            style={{ color: '#64748b' }}
          >
            {stat.detail}
          </div>
        </div>
      ))}
    </div>
  );
}