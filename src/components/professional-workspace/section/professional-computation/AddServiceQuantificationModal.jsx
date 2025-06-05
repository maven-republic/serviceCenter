// src/components/professional-workspace/section/professional-computation/AddServiceQuantificationModal.jsx
'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'

export default function AddServiceQuantificationModal({ 
  availableServices = [], 
  existingServices = [], 
  onClose, 
  onSuccess 
}) {
  const { user } = useUserStore()
  const [step, setStep] = useState(1) // 1: Select Service, 2: Configure Initial Pricing
  const [selectedService, setSelectedService] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [professionalId, setProfessionalId] = useState(null)

  // Initial configuration for the service
  const [initialConfig, setInitialConfig] = useState({
    customPrice: '',
    customDuration: '',
    pricingModel: 'auto',
    urgencyLevel: 'standard',
    marketDemand: 'normal',
    notes: ''
  })

  // Get professional ID
  useEffect(() => {
    const fetchProfessionalId = async () => {
      if (!user?.account?.account_id) return

      try {
        // Try to get from existing services first
        if (existingServices.length > 0 && existingServices[0].professional_id) {
          setProfessionalId(existingServices[0].professional_id)
          return
        }

        // Fallback: fetch from API
        const response = await fetch('/api/professionals/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: user.account.account_id })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.professional_id) {
            setProfessionalId(data.professional_id)
          }
        }
      } catch (err) {
        console.error('Error fetching professional ID:', err)
      }
    }

    fetchProfessionalId()
  }, [user?.account?.account_id, existingServices])

  // Filter available services (exclude already added ones)
  const getFilteredServices = () => {
    const existingServiceIds = existingServices.map(es => es.service_id)
    const unaddedServices = availableServices.filter(service => 
      !existingServiceIds.includes(service.service_id)
    )

    let filtered = unaddedServices

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.portfolio?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.portfolio?.vertical?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service =>
        service.portfolio?.vertical?.name?.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    }

    return filtered
  }

  // Get unique categories from available services
  const getCategories = () => {
    const categories = availableServices
      .map(service => service.portfolio?.vertical?.name)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
    
    return ['all', ...categories]
  }

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setInitialConfig(prev => ({
      ...prev,
      customPrice: service.base_price?.toString() || '',
      customDuration: service.duration_minutes?.toString() || ''
    }))
    setStep(2)
  }

  // Handle adding the service with pricing
  const handleAddService = async () => {
    if (!selectedService || !professionalId) {
      setError('Missing required information')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // First, add the service to professional_service table
      const addServiceResponse = await fetch('/api/professionals/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: professionalId,
          service_id: selectedService.service_id,
          custom_price: parseFloat(initialConfig.customPrice) || null,
          custom_duration_minutes: parseInt(initialConfig.customDuration) || null,
          additional_notes: initialConfig.notes || null,
          is_active: true
        })
      })

      if (!addServiceResponse.ok) {
        const errorData = await addServiceResponse.json()
        throw new Error(errorData.error || 'Failed to add service')
      }

      const serviceData = await addServiceResponse.json()

      // If custom pricing is set, also save the pricing configuration
      if (initialConfig.customPrice && parseFloat(initialConfig.customPrice) !== selectedService.base_price) {
        try {
          await fetch('/api/professionals/service-pricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              professional_service_id: serviceData.data.professional_service_id,
              custom_price: parseFloat(initialConfig.customPrice),
              custom_duration_minutes: parseInt(initialConfig.customDuration) || null,
              quantification_data: {
                professional_id: professionalId,
                service_id: selectedService.service_id,
                model: initialConfig.pricingModel,
                preferred_pricing_model: initialConfig.pricingModel,
                markup_percent: ((parseFloat(initialConfig.customPrice) / selectedService.base_price) - 1) * 100
              },
              notes: initialConfig.notes
            })
          })
        } catch (pricingError) {
          console.warn('Service added but pricing configuration failed:', pricingError)
        }
      }

      // Success
      if (onSuccess) {
        onSuccess(serviceData.data)
      }
      
      onClose()

    } catch (err) {
      console.error('Error adding service:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset to step 1
  const handleBackToSelection = () => {
    setStep(1)
    setSelectedService(null)
    setError('')
    setInitialConfig({
      customPrice: '',
      customDuration: '',
      pricingModel: 'auto',
      urgencyLevel: 'standard',
      marketDemand: 'normal',
      notes: ''
    })
  }

  const filteredServices = getFilteredServices()
  const categories = getCategories()

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className={`modal-dialog ${step === 2 ? 'modal-lg' : 'modal-xl'} modal-dialog-centered`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {step === 1 ? 'Add Service for Pricing' : 'Configure Initial Pricing'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <p className="text-muted mb-0">
                    Select a service to add to your pricing portfolio. You can configure advanced pricing after selection.
                  </p>
                  <span className="badge bg-primary text-white px-3 py-2">
                    <i className="fas fa-calculator me-2"></i>
                    QUANTIFICATION READY
                  </span>
                </div>

                {/* Search and Filter */}
                <div className="row mb-4">
                  <div className="col-md-8">
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control ps-5"
                        placeholder="Search services by name, description, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select 
                      className="form-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mb-3">
                  <small className="text-muted">
                    {filteredServices.length} of {availableServices.length - existingServices.length} available services
                  </small>
                </div>

                {/* Services Grid */}
                <div className="row g-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {filteredServices.length > 0 ? (
                    filteredServices.map(service => (
                      <div key={service.service_id} className="col-md-6 col-lg-4">
                        <div 
                          className="card h-100 border service-select-card"
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                          onClick={() => handleServiceSelect(service)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#5bbb7b'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(91, 187, 123, 0.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <div className="card-body p-3">
                            <h6 className="card-title fw-semibold mb-2 text-dark">{service.name}</h6>
                            
                            <div className="mb-2">
                              <span className="badge bg-primary-subtle text-primary px-2 py-1 small">
                                {service.portfolio?.vertical?.name || 'General'}
                              </span>
                            </div>
                            
                            <p className="card-text small text-muted mb-3" style={{ 
                              display: '-webkit-box', 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden' 
                            }}>
                              {service.description || 'No description available'}
                            </p>
                            
                            <div className="d-flex justify-content-between align-items-center mt-auto">
                              <div>
                                <div className="fw-bold text-success">
                                  J${(service.base_price || 0).toFixed(2)}
                                </div>
                                <small className="text-muted">Base Price</small>
                              </div>
                              
                              <div className="text-end">
                                {service.duration_minutes && (
                                  <div className="small text-muted">
                                    <i className="fas fa-clock me-1"></i>
                                    {service.duration_minutes} min
                                  </div>
                                )}
                                <div className="small">
                                  <span className={`badge ${
                                    service.pricing_model === 'monte_carlo' ? 'bg-warning text-dark' :
                                    service.pricing_model === 'black_scholes' ? 'bg-info' : 'bg-success'
                                  }`}>
                                    {service.pricing_model || 'quote'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="text-center py-5">
                        {availableServices.length === existingServices.length ? (
                          <>
                            <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                            <h6 className="text-muted">All Services Added</h6>
                            <p className="text-muted">
                              You've already added all available services to your pricing portfolio.
                            </p>
                          </>
                        ) : searchTerm || selectedCategory !== 'all' ? (
                          <>
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h6 className="text-muted">No Services Found</h6>
                            <p className="text-muted">
                              Try adjusting your search terms or category filter.
                            </p>
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                setSearchTerm('')
                                setSelectedCategory('all')
                              }}
                            >
                              Clear Filters
                            </button>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                            <h6 className="text-muted">No Services Available</h6>
                            <p className="text-muted">
                              No services are available to add. Please check your service catalog.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Initial Pricing Configuration */}
            {step === 2 && selectedService && (
              <>
                {/* Selected Service Header */}
                <div className="border rounded p-3 mb-4 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">{selectedService.name}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary-subtle text-primary">
                          {selectedService.portfolio?.vertical?.name || 'General'}
                        </span>
                        <small className="text-muted">
                          {selectedService.portfolio?.name || 'Services'}
                        </small>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleBackToSelection}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Change Service
                    </button>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Pricing Configuration Form */}
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-semibold mb-3">
                      <i className="fas fa-dollar-sign me-2 text-success"></i>
                      Pricing Configuration
                    </h6>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Custom Price (J$)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="Enter custom price"
                        value={initialConfig.customPrice}
                        onChange={(e) => setInitialConfig(prev => ({
                          ...prev,
                          customPrice: e.target.value
                        }))}
                      />
                      <div className="form-text">
                        Base price: J${(selectedService.base_price || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Custom Duration (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter duration"
                        value={initialConfig.customDuration}
                        onChange={(e) => setInitialConfig(prev => ({
                          ...prev,
                          customDuration: e.target.value
                        }))}
                      />
                      <div className="form-text">
                        Base duration: {selectedService.duration_minutes || 0} minutes
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Preferred Pricing Model</label>
                      <select
                        className="form-select"
                        value={initialConfig.pricingModel}
                        onChange={(e) => setInitialConfig(prev => ({
                          ...prev,
                          pricingModel: e.target.value
                        }))}
                      >
                        <option value="auto">Auto-Select (Recommended)</option>
                        <option value="quote">Quote Model</option>
                        <option value="black_scholes">Black-Scholes</option>
                        <option value="monte_carlo">Monte Carlo</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold mb-3">
                      <i className="fas fa-cog me-2 text-primary"></i>
                      Market Settings
                    </h6>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Default Urgency Level</label>
                      <select
                        className="form-select"
                        value={initialConfig.urgencyLevel}
                        onChange={(e) => setInitialConfig(prev => ({
                          ...prev,
                          urgencyLevel: e.target.value
                        }))}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="standard">Standard</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Market Demand</label>
                      <select
                        className="form-select"
                        value={initialConfig.marketDemand}
                        onChange={(e) => setInitialConfig(prev => ({
                          ...prev,
                          marketDemand: e.target.value
                        }))}
                      >
                        <option value="low">Low Demand</option>
                        <option value="normal">Normal</option>
                        <option value="high">High Demand</option>
                        <option value="peak">Peak Demand</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Add any special notes or considerations..."
                        value={initialConfig.notes}
                        onChange={(e) => setInitialConfig(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Price Comparison */}
                {initialConfig.customPrice && parseFloat(initialConfig.customPrice) > 0 && (
                  <div className="mt-4 p-3 bg-info-subtle rounded">
                    <h6 className="fw-semibold mb-2">
                      <i className="fas fa-chart-line me-2"></i>
                      Price Comparison
                    </h6>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="text-center">
                          <div className="h6 text-muted">Base Price</div>
                          <div className="h5 fw-bold">J${(selectedService.base_price || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center">
                          <div className="h6 text-success">Custom Price</div>
                          <div className="h5 fw-bold text-success">J${parseFloat(initialConfig.customPrice).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center">
                          <div className="h6">Difference</div>
                          <div className={`h5 fw-bold ${
                            parseFloat(initialConfig.customPrice) > (selectedService.base_price || 0) ? 'text-success' : 'text-danger'
                          }`}>
                            {parseFloat(initialConfig.customPrice) > (selectedService.base_price || 0) ? '+' : ''}
                            {(((parseFloat(initialConfig.customPrice) / (selectedService.base_price || 1)) - 1) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            {step === 1 ? (
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleBackToSelection}
                  disabled={isLoading}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Selection
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddService}
                  disabled={isLoading || !initialConfig.customPrice}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2"></div>
                      Adding Service...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-2"></i>
                      Add Service with Pricing
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .service-select-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}