// NotesTab.jsx - Notes Tab Component

'use client'

const NotesTab = ({ 
  notes,
  setNotes,
  service,
  displayedUnit,
  isSaving,
  formStyles,
  spacing,
  typography,
  colors
}) => {
  return (
    <div>
      <div className="mb-4">
        <label {...formStyles.label}>Pricing Notes & Comments</label>
        <textarea
          {...formStyles.input}
          rows="6"
          placeholder="Add any specific notes about this service pricing..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSaving}
          aria-label="Enter pricing notes"
          style={{
            ...formStyles.input.style,
            resize: 'vertical',
            minHeight: '120px'
          }}
        />
        <div 
          className="mt-2"
          style={{
            fontSize: typography.micro,
            color: colors.text.muted
          }}
        >
          <i className="fas fa-info-circle me-1"></i>
          These notes will be saved with your pricing configuration and can help you remember specific considerations for this service.
        </div>
      </div>
      
      {/* Enhanced Service Information Display */}
      <div 
        className="border bg-white"
        style={{
          borderColor: colors.border.default,
          borderRadius: '12px',
          padding: spacing.xl
        }}
      >
        <h6 
          className="fw-semibold mb-4"
          style={{
            fontSize: typography.primaryText,
            color: colors.text.primary
          }}
        >
          <i className="fas fa-info-circle me-2" style={{ color: colors.interactive.primary }}></i>
          Service Information
        </h6>
        
        <div className="row g-3" style={{ fontSize: typography.secondaryText }}>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center py-3">
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Quantified Price:</span>
              <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                {service?.service?.quant?.base_price_mean 
                  ? `J${service.service.quant.base_price_mean.toFixed(2)}` 
                  : (
                    <span style={{ color: colors.text.muted, fontStyle: 'italic' }}>
                      Not Available
                    </span>
                  )}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center py-3">
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Base Price:</span>
              <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                {service?.service?.base_price 
                  ? `J${service.service.base_price.toFixed(2)}` 
                  : (
                    <span style={{ color: colors.text.muted, fontStyle: 'italic' }}>
                      Not Set
                    </span>
                  )}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center py-3">
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Duration:</span>
              <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                {service?.custom_duration_minutes || service?.service?.duration_minutes || 0} minutes
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center py-3">
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Custom Price:</span>
              <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                {service?.custom_price ? (
                  <span style={{ color: colors.interactive.success }}>
                    J${service.custom_price.toFixed(2)}
                  </span>
                ) : (
                  <span style={{ color: colors.text.muted, fontStyle: 'italic' }}>
                    None Set
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center py-3">
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Current Unit:</span>
              <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                {displayedUnit?.display_name || 'Flat Rate'}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center py-3">
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Unit Type:</span>
              <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                {displayedUnit?.category?.charAt(0).toUpperCase() + displayedUnit?.category?.slice(1) || 'Fixed'}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center py-3">
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Service ID:</span>
              <span style={{ color: colors.text.muted, fontFamily: 'monospace', fontSize: typography.micro }}>
                {service?.service_id || 'N/A'}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center py-3">
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Professional Service ID:</span>
              <span style={{ color: colors.text.muted, fontFamily: 'monospace', fontSize: typography.micro }}>
                {service?.professional_service_id || 'N/A'}
              </span>
            </div>
          </div>
          <div className="col-12">
            <div 
              className="d-flex justify-content-between align-items-center py-3 border-top" 
              style={{ borderTopColor: colors.border.subtle }}
            >
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Service Category:</span>
              <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                {service?.service?.portfolio?.vertical?.name || 'General'}
              </span>
            </div>
          </div>
          
          {/* Portfolio Information */}
          {service?.service?.portfolio && (
            <div className="col-12">
              <div 
                className="d-flex justify-content-between align-items-center py-3 border-top" 
                style={{ borderTopColor: colors.border.subtle }}
              >
                <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Portfolio:</span>
                <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                  {service.service.portfolio.name}
                </span>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="col-12">
            <div 
              className="d-flex justify-content-between align-items-center py-3 border-top" 
              style={{ borderTopColor: colors.border.subtle }}
            >
              <span style={{ color: colors.text.secondary, fontWeight: '500' }}>Last Updated:</span>
              <span style={{ color: colors.text.muted, fontSize: typography.small }}>
                {service?.updated_at ? new Date(service.updated_at).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="mt-4 p-3 border-top"
          style={{ borderTopColor: colors.border.subtle }}
        >
          <div 
            className="fw-medium mb-2"
            style={{
              fontSize: typography.caption,
              color: colors.text.primary
            }}
          >
            Quick Actions
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm"
              style={{
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                background: 'transparent',
                color: colors.text.secondary,
                fontSize: typography.small,
                padding: `4px 12px`
              }}
              onClick={() => setNotes(notes + '\n• ')}
              disabled={isSaving}
            >
              <i className="fas fa-list me-1"></i>
              Add Bullet
            </button>
            <button
              className="btn btn-sm"
              style={{
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                background: 'transparent',
                color: colors.text.secondary,
                fontSize: typography.small,
                padding: `4px 12px`
              }}
              onClick={() => setNotes(notes + `\nLast updated: ${new Date().toLocaleDateString()}\n`)}
              disabled={isSaving}
            >
              <i className="fas fa-calendar me-1"></i>
              Add Date
            </button>
            <button
              className="btn btn-sm"
              style={{
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                background: 'transparent',
                color: colors.text.secondary,
                fontSize: typography.small,
                padding: `4px 12px`
              }}
              onClick={() => setNotes('')}
              disabled={isSaving}
            >
              <i className="fas fa-eraser me-1"></i>
              Clear Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotesTab