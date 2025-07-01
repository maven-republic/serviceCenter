// ============ 8. ChartClickPopup.jsx ============
export default function ChartClickPopup({ selectedBarData, setSelectedBarData, hideEarnings }) {
  if (!selectedBarData) return null;

  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••';
    return `$${amount.toFixed(2)}`;
  };

  const getContextMessage = () => {
    const { type, value } = selectedBarData;
    
    if (type === 'daily') {
      return value > 600 ? '🔥 Great day!' : 
             value > 400 ? '👍 Good performance' : 
             '💡 Room for improvement';
    }
    
    if (type === 'hourly') {
      return value > 300 ? '⭐ Peak hour' : 
             value > 200 ? '📈 Good hour' : 
             '🔍 Low activity';
    }
    
    if (type === 'weekly') {
      return value > 3500 ? '🎯 Excellent week!' : 
             value > 3000 ? '✅ Solid week' : 
             '📊 Building momentum';
    }
    
    return '';
  };

  return (
    <div 
      className="position-absolute"
      style={{
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10,
        minWidth: '200px',
        animation: 'fadeIn 0.3s ease-in'
      }}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="fz12 text-white-50">
            {selectedBarData.type === 'daily' && 'Daily Earnings'}
            {selectedBarData.type === 'hourly' && 'Hourly Average'}
            {selectedBarData.type === 'weekly' && 'Weekly Total'}
          </div>
          <div className="fz16 fw-bold">{selectedBarData.label}</div>
          <div className="h5 mb-0">{formatEarnings(selectedBarData.value)}</div>
        </div>
        <button
          onClick={() => setSelectedBarData(null)}
          className="btn btn-sm p-0 text-white-50"
          style={{background: 'none', border: 'none', fontSize: '14px'}}
        >
          ✕
        </button>
      </div>
      
      <div className="mt-2 fz12 text-white-50">
        {getContextMessage()}
      </div>
    </div>
  );
}