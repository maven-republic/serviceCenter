// ConfigurationTab.jsx - Configuration Tab Component

'use client'

import UnitInformationGuide from './UnitInformationGuide'

const ConfigurationTab = ({ 
  config,
  marketConditions,
  availableUnits,
  service,
  loadingUnits,
  updateConfig,
  updateMarketConditions,
  isSaving,
  formStyles,
  spacing,
  typography,
  colors
}) => {
  // Get the currently selected unit for the guide
  const getSelectedUnit = () => {
    return availableUnits.find(u => u.unit_id === config.valuationUnitId) || 
           service?.custom_valuation_unit || 
           service?.service?.valuation_unit
  }

  const selectedUnit = getSelectedUnit()

  return (
    <div 
      className="border bg-white"
      style={{
        borderColor: colors.border.default,
        borderRadius: '12px',
        padding: spacing.xl
      }}
    >
      <div className="row g-4">
        {/* Valuation Unit Configuration */}
        <div className="col-lg-6">
          <label {...formStyles.label}>Valuation Unit</label>
          {loadingUnits ? (
            <div className="d-flex align-items-center" style={{ height: '38px' }}>
              <div className="spinner-border spinner-border-sm me-2" style={{width: '16px', height: '16px'}}></div>
              <span style={{ fontSize: typography.small, color: colors.text.muted }}>Loading units...</span>
            </div>
          ) : (
            <select
              {...formStyles.select}
              value={config.valuationUnitId || service?.custom_valuation_unit_id || service?.service?.valuation_unit_id || ''}
              onChange={(e) => {
                const selectedUnitId = e.target.value
                console.log('🔄 Unit changed:', {
                  from: config.valuationUnitId,
                  to: selectedUnitId,
                  selectedUnit: availableUnits.find(u => u.unit_id === selectedUnitId)
                })
                updateConfig({ valuationUnitId: selectedUnitId })
              }}
              disabled={isSaving}
              aria-label="Select valuation unit"
            >
              <option value="">Select Pricing Unit</option>
              {/* Group units by category */}
              {['fixed', 'time', 'area', 'count', 'volume', 'weight', 'service'].map(category => {
                const categoryUnits = availableUnits.filter(unit => unit.category === category && unit.is_active !== false)
                if (categoryUnits.length === 0) return null
                
                const categoryLabel = {
                  'fixed': 'Fixed Pricing',
                  'time': 'Time-Based',
                  'area': 'Area-Based', 
                  'count': 'Count-Based',
                  'volume': 'Volume-Based',
                  'weight': 'Weight-Based',
                  'service': 'Service-Based'
                }[category]
                
                return (
                  <optgroup key={category} label={categoryLabel}>
                    {categoryUnits.map(unit => (
                      <option key={unit.unit_id} value={unit.unit_id}>
                        {unit.display_name}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          )}
        </div>
        
        <div className="col-lg-6">
          <label {...formStyles.label}>Pricing Model</label>
          <select
            {...formStyles.select}
            value={config.pricingModel}
            onChange={(e) => updateConfig({ pricingModel: e.target.value })}
            disabled={isSaving}
            aria-label="Select pricing model"
          >
            <option value="auto">Auto-Select</option>
            <option value="quote">Standard Quote</option>
            <option value="black_scholes">Black-Scholes Model</option>
            <option value="monte_carlo">Monte Carlo Simulation</option>
          </select>
        </div>
        
        <div className="col-lg-6">
          <label {...formStyles.label}>Confidence Level</label>
          <select
            {...formStyles.select}
            value={config.confidenceLevel}
            onChange={(e) => updateConfig({ confidenceLevel: parseFloat(e.target.value) })}
            disabled={isSaving}
            aria-label="Select confidence level"
          >
            <option value="0.85">85% Confidence</option>
            <option value="0.90">90% Confidence</option>
            <option value="0.95">95% Confidence</option>
            <option value="0.99">99% Confidence</option>
          </select>
        </div>
        
        <div className="col-lg-6">
          <label {...formStyles.label}>Competition Level</label>
          <select
            {...formStyles.select}
            value={marketConditions.competitorDensity}
            onChange={(e) => updateMarketConditions({ competitorDensity: e.target.value })}
            disabled={isSaving}
            aria-label="Select competition level"
          >
            <option value="low">Low Competition</option>
            <option value="medium">Medium Competition</option>
            <option value="high">High Competition</option>
            <option value="very_high">Very High Competition</option>
          </select>
        </div>
        
        <div className="col-lg-6">
          <label {...formStyles.label}>Economic Climate</label>
          <select
            {...formStyles.select}
            value={marketConditions.economicIndicator}
            onChange={(e) => updateMarketConditions({ economicIndicator: e.target.value })}
            disabled={isSaving}
            aria-label="Select economic climate"
          >
            <option value="recession">Economic Recession</option>
            <option value="stable">Stable Economy</option>
            <option value="growth">Economic Growth</option>
            <option value="boom">Economic Boom</option>
          </select>
        </div>

        <div className="col-lg-6">
          <label {...formStyles.label}>Risk Tolerance</label>
          <select
            {...formStyles.select}
            value={config.riskTolerance || 'medium'}
            onChange={(e) => updateConfig({ riskTolerance: e.target.value })}
            disabled={isSaving}
            aria-label="Select risk tolerance"
          >
            <option value="conservative">Conservative</option>
            <option value="medium">Medium Risk</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        
        {/* Unit-specific configuration */}
        {(() => {
          const unitCode = selectedUnit?.unit_code
          
          if (unitCode === 'hour') {
            return (
              <div className="col-lg-6">
                <label {...formStyles.label}>Minimum Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  {...formStyles.input}
                  placeholder="e.g. 2"
                  value={config.minimumHours || ''}
                  onChange={(e) => updateConfig({ minimumHours: parseFloat(e.target.value) })}
                  disabled={isSaving}
                  aria-label="Enter minimum hours"
                />
              </div>
            )
          } else if (unitCode === 'square_foot' || unitCode === 'square_meter') {
            return (
              <div className="col-lg-6">
                <label {...formStyles.label}>Minimum Area</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  {...formStyles.input}
                  placeholder={unitCode === 'square_foot' ? 'e.g. 100 sq ft' : 'e.g. 10 sq m'}
                  value={config.minimumArea || ''}
                  onChange={(e) => updateConfig({ minimumArea: parseFloat(e.target.value) })}
                  disabled={isSaving}
                  aria-label="Enter minimum area"
                />
              </div>
            )
          } else if (unitCode === 'linear_foot' || unitCode === 'linear_meter') {
            return (
              <div className="col-lg-6">
                <label {...formStyles.label}>Minimum Length</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  {...formStyles.input}
                  placeholder={unitCode === 'linear_foot' ? 'e.g. 10 ft' : 'e.g. 3 m'}
                  value={config.minimumLength || ''}
                  onChange={(e) => updateConfig({ minimumLength: parseFloat(e.target.value) })}
                  disabled={isSaving}
                  aria-label="Enter minimum length"
                />
              </div>
            )
          } else if (unitCode === 'fixed') {
            return (
              <div className="col-lg-6">
                <label {...formStyles.label}>Service Call Fee</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...formStyles.input}
                  placeholder="e.g. 50.00"
                  value={config.serviceCallFee || ''}
                  onChange={(e) => updateConfig({ serviceCallFee: parseFloat(e.target.value) })}
                  disabled={isSaving}
                  aria-label="Enter service call fee"
                />
              </div>
            )
          }
          return null
        })()}

        {/* Advanced Settings */}
        <div className="col-12">
          <hr style={{ borderColor: colors.border.subtle, margin: `${spacing.lg} 0` }} />
          <h6 
            className="fw-semibold mb-3"
            style={{
              fontSize: typography.secondaryText,
              color: colors.text.primary
            }}
          >
            Advanced Settings
          </h6>
        </div>

        <div className="col-lg-6">
          <label {...formStyles.label}>Markup Strategy</label>
          <select
            {...formStyles.select}
            value={config.markupStrategy || 'standard'}
            onChange={(e) => updateConfig({ markupStrategy: e.target.value })}
            disabled={isSaving}
            aria-label="Select markup strategy"
          >
            <option value="cost_plus">Cost Plus</option>
            <option value="standard">Standard Markup</option>
            <option value="value_based">Value-Based</option>
            <option value="competitive">Competitive Pricing</option>
          </select>
        </div>

        <div className="col-lg-6">
          <label {...formStyles.label}>Price Rounding</label>
          <select
            {...formStyles.select}
            value={config.priceRounding || 'nearest_5'}
            onChange={(e) => updateConfig({ priceRounding: e.target.value })}
            disabled={isSaving}
            aria-label="Select price rounding"
          >
            <option value="exact">Exact Amount</option>
            <option value="nearest_5">Round to $5</option>
            <option value="nearest_10">Round to $10</option>
            <option value="nearest_25">Round to $25</option>
          </select>
        </div>
      </div>
      
      {/* Unit Information Helper */}
      <UnitInformationGuide 
        selectedUnit={selectedUnit}
        spacing={spacing}
        typography={typography}
        colors={colors}
      />
    </div>
  )
}

export default ConfigurationTab