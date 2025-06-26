// src/utils/quantification/quantificationAlgorithms.js

/**
 * Maven Republic Quantification Algorithms
 * Sophisticated pricing calculations using financial mathematics
 * More advanced than TaskRabbit, Thumbtack, or any competitor
 */

// ==========================================
// CORE PRICING MODELS
// ==========================================

/**
 * Monte Carlo Pricing Calculator
 * Used for high-uncertainty services (emergency repairs, complex projects)
 * Simulates thousands of possible outcomes to determine fair pricing
 */
export const monteCarloCalculator = ({
  basePrice,
  volatility = 0.20,        // Default 20% volatility
  urgencyMultiplier = 1.0,  // 1.0 = normal, 1.5 = urgent, 2.0 = emergency
  materialFactor = 1.0,     // Material cost multiplier
  complexityFactor = 1.0,   // Service complexity multiplier
  simulations = 10000,      // Number of Monte Carlo simulations
  confidenceLevel = 0.95    // 95% confidence interval
}) => {
  try {
    if (!basePrice || basePrice <= 0) {
      throw new Error('Base price must be positive')
    }

    const results = []
    const dt = 1 / 252 // Daily time step (252 trading days per year)
    
    // Run Monte Carlo simulations
    for (let i = 0; i < simulations; i++) {
      let price = basePrice
      
      // Apply random walk with volatility
      const randomShock = Math.random() * 2 - 1 // Random between -1 and 1
      const priceMovement = volatility * randomShock * Math.sqrt(dt)
      price *= Math.exp(priceMovement)
      
      // Apply service-specific factors
      price *= urgencyMultiplier * materialFactor * complexityFactor
      
      // Add labor variability (10% standard deviation)
      const laborVariability = 1 + (Math.random() * 0.2 - 0.1)
      price *= laborVariability
      
      results.push(Math.max(price, basePrice * 0.5)) // Floor at 50% of base
    }
    
    // Calculate statistics
    results.sort((a, b) => a - b)
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length
    const median = results[Math.floor(results.length / 2)]
    
    // Confidence intervals
    const lowerIndex = Math.floor((1 - confidenceLevel) / 2 * results.length)
    const upperIndex = Math.floor((1 + confidenceLevel) / 2 * results.length)
    const lowerBound = results[lowerIndex]
    const upperBound = results[upperIndex]
    
    // Risk metrics
    const standardDeviation = Math.sqrt(
      results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length
    )
    
    return {
      model: 'monte_carlo',
      recommendedPrice: median, // Use median as it's more robust
      priceRange: {
        min: lowerBound,
        max: upperBound,
        confidence: confidenceLevel
      },
      statistics: {
        mean,
        median,
        standardDeviation,
        volatility: standardDeviation / mean,
        riskScore: standardDeviation / basePrice
      },
      factors: {
        basePrice,
        urgencyMultiplier,
        materialFactor,
        complexityFactor,
        finalMultiplier: median / basePrice
      },
      metadata: {
        simulations,
        timestamp: new Date().toISOString(),
        currency: 'USD'
      }
    }
  } catch (error) {
    console.error('Monte Carlo calculation error:', error)
    return {
      model: 'monte_carlo',
      error: error.message,
      fallbackPrice: basePrice * urgencyMultiplier * materialFactor * complexityFactor
    }
  }
}

/**
 * Black-Scholes Pricing Calculator
 * Used for services with predictable timelines and known parameters
 * Adapted from options pricing theory for service pricing
 */
