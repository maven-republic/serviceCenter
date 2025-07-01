// ============ 10. InsightsCards.jsx ============
export default function InsightsCards() {
  const insights = [
    {
      title: "Best Performance",
      subtitle: "Weekends 6-9 PM",
      icon: "📈",
      bgColor: "#dcfce7",
      borderColor: "#bbf7d0",
      iconBg: "#f0fdf4",
      titleColor: "#166534",
      subtitleColor: "#15803d"
    },
    {
      title: "Opportunity", 
      subtitle: "Mornings 7-9 AM",
      icon: "⭐",
      bgColor: "#dbeafe",
      borderColor: "#93c5fd", 
      iconBg: "#eff6ff",
      titleColor: "#1e40af",
      subtitleColor: "#2563eb"
    },
    {
      title: "Weekly Goal",
      subtitle: "85% complete", 
      icon: "🎯",
      bgColor: "#fef3c7",
      borderColor: "#fcd34d",
      iconBg: "#fffbeb", 
      titleColor: "#92400e",
      subtitleColor: "#d97706"
    }
  ];

  return (
    <div className="row mt20">
      {insights.map((insight, index) => (
        <div key={index} className="col-md-4">
          <div 
            className="d-flex align-items-center p15" 
            style={{
              backgroundColor: insight.bgColor, 
              border: `1px solid ${insight.borderColor}`, 
              borderRadius: '8px'
            }}
          >
            <div 
              className="me-3" 
              style={{
                width: '32px', 
                height: '32px', 
                backgroundColor: insight.iconBg, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              <span style={{fontSize: '14px'}}>{insight.icon}</span>
            </div>
            <div>
              <div className="fz14 fw-bold" style={{color: insight.titleColor}}>
                {insight.title}
              </div>
              <div className="fz12" style={{color: insight.subtitleColor}}>
                {insight.subtitle}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
