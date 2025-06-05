// src/components/professional-workspace/section/professional-computation/ServiceCard.jsx
// PURE OPTION 1 IMPLEMENTATION - STAGE 2
'use client'

export default function ServiceCard({ service, onClick, variant = 'default' }) {
  // Get effective price with hierarchy
  const getEffectivePrice = () => {
    return service?.custom_price ||
           service?.service?.quant?.base_price_mean ||
           service?.service?.base_price ||
           50
  }

  const getCurrentPrice = () => getEffectivePrice()
  const hasCustomPricing = Boolean(service?.custom_price)
  const hasQuantPricing = Boolean(service?.service?.quant?.base_price_mean)

  // Determine price status with more detailed info
  const getPriceStatus = () => {
    if (hasCustomPricing) {
      return { 
        type: 'custom', 
        label: 'Custom', 
        color: 'success',
        icon: 'user-cog',
        description: 'Custom pricing configured'
      }
    }
    if (hasQuantPricing) {
      return { 
        type: 'quant', 
        label: 'Calculated', 
        color: 'info',
        icon: 'calculator',
        description: 'AI-calculated pricing'
      }
    }
    return { 
      type: 'base', 
      label: 'Base', 
      color: 'secondary',
      icon: 'tag',
      description: 'Default base pricing'
    }
  }

  // Calculate price comparison
  const getPriceComparison = () => {
    const currentPrice = getCurrentPrice()
    const basePrice = service?.service?.base_price || 0
    
    if (basePrice === 0 || currentPrice === basePrice) return null
    
    const difference = currentPrice - basePrice
    const percentChange = (difference / basePrice) * 100
    
    return {
      difference,
      percentChange,
      isIncrease: difference > 0
    }
  }

  const priceStatus = getPriceStatus()
  const priceComparison = getPriceComparison()

  // Get urgency indicator based on last updated
  const getUrgencyIndicator = () => {
    if (!service?.updated_at) return null
    
    const lastUpdated = new Date(service.updated_at)
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUpdate > 30) {
      return { type: 'warning', message: 'Pricing needs review', icon: 'clock' }
    }
    if (daysSinceUpdate > 7) {
      return { type: 'info', message: 'Consider updating', icon: 'info-circle' }
    }
    return null
  }

  const urgencyIndicator = getUrgencyIndicator()

  return (
    <>
      <div 
        className={`service-card border bg-white position-relative ${variant === 'compact' ? 'p-2' : 'p-3'} h-100`}
        style={{ 
          borderRadius: '16px', 
          cursor: 'pointer', 
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: variant === 'compact' ? '120px' : '160px'
        }}
        onClick={onClick}
      >
        {/* Urgency Indicator */}
        {urgencyIndicator && (
          <div className={`position-absolute top-0 end-0 mt-2 me-2 badge bg-${urgencyIndicator.type} bg-opacity-10 text-${urgencyIndicator.type} rounded-pill px-2 py-1`}>
            <i className={`fas fa-${urgencyIndicator.icon} me-1`}></i>
            <small>{urgencyIndicator.message}</small>
          </div>
        )}

        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1 me-2">
            <h6 className={`text-gray-900 mb-1 fw-semibold line-clamp-2 ${variant === 'compact' ? 'small' : ''}`}>
              {service?.service?.name || 'Unnamed Service'}
            </h6>
            <div className={`text-gray-500 ${variant === 'compact' ? 'small' : ''}`}>
              {service?.service?.portfolio?.name || 'No Portfolio'}
            </div>
          </div>
          
          {/* Status Icon */}
          <div className={`text-${priceStatus.color} fs-5`} title={priceStatus.description}>
            <i className={`fas fa-${priceStatus.icon}`}></i>
          </div>
        </div>

        {/* Vertical & Portfolio Tags */}
        <div className="mb-3">
          <div className="d-flex flex-wrap gap-1">
            <span className="badge border text-gray-600 bg-light px-2 py-1 small rounded-pill">
              {service?.service?.portfolio?.vertical?.name || 'General'}
            </span>
            {service?.service?.service_type && (
              <span className="badge border text-gray-500 bg-white px-2 py-1 small rounded-pill">
                {service.service.service_type}
              </span>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-end mb-2">
            <div className="flex-grow-1">
              <div className="d-flex align-items-baseline gap-2">
                <div className={`${variant === 'compact' ? 'h6' : 'h5'} text-gray-900 mb-0 fw-bold`}>
                  J${getCurrentPrice().toFixed(2)}
                </div>
                {priceComparison && (
                  <div className={`small ${priceComparison.isIncrease ? 'text-success' : 'text-danger'}`}>
                    {priceComparison.isIncrease ? '+' : ''}
                    {priceComparison.percentChange.toFixed(1)}%
                  </div>
                )}
              </div>
              
              {/* Additional Price Info */}
              <div className="d-flex justify-content-between align-items-center">
                <div className="small text-gray-500">
                  {service?.service?.duration_minutes || 0} min
                  {service?.service?.base_price && service?.service?.base_price !== getCurrentPrice() && (
                    <span className="ms-2 text-decoration-line-through">
                      J${service.service.base_price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* Status Badge */}
                <span className={`badge border bg-transparent px-2 py-1 small rounded-pill 
                  ${priceStatus.color === 'success' ? 'border-success text-success' :
                    priceStatus.color === 'info' ? 'border-info text-info' : 
                    'border-secondary text-secondary'}`}>
                  {priceStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          {variant !== 'compact' && (
            <div className="border-top pt-2 mt-2">
              <div className="row g-2 text-center">
                <div className="col-4">
                  <div className="small text-gray-500">Base</div>
                  <div className="small fw-semibold text-gray-700">
                    J${(service?.service?.base_price || 0).toFixed(0)}
                  </div>
                </div>
                <div className="col-4">
                  <div className="small text-gray-500">Model</div>
                  <div className="small fw-semibold text-gray-700">
                    {service?.service?.pricing_model || 'Quote'}
                  </div>
                </div>
                <div className="col-4">
                  <div className="small text-gray-500">Updated</div>
                  <div className="small fw-semibold text-gray-700">
                    {service?.updated_at 
                      ? new Date(service.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Never'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hover Overlay with Enhanced Actions */}
        <div className="hover-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="overlay-content text-center">
            <div className="text-white bg-dark bg-opacity-90 rounded-4 p-3 shadow-lg">
              <div className="mb-2">
                <i className="fas fa-cog fa-lg mb-2"></i>
                <div className="fw-semibold">Configure Pricing</div>
              </div>
              <div className="d-flex gap-2 justify-content-center">
                <div className="small opacity-75">
                  <i className="fas fa-calculator me-1"></i>
                  Calculate
                </div>
                <div className="small opacity-75">
                  <i className="fas fa-chart-line me-1"></i>
                  Optimize
                </div>
                <div className="small opacity-75">
                  <i className="fas fa-save me-1"></i>
                  Save
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Ring (Optional) */}
        {service?.performance_score && variant !== 'compact' && (
          <div className="position-absolute top-0 start-0 mt-2 ms-2">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center small fw-bold text-white"
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: service.performance_score >= 80 ? '#10b981' : 
                                service.performance_score >= 60 ? '#f59e0b' : '#ef4444'
              }}
            >
              {service.performance_score}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        .service-card {
          border: 1px solid #e5e7eb !important;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .service-card:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
          transform: translateY(-4px);
        }

        .service-card:active {
          transform: translateY(-2px);
          transition: all 0.1s ease;
        }

        .hover-overlay {
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 16px;
          backdrop-filter: blur(4px);
        }

        .service-card:hover .hover-overlay {
          opacity: 1;
        }

        .overlay-content {
          transform: scale(0.9);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .service-card:hover .overlay-content {
          transform: scale(1);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          max-height: 2.8em;
        }

        .text-gray-900 { color: #111827; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        
        .border-success { border-color: #10b981 !important; }
        .text-success { color: #10b981; }
        .border-info { border-color: #3b82f6 !important; }
        .text-info { color: #3b82f6; }
        .border-secondary { border-color: #6b7280 !important; }
        .text-secondary { color: #6b7280; }

        /* Micro-interactions */
        .badge {
          transition: all 0.2s ease;
        }

        .service-card:hover .badge {
          transform: scale(1.05);
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .service-card {
            min-height: 140px !important;
          }
          
          .hover-overlay {
            opacity: 1;
            background: rgba(0, 0, 0, 0.1);
          }
          
          .overlay-content {
            display: none;
          }
        }
      `}</style>
    </>
  )
}