export const blackScholesCalculator = ({
  basePrice,
  timeToCompletion = 7,     // Days until service completion
  volatility = 0.15,        // Lower volatility for predictable services
  riskFreeRate = 0.05,      // 5% annual risk-free rate
  urgencyPremium = 0,       // Additional premium for urgency
  materialCosts = 0,        // Direct material costs
  complexityAdjustment = 1.0 // Complexity multiplier
}) => {
  try {
    if (!basePrice || basePrice <= 0) {
      throw new Error('Base price must be positive')
    }
    
    // Convert time to years
    const timeInYears = timeToCompletion / 365
    
    // Black-Scholes calculations adapted for services
    const d1 = (Math.log(basePrice / basePrice) + (riskFreeRate + 0.5 * volatility ** 2) * timeInYears) /
               (volatility * Math.sqrt(timeInYears))
    const d2 = d1 - volatility * Math.sqrt(timeInYears)
    
    // Cumulative standard normal distribution approximation
    const cumulativeStandardNormal = (x) => {
      return 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp(-2 * x ** 2 / Math.PI)))
    }
    
    const N_d1 = cumulativeStandardNormal(d1)
    const N_d2 = cumulativeStandardNormal(d2)
    
    // Service option value (theoretical price adjustment)
    const optionValue = basePrice * N_d1 - basePrice * Math.exp(-riskFreeRate * timeInYears) * N_d2
    
    // Calculate final price
    const timeDecay = Math.exp(-riskFreeRate * timeInYears)
    const volatilityPremium = basePrice * volatility * Math.sqrt(timeInYears) * 0.5
    
    let finalPrice = basePrice + optionValue + volatilityPremium + urgencyPremium + materialCosts
    finalPrice *= complexityAdjustment
    
    // Greeks calculation (risk sensitivities)
    const delta = N_d1 // Price sensitivity to base price changes
    const gamma = Math.exp(d1 ** 2 / 2) / (basePrice * volatility * Math.sqrt(2 * Math.PI * timeInYears))
    const theta = -(basePrice * Math.exp(d1 ** 2 / 2) * volatility) / (2 * Math.sqrt(2 * Math.PI * timeInYears)) -
                  riskFreeRate * basePrice * Math.exp(-riskFreeRate * timeInYears) * N_d2
    const vega = basePrice * Math.sqrt(timeInYears) * Math.exp(d1 ** 2 / 2) / Math.sqrt(2 * Math.PI)
    
    return {
      model: 'black_scholes',
      recommendedPrice: Math.max(finalPrice, basePrice * 0.8), // Floor at 80% of base
      priceComponents: {
        basePrice,
        optionValue,
        volatilityPremium,
        urgencyPremium,
        materialCosts,
        complexityAdjustment
      },
      riskMetrics: {
        delta: delta.toFixed(4),
        gamma: gamma.toFixed(6),
        theta: theta.toFixed(4),
        vega: vega.toFixed(4),
        impliedVolatility: volatility
      },
      timeFactors: {
        timeToCompletion,
        timeDecay,
        annualizedTime: timeInYears
      },
      metadata: {
        riskFreeRate,
        timestamp: new Date().toISOString(),
        currency: 'USD'
      }
    }
  } catch (error) {
    console.error('Black-Scholes calculation error:', error)
    return {
      model: 'black_scholes',
      error: error.message,
      fallbackPrice: basePrice * complexityAdjustment + materialCosts + urgencyPremium
    }
  }
}

/**
 * Simple Quote Calculator
 * Used for straightforward services with fixed pricing
 * Fast and reliable for standard service offerings
 */
export const quoteCalculator = ({
  basePrice,
  serviceDuration = 60,     // Duration in minutes
  urgencyLevel = 'standard', // 'standard', 'urgent', 'emergency'
  materialCosts = 0,        // Direct material costs
  laborRate = 50,           // Hourly labor rate
  overheadMultiplier = 1.15, // 15% overhead
  profitMargin = 0.20,      // 20% profit margin
  customAdjustments = {}    // Custom price adjustments
}) => {
  try {
    if (!basePrice || basePrice <= 0) {
      throw new Error('Base price must be positive')
    }
    
    // Urgency multipliers
    const urgencyMultipliers = {
      'standard': 1.0,
      'urgent': 1.5,
      'emergency': 2.0,
      'scheduled': 0.9  // Discount for scheduled services
    }
    
    const urgencyMultiplier = urgencyMultipliers[urgencyLevel] || 1.0
    
    // Calculate labor cost based on duration
    const laborCost = (serviceDuration / 60) * laborRate
    
    // Base calculation
    let calculatedPrice = Math.max(basePrice, laborCost)
    
    // Add material costs
    calculatedPrice += materialCosts
    
    // Apply overhead
    calculatedPrice *= overheadMultiplier
    
    // Apply urgency multiplier
    calculatedPrice *= urgencyMultiplier
    
    // Apply profit margin
    const priceBeforeProfit = calculatedPrice
    calculatedPrice *= (1 + profitMargin)
    
    // Apply custom adjustments
    Object.entries(customAdjustments).forEach(([key, value]) => {
      if (typeof value === 'number') {
        calculatedPrice += value
      }
    })
    
    // Round to nearest $5 for cleaner pricing
    const roundedPrice = Math.ceil(calculatedPrice / 5) * 5
    
    return {
      model: 'quote',
      recommendedPrice: roundedPrice,
      priceBreakdown: {
        basePrice,
        laborCost: laborCost.toFixed(2),
        materialCosts,
        overhead: (priceBeforeProfit * (overheadMultiplier - 1)).toFixed(2),
        urgencyAdjustment: (priceBeforeProfit * (urgencyMultiplier - 1)).toFixed(2),
        profit: (priceBeforeProfit * profitMargin).toFixed(2),
        customAdjustments
      },
      serviceDetails: {
        duration: serviceDuration,
        urgencyLevel,
        laborRate,
        effectiveHourlyRate: (roundedPrice / (serviceDuration / 60)).toFixed(2)
      },
      margins: {
        overheadMultiplier,
        profitMargin,
        totalMargin: ((roundedPrice - basePrice - materialCosts) / roundedPrice).toFixed(3)
      },
      metadata: {
        timestamp: new Date().toISOString(),
        currency: 'USD'
      }
    }
  } catch (error) {
    console.error('Quote calculation error:', error)
    return {
      model: 'quote',
      error: error.message,
      fallbackPrice: basePrice + materialCosts
    }
  }
}

