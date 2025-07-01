// ============ 6. ChartTabs.jsx ============
export default function ChartTabs({ activeChart, setActiveChart }) {
  const tabs = [
    { key: 'daily', label: 'Day'},
    { key: 'hourly', label: 'Hour' },
    { key: 'weekly', label: 'Week' }
  ];

  return (
    <div className="d-flex mb20 p3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveChart(tab.key)}
          className="btn flex-fill mx-3"
          style={{
            backgroundColor: activeChart === tab.key ? '#000000' : '#ffffff',
            color: activeChart === tab.key ? '#ffffff' : '#64748b',
            border: `1px solid ${activeChart === tab.key ? '#000000' : '#64748b'}`,
            fontWeight: activeChart === tab.key ? '600' : '400',
            transition: 'all 0.3s ease'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}