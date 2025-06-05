// ServiceQuantificationInstance.jsx - Main Orchestrator Component

'use client'

import { useState, useEffect } from 'react'
import { useQuantificationManifold } from '@/hook/useQuantificationManifold'

// Import all child components
import ServiceTableInstance from './ServiceTableInstance'
import PricingConfigurationModal from './PricingConfigurationModal'

export default function ServiceQuantificationInstance({ 
  service, 
  onUpdate, 
  professionalId 
}) {
  // Modal and UI state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('parameters')
  const [notes, setNotes] = useState(service?.additional_notes || '')
  
  // Loading states
  const [availableUnits, setAvailableUnits] = useState([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  
  // Phase 3A: Enhanced loading states
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [optimisticUpdate, setOptimisticUpdate] = useState(null)
  const [rollbackData, setRollbackData] = useState(null)
  const [savingProgress, setSavingProgress] = useState(0)

  // Design system constants
  const spacing = {
    xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '24px'
  }
  
  const typography = {
    tableHeader: '13px',
    primaryText: '15px',
    secondaryText: '13px',
    caption: '12px',
    micro: '11px',
    small: '12px'
  }

  const colors = {
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      muted: '#9ca3af'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      muted: '#f3f4f6'
    },
    border: {
      subtle: '#f3f4f6',
      default: '#e5e7eb',
      emphasis: '#d1d5db'
    },
    interactive: {
      primary: '#3b82f6',
      hover: '#2563eb',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    }
  }

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

  // PHASE 3A: Enhanced loading progress simulation
  useEffect(() => {
    if (isSaving) {
      setSavingProgress(0)
      const progressInterval = setInterval(() => {
        setSavingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 20
        })
      }, 150)

      return () => clearInterval(progressInterval)
    }
  }, [isSaving])

  // Hybrid pricing implementation
  const getEffectiveBasePrice = (serviceData) => {
    if (!serviceData) return 50
    return serviceData.service?.quant?.base_price_mean ||
           serviceData.service?.base_price ||
           serviceData.effective_base_price ||
           50
  }

  // Better valuation unit display logic
  const getDisplayedValuationUnit = () => {
    // Use optimistic update if available
    if (optimisticUpdate?.custom_valuation_unit) {
      return optimisticUpdate.custom_valuation_unit
    }

    // Priority: custom_valuation_unit -> service.valuation_unit -> fallback
    if (service?.custom_valuation_unit) {
      return service.custom_valuation_unit
    }
    
    if (service?.service?.valuation_unit) {
      return service.service.valuation_unit
    }
    
    // Find from available units if we have a custom_valuation_unit_id
    if (service?.custom_valuation_unit_id && availableUnits.length > 0) {
      const foundUnit = availableUnits.find(unit => unit.unit_id === service.custom_valuation_unit_id)
      if (foundUnit) return foundUnit
    }
    
    // Find from available units if we have a service valuation_unit_id
    if (service?.service?.valuation_unit_id && availableUnits.length > 0) {
      const foundUnit = availableUnits.find(unit => unit.unit_id === service.service.valuation_unit_id)
      if (foundUnit) return foundUnit
    }
    
    // Fallback
    return { display_name: 'flat rate', unit_code: 'fixed' }
  }

  // Set service when component mounts or service changes
  useEffect(() => {
    if (service?.service) {
      const effectivePrice = getEffectiveBasePrice(service)
      const serviceWithPrice = {
        ...service.service,
        base_price: effectivePrice
      }
      setService(serviceWithPrice)
    }
  }, [service, setService])

  // Fetch available valuation units with enhanced loading
  useEffect(() => {
    const fetchValuationUnits = async () => {
      console.log('🔄 Fetching valuation units...')
      setLoadingUnits(true)
      
      try {
        const response = await fetch('/api/valuation-units')
        console.log('📡 Valuation units response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Valuation units data:', data)
          setAvailableUnits(data.units || [])
        } else {
          const errorData = await response.json()
          console.error('❌ Valuation units API error:', errorData)
          throw new Error(errorData.error || 'Failed to fetch units')
        }
      } catch (error) {
        console.error('❌ Error fetching valuation units:', error)
        console.log('🔄 Using fallback units...')
        // Fallback with proper UUID structure
        setAvailableUnits([
          { unit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', unit_code: 'fixed', display_name: 'Flat Rate', category: 'fixed', description: 'One-time fixed price' },
          { unit_id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', unit_code: 'hour', display_name: 'Per Hour', category: 'time', description: 'Hourly rate pricing' },
          { unit_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234', unit_code: 'square_foot', display_name: 'Per Square Foot', category: 'area', description: 'Price per square foot' },
          { unit_id: 'd4e5f6g7-h8i9-0123-defg-456789012345', unit_code: 'linear_foot', display_name: 'Per Linear Foot', category: 'area', description: 'Price per linear foot' },
          { unit_id: 'e5f6g7h8-i9j0-1234-efgh-567890123456', unit_code: 'fixture', display_name: 'Per Fixture', category: 'count', description: 'Price per fixture' },
          { unit_id: 'f6g7h8i9-j0k1-2345-fghi-678901234567', unit_code: 'per_item', display_name: 'Per Item', category: 'count', description: 'Price per individual item' },
          { unit_id: 'g7h8i9j0-k1l2-3456-ghij-789012345678', unit_code: 'room', display_name: 'Per Room', category: 'count', description: 'Price per room' },
          { unit_id: 'h8i9j0k1-l2m3-4567-hijk-890123456789', unit_code: 'outlet', display_name: 'Per Outlet', category: 'count', description: 'Price per electrical outlet' }
        ])
      } finally {
        setLoadingUnits(false)
        console.log('🏁 Valuation units loading complete')
      }
    }

    fetchValuationUnits()
  }, [])

  // Update notes when service prop changes
  useEffect(() => {
    setNotes(service?.additional_notes || '')
  }, [service?.additional_notes])

  // Initialize config with current valuation unit
  useEffect(() => {
    if (availableUnits.length > 0) {
      const currentUnitId = service?.custom_valuation_unit_id || service?.service?.valuation_unit_id
      if (currentUnitId && !config.valuationUnitId) {
        updateConfig({ valuationUnitId: currentUnitId })
      }
    }
  }, [availableUnits, service, config.valuationUnitId, updateConfig])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  // Service category detection
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

  // Helper function to get the correct unit UUID
  const getValidationUnitId = () => {
    // If config has a valuationUnitId, find the corresponding unit
    if (config.valuationUnitId) {
      const selectedUnit = availableUnits.find(unit => 
        unit.unit_id === config.valuationUnitId || 
        unit.unit_code === config.valuationUnitId
      )
      if (selectedUnit) {
        return selectedUnit.unit_id
      }
    }
    
    // Fall back to service defaults
    return service?.custom_valuation_unit_id || 
           service?.service?.valuation_unit_id || 
           null
  }

  // PHASE 3A: Enhanced rollback function
  const rollbackOptimisticUpdate = () => {
    if (rollbackData) {
      setOptimisticUpdate(null)
      if (onUpdate) {
        onUpdate(rollbackData)
      }
      setRollbackData(null)
      setSaveMessage('Changes rolled back')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  // Improved form styles
  const formStyles = {
    input: {
      className: "form-control bg-transparent",
      style: {
        borderWidth: '1px',
        borderColor: colors.border.default,
        borderRadius: '6px',
        padding: `${spacing.sm} ${spacing.md}`,
        fontSize: typography.secondaryText,
        boxShadow: 'none',
        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
      }
    },
    select: {
      className: "form-select bg-transparent",
      style: {
        borderWidth: '1px',
        borderColor: colors.border.default,
        borderRadius: '6px',
        padding: `${spacing.sm} ${spacing.md}`,
        fontSize: typography.secondaryText,
        boxShadow: 'none'
      }
    },
    label: {
      className: "form-label fw-medium mb-1",
      style: {
        fontSize: typography.caption,
        color: colors.text.secondary
      }
    }
  }

  // PHASE 3A: Enhanced handle saving pricing with optimistic updates
  const handleSavePricing = async () => {
    if (!quantificationResult || !service?.professional_service_id) {
      setSaveMessage('No pricing data to save')
      return
    }

    // Store rollback data
    setRollbackData({ ...service })

    // Get the correct UUID for the valuation unit
    const validationUnitId = getValidationUnitId()
    const selectedUnit = availableUnits.find(u => u.unit_id === validationUnitId)

    // PHASE 3A: Optimistic update
    const optimisticData = {
      ...service,
      custom_price: quantificationResult.recommendedPrice,
      custom_duration_minutes: quantificationResult.tradeCalculations?.totalDuration || service.service?.duration_minutes,
      custom_valuation_unit_id: validationUnitId,
      custom_valuation_unit: selectedUnit,
      additional_notes: notes
    }

    setOptimisticUpdate(optimisticData)
    setIsSaving(true)
    setSaveMessage('')
    setSavingProgress(0)

    // Immediately update parent with optimistic data
    if (onUpdate) {
      onUpdate(optimisticData)
    }

    try {
      const payload = {
        professional_service_id: service.professional_service_id,
        custom_price: quantificationResult.recommendedPrice,
        custom_duration_minutes: quantificationResult.tradeCalculations?.totalDuration || service.service?.duration_minutes,
        custom_valuation_unit_id: validationUnitId,
        quantification_data: {
          professional_id: professionalId,
          service_id: service.service_id,
          model: quantificationResult.model,
          attributes,
          config,
          marketConditions,
          volatility: quantificationResult.marketConditions?.adjustedVolatility,
          urgency_drift: quantificationResult.marketConditions?.priceMultiplier,
          markup_percent: ((quantificationResult.recommendedPrice / (service.service?.base_price || 1)) - 1) * 100,
          valuation_unit_id: validationUnitId
        },
        notes: notes
      }

      const response = await fetch('/api/professionals/service-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        // Complete the progress
        setSavingProgress(100)
        
        // Create the final updated service object
        const finalUpdatedData = {
          ...service,
          ...data.data,
          custom_valuation_unit_id: validationUnitId,
          custom_valuation_unit: selectedUnit
        }
        
        setSaveMessage('Pricing saved successfully!')
        setOptimisticUpdate(null)
        setRollbackData(null)
        
        // Update parent with final data
        if (onUpdate) {
          onUpdate(finalUpdatedData)
        }
        
        setTimeout(() => {
          setSaveMessage('')
          setIsModalOpen(false)
        }, 2000)
      } else {
        throw new Error(data.error || 'Failed to save pricing')
      }
    } catch (error) {
      console.error('❌ Error saving pricing:', error)
      
      // PHASE 3A: Rollback on error
      rollbackOptimisticUpdate()
      setSaveMessage(`Error: ${error.message}`)
    } finally {
      setIsSaving(false)
      setSavingProgress(0)
    }
  }

  // Price calculations (with optimistic updates)
  const getCurrentPrice = () => {
    if (optimisticUpdate?.custom_price) return optimisticUpdate.custom_price
    
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

  // Get the displayed valuation unit for the table
  const displayedUnit = getDisplayedValuationUnit()
  const serviceCategory = getServiceCategory()

  return (
    <>
      {/* Service Table Row */}
      <ServiceTableInstance
        service={service}
        displayedUnit={displayedUnit}
        optimisticUpdate={optimisticUpdate}
        isSaving={isSaving}
        onConfigureClick={() => setIsModalOpen(true)}
        spacing={spacing}
        typography={typography}
        colors={colors}
      />

      {/* Pricing Configuration Modal */}
      <PricingConfigurationModal
        // Modal state
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        
        // Core data
        service={service}
        displayedUnit={displayedUnit}
        serviceCategory={serviceCategory}
        
        // Pricing result and calculation
        quantificationResult={quantificationResult}
        isCalculating={isCalculating}
        quantError={quantError}
        formatPrice={formatPrice}
        getRecommendedPrice={getRecommendedPrice}
        getPriceChange={getPriceChange}
        performCalculation={performCalculation}
        hasValidService={hasValidService}
        
        // Form state and handlers
        attributes={attributes}
        updateAttribute={updateAttribute}
        config={config}
        marketConditions={marketConditions}
        updateConfig={updateConfig}
        updateMarketConditions={updateMarketConditions}
        notes={notes}
        setNotes={setNotes}
        
        // Available units
        availableUnits={availableUnits}
        loadingUnits={loadingUnits}
        
        // Tab management
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        
        // Save functionality
        handleSavePricing={handleSavePricing}
        isSaving={isSaving}
        saveMessage={saveMessage}
        savingProgress={savingProgress}
        
        // Optimistic updates
        optimisticUpdate={optimisticUpdate}
        rollbackData={rollbackData}
        rollbackOptimisticUpdate={rollbackOptimisticUpdate}
        
        // Styling
        formStyles={formStyles}
        spacing={spacing}
        typography={typography}
        colors={colors}
      />
    </>
  )
}