// ==========================================
// TRADE-SPECIFIC CALCULATIONS
// ==========================================

/**
 * Plumbing-Specific Calculations
 * Handles pipe sizing, pressure calculations, material costs
 */
export const plumbingCalculations = ({
  serviceType,
  pipeDiameter,     // in inches
  pipeLength,       // in feet
  pipeMaterial = 'copper',
  pressureRating = 'standard',
  accessibility = 'standard',
  emergencyFactor = false
}) => {
  try {
    // Material cost per foot (approximate market rates)
    const materialCosts = {
      copper: { 0.5: 3.50, 0.75: 4.20, 1: 5.80, 1.25: 7.40, 1.5: 9.20, 2: 14.50 },
      pvc: { 0.5: 0.85, 0.75: 1.20, 1: 1.65, 1.25: 2.40, 1.5: 3.20, 2: 4.80 },
      pex: { 0.5: 1.20, 0.75: 1.50, 1: 2.10, 1.25: 2.80, 1.5: 3.60, 2: 5.40 }
    }
    
    // Labor complexity multipliers
    const accessibilityMultipliers = {
      'easy': 0.8,
      'standard': 1.0,
      'difficult': 1.4,
      'crawlspace': 1.6,
      'basement': 1.3,
      'wallaccess': 1.8
    }
    
    const pressureMultipliers = {
      'standard': 1.0,
      'high': 1.25,
      'commercial': 1.5
    }
    
    // Calculate material cost
    const costPerFoot = materialCosts[pipeMaterial]?.[pipeDiameter] || 5.0
    const materialCost = costPerFoot * pipeLength
    
    // Calculate labor multiplier
    let laborMultiplier = accessibilityMultipliers[accessibility] || 1.0
    laborMultiplier *= pressureMultipliers[pressureRating] || 1.0
    
    if (emergencyFactor) {
      laborMultiplier *= 1.8 // Emergency surcharge
    }
    
    // Base labor time (minutes per foot)
    const baseTimePerFoot = pipeDiameter <= 1 ? 15 : pipeDiameter <= 1.5 ? 20 : 30
    const totalLaborMinutes = baseTimePerFoot * pipeLength * laborMultiplier
    
    return {
      materialCost: Math.round(materialCost * 100) / 100,
      laborMultiplier: Math.round(laborMultiplier * 100) / 100,
      estimatedDuration: Math.ceil(totalLaborMinutes),
      complexity: {
        pipeDiameter,
        pipeLength,
        pipeMaterial,
        accessibility,
        pressureRating
      },
      costFactors: {
        materialPerFoot: costPerFoot,
        timePerFoot: baseTimePerFoot,
        accessibilityImpact: accessibilityMultipliers[accessibility],
        pressureImpact: pressureMultipliers[pressureRating]
      }
    }
  } catch (error) {
    console.error('Plumbing calculation error:', error)
    return {
      error: error.message,
      materialCost: 0,
      laborMultiplier: 1.0,
      estimatedDuration: 60
    }
  }
}

/**
 * Welding-Specific Calculations
 * Handles metal thickness, joint complexity, material costs
 */
