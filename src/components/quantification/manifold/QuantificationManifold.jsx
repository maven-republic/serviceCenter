import React, { useState, useEffect } from 'react'
import { useQuantificationManifold } from '@/hook/useQuantificationManifold'

/**
 * QuantificationManifold Component
 * Professional interface for sophisticated service pricing calculations
 * Integrates Monte Carlo, Black-Scholes, and Quote pricing models
 */
const QuantificationManifold = ({ 
  initialService = null,
  mode = 'professional', // 'professional' | 'customer' | 'admin'
  onPriceUpdate = null,
  showComparison = true,
  allowModelSelection = true
}) => {
  // ==========================================
  // HOOK INTEGRATION
  // ==========================================
  
  const {
    service,
    setService,
    attributes,
    quantificationResult,
    isCalculating,
    error,
    config,
    marketConditions,
    updateAttribute,
    updateAttributes,
    updateConfig,
    updateMarketConditions,
    performCalculation,
    compareModels,
    formatPrice,
    getRecommendedPrice,
    getPriceRange,
    getModel,
    hasValidService,
    isReady
  } = useQuantificationManifold({
    initialService,
    autoCalculate: true,
    cacheResults: true,
    debugMode: mode === 'admin'
  })

  // ==========================================
  // LOCAL STATE
  // ==========================================
  
  const [activeTab, setActiveTab] = useState('inputs')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [modelComparison, setModelComparison] = useState(null)
  const [selectedAttributes, setSelectedAttributes] = useState({})
  
  // ==========================================
  // EFFECTS
  // ==========================================
  
  useEffect(() => {
    if (initialService) {
      setService(initialService)
    }
  }, [initialService, setService])
  
  useEffect(() => {
    if (quantificationResult && onPriceUpdate) {
      onPriceUpdate(quantificationResult)
    }
  }, [quantificationResult, onPriceUpdate])
  
  // ==========================================
  // TRADE-SPECIFIC ATTRIBUTE INPUTS
  // ==========================================
  
  const renderPlumbingInputs = () => (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label fw-semibold">Pipe Diameter</label>
        <select
          className="form-select"
          value={attributes.pipeDiameter || ''}
          onChange={(e) => updateAttribute('pipeDiameter', parseFloat(e.target.value))}
        >
          <option value="">Select diameter</option>
          <option value="0.5">1/2 inch</option>
          <option value="0.75">3/4 inch</option>
          <option value="1">1 inch</option>
          <option value="1.25">1 1/4 inch</option>
          <option value="1.5">1 1/2 inch</option>
          <option value="2">2 inch</option>
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Pipe Length (feet)</label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter length"
          value={attributes.pipeLength || ''}
          onChange={(e) => updateAttribute('pipeLength', parseFloat(e.target.value))}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Pipe Material</label>
        <select
          className="form-select"
          value={attributes.pipeMaterial || 'copper'}
          onChange={(e) => updateAttribute('pipeMaterial', e.target.value)}
        >
          <option value="copper">Copper</option>
          <option value="pvc">PVC</option>
          <option value="pex">PEX</option>
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Accessibility</label>
        <select
          className="form-select"
          value={attributes.accessibility || 'standard'}
          onChange={(e) => updateAttribute('accessibility', e.target.value)}
        >
          <option value="easy">Easy Access</option>
          <option value="standard">Standard</option>
          <option value="difficult">Difficult</option>
          <option value="crawlspace">Crawlspace</option>
          <option value="wallaccess">Behind Wall</option>
        </select>
      </div>
    </div>
  )
  
  const renderWeldingInputs = () => (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label fw-semibold">Metal Type</label>
        <select
          className="form-select"
          value={attributes.metalType || 'steel'}
          onChange={(e) => updateAttribute('metalType', e.target.value)}
        >
          <option value="steel">Steel</option>
          <option value="aluminum">Aluminum</option>
          <option value="stainless">Stainless Steel</option>
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Thickness (inches)</label>
        <input
          type="number"
          step="0.125"
          className="form-control"
          placeholder="Enter thickness"
          value={attributes.thickness || ''}
          onChange={(e) => updateAttribute('thickness', parseFloat(e.target.value))}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Joint Length (inches)</label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter length"
          value={attributes.jointLength || ''}
          onChange={(e) => updateAttribute('jointLength', parseFloat(e.target.value))}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Joint Type</label>
        <select
          className="form-select"
          value={attributes.jointType || 'butt'}
          onChange={(e) => updateAttribute('jointType', e.target.value)}
        >
          <option value="butt">Butt Joint</option>
          <option value="fillet">Fillet</option>
          <option value="groove">Groove</option>
          <option value="lap">Lap Joint</option>
          <option value="corner">Corner</option>
        </select>
      </div>
    </div>
  )
  
  const renderGenericInputs = () => (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label fw-semibold">Complexity Level</label>
        <select
          className="form-select"
          value={attributes.complexityLevel || 'standard'}
          onChange={(e) => updateAttribute('complexityLevel', e.target.value)}
        >
          <option value="simple">Simple</option>
          <option value="standard">Standard</option>
          <option value="complex">Complex</option>
          <option value="expert">Expert Level</option>
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Material Quantity</label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter quantity"
          value={attributes.materialQuantity || ''}
          onChange={(e) => updateAttribute('materialQuantity', parseFloat(e.target.value))}
        />
      </div>
    </div>
  )
  
  // ==========================================
  // RENDER ATTRIBUTE INPUTS
  // ==========================================
  
  const renderAttributeInputs = () => {
    const serviceName = service?.name?.toLowerCase() || ''
    const verticalName = service?.portfolio?.vertical?.name?.toLowerCase() || ''
    
    if (verticalName.includes('plumb') || serviceName.includes('plumb')) {
      return renderPlumbingInputs()
    } else if (verticalName.includes('weld') || serviceName.includes('weld')) {
      return renderWeldingInputs()
    }
    return renderGenericInputs()
  }
  
  // ==========================================
  // PRICING MODEL COMPARISON
  // ==========================================
  
  const handleCompareModels = async () => {
    const comparison = await compareModels()
    setModelComparison(comparison)
    setActiveTab('comparison')
  }
  
  // ==========================================
  // PRICE DISPLAY COMPONENT
  // ==========================================
  
  const PriceDisplay = () => {
    if (!quantificationResult) return null
    
    const price = getRecommendedPrice()
    const model = getModel()
    const range = getPriceRange()
    
    return (
      <div className="bg-primary bg-opacity-10 rounded-3 p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="d-flex align-items-baseline">
              <h2 className="text-primary fw-bold mb-0 me-3">
                {formatPrice(price)}
              </h2>
              <span className={`badge rounded-pill px-3 ${
                model === 'monte_carlo' ? 'bg-warning' :
                model === 'black_scholes' ? 'bg-info' : 'bg-success'
              }`}>
                {model.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            {range && (
              <p className="text-muted mb-0 mt-2">
                Range: {formatPrice(range.min)} - {formatPrice(range.max)}
                <small className="ms-2">({Math.round(range.confidence * 100)}% confidence)</small>
              </p>
            )}
          </div>
          <div className="col-md-6 text-md-end">
            <div className="d-flex flex-column">
              <small className="text-muted">Base Price: {formatPrice(service?.base_price || 0)}</small>
              <small className="text-muted">
                Adjustment: {price > service?.base_price ? '+' : ''}{formatPrice(price - (service?.base_price || 0))}
              </small>
              <small className="text-success fw-semibold">
                {((price / (service?.base_price || 1) - 1) * 100).toFixed(1)}% vs base
              </small>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // ==========================================
  // LOADING AND ERROR STATES
  // ==========================================
  
  if (!hasValidService) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-calculator fa-3x text-muted mb-3"></i>
        <h5 className="text-muted">No Service Selected</h5>
        <p className="text-muted">Please select a service to begin quantification.</p>
      </div>
    )
  }
  
  // ==========================================
  // MAIN RENDER
  // ==========================================
  
  return (
    <div className="quantification-manifold">
      {/* Service Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">{service?.name}</h4>
          <p className="text-muted mb-0">
            {service?.portfolio?.vertical?.name} • {service?.portfolio?.name}
          </p>
        </div>
        <div className="d-flex gap-2">
          {showComparison && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={handleCompareModels}
              disabled={isCalculating || !isReady}
            >
              <i className="fas fa-chart-line me-2"></i>
              Compare Models
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={performCalculation}
            disabled={isCalculating || !isReady}
          >
            {isCalculating ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Calculating...
              </>
            ) : (
              <>
                <i className="fas fa-calculator me-2"></i>
                Calculate
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {/* Price Display */}
      <PriceDisplay />
      
      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'inputs' ? 'active' : ''}`}
            onClick={() => setActiveTab('inputs')}
          >
            <i className="fas fa-sliders-h me-2"></i>
            Service Inputs
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <i className="fas fa-cog me-2"></i>
            Configuration
          </button>
        </li>
        {quantificationResult && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'breakdown' ? 'active' : ''}`}
              onClick={() => setActiveTab('breakdown')}
            >
              <i className="fas fa-chart-pie me-2"></i>
              Price Breakdown
            </button>
          </li>
        )}
        {modelComparison && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              <i className="fas fa-balance-scale me-2"></i>
              Model Comparison
            </button>
          </li>
        )}
      </ul>
      
      {/* Tab Content */}
      <div className="tab-content">
        {/* Service Inputs Tab */}
        {activeTab === 'inputs' && (
          <div className="card">
            <div className="card-body">
              <h6 className="card-title fw-semibold mb-3">
                <i className="fas fa-tools me-2 text-primary"></i>
                Service Parameters
              </h6>
              {renderAttributeInputs()}
              
              <hr className="my-4" />
              
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Urgency Level</label>
                  <select
                    className="form-select"
                    value={config.urgencyLevel}
                    onChange={(e) => updateConfig({ urgencyLevel: e.target.value })}
                  >
                    <option value="scheduled">Scheduled (-10%)</option>
                    <option value="standard">Standard</option>
                    <option value="urgent">Urgent (+50%)</option>
                    <option value="emergency">Emergency (+100%)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Market Demand</label>
                  <select
                    className="form-select"
                    value={marketConditions.marketDemand}
                    onChange={(e) => updateMarketConditions({ marketDemand: e.target.value })}
                  >
                    <option value="low">Low Demand</option>
                    <option value="normal">Normal</option>
                    <option value="high">High Demand</option>
                    <option value="peak">Peak Demand</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Time of Service</label>
                  <select
                    className="form-select"
                    value={marketConditions.timeOfDay}
                    onChange={(e) => updateMarketConditions({ timeOfDay: e.target.value })}
                  >
                    <option value="business">Business Hours</option>
                    <option value="evening">Evening</option>
                    <option value="weekend">Weekend</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Configuration Tab */}
        {activeTab === 'config' && allowModelSelection && (
          <div className="card">
            <div className="card-body">
              <h6 className="card-title fw-semibold mb-3">
                <i className="fas fa-brain me-2 text-primary"></i>
                Pricing Model Configuration
              </h6>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Pricing Model</label>
                  <select
                    className="form-select"
                    value={config.pricingModel}
                    onChange={(e) => updateConfig({ pricingModel: e.target.value })}
                  >
                    <option value="auto">Auto-Select (Recommended)</option>
                    <option value="quote">Quote Model (Fast & Simple)</option>
                    <option value="black_scholes">Black-Scholes (Predictable Services)</option>
                    <option value="monte_carlo">Monte Carlo (Complex/Uncertain)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Confidence Level</label>
                  <select
                    className="form-select"
                    value={config.confidenceLevel}
                    onChange={(e) => updateConfig({ confidenceLevel: parseFloat(e.target.value) })}
                  >
                    <option value="0.90">90% Confidence</option>
                    <option value="0.95">95% Confidence</option>
                    <option value="0.99">99% Confidence</option>
                  </select>
                </div>
              </div>
              
              {showAdvanced && (
                <div className="mt-4">
                  <hr />
                  <h6 className="fw-semibold mb-3">Advanced Settings</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Monte Carlo Simulations</label>
                      <select
                        className="form-select"
                        value={config.simulations}
                        onChange={(e) => updateConfig({ simulations: parseInt(e.target.value) })}
                      >
                        <option value="1000">1,000 (Fast)</option>
                        <option value="10000">10,000 (Recommended)</option>
                        <option value="50000">50,000 (High Precision)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Competition Density</label>
                      <select
                        className="form-select"
                        value={marketConditions.competitorDensity}
                        onChange={(e) => updateMarketConditions({ competitorDensity: e.target.value })}
                      >
                        <option value="low">Low Competition</option>
                        <option value="medium">Medium Competition</option>
                        <option value="high">High Competition</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'} me-2`}></i>
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Price Breakdown Tab */}
        {activeTab === 'breakdown' && quantificationResult && (
          <div className="card">
            <div className="card-body">
              <h6 className="card-title fw-semibold mb-3">
                <i className="fas fa-receipt me-2 text-primary"></i>
                Price Breakdown Analysis
              </h6>
              
              {/* Render breakdown based on model type */}
              {quantificationResult.model === 'quote' && quantificationResult.priceBreakdown && (
                <div className="row g-3">
                  {Object.entries(quantificationResult.priceBreakdown).map(([key, value]) => (
                    <div key={key} className="col-md-6 col-lg-4">
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <span className="text-capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="fw-semibold">{typeof value === 'number' ? formatPrice(value) : value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {quantificationResult.model === 'monte_carlo' && quantificationResult.statistics && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6>Risk Analysis</h6>
                    <p><strong>Risk Score:</strong> {(quantificationResult.statistics.riskScore * 100).toFixed(1)}%</p>
                    <p><strong>Volatility:</strong> {(quantificationResult.statistics.volatility * 100).toFixed(1)}%</p>
                    <p><strong>Standard Deviation:</strong> {formatPrice(quantificationResult.statistics.standardDeviation)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Price Statistics</h6>
                    <p><strong>Mean Price:</strong> {formatPrice(quantificationResult.statistics.mean)}</p>
                    <p><strong>Median Price:</strong> {formatPrice(quantificationResult.statistics.median)}</p>
                    <p><strong>Simulations:</strong> {quantificationResult.metadata?.simulations?.toLocaleString()}</p>
                  </div>
                </div>
              )}
              
              {quantificationResult.tradeCalculations && (
                <div className="mt-4">
                  <hr />
                  <h6>Trade-Specific Calculations</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <p><strong>Material Cost:</strong> {formatPrice(quantificationResult.tradeCalculations.materialCost || 0)}</p>
                      <p><strong>Labor Multiplier:</strong> {quantificationResult.tradeCalculations.laborMultiplier?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Estimated Duration:</strong> {quantificationResult.tradeCalculations.estimatedDuration || 0} minutes</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Model Comparison Tab */}
        {activeTab === 'comparison' && modelComparison && (
          <div className="card">
            <div className="card-body">
              <h6 className="card-title fw-semibold mb-3">
                <i className="fas fa-balance-scale me-2 text-primary"></i>
                Pricing Model Comparison
              </h6>
              
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <h6 className="text-warning">Monte Carlo</h6>
                    <div className="h4 fw-bold">{formatPrice(modelComparison.monteCarlo.price)}</div>
                    <small className="text-muted">High uncertainty scenarios</small>
                    {modelComparison.recommendation === 'monte_carlo' && (
                      <div className="badge bg-success mt-2">Recommended</div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <h6 className="text-info">Black-Scholes</h6>
                    <div className="h4 fw-bold">{formatPrice(modelComparison.blackScholes.price)}</div>
                    <small className="text-muted">Predictable timelines</small>
                    {modelComparison.recommendation === 'black_scholes' && (
                      <div className="badge bg-success mt-2">Recommended</div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <h6 className="text-success">Quote Model</h6>
                    <div className="h4 fw-bold">{formatPrice(modelComparison.quote.price)}</div>
                    <small className="text-muted">Standard services</small>
                    {modelComparison.recommendation === 'quote' && (
                      <div className="badge bg-success mt-2">Recommended</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuantificationManifold