// ============ ChartTabs.jsx - Improved Design ============
import React from 'react';

export default function ChartTabs({ activeChart, setActiveChart }) {
  const tabs = [
    { key: 'daily', label: 'Day', icon: '📊', description: 'Daily trends' },
    { key: 'hourly', label: 'Hour', icon: '⏰', description: 'Peak hours' },
    { key: 'weekly', label: 'Week', icon: '📈', description: 'Weekly view' },
    { key: 'monthly', label: 'Month', icon: '📅', description: 'Monthly stats' }
  ];

  const tabStyles = {
    container: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '12px',
      padding: '6px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e2e8f0'
    },
    tabsWrapper: {
      display: 'flex',
      gap: '4px',
      width: '100%'
    },
    tab: (isActive) => ({
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: '12px 8px',
      fontSize: '13px',
      fontWeight: isActive ? '600' : '500',
      backgroundColor: isActive ? '#000000' : 'transparent',
      color: isActive ? '#ffffff' : '#64748b',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      // CSS Reset
      boxSizing: 'border-box',
      textDecoration: 'none',
      appearance: 'none',
      webkitAppearance: 'none',
      mozAppearance: 'none',
      lineHeight: '1.4',
      whiteSpace: 'nowrap',
      margin: '0',
      fontFamily: 'inherit',
      textAlign: 'center',
      userSelect: 'none',
      // Hover shadow for inactive tabs
      // boxShadow: isActive 
        // ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
        // : '0 0 0 0 transparent'
    }),
    tabIcon: (isActive) => ({
      fontSize: '16px',
      transition: 'transform 0.3s ease',
      transform: isActive ? 'scale(1.1)' : 'scale(1)'
    }),
    tabLabel: {
      fontSize: '13px',
      fontWeight: 'inherit'
    },
    tabDescription: (isActive) => ({
      fontSize: '10px',
      opacity: isActive ? 0.9 : 0.7,
      transition: 'opacity 0.3s ease',
      marginTop: '2px'
    })
  };

  return (
    <div style={tabStyles.container}>
      <div style={tabStyles.tabsWrapper}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key)}
            className="" // Remove any Bootstrap classes
            style={tabStyles.tab(activeChart === tab.key)}
            onMouseEnter={(e) => {
              if (activeChart !== tab.key) {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.color = '#374151';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeChart !== tab.key) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#64748b';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 0 0 0 transparent';
              }
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(0) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = activeChart === tab.key 
                ? 'translateY(0) scale(1)' 
                : 'translateY(-1px) scale(1)';
            }}
          >
            <div style={tabStyles.tabIcon(activeChart === tab.key)}>
              {tab.icon}
            </div>
            <div style={tabStyles.tabLabel}>
              {tab.label}
            </div>
            <div style={tabStyles.tabDescription(activeChart === tab.key)}>
              {tab.description}
            </div>
          </button>
        ))}
      </div>

      {/* CSS for additional animations */}
      <style jsx>{`
        @keyframes tabSelect {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        
        .tab-selected {
          animation: tabSelect 0.3s ease-out;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .tab-icon {
            font-size: 14px !important;
          }
          .tab-label {
            font-size: 11px !important;
          }
          .tab-description {
            font-size: 9px !important;
          }
        }
      `}</style>
    </div>
  );
}