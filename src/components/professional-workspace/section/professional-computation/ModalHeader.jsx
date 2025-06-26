// ModalHeader.jsx - Modal Header Component

'use client'

import SkeletonLoader from './SkeletonLoader'

const ModalHeader = ({ 
  service,
  isSaving,
  savingProgress,
  optimisticUpdate,
  rollbackData,
  rollbackOptimisticUpdate,
  onClose,
  spacing,
  typography,
  colors
}) => {
  return (
    <div 
      className="d-flex justify-content-between align-items-center border-bottom"
      style={{
        padding: spacing.xl,
        borderBottomColor: colors.border.default,
        backgroundColor: colors.background.secondary
      }}
    >
      <div className="flex-grow-1">
        <h5 
          className="fw-bold mb-1"
          style={{
            fontSize: '20px',
            color: colors.text.primary
          }}
        >
          Configure Pricing: {service?.service?.name || <SkeletonLoader width="200px" height="20px" />}
        </h5>
        <p 
          className="mb-0"
          style={{
            fontSize: typography.secondaryText,
            color: colors.text.secondary
          }}
        >
          {service?.service?.portfolio?.name || <SkeletonLoader width="150px" height="14px" />} • {service?.service?.portfolio?.vertical?.name || <SkeletonLoader width="100px" height="14px" />}
        </p>
        
        {/* Enhanced Progress Bar During Save */}
        {isSaving && (
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span style={{ fontSize: typography.small, color: colors.text.muted }}>
                <i className="fas fa-save me-1"></i>
                Saving pricing configuration...
              </span>
              <span style={{ fontSize: typography.small, color: colors.text.muted }}>
                {Math.round(savingProgress)}%
              </span>
            </div>
            <div 
              className="progress"
              style={{ 
                height: '6px', 
                backgroundColor: colors.background.muted,
                borderRadius: '3px',
                overflow: 'hidden'
              }}
            >
              <div 
                className="progress-bar"
                style={{
                  width: `${savingProgress}%`,
                  backgroundColor: colors.interactive.primary,
                  transition: 'width 0.3s ease',
                  borderRadius: '3px'
                }}
              />
            </div>
            <div 
              className="mt-1"
              style={{
                fontSize: typography.micro,
                color: colors.text.muted,
                textAlign: 'center'
              }}
            >
              Please wait while we save your pricing configuration
            </div>
          </div>
        )}

        {/* Optimistic Update Indicator */}
        {optimisticUpdate && !isSaving && (
          <div 
            className="mt-2 p-2 border-start"
            style={{
              borderLeftColor: colors.interactive.warning,
              borderLeftWidth: '3px',
              backgroundColor: '#fffbeb'
            }}
          >
            <div 
              style={{
                fontSize: typography.small,
                color: '#92400e',
                fontWeight: '500'
              }}
            >
              <i className="fas fa-clock me-1"></i>
              Changes applied - waiting for server confirmation
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Close Button with Rollback Option */}
      <div className="d-flex gap-2">
        {optimisticUpdate && rollbackData && (
          <button
            className="btn p-2 transition-all duration-150 ease-in-out"
            style={{
              border: `1px solid ${colors.interactive.warning}`,
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              background: 'transparent',
              color: colors.interactive.warning
            }}
            onClick={rollbackOptimisticUpdate}
            title="Rollback changes"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.interactive.warning
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = colors.interactive.warning
            }}
          >
            <i className="fas fa-undo" style={{ fontSize: typography.secondaryText }}></i>
          </button>
        )}
        
        <button
          className="btn p-2 transition-all duration-150 ease-in-out"
          style={{
            border: `1px solid ${colors.border.default}`,
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            background: 'transparent',
            color: colors.text.secondary,
            opacity: isSaving ? 0.5 : 1
          }}
          onClick={() => !isSaving && onClose()}
          disabled={isSaving}
          title={isSaving ? 'Cannot close while saving' : 'Close modal'}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = colors.background.muted
              e.target.style.borderColor = colors.border.emphasis
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.borderColor = colors.border.default
            }
          }}
          aria-label="Close modal"
        >
          <i className="fas fa-times" style={{ fontSize: typography.secondaryText }}></i>
        </button>
      </div>
    </div>
  )
}

export default ModalHeader