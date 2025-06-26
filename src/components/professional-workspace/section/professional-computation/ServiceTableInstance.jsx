// ServiceTableInstance.jsx - Service Table Row Component

'use client'

import SkeletonLoader from './SkeletonLoader'

const ServiceTableInstance = ({ 
  service, 
  displayedUnit, 
  optimisticUpdate, 
  isSaving, 
  onConfigureClick,
  spacing,
  typography,
  colors
}) => {
  return (
    <>
      {/* Enhanced CSS with skeleton animation */}
      <style jsx>{`
        .service-row {
          border-bottom: 1px solid ${colors.border.subtle} !important;
          transition: background-color 0.1s ease-out;
        }
        .service-row:hover {
          background-color: ${colors.background.secondary} !important;
        }
        .service-row:last-child {
          border-bottom: none !important;
        }
        
        .optimistic-update {
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
      `}</style>

      {/* Table Row with optimistic update styling */}
      <tr 
        className={`border-0 service-row ${optimisticUpdate ? 'optimistic-update' : ''}`}
      >
        {/* Service Name Column */}
        <td className="border-0" style={{ padding: `${spacing.lg} ${spacing.lg}`, verticalAlign: 'middle' }}>
          <div className="d-flex align-items-center">
            <div>
              <div 
                className="fw-medium mb-1"
                style={{
                  fontSize: typography.primaryText,
                  lineHeight: '1.3',
                  color: colors.text.primary
                }}
              >
                {service?.service?.name || <SkeletonLoader width="140px" height="16px" />}
              </div>
              <div 
                style={{
                  fontSize: typography.secondaryText,
                  lineHeight: '1.2',
                  color: colors.text.secondary
                }}
              >
                {service?.service?.portfolio?.name || <SkeletonLoader width="100px" height="14px" />}
              </div>
            </div>
          </div>
        </td>

        {/* Category Column */}
        <td className="border-0 align-middle" style={{ padding: `${spacing.lg} ${spacing.md}` }}>
          {service?.service?.portfolio?.vertical?.name ? (
            <span 
              className="badge bg-transparent"
              style={{
                border: `1px solid ${colors.border.emphasis}`,
                borderRadius: '16px',
                padding: `${spacing.xs} ${spacing.md}`,
                fontSize: typography.caption,
                color: colors.text.secondary,
                fontWeight: '500'
              }}
            >
              {service.service.portfolio.vertical.name}
            </span>
          ) : (
            <SkeletonLoader width="80px" height="24px" />
          )}
        </td>
        
        {/* Duration Column */}
        <td className="border-0 align-middle" style={{ padding: `${spacing.lg} ${spacing.md}` }}>
          {service ? (
            <span style={{ fontSize: typography.secondaryText, color: colors.text.secondary }}>
              {(optimisticUpdate?.custom_duration_minutes || service?.custom_duration_minutes || service?.service?.duration_minutes || 0)}m
            </span>
          ) : (
            <SkeletonLoader width="40px" height="16px" />
          )}
        </td>
        
        {/* Price Column with enhanced loading */}
        <td className="border-0 align-middle" style={{ padding: `${spacing.lg} ${spacing.md}` }}>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column">
              {service ? (
                <>
                  <span 
                    className="fw-semibold"
                    style={{
                      fontSize: typography.primaryText,
                      color: colors.text.primary
                    }}
                  >
                    J${(optimisticUpdate?.custom_price || service?.custom_price || service?.service?.base_price || 0).toFixed(2)}
                  </span>
                  <span 
                    style={{
                      fontSize: typography.micro,
                      color: colors.text.muted,
                      lineHeight: '1.2'
                    }}
                  >
                    {displayedUnit?.display_name || 'flat rate'}
                  </span>
                </>
              ) : (
                <>
                  <SkeletonLoader width="60px" height="16px" />
                  <SkeletonLoader width="50px" height="12px" />
                </>
              )}
            </div>
            {(optimisticUpdate?.custom_price || service?.custom_price) && (
              <span 
                className="badge bg-transparent"
                style={{
                  border: `1px solid ${colors.interactive.success}`,
                  borderRadius: '12px',
                  padding: `2px ${spacing.sm}`,
                  fontSize: typography.micro,
                  color: colors.interactive.success,
                  fontWeight: '500'
                }}
              >
                Custom
              </span>
            )}
            
            {/* Show optimistic update indicator */}
            {optimisticUpdate && (
              <div 
                className="d-flex align-items-center"
                style={{
                  fontSize: typography.micro,
                  color: colors.interactive.warning
                }}
              >
                <div 
                  className="spinner-border spinner-border-sm me-1"
                  style={{ width: '12px', height: '12px' }}
                />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </td>
        
        {/* Action Column - Configure Button */}
        <td className="border-0 align-middle text-end" style={{ padding: `${spacing.lg} ${spacing.lg}` }}>
          <button
            className="btn transition-all duration-150 ease-in-out"
            style={{
              border: `1px solid ${colors.interactive.primary}`,
              borderRadius: '8px',
              background: 'transparent',
              color: colors.interactive.primary,
              padding: `${spacing.sm} ${spacing.lg}`,
              fontSize: typography.secondaryText,
              fontWeight: '500'
            }}
            onClick={onConfigureClick}
            disabled={isSaving}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = colors.interactive.primary
                e.target.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = colors.interactive.primary
              }
            }}
          >
            <i className="fas fa-cog me-2"></i>
            Configure
          </button>
        </td>
      </tr>
    </>
  )
}

export default ServiceTableInstance