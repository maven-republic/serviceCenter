// ModalFooter.jsx - Modal Footer Component

'use client'

const ModalFooter = ({ 
  saveMessage,
  isSaving,
  savingProgress,
  rollbackData,
  rollbackOptimisticUpdate,
  quantificationResult,
  onSave,
  onCancel,
  spacing,
  typography,
  colors
}) => {
  return (
    <div 
      className="d-flex justify-content-between align-items-center border-top"
      style={{
        padding: spacing.xl,
        borderTopColor: colors.border.default,
        backgroundColor: colors.background.secondary
      }}
    >
      <div className="flex-grow-1">
        {saveMessage && (
          <div 
            className={`d-flex align-items-center ${saveMessage.includes('Error') ? 'text-danger' : 'text-success'}`}
            style={{ fontSize: typography.secondaryText, fontWeight: '500' }}
          >
            <i className={`fas ${saveMessage.includes('Error') ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
            {saveMessage}
            
            {/* Enhanced Rollback Button for Errors */}
            {saveMessage.includes('Error') && rollbackData && (
              <button
                className="btn btn-sm ms-3"
                style={{
                  border: `1px solid ${colors.interactive.warning}`,
                  borderRadius: '6px',
                  background: 'transparent',
                  color: colors.interactive.warning,
                  padding: `4px 12px`,
                  fontSize: typography.small
                }}
                onClick={rollbackOptimisticUpdate}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.interactive.warning
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = colors.interactive.warning
                }}
              >
                <i className="fas fa-undo me-1" style={{ fontSize: typography.micro }}></i>
                Rollback
              </button>
            )}
          </div>
        )}
        
        {/* Enhanced Progress Indicator in Footer */}
        {isSaving && (
          <div className="mt-2">
            <div className="d-flex align-items-center gap-2">
              <div 
                className="spinner-border spinner-border-sm" 
                style={{ width: '16px', height: '16px' }}
              ></div>
              <span style={{ fontSize: typography.small, color: colors.text.muted }}>
                Saving pricing configuration... {Math.round(savingProgress)}%
              </span>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {!quantificationResult && !isSaving && (
          <div 
            className="d-flex align-items-center"
            style={{ 
              fontSize: typography.small, 
              color: colors.text.muted,
              fontStyle: 'italic'
            }}
          >
            <i className="fas fa-info-circle me-1"></i>
            Calculate pricing first to enable save functionality
          </div>
        )}
      </div>
      
      <div className="d-flex gap-3">
        <button
          className="btn transition-all duration-150 ease-in-out"
          style={{
            border: `1px solid ${colors.border.emphasis}`,
            borderRadius: '8px',
            background: 'transparent',
            color: colors.text.secondary,
            padding: `${spacing.md} ${spacing.xl}`,
            fontSize: typography.secondaryText,
            fontWeight: '500',
            opacity: isSaving ? 0.6 : 1
          }}
          onClick={() => !isSaving && onCancel()}
          disabled={isSaving}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = colors.background.muted
              e.target.style.borderColor = colors.border.emphasis
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.borderColor = colors.border.emphasis
            }
          }}
        >
          <i className="fas fa-times me-2"></i>
          Cancel
        </button>
        
        <button
          className="btn transition-all duration-150 ease-in-out"
          style={{
            border: `1px solid ${colors.interactive.primary}`,
            borderRadius: '8px',
            background: colors.interactive.primary,
            color: 'white',
            padding: `${spacing.md} ${spacing.xl}`,
            fontSize: typography.secondaryText,
            fontWeight: '500',
            opacity: (isSaving || !quantificationResult) ? 0.6 : 1,
            position: 'relative'
          }}
          onClick={onSave}
          disabled={isSaving || !quantificationResult}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = colors.interactive.hover
              e.target.style.borderColor = colors.interactive.hover
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = colors.interactive.primary
              e.target.style.borderColor = colors.interactive.primary
            }
          }}
        >
          {isSaving ? (
            <>
              <div 
                className="spinner-border spinner-border-sm me-2" 
                style={{width: '16px', height: '16px'}}
              ></div>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>
              Save Pricing
            </>
          )}
          
          {/* Success Indicator */}
          {saveMessage && saveMessage.includes('successfully') && (
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                backgroundColor: colors.interactive.success,
                borderRadius: '50%',
                border: `2px solid ${colors.background.primary}`
              }}
            />
          )}
        </button>
      </div>
    </div>
  )
}

export default ModalFooter