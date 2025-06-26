// src/hook/useQuantificationManifold.js

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import {
  calculateQuantification,
  monteCarloCalculator,
  blackScholesCalculator,
  quoteCalculator,
  plumbingCalculations,
  weldingCalculations,
  calculateMarketVolatility
} from '@/utils/quantification/quantificationAlgorithms'

/**
 * useQuantificationManifold Hook
 * Provides a complete interface for service quantification calculations
 * Integrates sophisticated algorithms with React state management
 */
const useQuantificationManifold = ({
  initialService = null,
  autoCalculate = true,
  cacheResults = true,
  debugMode = false
}) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  const [service, setService] = useState(initialService)
  const [attributes, setAttributes] = useState({})
  const [quantificationResult, setQuantificationResult] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [marketConditions, setMarketConditions] = useState({
    marketDemand: 'normal',
    competitorDensity: 'medium',
    economicIndicator: 'stable',
    timeOfDay: 'business',
    seasonalFactor: 1.0
  })
  
  // Configuration state
  const [config, setConfig] = useState({
    pricingModel: 'auto', // 'auto', 'monte_carlo', 'black_scholes', 'quote'
    urgencyLevel: 'standard',
    customParameters: {},
    confidenceLevel: 0.95,
    simulations: 10000
  })
  
  // Cache for results
  const cacheRef = useRef(new Map())
  const lastCalculationRef = useRef(null)
  
  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  
  const generateCacheKey = useCallback((service, attributes, config, marketConditions) => {
    return JSON.stringify({
      serviceId: service?.service_id,
      attributes: Object.keys(attributes).sort().reduce((sorted, key) => {
        sorted[key] = attributes[key]
        return sorted
      }, {}),
      config,
      marketConditions
    })
  }, [])
  
  const logDebug = useCallback((message, data = null) => {
    if (debugMode) {
      console.log(`🔧 Quantification Manifold: ${message}`, data || '')
    }
  }, [debugMode])
  
  // ==========================================
  // CORE CALCULATION FUNCTIONS
  // ==========================================
  
  const performCalculation = useCallback(async (
    targetService = service,
    targetAttributes = attributes,
    targetConfig = config,
    targetMarketConditions = marketConditions
  ) => {
    if (!targetService) {
      setError('No service selected for quantification')
      return null
    }
    
    logDebug('Starting quantification calculation', {
      service: targetService?.name,
      model: targetConfig.pricingModel
    })
    
    setIsCalculating(true)
    setError(null)
    
    try {
      // Check cache first
      if (cacheResults) {
        const cacheKey = generateCacheKey(targetService, targetAttributes, targetConfig, targetMarketConditions)
        if (cacheRef.current.has(cacheKey)) {
          const cachedResult = cacheRef.current.get(cacheKey)
          logDebug('Using cached result', { cacheKey: cacheKey.substring(0, 50) + '...' })
          setQuantificationResult(cachedResult)
          setIsCalculating(false)
          return cachedResult
        }
      }
      
      // Auto-determine pricing model if set to 'auto'
      let effectivePricingModel = targetConfig.pricingModel
      if (effectivePricingModel === 'auto') {
        // Determine model based on service characteristics
        const basePrice = parseFloat(targetService.base_price || 0)
        const hasComplexAttributes = Object.keys(targetAttributes).length > 3
        const isEmergency = targetConfig.urgencyLevel === 'emergency'
        
        if (isEmergency || hasComplexAttributes || basePrice > 500) {
          effectivePricingModel = 'monte_carlo'
        } else if (targetService.duration_minutes > 240) { // >4 hours
          effectivePricingModel = 'black_scholes'
        } else {
          effectivePricingModel = 'quote'
        }
        
        logDebug('Auto-selected pricing model', { 
          model: effectivePricingModel,
          factors: { basePrice, hasComplexAttributes, isEmergency }
        })
      }
      
      // Prepare calculation parameters
      const calculationParams = {
        service: {
          ...targetService,
          pricing_model: effectivePricingModel
        },
        attributes: targetAttributes,
        urgencyLevel: targetConfig.urgencyLevel,
        customParameters: {
          ...targetConfig.customParameters,
          confidenceLevel: targetConfig.confidenceLevel,
          simulations: targetConfig.simulations
        },
        marketConditions: targetMarketConditions
      }
      
      // Perform the calculation
      const result = await calculateQuantification(calculationParams)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Enhance result with additional metadata
      const enhancedResult = {
        ...result,
        calculatedAt: new Date().toISOString(),
        effectivePricingModel,
        inputHash: generateCacheKey(targetService, targetAttributes, targetConfig, targetMarketConditions),
        performance: {
          cacheHit: false,
          calculationTime: Date.now() - lastCalculationRef.current
        }
      }
      
      // Cache the result
      if (cacheResults) {
        const cacheKey = generateCacheKey(targetService, targetAttributes, targetConfig, targetMarketConditions)
        cacheRef.current.set(cacheKey, enhancedResult)
        
        // Limit cache size
        if (cacheRef.current.size > 100) {
          const firstKey = cacheRef.current.keys().next().value
          cacheRef.current.delete(firstKey)
        }
      }
      
      // Update state
      setQuantificationResult(enhancedResult)
      
      // Add to history
      setHistory(prev => [{
        timestamp: new Date().toISOString(),
        service: targetService.name,
        model: effectivePricingModel,
        price: enhancedResult.recommendedPrice,
        attributes: Object.keys(targetAttributes).length
      }, ...prev.slice(0, 19)]) // Keep last 20 calculations
      
      logDebug('Calculation completed successfully', {
        model: effectivePricingModel,
        price: enhancedResult.recommendedPrice,
        duration: enhancedResult.performance?.calculationTime
      })
      
      return enhancedResult
      
    } catch (err) {
      const errorMessage = err.message || 'Quantification calculation failed'
      setError(errorMessage)
      logDebug('Calculation error', { error: errorMessage })
      toast.error(`Quantification failed: ${errorMessage}`)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [service, attributes, config, marketConditions, cacheResults, generateCacheKey, logDebug])
  
  // ==========================================
  // SPECIFIC CALCULATION METHODS
  // ==========================================
  
  const calculateMonteCarlo = useCallback(async (customParams = {}) => {
    if (!service) return null
    
    try {
      const params = {
        basePrice: parseFloat(service.base_price),
        urgencyMultiplier: config.urgencyLevel === 'emergency' ? 2.0 : 
                          config.urgencyLevel === 'urgent' ? 1.5 : 1.0,
        simulations: config.simulations,
        confidenceLevel: config.confidenceLevel,
        ...customParams
      }
      
      return monteCarloCalculator(params)
    } catch (error) {
      logDebug('Monte Carlo calculation error', error)
      return null
    }
  }, [service, config, logDebug])
  
  const calculateBlackScholes = useCallback(async (customParams = {}) => {
    if (!service) return null
    
    try {
      const params = {
        basePrice: parseFloat(service.base_price),
        timeToCompletion: (service.duration_minutes || 60) / (60 * 24), // Convert to days
        urgencyPremium: config.urgencyLevel === 'emergency' ? service.base_price * 0.5 : 0,
        ...customParams
      }
      
      return blackScholesCalculator(params)
    } catch (error) {
      logDebug('Black-Scholes calculation error', error)
      return null
    }
  }, [service, config, logDebug])
  
  const calculateQuote = useCallback(async (customParams = {}) => {
    if (!service) return null
    
    try {
      const params = {
        basePrice: parseFloat(service.base_price),
        serviceDuration: service.duration_minutes || 60,
        urgencyLevel: config.urgencyLevel,
        ...customParams
      }
      
      return quoteCalculator(params)
    } catch (error) {
      logDebug('Quote calculation error', error)
      return null
    }
  }, [service, config, logDebug])
  
  // ==========================================
  // TRADE-SPECIFIC CALCULATIONS
  // ==========================================
  
  const calculateTradeSpecific = useCallback(async () => {
    if (!service || !attributes) return null
    
    const verticalName = service.portfolio?.vertical?.name?.toLowerCase() || ''
    
    try {
      if (verticalName.includes('plumb')) {
        return plumbingCalculations(attributes)
      } else if (verticalName.includes('weld')) {
        return weldingCalculations(attributes)
      }
      return null
    } catch (error) {
      logDebug('Trade-specific calculation error', error)
      return null
    }
  }, [service, attributes, logDebug])
  
  // ==========================================
  // ATTRIBUTE MANAGEMENT
  // ==========================================
  
  const updateAttribute = useCallback((key, value) => {
    setAttributes(prev => {
      const updated = { ...prev, [key]: value }
      logDebug('Attribute updated', { key, value })
      return updated
    })
  }, [logDebug])
  
  const updateAttributes = useCallback((newAttributes) => {
    setAttributes(prev => {
      const updated = { ...prev, ...newAttributes }
      logDebug('Multiple attributes updated', newAttributes)
      return updated
    })
  }, [logDebug])
  
  const clearAttributes = useCallback(() => {
    setAttributes({})
    logDebug('Attributes cleared')
  }, [logDebug])
  
  // ==========================================
  // CONFIGURATION MANAGEMENT
  // ==========================================
  
  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig }
      logDebug('Configuration updated', newConfig)
      return updated
    })
  }, [logDebug])
  
  const updateMarketConditions = useCallback((newConditions) => {
    setMarketConditions(prev => {
      const updated = { ...prev, ...newConditions }
      logDebug('Market conditions updated', newConditions)
      return updated
    })
  }, [logDebug])
  
  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================
  
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
    logDebug('Cache cleared')
    toast.success('Calculation cache cleared')
  }, [logDebug])
  
  const getCacheStats = useCallback(() => {
    return {
      size: cacheRef.current.size,
      maxSize: 100,
      utilizationRate: (cacheRef.current.size / 100) * 100
    }
  }, [])
  
  // ==========================================
  // AUTO-CALCULATION EFFECT
  // ==========================================
  
  useEffect(() => {
    if (autoCalculate && service && Object.keys(attributes).length > 0) {
      lastCalculationRef.current = Date.now()
      performCalculation()
    }
  }, [service, attributes, config, marketConditions, autoCalculate, performCalculation])
  
  // ==========================================
  // COMPARISON UTILITIES
  // ==========================================
  
  const compareModels = useCallback(async () => {
    if (!service) return null
    
    setIsCalculating(true)
    
    try {
      const [monteCarloResult, blackScholesResult, quoteResult] = await Promise.all([
        calculateMonteCarlo(),
        calculateBlackScholes(),
        calculateQuote()
      ])
      
      const comparison = {
        monteCarlo: {
          price: monteCarloResult?.recommendedPrice || 0,
          range: monteCarloResult?.priceRange || null,
          risk: monteCarloResult?.statistics?.riskScore || 0
        },
        blackScholes: {
          price: blackScholesResult?.recommendedPrice || 0,
          components: blackScholesResult?.priceComponents || null,
          greeks: blackScholesResult?.riskMetrics || null
        },
        quote: {
          price: quoteResult?.recommendedPrice || 0,
          breakdown: quoteResult?.priceBreakdown || null,
          margin: quoteResult?.margins?.totalMargin || 0
        },
        recommendation: null
      }
      
      // Determine recommendation
      const prices = [
        comparison.monteCarlo.price,
        comparison.blackScholes.price,
        comparison.quote.price
      ].filter(p => p > 0)
      
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length
      const stdDev = Math.sqrt(variance)
      
      if (stdDev / avgPrice > 0.15) { // High variance
        comparison.recommendation = 'monte_carlo'
      } else if (service.duration_minutes > 240) {
        comparison.recommendation = 'black_scholes'
      } else {
        comparison.recommendation = 'quote'
      }
      
      logDebug('Model comparison completed', comparison)
      return comparison
      
    } catch (error) {
      logDebug('Model comparison error', error)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [service, calculateMonteCarlo, calculateBlackScholes, calculateQuote, logDebug])
  
  // ==========================================
  // RETURN HOOK INTERFACE
  // ==========================================
  
  return {
    // State
    service,
    attributes,
    quantificationResult,
    isCalculating,
    error,
    history,
    config,
    marketConditions,
    
    // Core functions
    setService,
    performCalculation,
    
    // Specific calculations
    calculateMonteCarlo,
    calculateBlackScholes,
    calculateQuote,
    calculateTradeSpecific,
    compareModels,
    
    // Attribute management
    updateAttribute,
    updateAttributes,
    clearAttributes,
    
    // Configuration
    updateConfig,
    updateMarketConditions,
    
    // Cache management
    clearCache,
    getCacheStats,
    
    // Utilities
    hasValidService: !!service,
    hasAttributes: Object.keys(attributes).length > 0,
    isReady: !!service && Object.keys(attributes).length > 0,
    
    // Getters
    getRecommendedPrice: () => quantificationResult?.recommendedPrice || 0,
    getPriceRange: () => quantificationResult?.priceRange || null,
    getModel: () => quantificationResult?.model || 'unknown',
    getCalculationTime: () => quantificationResult?.performance?.calculationTime || 0,
    
    // Price utilities
    formatPrice: (price) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0),
    
    // Debug utilities
    enableDebug: () => updateConfig({ debugMode: true }),
    disableDebug: () => updateConfig({ debugMode: false }),
    getDebugInfo: () => ({
      cacheStats: getCacheStats(),
      lastCalculation: lastCalculationRef.current,
      historyLength: history.length,
      hasError: !!error
    })
  }
}

// Export as both named and default export for maximum compatibility
export { useQuantificationManifold }
export default useQuantificationManifold