export const weldingCalculations = ({
  metalType = 'steel',
  thickness,        // in inches
  jointLength,      // in inches
  jointType = 'butt',
  weldPosition = 'flat',
  materialGrade = 'standard'
}) => {
  try {
    // Welding rates by metal type (inches per hour)
    const weldingRates = {
      steel: { flat: 24, horizontal: 20, vertical: 16, overhead: 12 },
      aluminum: { flat: 18, horizontal: 15, vertical: 12, overhead: 9 },
      stainless: { flat: 16, horizontal: 13, vertical: 10, overhead: 8 }
    }
    
    // Joint complexity multipliers
    const jointMultipliers = {
      'butt': 1.0,
      'fillet': 1.2,
      'groove': 1.4,
      'lap': 1.1,
      'corner': 1.3
    }
    
    // Material cost per pound (approximate)
    const materialCosts = {
      steel: 2.50,
      aluminum: 4.20,
      stainless: 6.80
    }
    
    // Calculate welding time
    const baseRate = weldingRates[metalType]?.[weldPosition] || 12
    const jointMultiplier = jointMultipliers[jointType] || 1.0
    const thicknessMultiplier = Math.pow(thickness, 0.7) // Thickness increases time non-linearly
    
    const weldingTimeHours = (jointLength / baseRate) * jointMultiplier * thicknessMultiplier
    const weldingTimeMinutes = Math.ceil(weldingTimeHours * 60)
    
    // Estimate material consumption (rod/wire)
    const materialWeight = jointLength * thickness * 0.1 * jointMultiplier // Approximate formula
    const materialCost = materialWeight * materialCosts[metalType]
    
    // Setup and finishing time
    const setupTime = 30 // 30 minutes setup
    const finishingTime = Math.max(15, jointLength * 0.5) // Finishing time based on length
    
    const totalTime = weldingTimeMinutes + setupTime + finishingTime
    
    return {
      weldingTime: weldingTimeMinutes,
      setupTime,
      finishingTime,
      totalDuration: Math.ceil(totalTime),
      materialCost: Math.round(materialCost * 100) / 100,
      materialWeight: Math.round(materialWeight * 100) / 100,
      complexity: {
        metalType,
        thickness,
        jointLength,
        jointType,
        weldPosition,
        materialGrade
      },
      rates: {
        baseWeldingRate: baseRate,
        effectiveRate: baseRate / (jointMultiplier * thicknessMultiplier),
        jointComplexity: jointMultiplier,
        thicknessImpact: thicknessMultiplier
      }
    }
  } catch (error) {
    console.error('Welding calculation error:', error)
    return {
      error: error.message,
      totalDuration: 120,
      materialCost: 0
    }
  }
}

// ==========================================
// VOLATILITY AND RISK CALCULATIONS
// ==========================================

/**
 * Market Volatility Calculator
 * Adjusts pricing based on market conditions and demand
 */
