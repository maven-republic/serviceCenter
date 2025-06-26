// PricingResultDisplay.jsx - Pricing Results Display Component

'use client'

import SkeletonLoader from './SkeletonLoader'

const PricingResultDisplay = ({ 
  quantificationResult,
  isCalculating,
  quantError,
  service,
  displayedUnit,
  formatPrice,
  getRecommendedPrice,
  getPriceChange,
  spacing,
  typography,
  colors
}) => {
  // Show skeleton loading during calculation
  if (isCalculating) {
    return (
      <div className="mb-4">
        <div 
          className="border bg-white"
          style={{
            borderWidth: '1px',
            borderColor: colors.border.default,
            borderRadius: '12px',
            padding: spacing.xl
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="spinner-border" style={{ width: '40px', height: '40px' }}></div>
            <div>
              <SkeletonLoader width="200px" height="32px" />
              <div className="mt-2">
                <SkeletonLoader width="150px" height="16px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (quantError) {
    return (
      <div className="mb-4">
        <div 
          className="border border-danger p-3"
          style={{
            borderLeftWidth: '4px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2'
          }}
        >
          <div style={{ fontSize: typography.secondaryText, color: '#dc2626' }}>
            {quantError}
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if no results
  if (!quantificationResult) {
    return null
  }

  return (
    <div className="mb-4">
      <div 
        className="border bg-white"
        style={{
          borderWidth: '1px',
          borderColor: colors.border.default,
          borderRadius: '12px',
          padding: spacing.xl
        }}
      >
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-4">
              <div>
                <div 
                  className="fw-bold mb-2"
                  style={{
                    fontSize: '32px',
                    color: colors.text.primary
                  }}
                >
                  {formatPrice(getRecommendedPrice())}
                  <span 
                    style={{
                      fontSize: typography.secondaryText,
                      color: colors.text.muted,
                      fontWeight: '400',
                      marginLeft: spacing.sm
                    }}
                  >
                    {displayedUnit?.display_name || 'flat rate'}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span 
                    className={`badge bg-transparent fw-medium ${
                      quantificationResult.model === 'monte_carlo' ? 'border-warning text-warning' :
                      quantificationResult.model === 'black_scholes' ? 'border-primary text-primary' : 'border-success text-success'
                    }`}
                    style={{
                      padding: `${spacing.xs} ${spacing.md}`,
                      fontSize: typography.caption,
                      borderRadius: '8px'
                    }}
                  >
                    {quantificationResult.model?.replace('_', '-').toUpperCase()}
                  </span>
                  {Math.abs(getPriceChange()) > 0.1 && (
                    <span 
                      className="badge bg-transparent border fw-medium"
                      style={{
                        borderColor: colors.border.emphasis,
                        color: colors.text.secondary,
                        padding: `${spacing.xs} ${spacing.md}`,
                        fontSize: typography.caption,
                        borderRadius: '8px'
                      }}
                    >
                      {getPriceChange() > 0 ? '+' : ''}{getPriceChange().toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="d-flex gap-3">
                <div 
                  className="border text-center"
                  style={{
                    borderColor: colors.border.default,
                    borderRadius: '8px',
                    padding: spacing.lg,
                    minWidth: '100px',
                    backgroundColor: colors.background.primary
                  }}
                >
                  <div style={{ fontSize: typography.caption, color: colors.text.muted }}>Base Price</div>
                  <div style={{ fontSize: typography.primaryText, color: colors.text.primary, fontWeight: '600' }}>
                    J${(service?.service?.base_price || 0).toFixed(2)}
                  </div>
                </div>
                <div 
                  className="border text-center"
                  style={{
                    borderColor: colors.border.default,
                    borderRadius: '8px',
                    padding: spacing.lg,
                    minWidth: '100px',
                    backgroundColor: colors.background.primary
                  }}
                >
                  <div style={{ fontSize: typography.caption, color: colors.text.muted }}>Price Change</div>
                  <div style={{ fontSize: typography.primaryText, color: colors.text.primary, fontWeight: '600' }}>
                    {getRecommendedPrice() > (service?.service?.base_price || 0) ? '+' : ''}
                    J${(getRecommendedPrice() - (service?.service?.base_price || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingResultDisplay