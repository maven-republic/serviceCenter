// ParametersTab.jsx - Parameters Tab Component

'use client'

import TradeInputs from './TradeInputs'

const ParametersTab = ({ 
  serviceCategory,
  attributes,
  updateAttribute,
  config,
  marketConditions,
  updateConfig,
  updateMarketConditions,
  performCalculation,
  isCalculating,
  hasValidService,
  isSaving,
  formStyles,
  spacing,
  typography,
  colors
}) => {
  return (
    <div>
      <div className="mb-4">
        <h6 
          className="fw-semibold mb-3"
          style={{
            fontSize: typography.primaryText,
            color: colors.text.primary
          }}
        >
          Service Parameters
        </h6>
        <div 
          className="border bg-white"
          style={{
            borderColor: colors.border.default,
            borderRadius: '12px',
            padding: spacing.xl
          }}
        >
          <TradeInputs 
            serviceCategory={serviceCategory}
            attributes={attributes}
            updateAttribute={updateAttribute}
            formStyles={formStyles}
          />
        </div>
      </div>

      <div className="mb-4">
        <h6 
          className="fw-semibold mb-3"
          style={{
            fontSize: typography.primaryText,
            color: colors.text.primary
          }}
        >
          Market Conditions
        </h6>
        <div 
          className="border bg-white"
          style={{
            borderColor: colors.border.default,
            borderRadius: '12px',
            padding: spacing.xl
          }}
        >
          <div className="row g-4">
            <div className="col-lg-4">
              <label {...formStyles.label}>Urgency Level</label>
              <select
                {...formStyles.select}
                value={config.urgencyLevel}
                onChange={(e) => updateConfig({ urgencyLevel: e.target.value })}
                disabled={isSaving}
                aria-label="Select urgency level"
              >
                <option value="scheduled">Scheduled</option>
                <option value="standard">Standard</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="col-lg-4">
              <label {...formStyles.label}>Market Demand</label>
              <select
                {...formStyles.select}
                value={marketConditions.marketDemand}
                onChange={(e) => updateMarketConditions({ marketDemand: e.target.value })}
                disabled={isSaving}
                aria-label="Select market demand level"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="peak">Peak</option>
              </select>
            </div>
            <div className="col-lg-4">
              <label {...formStyles.label}>Time of Service</label>
              <select
                {...formStyles.select}
                value={marketConditions.timeOfDay}
                onChange={(e) => updateMarketConditions({ timeOfDay: e.target.value })}
                disabled={isSaving}
                aria-label="Select time of service"
              >
                <option value="business">Business Hours</option>
                <option value="evening">Evening</option>
                <option value="weekend">Weekend</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
            <div className="col-lg-4">
              <label {...formStyles.label}>Season</label>
              <select
                {...formStyles.select}
                value={marketConditions.season || 'normal'}
                onChange={(e) => updateMarketConditions({ season: e.target.value })}
                disabled={isSaving}
                aria-label="Select season"
              >
                <option value="normal">Normal Season</option>
                <option value="peak">Peak Season</option>
                <option value="off">Off Season</option>
                <option value="holiday">Holiday Season</option>
              </select>
            </div>
            <div className="col-lg-4">
              <label {...formStyles.label}>Weather Impact</label>
              <select
                {...formStyles.select}
                value={marketConditions.weather || 'normal'}
                onChange={(e) => updateMarketConditions({ weather: e.target.value })}
                disabled={isSaving}
                aria-label="Select weather impact"
              >
                <option value="normal">Normal Conditions</option>
                <option value="adverse">Adverse Weather</option>
                <option value="extreme">Extreme Conditions</option>
                <option value="favorable">Favorable Weather</option>
              </select>
            </div>
            <div className="col-lg-4">
              <label {...formStyles.label}>Customer Type</label>
              <select
                {...formStyles.select}
                value={marketConditions.customerType || 'residential'}
                onChange={(e) => updateMarketConditions({ customerType: e.target.value })}
                disabled={isSaving}
                aria-label="Select customer type"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="emergency">Emergency Service</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          className="btn fw-medium transition-all duration-150 ease-in-out"
          style={{
            border: `1px solid ${colors.text.primary}`,
            borderRadius: '8px',
            background: 'transparent',
            color: colors.text.primary,
            padding: `${spacing.lg} ${spacing.xxl}`,
            fontSize: typography.primaryText,
            opacity: (isCalculating || !hasValidService || isSaving) ? 0.6 : 1
          }}
          onClick={() => {
            console.log('🔍 Calculate button clicked. Service state:', {
              hasValidService,
              serviceCategory,
              attributes
            })
            performCalculation()
          }}
          disabled={isCalculating || !hasValidService || isSaving}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = colors.text.primary
              e.target.style.color = 'white'
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = colors.text.primary
            }
          }}
        >
          {isCalculating ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" style={{width: '20px', height: '20px'}}></div>
              Calculating...
            </>
          ) : (
            <>
              <i className="fas fa-calculator me-2"></i>
              Calculate Pricing
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ParametersTab