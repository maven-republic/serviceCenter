// src/components/professional-workspace/section/professional-computation/ServiceQuantificationConfiguration.jsx
'use client'

import { useState, useEffect } from 'react'
import { useQuantificationManifold } from '@/hook/useQuantificationManifold'

export default function ServiceQuantificationConfiguration({ 
  service, 
  onUpdate, 
  professionalId 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [notes, setNotes] = useState(service?.additional_notes || '')
  const [activeTab, setActiveTab] = useState('parameters')

  // Initialize quantification hook with the service
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

  // Hybrid pricing: Implement pricing hierarchy
  const getEffectiveBasePrice = (serviceData) => {
    if (!serviceData) return 50
    
    // Pricing hierarchy: quant.base_price_mean -> service.base_price -> fallback
    return serviceData.service?.quant?.base_price_mean ||
           serviceData.service?.base_price ||
           serviceData.effective_base_price ||
           50
  }

  // Set service when component mounts or service changes
  useEffect(() => {
    if (service?.service) {
      // Ensure the service object has the required base_price using hybrid approach
      const effectivePrice = getEffectiveBasePrice(service)
      
      const serviceWithPrice = {
        ...service.service,
        base_price: effectivePrice
      }
      
      console.log('🎯 Hybrid Pricing Implementation:', {
        quantPrice: service.service?.quant?.base_price_mean,
        servicePrice: service.service?.base_price, 
        customPrice: service.custom_price,
        effectivePrice: effectivePrice,
        finalService: serviceWithPrice
      })
      
      setService(serviceWithPrice)
    } else {
      console.log('⚠️ No service.service found:', service)
    }
  }, [service, setService])

  // Determine service category for trade-specific inputs
  const getServiceCategory = () => {
    const serviceName = service?.service?.name?.toLowerCase() || ''
    const verticalName = service?.service?.portfolio?.vertical?.name?.toLowerCase() || ''
    
    if (verticalName.includes('plumb') || serviceName.includes('plumb')) {
      return 'plumbing'
    } else if (verticalName.includes('weld') || serviceName.includes('weld')) {
      return 'welding'
    } else if (verticalName.includes('electr') || serviceName.includes('electr')) {
      return 'electrical'
    }
    return 'general'
  }

  // Render trade-specific inputs with minimal styling
  const renderTradeInputs = () => {
    const category = getServiceCategory()

    const inputClass = "form-control border-1 bg-transparent py-2 px-3 border-gray-300 transition-colors"
    const selectClass = "form-select border-1 bg-transparent py-2 px-3 border-gray-300 transition-colors"
    const labelClass = "form-label text-gray-700 mb-1 small fw-normal"

    switch (category) {
      case 'plumbing':
        return (
          <div className="row g-3">
            <div className="col-lg-6">
              <label className={labelClass}>Pipe Diameter</label>
              <select
                className={selectClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
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
            <div className="col-lg-6">
              <label className={labelClass}>Pipe Length (feet)</label>
              <input
                type="number"
                className={inputClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
                placeholder="Enter length"
                value={attributes.pipeLength || ''}
                onChange={(e) => updateAttribute('pipeLength', parseFloat(e.target.value))}
              />
            </div>
            <div className="col-lg-6">
              <label className={labelClass}>Material</label>
              <select
                className={selectClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
                value={attributes.pipeMaterial || 'copper'}
                onChange={(e) => updateAttribute('pipeMaterial', e.target.value)}
              >
                <option value="copper">Copper</option>
                <option value="pvc">PVC</option>
                <option value="pex">PEX</option>
              </select>
            </div>
            <div className="col-lg-6">
              <label className={labelClass}>Accessibility</label>
              <select
                className={selectClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
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

      case 'welding':
        return (
          <div className="row g-3">
            <div className="col-lg-6">
              <label className={labelClass}>Metal Type</label>
              <select
                className={selectClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
                value={attributes.metalType || 'steel'}
                onChange={(e) => updateAttribute('metalType', e.target.value)}
              >
                <option value="steel">Steel</option>
                <option value="aluminum">Aluminum</option>
                <option value="stainless">Stainless Steel</option>
              </select>
            </div>
            <div className="col-lg-6">
              <label className={labelClass}>Thickness (inches)</label>
              <input
                type="number"
                step="0.125"
                className={inputClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
                placeholder="Enter thickness"
                value={attributes.thickness || ''}
                onChange={(e) => updateAttribute('thickness', parseFloat(e.target.value))}
              />
            </div>
            <div className="col-lg-6">
              <label className={labelClass}>Joint Length (inches)</label>
              <input
                type="number"
                className={inputClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
                placeholder="Enter length"
                value={attributes.jointLength || ''}
                onChange={(e) => updateAttribute('jointLength', parseFloat(e.target.value))}
              />
            </div>
            <div className="col-lg-6">
              <label className={labelClass}>Joint Type</label>
              <select
                className={selectClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
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

      default:
        return (
          <div className="row g-3">
            <div className="col-lg-6">
              <label className={labelClass}>Complexity Level</label>
              <select
                className={selectClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
                value={attributes.complexityLevel || 'standard'}
                onChange={(e) => updateAttribute('complexityLevel', e.target.value)}
              >
                <option value="simple">Simple</option>
                <option value="standard">Standard</option>
                <option value="complex">Complex</option>
                <option value="expert">Expert Level</option>
              </select>
            </div>
            <div className="col-lg-6">
              <label className={labelClass}>Material Quantity</label>
              <input
                type="number"
                className={inputClass}
                style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none'}}
                placeholder="Enter quantity"
                value={attributes.materialQuantity || ''}
                onChange={(e) => updateAttribute('materialQuantity', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )
    }
  }

  // Handle saving the pricing
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
        setSaveMessage('Pricing saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
        
        if (onUpdate) {
          onUpdate(data.data)
        }
      } else {
        throw new Error(data.error || 'Failed to save pricing')
      }
    } catch (error) {
      console.error('Error saving pricing:', error)
      setSaveMessage(`Error: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Get current effective price using hybrid approach
  const getCurrentPrice = () => {
    // Final pricing hierarchy: custom_price -> quant.base_price_mean -> service.base_price -> fallback
    return service?.custom_price ||
           service?.service?.quant?.base_price_mean ||
           service?.service?.base_price ||
           service?.effective_base_price ||
           50
  }

  const getNewPrice = () => {
    return quantificationResult?.recommendedPrice || 0
  }

  const getPriceChange = () => {
    const current = getCurrentPrice()
    const newPrice = getNewPrice()
    if (current === 0 || newPrice === 0) return 0
    return ((newPrice - current) / current) * 100
  }

  return (
    <>
      {/* Minimal Brutalist/Swiss Design Styles - No Shadows */}
      <style jsx>{`
        .border-gray-300 { border-color: #d1d5db !important; border-width: 0.5px !important; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-900 { color: #111827; }
        
        .transition-colors { transition: border-color 0.15s ease-in-out, color 0.15s ease-in-out; }
        
        /* Complete shadow removal for all elements */
        * {
          box-shadow: none !important;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #3b82f6 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        
        .btn-ghost {
          background: transparent;
          border: 0.5px solid #d1d5db;
          color: #374151;
          transition: all 0.15s ease-in-out;
          box-shadow: none !important;
        }
        
        .btn-ghost:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
          color: #111827;
          box-shadow: none !important;
        }
        
        .btn-ghost:focus {
          border-color: #3b82f6 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        
        .btn-ghost.active {
          background: #111827;
          border-color: #111827;
          color: white;
          box-shadow: none !important;
        }
        
        .btn,
        .btn:focus,
        .btn:active,
        .btn:hover {
          box-shadow: none !important;
          outline: none !important;
        }
        
        .badge {
          box-shadow: none !important;
        }
        
        .header-badge {
          border-width: 0.5px !important;
          border-radius: 20px;
          box-shadow: none !important;
        }
        
        .header-expand-btn {
          border-width: 0.5px !important;
          border-radius: 8px;
          box-shadow: none !important;
          transition: border-color 0.15s ease-in-out, background-color 0.15s ease-in-out;
        }
        
        .header-expand-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
          box-shadow: none !important;
        }
        
        .header-expand-btn:focus {
          border-color: #3b82f6 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        
        .border-l-2 { border-left: 2px solid; }
        .border-l-blue-500 { border-left-color: #3b82f6; }
        .border-l-green-500 { border-left-color: #10b981; }
        .border-l-red-500 { border-left-color: #ef4444; }
        
        .divide-y > * + * { border-top: 0.5px solid #e5e7eb; }
      `}</style>

      {/* Minimal Card Container */}
{/* Ultra-Thin Minimal Table Container */}
<div className="border border-gray-300 bg-white" style={{borderWidth: '0.5px', borderRadius: '12px', boxShadow: 'none', overflow: 'hidden'}}>
  <table className="table table-borderless mb-0 w-100">
    <thead>
      <tr className="border-bottom border-gray-300" style={{borderBottomWidth: '0.5px'}}>
        <th className="text-gray-700 fw-normal small text-uppercase py-2 ps-3" style={{background: '#f8f9fa', fontSize: '11px'}}>
          Service
        </th>
        <th className="text-gray-700 fw-normal small text-uppercase py-2" style={{background: '#f8f9fa', fontSize: '11px', width: '120px'}}>
          Category
        </th>
        <th className="text-gray-700 fw-normal small text-uppercase py-2" style={{background: '#f8f9fa', fontSize: '11px', width: '100px'}}>
          Duration
        </th>
        <th className="text-gray-700 fw-normal small text-uppercase py-2" style={{background: '#f8f9fa', fontSize: '11px', width: '100px'}}>
          Price
        </th>
        <th className="text-gray-700 fw-normal small text-uppercase py-2 pe-3 text-end" style={{background: '#f8f9fa', fontSize: '11px', width: '50px'}}>
          
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-0 hover:bg-gray-50" style={{transition: 'background-color 0.15s ease'}}>
        <td className="py-2 ps-3 border-0" style={{verticalAlign: 'middle'}}>
          <div className="d-flex align-items-center">
            <div>
              <div className="text-gray-900 mb-0 fw-normal" style={{fontSize: '14px', lineHeight: '1.2'}}>
                {service?.service?.name}
              </div>
              <div className="text-gray-500" style={{fontSize: '11px', lineHeight: '1.2'}}>
                {service?.service?.portfolio?.name}
              </div>
            </div>
          </div>
        </td>
        <td className="py-2 border-0 align-middle">
          <span 
            className="badge border border-gray-300 text-gray-600 bg-transparent px-2 py-1"
            style={{
              borderWidth: '0.5px', 
              borderRadius: '12px',
              boxShadow: 'none',
              fontSize: '10px',
              lineHeight: '1'
            }}
          >
            {service?.service?.portfolio?.vertical?.name}
          </span>
        </td>
        <td className="py-2 border-0 align-middle">
          <span className="text-gray-600" style={{fontSize: '12px'}}>
            {service?.service?.duration_minutes || 0}m
          </span>
        </td>
        <td className="py-2 border-0 align-middle">
          <div className="d-flex align-items-center gap-2">
            <span className="text-gray-900 fw-medium" style={{fontSize: '13px'}}>
              J${service?.custom_price ? service.custom_price.toFixed(2) : (service?.service?.base_price || 0).toFixed(2)}
            </span>
            {service?.custom_price && (
              <span 
                className="badge border border-green-500 text-green-500 bg-transparent px-1"
                style={{
                  borderWidth: '0.5px', 
                  borderRadius: '8px',
                  boxShadow: 'none',
                  fontSize: '9px',
                  lineHeight: '1'
                }}
              >
                Custom
              </span>
            )}
          </div>
        </td>
        <td className="py-2 pe-3 border-0 align-middle text-end">
          <button
            className="btn btn-ghost p-1"
            style={{
              borderWidth: '0.5px', 
              borderRadius: '6px',
              width: '28px', 
              height: '28px',
              boxShadow: 'none',
              fontSize: '11px'
            }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{fontSize: '10px'}}></i>
          </button>
        </td>
      </tr>
      
      {/* Ultra-Thin Expanded Row */}
      {isExpanded && (
        <tr className="border-0">
          <td colSpan="5" className="p-0 border-0">
            <div className="border-top border-gray-300 bg-gray-50" style={{borderTopWidth: '0.5px'}}>
              {/* Compact Pricing Result Display */}
              {quantificationResult && (
                <div className="p-3">
                  <div className="border border-gray-300 p-2" style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none', background: 'white'}}>
                    <div className="row align-items-center g-2">
                      <div className="col-lg-6">
                        <div className="d-flex align-items-center gap-3">
                          <div>
                            <div className="h5 text-gray-900 mb-0" style={{fontSize: '18px'}}>
                              {formatPrice(getRecommendedPrice())}
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <span className={`badge border px-2 py-1 ${
                                quantificationResult.model === 'monte_carlo' ? 'border-orange-500 text-orange-500' :
                                quantificationResult.model === 'black_scholes' ? 'border-blue-500 text-blue-500' : 'border-green-500 text-green-500'
                              } bg-transparent`} style={{boxShadow: 'none', fontSize: '9px'}}>
                                {quantificationResult.model?.replace('_', '-').toUpperCase()}
                              </span>
                              {Math.abs(getPriceChange()) > 0.1 && (
                                <span className="badge border border-gray-300 text-gray-700 bg-transparent px-2 py-1" style={{boxShadow: 'none', fontSize: '9px'}}>
                                  {getPriceChange() > 0 ? '+' : ''}{getPriceChange().toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="d-flex gap-2">
                            <div className="border border-gray-300 p-1 text-center" style={{borderWidth: '0.5px', borderRadius: '4px', boxShadow: 'none', minWidth: '60px'}}>
                              <div style={{fontSize: '9px'}} className="text-gray-500 mb-0">Base</div>
                              <div style={{fontSize: '11px'}} className="text-gray-900">J${(service?.service?.base_price || 0).toFixed(2)}</div>
                            </div>
                            <div className="border border-gray-300 p-1 text-center" style={{borderWidth: '0.5px', borderRadius: '4px', boxShadow: 'none', minWidth: '60px'}}>
                              <div style={{fontSize: '9px'}} className="text-gray-500 mb-0">Change</div>
                              <div style={{fontSize: '11px'}} className="text-gray-900">
                                {getRecommendedPrice() > (service?.service?.base_price || 0) ? '+' : ''}
                                J${(getRecommendedPrice() - (service?.service?.base_price || 0)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-lg-6 text-end">
                        <button
                          className="btn text-gray-700 px-2 py-1"
                          style={{
                            borderWidth: '0.5px', 
                            borderRadius: '6px',
                            border: '0.5px solid #d1d5db',
                            background: 'transparent',
                            boxShadow: 'none',
                            fontSize: '12px'
                          }}
                          onClick={handleSavePricing}
                          disabled={isSaving || !quantificationResult}
                        >
                          {isSaving ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-1" style={{width: '12px', height: '12px'}}></div>
                              Saving
                            </>
                          ) : (
                            <>Save</>
                          )}
                        </button>
                        
                        {saveMessage && (
                          <div className={`mt-1 ${saveMessage.includes('Error') ? 'text-danger' : 'text-success'}`} style={{fontSize: '10px'}}>
                            {saveMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Error Display */}
              {quantError && (
                <div className="p-2">
                  <div className="border border-red-500 border-l-2 border-l-red-500 p-2 bg-red-50" style={{boxShadow: 'none', borderRadius: '4px'}}>
                    <div style={{fontSize: '11px'}} className="text-red-700">{quantError}</div>
                  </div>
                </div>
              )}

              {/* Ultra-Compact Tab Navigation */}
              <div className="p-2">
                <div className="d-flex gap-1 bg-white p-1 rounded-pill justify-content-center border border-gray-300" style={{boxShadow: 'none', borderWidth: '0.5px'}}>
                  {[
                    { id: 'parameters', label: 'Params' },
                    { id: 'configuration', label: 'Config' },
                    { id: 'notes', label: 'Notes' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      className={`btn fw-normal px-3 py-1 rounded-pill border transition-all ${
                        activeTab === tab.id
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-transparent text-gray-600 border-transparent'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      style={{ minWidth: '60px', boxShadow: 'none', fontSize: '11px', borderWidth: '0.5px' }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Tab Content */}
              <div className="px-2 pb-2">
                {/* Parameters Tab */}
                {activeTab === 'parameters' && (
                  <div>
                    <div className="mb-3">
                      <h6 className="text-gray-700 mb-2 fw-normal text-uppercase" style={{fontSize: '10px'}}>Service Parameters</h6>
                      <div className="border border-gray-300 p-2" style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none', background: 'white'}}>
                        {renderTradeInputs()}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6 className="text-gray-700 mb-2 fw-normal text-uppercase" style={{fontSize: '10px'}}>Market Conditions</h6>
                      <div className="border border-gray-300 p-2" style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none', background: 'white'}}>
                        <div className="row g-2">
                          <div className="col-lg-4">
                            <label className="form-label text-gray-700 mb-1 fw-normal" style={{fontSize: '10px'}}>Urgency</label>
                            <select
                              className="form-select border-1 border-gray-300 bg-transparent py-1 px-2"
                              style={{boxShadow: 'none', fontSize: '11px', borderRadius: '4px'}}
                              value={config.urgencyLevel}
                              onChange={(e) => updateConfig({ urgencyLevel: e.target.value })}
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="standard">Standard</option>
                              <option value="urgent">Urgent</option>
                              <option value="emergency">Emergency</option>
                            </select>
                          </div>
                          <div className="col-lg-4">
                            <label className="form-label text-gray-700 mb-1 fw-normal" style={{fontSize: '10px'}}>Demand</label>
                            <select
                              className="form-select border-1 border-gray-300 bg-transparent py-1 px-2"
                              style={{boxShadow: 'none', fontSize: '11px', borderRadius: '4px'}}
                              value={marketConditions.marketDemand}
                              onChange={(e) => updateMarketConditions({ marketDemand: e.target.value })}
                            >
                              <option value="low">Low</option>
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                              <option value="peak">Peak</option>
                            </select>
                          </div>
                          <div className="col-lg-4">
                            <label className="form-label text-gray-700 mb-1 fw-normal" style={{fontSize: '10px'}}>Time</label>
                            <select
                              className="form-select border-1 border-gray-300 bg-transparent py-1 px-2"
                              style={{boxShadow: 'none', fontSize: '11px', borderRadius: '4px'}}
                              value={marketConditions.timeOfDay}
                              onChange={(e) => updateMarketConditions({ timeOfDay: e.target.value })}
                            >
                              <option value="business">Business</option>
                              <option value="evening">Evening</option>
                              <option value="weekend">Weekend</option>
                              <option value="holiday">Holiday</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        className="btn text-gray-900 px-3 py-1"
                        style={{
                          borderWidth: '0.5px', 
                          borderRadius: '6px',
                          border: '0.5px solid #111827',
                          background: 'transparent',
                          boxShadow: 'none',
                          fontSize: '11px'
                        }}
                        onClick={() => {
                          console.log('🔍 Calculate button clicked. Service state:', {
                            hasValidService,
                            isReady,
                            service: service?.service,
                            basePrice: service?.service?.base_price,
                            attributes
                          })
                          performCalculation()
                        }}
                        disabled={isCalculating || !hasValidService}
                      >
                        {isCalculating ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-1" style={{width: '12px', height: '12px'}}></div>
                            Calculating
                          </>
                        ) : (
                          <>Calculate</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Configuration Tab */}
                {activeTab === 'configuration' && (
                  <div className="border border-gray-300 p-2" style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none', background: 'white'}}>
                    <div className="row g-2">
                      <div className="col-lg-6">
                        <label className="form-label text-gray-700 mb-1 fw-normal" style={{fontSize: '10px'}}>Model</label>
                        <select
                          className="form-select bg-transparent py-1 px-2"
                          style={{borderWidth: '0.5px', borderRadius: '4px', boxShadow: 'none', fontSize: '11px'}}
                          value={config.pricingModel}
                          onChange={(e) => updateConfig({ pricingModel: e.target.value })}
                        >
                          <option value="auto">Auto</option>
                          <option value="quote">Quote</option>
                          <option value="black_scholes">Black-Scholes</option>
                          <option value="monte_carlo">Monte Carlo</option>
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label text-gray-700 mb-1 fw-normal" style={{fontSize: '10px'}}>Confidence</label>
                        <select
                          className="form-select bg-transparent py-1 px-2"
                          style={{borderWidth: '0.5px', borderRadius: '4px', boxShadow: 'none', fontSize: '11px'}}
                          value={config.confidenceLevel}
                          onChange={(e) => updateConfig({ confidenceLevel: parseFloat(e.target.value) })}
                        >
                          <option value="0.90">90%</option>
                          <option value="0.95">95%</option>
                          <option value="0.99">99%</option>
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label text-gray-700 mb-1 fw-normal" style={{fontSize: '10px'}}>Competition</label>
                        <select
                          className="form-select bg-transparent py-1 px-2"
                          style={{borderWidth: '0.5px', borderRadius: '4px', boxShadow: 'none', fontSize: '11px'}}
                          value={marketConditions.competitorDensity}
                          onChange={(e) => updateMarketConditions({ competitorDensity: e.target.value })}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label text-gray-700 mb-1 fw-normal" style={{fontSize: '10px'}}>Economy</label>
                        <select
                          className="form-select border-1 border-gray-300 bg-transparent py-1 px-2"
                          style={{boxShadow: 'none', fontSize: '11px', borderRadius: '4px'}}
                          value={marketConditions.economicIndicator}
                          onChange={(e) => updateMarketConditions({ economicIndicator: e.target.value })}
                        >
                          <option value="recession">Recession</option>
                          <option value="stable">Stable</option>
                          <option value="growth">Growth</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <div className="mb-2">
                      <label className="form-label text-gray-700 mb-1 fw-normal" style={{fontSize: '10px'}}>Notes</label>
                      <textarea
                        className="form-control bg-transparent py-1 px-2"
                        style={{borderWidth: '0.5px', borderRadius: '4px', boxShadow: 'none', fontSize: '11px'}}
                        rows="3"
                        placeholder="Add pricing notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    
                    {/* Ultra-Compact Service Info */}
                    <div className="border border-gray-300 p-2" style={{borderWidth: '0.5px', borderRadius: '8px', boxShadow: 'none', background: 'white'}}>
                      <h6 className="text-gray-700 mb-1 fw-normal text-uppercase" style={{fontSize: '9px'}}>Service Info</h6>
                      <div className="row g-1" style={{fontSize: '10px'}}>
                        <div className="col-6 d-flex justify-content-between py-0">
                          <span className="text-gray-500">Quant:</span>
                          <span className="text-gray-900">
                            {service?.service?.quant?.base_price_mean 
                              ? `J${service.service.quant.base_price_mean.toFixed(2)}` 
                              : 'Not Set'}
                          </span>
                        </div>
                        <div className="col-6 d-flex justify-content-between py-0">
                          <span className="text-gray-500">Base:</span>
                          <span className="text-gray-900">
                            {service?.service?.base_price 
                              ? `J${service.service.base_price.toFixed(2)}` 
                              : 'Not Set'}
                          </span>
                        </div>
                        <div className="col-6 d-flex justify-content-between py-0">
                          <span className="text-gray-500">Duration:</span>
                          <span className="text-gray-900">{service?.service?.duration_minutes || 0}m</span>
                        </div>
                        <div className="col-6 d-flex justify-content-between py-0">
                          <span className="text-gray-500">Custom:</span>
                          <span className="text-gray-900">
                            {service?.custom_price ? `J${service.custom_price.toFixed(2)}` : 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


    </>
  )
}