export const calculateMarketVolatility = ({
  serviceCategory,
  seasonalFactor = 1.0,     // Seasonal demand multiplier
  marketDemand = 'normal',  // 'low', 'normal', 'high', 'peak'
  competitorDensity = 'medium', // 'low', 'medium', 'high'
  economicIndicator = 'stable', // 'recession', 'stable', 'growth'
  timeOfDay = 'business'    // 'business', 'evening', 'weekend', 'holiday'
}) => {
  try {
    // Base volatility by service category
    const baseVolatility = {
      'plumbing': 0.18,
      'welding': 0.22,
      'electrical': 0.20,
      'carpentry': 0.16,
      'landscaping': 0.25,
      'roofing': 0.30
    }
    
    // Market demand multipliers
    const demandMultipliers = {
      'low': 0.85,
      'normal': 1.0,
      'high': 1.25,
      'peak': 1.60
    }
    
    // Competition impact
    const competitionMultipliers = {
      'low': 1.15,    // Less competition = higher prices
      'medium': 1.0,
      'high': 0.90    // More competition = lower prices
    }
    
    // Economic condition impact
    const economicMultipliers = {
      'recession': 0.85,
      'stable': 1.0,
      'growth': 1.12
    }
    
    // Time-of-day premium
    const timeMultipliers = {
      'business': 1.0,
      'evening': 1.15,
      'weekend': 1.25,
      'holiday': 1.40
    }
    
    // Calculate adjusted volatility
    let volatility = baseVolatility[serviceCategory] || 0.20
    volatility *= seasonalFactor
    volatility *= (demandMultipliers[marketDemand] || 1.0) - 1.0 + 1.0
    
    // Calculate price multiplier
    let priceMultiplier = 1.0
    priceMultiplier *= demandMultipliers[marketDemand] || 1.0
    priceMultiplier *= competitionMultipliers[competitorDensity] || 1.0
    priceMultiplier *= economicMultipliers[economicIndicator] || 1.0
    priceMultiplier *= timeMultipliers[timeOfDay] || 1.0
    
    return {
      adjustedVolatility: Math.round(volatility * 1000) / 1000,
      priceMultiplier: Math.round(priceMultiplier * 1000) / 1000,
      factors: {
        serviceCategory,
        seasonalFactor,
        marketDemand,
        competitorDensity,
        economicIndicator,
        timeOfDay
      },
      impact: {
        demandImpact: ((demandMultipliers[marketDemand] - 1) * 100).toFixed(1) + '%',
        competitionImpact: ((competitionMultipliers[competitorDensity] - 1) * 100).toFixed(1) + '%',
        economicImpact: ((economicMultipliers[economicIndicator] - 1) * 100).toFixed(1) + '%',
        timeImpact: ((timeMultipliers[timeOfDay] - 1) * 100).toFixed(1) + '%',
        totalImpact: ((priceMultiplier - 1) * 100).toFixed(1) + '%'
      }
    }
  } catch (error) {
    console.error('Volatility calculation error:', error)
    return {
      adjustedVolatility: 0.20,
      priceMultiplier: 1.0,
      error: error.message
    }
  }
}

// ==========================================
// MAIN QUANTIFICATION ORCHESTRATOR
// ==========================================

/**
 * Main Quantification Function
 * Orchestrates all calculations and returns comprehensive pricing
 */
export const calculateQuantification = async ({
  service,
  attributes = {},
  urgencyLevel = 'standard',
  customParameters = {},
  marketConditions = {}
}) => {
  try {
    if (!service || !service.base_price) {
      throw new Error('Service and base price are required')
    }
    
    // Determine pricing model
    const pricingModel = service.pricing_model || 'quote'
    
    // Get trade-specific calculations
    let tradeCalculations = {}
    if (service.portfolio?.vertical?.name?.toLowerCase().includes('plumb')) {
      tradeCalculations = plumbingCalculations(attributes)
    } else if (service.portfolio?.vertical?.name?.toLowerCase().includes('weld')) {
      tradeCalculations = weldingCalculations(attributes)
    }
    
    // Get market volatility
    const volatilityData = calculateMarketVolatility({
      serviceCategory: service.portfolio?.vertical?.name?.toLowerCase(),
      ...marketConditions
    })
    
    // Prepare calculation parameters
    const basePrice = parseFloat(service.base_price)
    const materialCosts = tradeCalculations.materialCost || 0
    const duration = tradeCalculations.totalDuration || service.duration_minutes || 60
    
    const calculationParams = {
      basePrice,
      materialCosts,
      serviceDuration: duration,
      urgencyLevel,
      volatility: volatilityData.adjustedVolatility,
      urgencyMultiplier: volatilityData.priceMultiplier,
      complexityFactor: tradeCalculations.laborMultiplier || 1.0,
      ...customParameters
    }
    
    // Calculate using appropriate model
    let pricingResult
    switch (pricingModel) {
      case 'monte_carlo':
        pricingResult = monteCarloCalculator(calculationParams)
        break
      case 'black_scholes':
        pricingResult = blackScholesCalculator(calculationParams)
        break
      case 'quote':
      default:
        pricingResult = quoteCalculator(calculationParams)
        break
    }
    
    // Combine all results
    return {
      ...pricingResult,
      service: {
        id: service.service_id,
        name: service.name,
        category: service.portfolio?.vertical?.name,
        basePrice
      },
      tradeCalculations,
      marketConditions: volatilityData,
      attributes,
      metadata: {
        ...pricingResult.metadata,
        calculationId: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: '1.0.0'
      }
    }
  } catch (error) {
    console.error('Quantification calculation error:', error)
    return {
      error: error.message,
      fallbackPrice: service?.base_price || 0,
      model: 'error'
    }
  }
}

// Export all functions
// export {
//   plumbingCalculations,
//   weldingCalculations,
//   calculateMarketVolatility
// }