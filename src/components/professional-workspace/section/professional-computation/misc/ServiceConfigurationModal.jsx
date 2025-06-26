// src/components/professional-workspace/section/professional-computation/ServiceConfigurationModal.jsx
// PURE OPTION 1 IMPLEMENTATION - STAGE 3
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuantificationManifold } from '@/hook/useQuantificationManifold'

export default function ServiceConfigurationModal({ 
  service, 
  isOpen, 
  onClose, 
  onUpdate, 
  professionalId 
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState('parameters')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [calculationHistory, setCalculationHistory] = useState([])
  const [presetName, setPresetName] = useState('')
  const [showPresetSave, setShowPresetSave] = useState(false)

  // Initialize quantification hook
  const {
    setService,
    attributes,
    quantificationResult,
    isCalculating,
    error: quantError,
    config,
    marketConditions,
    updateAttribute,
    updateConfig,
    updateMarketConditions,
    performCalculation,
    formatPrice,
    getRecommendedPrice,
    hasValidService,
    isReady
  } = useQuantificationManifold({
    initialService: service?.service,
    autoCalculate: false,
    cacheResults: true
  })

  // Reset state when modal opens/closes or service changes
  useEffect(() => {
    if (isOpen && service?.service) {
      const effectivePrice = service?.service?.quant?.base_price_mean ||
                            service?.service?.base_price ||
                            service?.effective_base_price ||
                            50

      const serviceWithPrice = {
        ...service.service,
        base_price: effectivePrice
      }

      setService(serviceWithPrice)
      setNotes(service?.additional_notes || '')
      setSaveMessage('')
      setActiveTab('parameters')
      setHasUnsavedChanges(false)
      setCalculationHistory([])
      setShowPresetSave(false)
    }
  }, [isOpen, service, setService])

  // Track changes for unsaved indicator
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [attributes, config, marketConditions, notes])

  // Add calculation to history
  const addToHistory = useCallback((result) => {
    if (!result) return
    
    const historyItem = {
      id: Date.now(),
      timestamp: new Date(),
      result,
      config: { ...config },
      marketConditions: { ...marketConditions },
      attributes: { ...attributes }
    }
    
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 4)]) // Keep last 5
  }, [config, marketConditions, attributes])

  // Enhanced calculation with history
  const handleCalculation = useCallback(() => {
    performCalculation().then(result => {
      if (result) {
        addToHistory(result)
      }
    })
  }, [performCalculation, addToHistory])

  if (!isOpen || !service) return null

  // Get service category for trade-specific inputs
  const getServiceCategory = () => {
    const serviceName = service?.service?.name?.toLowerCase() || ''
    const verticalName = service?.service?.portfolio?.vertical?.name?.toLowerCase() || ''
    
    if (verticalName.includes('plumb') || serviceName.includes('plumb')) return 'plumbing'
    if (verticalName.includes('weld') || serviceName.includes('weld')) return 'welding'
    if (verticalName.includes('electr') || serviceName.includes('electr')) return 'electrical'
    return 'general'
  }

  // Enhanced input renderer with better UX
  const renderTradeInputs = () => {
    const category = getServiceCategory()
    const inputClass = "form-control bg-light border-0 py-3 px-3 rounded-3"
    const selectClass = "form-select bg-light border-0 py-3 px-3 rounded-3"
    const labelClass = "form-label text-gray-700 mb-2 fw-medium"

    const renderInput = (label, type, value, onChange, options = {}) => (
      <div className="mb-4">
        <label className={labelClass}>
          {label}
          {options.required && <span className="text-danger ms-1">*</span>}
          {options.tooltip && (
            <i className="fas fa-info-circle ms-2 text-gray-400" title={options.tooltip}></i>
          )}
        </label>
        {type === 'select' ? (
          <select 
            className={`${selectClass} ${!value && options.required ? 'border-warning' : ''}`} 
            value={value || ''} 
            onChange={onChange}
          >
            {options.placeholder && <option value="">{options.placeholder}</option>}
            {options.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : type === 'range' ? (
          <div>
            <input
              type="range"
              className="form-range"
              min={options.min || 0}
              max={options.max || 100}
              step={options.step || 1}
              value={value || options.min || 0}
              onChange={onChange}
            />
            <div className="d-flex justify-content-between small text-gray-500 mt-1">
              <span>{options.min || 0}</span>
              <span className="fw-semibold">{value || options.min || 0}{options.unit || ''}</span>
              <span>{options.max || 100}</span>
            </div>
          </div>
        ) : (
          <input
            type={type}
            className={`${inputClass} ${!value && options.required ? 'border-warning' : ''}`}
            placeholder={options.placeholder}
            value={value || ''}
            onChange={onChange}
            step={options.step}
            min={options.min}
            max={options.max}
          />
        )}
        {options.help && (
          <div className="form-text text-gray-500 mt-1">{options.help}</div>
        )}
      </div>
    )

    const categoryConfigs = {
      plumbing: [
        {
          label: 'Pipe Diameter',
          type: 'select',
          value: attributes.pipeDiameter,
          onChange: (e) => updateAttribute('pipeDiameter', parseFloat(e.target.value)),
          options: {
            placeholder: 'Select diameter',
            required: true,
            tooltip: 'Larger diameters typically require more time and materials',
            options: [
              { value: 0.5, label: '1/2 inch (12.7mm)' },
              { value: 0.75, label: '3/4 inch (19.1mm)' },
              { value: 1, label: '1 inch (25.4mm)' },
              { value: 1.25, label: '1 1/4 inch (31.8mm)' },
              { value: 1.5, label: '1 1/2 inch (38.1mm)' },
              { value: 2, label: '2 inch (50.8mm)' }
            ]
          }
        },
        {
          label: 'Pipe Length',
          type: 'range',
          value: attributes.pipeLength,
          onChange: (e) => updateAttribute('pipeLength', parseFloat(e.target.value)),
          options: {
            min: 1,
            max: 100,
            step: 1,
            unit: ' ft',
            tooltip: 'Total length of pipe to be installed or repaired',
            help: 'Longer runs may require additional fittings and labor'
          }
        },
        {
          label: 'Material Type',
          type: 'select',
          value: attributes.pipeMaterial || 'copper',
          onChange: (e) => updateAttribute('pipeMaterial', e.target.value),
          options: {
            tooltip: 'Different materials have varying costs and installation complexity',
            options: [
              { value: 'copper', label: 'Copper (Premium, long-lasting)' },
              { value: 'pvc', label: 'PVC (Economical, easy install)' },
              { value: 'pex', label: 'PEX (Flexible, modern)' },
              { value: 'galvanized', label: 'Galvanized Steel (Heavy duty)' }
            ]
          }
        },
        {
          label: 'Installation Complexity',
          type: 'select',
          value: attributes.accessibility || 'standard',
          onChange: (e) => updateAttribute('accessibility', e.target.value),
          options: {
            tooltip: 'Access difficulty affects labor time and pricing',
            options: [
              { value: 'easy', label: 'Easy Access (Open areas)' },
              { value: 'standard', label: 'Standard (Normal install)' },
              { value: 'difficult', label: 'Difficult (Tight spaces)' },
              { value: 'crawlspace', label: 'Crawlspace Access' },
              { value: 'wallaccess', label: 'Behind Wall (Requires opening)' }
            ]
          }
        }
      ],
      welding: [
        {
          label: 'Metal Type',
          type: 'select',
          value: attributes.metalType || 'steel',
          onChange: (e) => updateAttribute('metalType', e.target.value),
          options: {
            required: true,
            tooltip: 'Different metals require specific welding techniques and equipment',
            options: [
              { value: 'steel', label: 'Carbon Steel (Most common)' },
              { value: 'stainless', label: 'Stainless Steel (Corrosion resistant)' },
              { value: 'aluminum', label: 'Aluminum (Lightweight, specialized)' },
              { value: 'cast_iron', label: 'Cast Iron (Heavy duty)' }
            ]
          }
        },
        {
          label: 'Material Thickness',
          type: 'range',
          value: attributes.thickness,
          onChange: (e) => updateAttribute('thickness', parseFloat(e.target.value)),
          options: {
            min: 0.125,
            max: 2,
            step: 0.125,
            unit: '"',
            tooltip: 'Thicker materials require more passes and time',
            help: 'Thickness affects welding technique and time requirements'
          }
        },
        {
          label: 'Joint Length',
          type: 'range',
          value: attributes.jointLength,
          onChange: (e) => updateAttribute('jointLength', parseFloat(e.target.value)),
          options: {
            min: 1,
            max: 120,
            step: 1,
            unit: '"',
            tooltip: 'Total length of weld joint',
            help: 'Longer joints require more time and materials'
          }
        },
        {
          label: 'Joint Type',
          type: 'select',
          value: attributes.jointType || 'butt',
          onChange: (e) => updateAttribute('jointType', e.target.value),
          options: {
            tooltip: 'Different joint types have varying complexity and strength',
            options: [
              { value: 'butt', label: 'Butt Joint (End-to-end)' },
              { value: 'fillet', label: 'Fillet Joint (90-degree)' },
              { value: 'groove', label: 'Groove Joint (V or U shape)' },
              { value: 'lap', label: 'Lap Joint (Overlapping)' },
              { value: 'corner', label: 'Corner Joint (L-shape)' }
            ]
          }
        }
      ],
      general: [
        {
          label: 'Service Complexity',
          type: 'select',
          value: attributes.complexityLevel || 'standard',
          onChange: (e) => updateAttribute('complexityLevel', e.target.value),
          options: {
            tooltip: 'Complexity affects time, skill level, and pricing',
            options: [
              { value: 'simple', label: 'Simple (Basic task)' },
              { value: 'standard', label: 'Standard (Regular complexity)' },
              { value: 'complex', label: 'Complex (Advanced skills needed)' },
              { value: 'expert', label: 'Expert Level (Specialized expertise)' }
            ]
          }
        },
        {
          label: 'Material/Resource Quantity',
          type: 'range',
          value: attributes.materialQuantity,
          onChange: (e) => updateAttribute('materialQuantity', parseFloat(e.target.value)),
          options: {
            min: 1,
            max: 50,
            step: 1,
            tooltip: 'Quantity of materials or resources needed',
            help: 'Higher quantities may qualify for bulk pricing adjustments'
          }
        }
      ]
    }

    return (
      <div className="row g-4">
        {(categoryConfigs[category] || categoryConfigs.general).map((field, index) => (
          <div key={index} className="col-md-6">
            {renderInput(field.label, field.type, field.value, field.onChange, field.options)}
          </div>
        ))}
      </div>
    )
  }

  // Handle saving with enhanced feedback
  const handleSavePricing = async () => {
    if (!quantificationResult || !service?.professional_service_id) {
      setSaveMessage('No pricing data to save')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/professionals/service-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_service_id: service.professional_service_id,
          custom_price: quantificationResult.recommendedPrice,
          custom_duration_minutes: quantificationResult.tradeCalculations?.totalDuration || service.service?.duration_minutes,
          quantification_data: {
            professional_id: professionalId,
            service_id: service.service_id,
            model: quantificationResult.model,
            attributes,
            config,
            marketConditions,
            volatility: quantificationResult.marketConditions?.adjustedVolatility,
            urgency_drift: quantificationResult.marketConditions?.priceMultiplier,
            markup_percent: ((quantificationResult.recommendedPrice / (service.service?.base_price || 1)) - 1) * 100
          },
          notes: notes
        })
      })

      const data = await response.json()

      if (data.success) {
        setSaveMessage('✅ Pricing saved successfully!')
        setHasUnsavedChanges(false)
        setTimeout(() => {
          if (onUpdate) onUpdate(data.data)
        }, 1000)
      } else {
        throw new Error(data.error || 'Failed to save pricing')
      }
    } catch (error) {
      console.error('Error saving pricing:', error)
      setSaveMessage(`❌ Error: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Price calculation helpers
  const getCurrentPrice = () => {
    return service?.custom_price ||
           service?.service?.quant?.base_price_mean ||
           service?.service?.base_price ||
           50
  }

  const getPriceChange = () => {
    const current = getCurrentPrice()
    const newPrice = quantificationResult?.recommendedPrice || 0
    if (current === 0 || newPrice === 0) return 0
    return ((newPrice - current) / current) * 100
  }

  // Close with unsaved changes warning
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal-backdrop show" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="modal show d-block" tabIndex="-1" style={{zIndex: 1060}}>
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-4">
            
            {/* Enhanced Header */}
            <div className="modal-header border-0 pb-2">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h4 className="modal-title text-gray-900 mb-1 fw-semibold">
                      {service?.service?.name}
                      {hasUnsavedChanges && (
                        <span className="badge bg-warning text-dark ms-2 small">Unsaved</span>
                      )}
                    </h4>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-light text-gray-600 px-3 py-2 rounded-pill">
                        <i className="fas fa-layer-group me-2"></i>
                        {service?.service?.portfolio?.vertical?.name}
                      </span>
                      <span className="text-gray-500">
                        <i className="fas fa-folder me-1"></i>
                        {service?.service?.portfolio?.name}
                      </span>
                      <span className="text-gray-500">
                        <i className="fas fa-clock me-1"></i>
                        {service?.service?.duration_minutes || 0} min
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleCalculation}
                      disabled={isCalculating || !hasValidService}
                      title="Quick Calculate"
                    >
                      <i className="fas fa-calculator"></i>
                    </button>
                    <button type="button" className="btn-close" onClick={handleClose}></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Enhanced Pricing Result */}
              {quantificationResult && (
                <div className="bg-gradient-primary-soft rounded-4 p-4 mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-4">
                          <div className="display-6 text-gray-900 mb-1 fw-bold">
                            {formatPrice(getRecommendedPrice())}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge px-3 py-2 rounded-pill ${
                              quantificationResult.model === 'monte_carlo' ? 'bg-warning text-dark' :
                              quantificationResult.model === 'black_scholes' ? 'bg-info text-white' : 'bg-success text-white'
                            }`}>
                              <i className="fas fa-chart-line me-2"></i>
                              {quantificationResult.model?.replace('_', '-').toUpperCase()}
                            </span>
                            {Math.abs(getPriceChange()) > 0.1 && (
                              <span className="badge bg-secondary text-white px-3 py-2 rounded-pill">
                                <i className={`fas fa-arrow-${getPriceChange() > 0 ? 'up' : 'down'} me-1`}></i>
                                {getPriceChange() > 0 ? '+' : ''}{getPriceChange().toFixed(1)}%
                              </span>
                            )}
                            <span className="badge bg-light text-gray-700 px-3 py-2 rounded-pill">
                              <i className="fas fa-clock me-1"></i>
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Price Breakdown */}
                      <div className="row g-3">
                        <div className="col-md-3">
                          <div className="bg-white rounded-3 p-3 text-center border">
                            <div className="text-gray-500 small mb-1">Base Price</div>
                            <div className="fw-bold text-gray-900">J${(service?.service?.base_price || 0).toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-white rounded-3 p-3 text-center border">
                            <div className="text-gray-500 small mb-1">Price Change</div>
                            <div className={`fw-bold ${getPriceChange() >= 0 ? 'text-success' : 'text-danger'}`}>
                              {getRecommendedPrice() > (service?.service?.base_price || 0) ? '+' : ''}
                              J${(getRecommendedPrice() - (service?.service?.base_price || 0)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-white rounded-3 p-3 text-center border">
                            <div className="text-gray-500 small mb-1">Duration</div>
                            <div className="fw-bold text-gray-900">
                              {quantificationResult.tradeCalculations?.totalDuration || service?.service?.duration_minutes || 0}m
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-white rounded-3 p-3 text-center border">
                            <div className="text-gray-500 small mb-1">Confidence</div>
                            <div className="fw-bold text-gray-900">{(config.confidenceLevel * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4 text-end">
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary px-4 py-3 rounded-3"
                          onClick={handleSavePricing}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Save Pricing
                            </>
                          )}
                        </button>
                        
                        <button
                          className="btn btn-outline-secondary px-4 py-2 rounded-3"
                          onClick={() => setShowPresetSave(true)}
                        >
                          <i className="fas fa-bookmark me-2"></i>
                          Save as Preset
                        </button>
                      </div>
                      
                      {saveMessage && (
                        <div className={`mt-3 p-2 rounded-3 small ${saveMessage.includes('❌') ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                          {saveMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Calculation History */}
              {calculationHistory.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="text-gray-700 mb-0">Recent Calculations</h6>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setCalculationHistory([])}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Clear
                    </button>
                  </div>
                  <div className="d-flex gap-2 overflow-auto">
                    {calculationHistory.map((item) => (
                      <div key={item.id} className="bg-light rounded-3 p-3 text-center" style={{minWidth: '120px'}}>
                        <div className="fw-bold text-gray-900">J${item.result.recommendedPrice?.toFixed(2)}</div>
                        <div className="small text-gray-500">{item.timestamp.toLocaleTimeString()}</div>
                        <div className="small text-gray-600">{item.result.model}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {quantError && (
                <div className="alert alert-danger rounded-4 mb-4">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle me-3 fa-lg"></i>
                    <div>
                      <div className="fw-semibold">Calculation Error</div>
                      <div>{quantError}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Tab Navigation */}
              <div className="d-flex gap-2 bg-light p-2 rounded-pill justify-content-center mb-4">
                {[
                  { id: 'parameters', label: 'Parameters', icon: 'sliders-h', description: 'Service-specific settings' },
                  { id: 'configuration', label: 'Configuration', icon: 'cog', description: 'Model and market settings' },
                  { id: 'notes', label: 'Notes & Info', icon: 'sticky-note', description: 'Documentation and details' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`btn fw-semibold px-4 py-3 rounded-pill border transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-dark border-dark shadow-sm'
                        : 'bg-white text-muted border-light'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ minWidth: '140px' }}
                    title={tab.description}
                  >
                    <i className={`fas fa-${tab.icon} me-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Enhanced Tab Content */}
              <div>
                {/* Parameters Tab */}
                {activeTab === 'parameters' && (
                  <div>
                    <div className="mb-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="text-gray-700 mb-0 text-uppercase fw-medium">
                          <i className="fas fa-tools me-2"></i>
                          Service Parameters
                        </h6>
                        <span className="badge bg-light text-gray-600">
                          {getServiceCategory().charAt(0).toUpperCase() + getServiceCategory().slice(1)}
                        </span>
                      </div>
                      <div className="bg-light rounded-4 p-4">
                        {renderTradeInputs()}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-gray-700 mb-3 text-uppercase fw-medium">
                        <i className="fas fa-chart-line me-2"></i>
                        Market Conditions
                      </h6>
                      <div className="bg-light rounded-4 p-4">
                        <div className="row g-4">
                          <div className="col-md-4">
                            <label className="form-label text-gray-700 mb-2 fw-medium">
                              Urgency Level
                              <i className="fas fa-info-circle ms-2 text-gray-400" title="How quickly the service is needed"></i>
                            </label>
                            <select
                              className="form-select bg-white border-0 py-3 px-3 rounded-3"
                              value={config.urgencyLevel}
                              onChange={(e) => updateConfig({ urgencyLevel: e.target.value })}
                            >
                              <option value="scheduled">📅 Scheduled (Standard rate)</option>
                              <option value="standard">⏰ Standard (Within days)</option>
                              <option value="urgent">🚨 Urgent (Same day premium)</option>
                              <option value="emergency">🆘 Emergency (Immediate response)</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label text-gray-700 mb-2 fw-medium">
                              Market Demand
                              <i className="fas fa-info-circle ms-2 text-gray-400" title="Current demand for this service type"></i>
                            </label>
                            <select
                              className="form-select bg-white border-0 py-3 px-3 rounded-3"
                              value={marketConditions.marketDemand}
                              onChange={(e) => updateMarketConditions({ marketDemand: e.target.value })}
                            >
                              <option value="low">📉 Low Demand</option>
                              <option value="normal">📊 Normal Demand</option>
                              <option value="high">📈 High Demand</option>
                              <option value="peak">🔥 Peak Demand</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label text-gray-700 mb-2 fw-medium">
                              Service Time
                              <i className="fas fa-info-circle ms-2 text-gray-400" title="When the service will be performed"></i>
                            </label>
                            <select
                              className="form-select bg-white border-0 py-3 px-3 rounded-3"
                              value={marketConditions.marketDemand}
                              onChange={(e) => updateMarketConditions({ marketDemand: e.target.value })}
                            >
                              <option value="low">📉 Low Demand</option>
                              <option value="normal">📊 Normal Demand</option>
                              <option value="high">📈 High Demand</option>
                              <option value="peak">🔥 Peak Demand</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label text-gray-700 mb-2 fw-medium">
                              Service Time
                              <i className="fas fa-info-circle ms-2 text-gray-400" title="When the service will be performed"></i>
                            </label>
                            <select
                              className="form-select bg-white border-0 py-3 px-3 rounded-3"
                              value={marketConditions.timeOfDay}
                              onChange={(e) => updateMarketConditions({ timeOfDay: e.target.value })}
                            >
                              <option value="business">🏢 Business Hours</option>
                              <option value="evening">🌆 Evening (After hours)</option>
                              <option value="weekend">🏖️ Weekend</option>
                              <option value="holiday">🎉 Holiday</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        className="btn btn-dark px-5 py-3 rounded-3 position-relative"
                        onClick={handleCalculation}
                        disabled={isCalculating || !hasValidService}
                      >
                        {isCalculating ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2"></div>
                            Calculating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-calculator me-2"></i>
                            Calculate Pricing
                          </>
                        )}
                        {hasUnsavedChanges && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                            !
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Configuration Tab */}
                {activeTab === 'configuration' && (
                  <div className="bg-light rounded-4 p-4">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label text-gray-700 mb-2 fw-medium">
                          <i className="fas fa-brain me-2"></i>
                          Pricing Model
                        </label>
                        <select
                          className="form-select bg-white border-0 py-3 px-3 rounded-3"
                          value={config.pricingModel}
                          onChange={(e) => updateConfig({ pricingModel: e.target.value })}
                        >
                          <option value="auto">🤖 Auto Select (Recommended)</option>
                          <option value="quote">💬 Quote Based</option>
                          <option value="black_scholes">📊 Black-Scholes (Financial)</option>
                          <option value="monte_carlo">🎲 Monte Carlo (Statistical)</option>
                        </select>
                        <div className="form-text mt-2">
                          Auto mode selects the best model based on service complexity and available data.
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-gray-700 mb-2 fw-medium">
                          <i className="fas fa-shield-alt me-2"></i>
                          Confidence Level
                        </label>
                        <select
                          className="form-select bg-white border-0 py-3 px-3 rounded-3"
                          value={config.confidenceLevel}
                          onChange={(e) => updateConfig({ confidenceLevel: parseFloat(e.target.value) })}
                        >
                          <option value="0.90">90% Confidence (Balanced)</option>
                          <option value="0.95">95% Confidence (Conservative)</option>
                          <option value="0.99">99% Confidence (Very Conservative)</option>
                        </select>
                        <div className="form-text mt-2">
                          Higher confidence levels provide more conservative pricing estimates.
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-gray-700 mb-2 fw-medium">
                          <i className="fas fa-users me-2"></i>
                          Competition Level
                        </label>
                        <select
                          className="form-select bg-white border-0 py-3 px-3 rounded-3"
                          value={marketConditions.competitorDensity}
                          onChange={(e) => updateMarketConditions({ competitorDensity: e.target.value })}
                        >
                          <option value="low">🏝️ Low Competition (Price advantage)</option>
                          <option value="medium">⚖️ Medium Competition (Balanced market)</option>
                          <option value="high">🏆 High Competition (Price sensitive)</option>
                        </select>
                        <div className="form-text mt-2">
                          Competition affects pricing flexibility and market positioning.
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-gray-700 mb-2 fw-medium">
                          <i className="fas fa-chart-area me-2"></i>
                          Economic Climate
                        </label>
                        <select
                          className="form-select bg-white border-0 py-3 px-3 rounded-3"
                          value={marketConditions.economicIndicator}
                          onChange={(e) => updateMarketConditions({ economicIndicator: e.target.value })}
                        >
                          <option value="recession">📉 Economic Downturn</option>
                          <option value="stable">📊 Stable Economy</option>
                          <option value="growth">📈 Economic Growth</option>
                        </select>
                        <div className="form-text mt-2">
                          Economic conditions influence customer spending and pricing tolerance.
                        </div>
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="mt-5 pt-4 border-top">
                      <h6 className="text-gray-700 mb-3">
                        <i className="fas fa-cogs me-2"></i>
                        Advanced Settings
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="autoRecalculate"
                              defaultChecked
                            />
                            <label className="form-check-label text-gray-700" htmlFor="autoRecalculate">
                              Auto-recalculate on changes
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="includeOverhead"
                              defaultChecked
                            />
                            <label className="form-check-label text-gray-700" htmlFor="includeOverhead">
                              Include overhead costs
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="seasonalAdjust"
                            />
                            <label className="form-check-label text-gray-700" htmlFor="seasonalAdjust">
                              Apply seasonal adjustments
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes & Info Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <div className="mb-4">
                      <label className="form-label text-gray-700 mb-2 fw-medium">
                        <i className="fas fa-sticky-note me-2"></i>
                        Pricing Notes & Strategy
                      </label>
                      <textarea
                        className="form-control bg-light border-0 py-3 px-3 rounded-3"
                        rows="6"
                        placeholder="Add notes about pricing strategy, special considerations, market factors, or client-specific requirements..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <div className="form-text mt-2">
                        These notes will be saved with the pricing configuration for future reference.
                      </div>
                    </div>
                    
                    {/* Enhanced Service Information */}
                    <div className="bg-light rounded-4 p-4">
                      <h6 className="text-gray-700 mb-3 text-uppercase fw-medium">
                        <i className="fas fa-info-circle me-2"></i>
                        Service Information
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="bg-white rounded-3 p-3 border">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-gray-600 small fw-medium">
                                <i className="fas fa-calculator me-1"></i>
                                Quantified Price:
                              </span>
                              <span className="fw-bold text-gray-900">
                                {service?.service?.quant?.base_price_mean 
                                  ? `J${service.service.quant.base_price_mean.toFixed(2)}` 
                                  : <span className="text-gray-400">Not Set</span>}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="bg-white rounded-3 p-3 border">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-gray-600 small fw-medium">
                                <i className="fas fa-tag me-1"></i>
                                Base Price:
                              </span>
                              <span className="fw-bold text-gray-900">
                                {service?.service?.base_price 
                                  ? `J${service.service.base_price.toFixed(2)}` 
                                  : <span className="text-gray-400">Not Set</span>}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="bg-white rounded-3 p-3 border">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-gray-600 small fw-medium">
                                <i className="fas fa-clock me-1"></i>
                                Duration:
                              </span>
                              <span className="fw-bold text-gray-900">
                                {service?.service?.duration_minutes || 0} minutes
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="bg-white rounded-3 p-3 border">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-gray-600 small fw-medium">
                                <i className="fas fa-user-cog me-1"></i>
                                Custom Price:
                              </span>
                              <span className="fw-bold text-gray-900">
                                {service?.custom_price ? (
                                  <span className="text-success">J${service.custom_price.toFixed(2)}</span>
                                ) : (
                                  <span className="text-gray-400">None</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="bg-white rounded-3 p-3 border">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-gray-600 small fw-medium">
                                <i className="fas fa-brain me-1"></i>
                                Pricing Model:
                              </span>
                              <span className="fw-bold text-gray-900">
                                {service?.service?.pricing_model || 'Quote'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="bg-white rounded-3 p-3 border">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-gray-600 small fw-medium">
                                <i className="fas fa-hashtag me-1"></i>
                                Service ID:
                              </span>
                              <span className="fw-bold text-gray-900 font-monospace small">
                                {service?.service_id || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Service Performance Metrics */}
                      <div className="mt-4 pt-3 border-top">
                        <h6 className="text-gray-700 mb-3 text-uppercase fw-medium small">
                          <i className="fas fa-chart-bar me-2"></i>
                          Performance Metrics
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-4 text-center">
                            <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                              <div className="h4 text-primary mb-0">4.8</div>
                              <div className="small text-gray-600">Avg Rating</div>
                            </div>
                          </div>
                          <div className="col-md-4 text-center">
                            <div className="bg-success bg-opacity-10 rounded-3 p-3">
                              <div className="h4 text-success mb-0">147</div>
                              <div className="small text-gray-600">Completions</div>
                            </div>
                          </div>
                          <div className="col-md-4 text-center">
                            <div className="bg-info bg-opacity-10 rounded-3 p-3">
                              <div className="h4 text-info mb-0">94%</div>
                              <div className="small text-gray-600">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="modal-footer border-0 pt-0">
              <div className="w-100 d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light px-4 py-2 rounded-3" onClick={handleClose}>
                    <i className="fas fa-times me-2"></i>
                    {hasUnsavedChanges ? 'Cancel' : 'Close'}
                  </button>
                  {hasUnsavedChanges && (
                    <span className="badge bg-warning text-dark align-self-center">
                      Unsaved changes
                    </span>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary px-4 py-2 rounded-3"
                    onClick={handleCalculation}
                    disabled={isCalculating || !hasValidService}
                  >
                    <i className="fas fa-calculator me-2"></i>
                    Calculate
                  </button>
                  
                  {quantificationResult && (
                    <button
                      className="btn btn-success px-4 py-2 rounded-3"
                      onClick={handleSavePricing}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save & Apply
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Save Modal */}
      {showPresetSave && (
        <div className="modal show d-block" style={{zIndex: 1070}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">Save Configuration Preset</h5>
                <button type="button" className="btn-close" onClick={() => setShowPresetSave(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Preset Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Standard Plumbing Setup"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Brief description of this configuration..."
                  />
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light" onClick={() => setShowPresetSave(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" disabled={!presetName.trim()}>
                  <i className="fas fa-bookmark me-2"></i>
                  Save Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Styles */}
      <style jsx>{`
        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
        }
        
        .modal-dialog {
          max-width: 1200px;
        }
        
        .bg-gradient-primary-soft {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #e2e8f0;
        }
        
        .text-gray-900 { color: #111827; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        
        .form-control:focus,
        .form-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25);
          border-color: #3b82f6;
        }
        
        .btn:disabled {
          opacity: 0.6;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }

        .border-warning {
          border-color: #f59e0b !important;
        }

        /* Custom scrollbar for calculation history */
        .overflow-auto::-webkit-scrollbar {
          height: 6px;
        }
        
        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Enhanced button animations */
        .btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}
                            