// ============ CalendarLegend.jsx - Calendar Icon ============
import React from 'react';

export default function CalendarLegend({ 
  showEarningsLegend = false,
  selectedRange = null,
  totalDaysSelected = 0
}) {
  const legendStyles = {
    container: {
      marginTop: '16px',
      padding: '12px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    title: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    legendGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '8px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      color: '#64748b'
    },
    legendDot: (color, size = '12px') => ({
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      flexShrink: 0
    }),
    legendBox: (backgroundColor, borderColor) => ({
      width: '12px',
      height: '12px',
      backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '2px',
      flexShrink: 0
    }),
    selectionInfo: {
      marginTop: '8px',
      padding: '8px 12px',
      backgroundColor: '#f0f9ff',
      border: '1px solid #0ea5e9',
      borderRadius: '6px',
      fontSize: '12px',
      color: '#0369a1',
      textAlign: 'center'
    }
  };

  // Basic calendar legend items
  const basicLegendItems = [
    {
      element: <div style={legendStyles.legendBox('#0ea5e9', '#0369a1')} />,
      label: 'Today'
    },
    {
      element: <div style={legendStyles.legendBox('#000000', '#000000')} />,
      label: 'Selected'
    },
    {
      element: <div style={legendStyles.legendBox('#f1f5f9', '#e2e8f0')} />,
      label: 'Range'
    },
    {
      element: <div style={legendStyles.legendDot('#94a3b8')} />,
      label: 'Past dates'
    }
  ];

  // Earnings legend items (future feature)
  const earningsLegendItems = [
    {
      element: <div style={legendStyles.legendDot('#22c55e')} />,
      label: 'High earnings ($1000+)'
    },
    {
      element: <div style={legendStyles.legendDot('#f59e0b')} />,
      label: 'Medium earnings ($500+)'
    },
    {
      element: <div style={legendStyles.legendDot('#0ea5e9')} />,
      label: 'Low earnings ($100+)'
    },
    {
      element: <div style={legendStyles.legendDot('#94a3b8')} />,
      label: 'Minimal earnings'
    }
  ];

  return (
    <div style={legendStyles.container}>
      {/* Legend Title */}
      <div style={legendStyles.title}>
        📅 Calendar Legend
      </div>

      {/* Basic Legend */}
      <div style={legendStyles.legendGrid}>
        {basicLegendItems.map((item, index) => (
          <div key={index} style={legendStyles.legendItem}>
            {item.element}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Earnings Legend (when enabled) */}
      {showEarningsLegend && (
        <>
          <div style={{ ...legendStyles.title, marginTop: '12px', marginBottom: '8px' }}>
            💰 Earnings Levels
          </div>
          <div style={legendStyles.legendGrid}>
            {earningsLegendItems.map((item, index) => (
              <div key={index} style={legendStyles.legendItem}>
                {item.element}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Selection Info */}
      {selectedRange && selectedRange.startDate && selectedRange.endDate && (
        <div style={legendStyles.selectionInfo}>
          📊 Selected Range: {selectedRange.startDate.toLocaleDateString()} - {selectedRange.endDate.toLocaleDateString()}
          {totalDaysSelected > 0 && ` (${totalDaysSelected} days)`}
        </div>
      )}

      {/* Usage Tips */}
      <div style={{
        marginTop: '8px',
        fontSize: '11px',
        color: '#64748b',
        fontStyle: 'italic'
      }}>
        💡 Click dates to select range • Navigate months with arrow buttons
      </div>
    </div>
  );
}