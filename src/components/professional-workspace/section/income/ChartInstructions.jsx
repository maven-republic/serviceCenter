export default function ChartInstructions({ activeChart }) {
  const getTimeUnit = () => {
    switch (activeChart) {
      case 'daily': return 'day';
      case 'hourly': return 'hour';
      case 'weekly': return 'week';
      case 'monthly': return 'month';
      default: return 'period';
    }
  };
return (
    <div className="mt20 p15" style={{backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0'}}>
      <div className="fz12 text-muted">
        💡 <strong>Tip:</strong> Click on any bar in the chart to see detailed earnings for that specific {getTimeUnit()}.
      </div>
    </div>
  );
}