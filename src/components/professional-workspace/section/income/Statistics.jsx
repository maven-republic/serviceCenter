// ============ 2. Statistics.jsx ============
export default function Statistics() {
  // Beta state - set to true when user has actual bookings
  const hasBookings = false; // This would come from your app state/API

  const stats = [
    {
      title: "Total Earnings",
      value: hasBookings ? "$89,340" : "",
      change: hasBookings ? "+15%" : "",
      subtitle: hasBookings ? "This Month" : "Your first booking",
      icon: "flaticon-dollar",
    },
    {
      title: "This Month's Earning",
      value: hasBookings ? "$12,850" : "", 
      change: hasBookings ? "+8%" : "",
      subtitle: hasBookings ? "vs Last Month" : "Initial transactions",
      icon: "flaticon-profit",
    },
    {
      title: "Mean Order Value",
      value: hasBookings ? "$485" : "",
      change: hasBookings ? "+12%" : "", 
      subtitle: hasBookings ? "Increase" : "After 3+ orders",
      icon: "flaticon-analytics",
    },
    {
      title: "Commission Earned",
      value: hasBookings ? "$8,934" : "",
      change: hasBookings ? "10%" : "",
      subtitle: hasBookings ? "Platform Fee" : "First customer", 
      icon: "flaticon-badge",
    }
  ];

  if (!hasBookings) {
    // Beta Empty State
    return (
      <div className="row">
        {stats.map((stat, index) => (
          <div key={index} className="col-sm-6 col-xxl-3">
            <div 
              className="d-flex align-items-center justify-content-between statistics_funfact"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.3s ease',
                opacity: '0.8'
              }}
            >
              <div className="details">
                <div className="title" 
                style={{ color: '#64748b' }}>{stat.title}
                </div>
                <div 
                  className="h4"
                  style={{
                    background: 'linear-gradient(45deg, #64748b, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '600'
                  }}
                >
                  {stat.value}
                </div>
                <div className="text fz14" style={{ color: '#94a3b8' }}>
                  {stat.subtitle}
                </div>
              </div>
              <div className="icon text-center">
                <span 
                  style={{
                    fontSize: '12px',
                    opacity: '0.6',
                    filter: 'grayscale(0.3)'
                  }}
                >
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Original Statistics (when hasBookings = true)
  return (
    <div className="row">
      {stats.map((stat, index) => (
        <div key={index} className="col-sm-6 col-xxl-3">
          <div className="d-flex align-items-center justify-content-between statistics_funfact">
            <div className="details">
              <div className="fz15">{stat.title}</div>
              <div className="title">{stat.value}</div>
              <div className="text fz14">
                <span className="text-thm">{stat.change}</span> {stat.subtitle}
              </div>
            </div>
            <div className="icon text-center">
              <i className={stat.icon} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}