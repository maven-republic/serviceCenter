// ============ 5. TodaysIncome.jsx ============
import React, { useEffect, useState } from 'react';

export default function TodaysIncome({ hideEarnings }) {
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Beta state - set to true when user has actual bookings
  const hasBookings = false; // This would come from your app state/API

  useEffect(() => {
    // Only run the earnings counter if we have bookings or showing preview
    if (hasBookings || showPreview) {
      const interval = setInterval(() => {
        setCurrentEarnings(prev => prev + Math.random() * 20);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [hasBookings, showPreview]);

  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••';
    return `$${amount.toFixed(2)}`;
  };

  // Beta Empty State
  if (!hasBookings && !showPreview) {
    return (
      <div className="row mb20">
        <div className="col-lg-8">
          <div 
            className="d-flex align-items-center justify-content-between p20" 
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
          >
            <div>
              <div className="fz15 mb-2" style={{ color: '#64748b' }}>Today's Earnings</div>
 </div>
            <div className="text-end">
              <div className="fz15" style={{ color: '#64748b' }}>Time Online</div>
              <div className="h4 mb-0" style={{ color: '#94a3b8' }}>
                <span style={{ fontSize: '28px', opacity: '0.6' }}>⏰</span>
              </div>
            </div>
          </div>
          
          {/* Preview Toggle */}
          <div className="text-center mt-3">
            <button 
              onClick={() => setShowPreview(true)}
              className="btn btn-outline-primary btn-sm"
              style={{ fontSize: '11px', padding: '4px 12px' }}
            >
              👁️ Preview earnings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Preview or Live Mode
  return (
    <div className="row mb20">
      <div className="col-lg-8">
        <div 
          className="d-flex align-items-center justify-content-between p20" 
          style={{
            background: showPreview 
              ? 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)' 
              : 'linear-gradient(135deg, #000000 0%, #374151 100%)', 
            borderRadius: '8px',
            opacity: showPreview ? 0.8 : 1
          }}
        >
          <div>
            <div className="fz15 text-white mb-2">
              {showPreview ? "Today's Earnings (Preview)" : "Today's Earnings"}
            </div>
            <div className="title text-white">
              {showPreview ? `Sample: ${formatEarnings(currentEarnings)}` : formatEarnings(currentEarnings)}
            </div>
            <div className="text fz14 text-white">
              {showPreview ? "Sample data +12%" : "+12% from yesterday"}
            </div>
          </div>
          <div className="text-end">
            <div className="fz15 text-white">Active Hours</div>
            <div className="h4 text-white mb-0">
              {showPreview ? "Demo" : "6.5h"}
            </div>
          </div>
        </div>
        
        {/* Show preview controls only in beta mode */}
        {!hasBookings && showPreview && (
          <div className="text-center mt-3">
            <div className="d-flex justify-content-center gap-2">
              <span 
                className="badge" 
                style={{ 
                  backgroundColor: '#fbbf24', 
                  color: '#92400e',
                  fontSize: '10px'
                }}
              >
                Preview Mode
              </span>
              <button 
                onClick={() => setShowPreview(false)}
                className="btn btn-outline-secondary btn-sm"
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                🙈 Hide preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}