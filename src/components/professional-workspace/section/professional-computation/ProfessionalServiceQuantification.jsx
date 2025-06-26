// ProfessionalServiceQuantification.jsx - Phase 2 Fix: Enhanced Data Flow

'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'

import ServiceQuantificationInstance from "./ServiceQuantificationInstance"

export default function ProfessionalServiceQuantification({ professionalId }) {
  const { user } = useUserStore()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    withCustomPricing: 0,
    withoutCustomPricing: 0,
    averageCustomPrice: 0,
    totalPotentialRevenue: 0
  })

  // Design system constants
  const spacing = {
    xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '24px'
  }
  
  const typography = {
    heading: '20px',
    subheading: '16px',
    body: '15px',
    caption: '13px',
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

  // Use professional ID from props or derive from user
  const effectiveProfessionalId = professionalId || user?.professional_id

  const fetchProfessionalServices = async () => {
    if (!effectiveProfessionalId) {
      setError('Professional ID not available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/professionals/service-pricing?professionalId=${effectiveProfessionalId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch services')
      }

      const data = await response.json()
      
      if (data.success) {
        // PHASE 2 FIX: Enhanced processing with better valuation unit handling
        const processedServices = (data.data || []).map(service => {
          // Determine the effective valuation unit with proper priority
          const effectiveValuationUnit = service.custom_valuation_unit || 
                                       service.service?.valuation_unit || 
                                       service.effective_valuation_unit

          return {
            ...service,
            // Implement pricing hierarchy: quant.base_price_mean -> service.base_price -> fallback
            effective_base_price: service.service?.quant?.base_price_mean || 
                                 service.service?.base_price || 
                                 50,
            service: {
              ...service.service,
              // Ensure base_price exists for quantification algorithms
              base_price: service.service?.quant?.base_price_mean || 
                         service.service?.base_price || 
                         50
            },
            // PHASE 2 FIX: Ensure we have the effective valuation unit
            effective_valuation_unit: effectiveValuationUnit
          }
        })
        
        setServices(processedServices)
        setStats(data.stats || stats)
        
        // PHASE 2 FIX: Enhanced debug logging
        console.log('✅ Parent Component - Services Loaded:', {
          success: data.success,
          servicesCount: processedServices.length,
          servicesWithCustomUnits: processedServices.filter(s => s.custom_valuation_unit).length,
          servicesWithServiceUnits: processedServices.filter(s => s.service?.valuation_unit).length,
          sampleServiceValuation: processedServices[0] ? {
            name: processedServices[0].service?.name,
            customUnit: processedServices[0].custom_valuation_unit?.display_name,
            serviceUnit: processedServices[0].service?.valuation_unit?.display_name,
            effectiveUnit: processedServices[0].effective_valuation_unit?.display_name
          } : null
        })
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }
    } catch (err) {
      console.error('❌ Error fetching professional services:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfessionalServices()
  }, [effectiveProfessionalId])

  // PHASE 2 FIX: Enhanced service update handler with better state management
  const handleServiceUpdate = async (updatedService) => {
    console.log('🔄 Parent Component - Service Update:', {
      serviceId: updatedService.professional_service_id,
      customPrice: updatedService.custom_price,
      customValuationUnit: updatedService.custom_valuation_unit,
      customValuationUnitId: updatedService.custom_valuation_unit_id
    })

    // PHASE 2 FIX: Optimistically update the UI with complete data
    setServices(prevServices => 
      prevServices.map(service => {
        if (service.professional_service_id === updatedService.professional_service_id) {
          // Merge the updated service data while preserving nested objects
          const mergedService = {
            ...service,
            ...updatedService,
            // Preserve the service object
            service: service.service,
            // Update the effective valuation unit
            effective_valuation_unit: updatedService.custom_valuation_unit || 
                                    service.service?.valuation_unit ||
                                    service.effective_valuation_unit
          }
          
          console.log('✅ Parent Component - Service Merged:', {
            original: service.effective_valuation_unit?.display_name,
            updated: mergedService.effective_valuation_unit?.display_name,
            customPrice: mergedService.custom_price
          })
          
          return mergedService
        }
        return service
      })
    )
    
    // PHASE 2 FIX: Debounced refresh to avoid excessive API calls
    setTimeout(() => {
      fetchProfessionalServices()
    }, 1000)
  }

  // Filter services based on search and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.service?.portfolio?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || 
                           service.service?.portfolio?.vertical?.name?.toLowerCase().includes(filterCategory.toLowerCase())
    
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = [...new Set(services.map(s => s.service?.portfolio?.vertical?.name).filter(Boolean))]

  const StatsCards = () => (
    <>
      <style jsx>{`
        .stats-card {
          border: 1px solid ${colors.border.default};
          border-radius: 16px;
          background: ${colors.background.primary};
          transition: all 0.15s ease-in-out;
          box-shadow: none;
        }
        
        .stats-card:hover {
          border-color: ${colors.border.emphasis};
          transform: translateY(-1px);
        }
        
        .stats-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
          background: transparent;
          box-shadow: none;
        }
        
        .stats-icon.primary {
          border-color: ${colors.interactive.primary};
          color: ${colors.interactive.primary};
          background: rgba(59, 130, 246, 0.08);
        }
        
        .stats-icon.success {
          border-color: ${colors.interactive.success};
          color: ${colors.interactive.success};
          background: rgba(16, 185, 129, 0.08);
        }
        
        .stats-icon.warning {
          border-color: ${colors.interactive.warning};
          color: ${colors.interactive.warning};
          background: rgba(245, 158, 11, 0.08);
        }
        
        .stats-icon.info {
          border-color: #06b6d4;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.08);
        }
        
        .stats-value {
          font-size: 28px;
          font-weight: 700;
          color: ${colors.text.primary};
          margin-bottom: 4px;
          line-height: 1.2;
        }
        
        .stats-label {
          font-size: ${typography.caption};
          color: ${colors.text.secondary};
          margin-bottom: 0;
          font-weight: 500;
        }
      `}</style>

      <div className="row mb-5">
        <div className="col-md-3 mb-3">
          <div className="stats-card" style={{ padding: spacing.xl }}>
            <div className="d-flex align-items-center">
              <div className="stats-icon primary me-3">
                <i className="fas fa-list-ul"></i>
              </div>
              <div className="flex-grow-1">
                <div className="stats-value">{stats.total}</div>
                <div className="stats-label">Total Services</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="stats-card" style={{ padding: spacing.xl }}>
            <div className="d-flex align-items-center">
              <div className="stats-icon success me-3">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="flex-grow-1">
                <div className="stats-value">{stats.withCustomPricing}</div>
                <div className="stats-label">Custom Priced</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="stats-card" style={{ padding: spacing.xl }}>
            <div className="d-flex align-items-center">
              <div className="stats-icon warning me-3">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="flex-grow-1">
                <div className="stats-value">
                  J${stats.averageCustomPrice.toFixed(0)}
                </div>
                <div className="stats-label">Average Price</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="stats-card" style={{ padding: spacing.xl }}>
            <div className="d-flex align-items-center">
              <div className="stats-icon info me-3">
                <i className="fas fa-chart-trend-up"></i>
              </div>
              <div className="flex-grow-1">
                <div className="stats-value">
                  J${stats.totalPotentialRevenue.toFixed(0)}
                </div>
                <div className="stats-label">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const SearchAndFilters = () => (
    <div className="row mb-4">
      <div className="col-md-8">
        <div className="position-relative">
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: `1px solid ${colors.border.default}`,
              borderRadius: '12px',
              padding: `${spacing.md} ${spacing.lg}`,
              fontSize: typography.body,
              backgroundColor: colors.background.primary,
              paddingLeft: '48px'
            }}
          />
          <i 
            className="fas fa-search position-absolute"
            style={{
              left: spacing.lg,
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.text.muted,
              fontSize: typography.caption
            }}
          />
        </div>
      </div>
      <div className="col-md-4">
        <select
          className="form-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            border: `1px solid ${colors.border.default}`,
            borderRadius: '12px',
            padding: `${spacing.md} ${spacing.lg}`,
            fontSize: typography.body,
            backgroundColor: colors.background.primary
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="text-center py-5">
      <div 
        className="mx-auto p-5"
        style={{
          maxWidth: '480px',
          backgroundColor: colors.background.secondary,
          borderRadius: '20px',
          border: `1px solid ${colors.border.default}`
        }}
      >
        <div className="mb-4">
          <div 
            className="mx-auto d-flex align-items-center justify-content-center"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: colors.background.muted,
              borderRadius: '50%',
              border: `1px solid ${colors.border.default}`
            }}
          >
            <i 
              className="fas fa-calculator"
              style={{
                fontSize: '32px',
                color: colors.text.muted
              }}
            />
          </div>
        </div>
        <h5 
          className="fw-semibold mb-3"
          style={{
            fontSize: typography.subheading,
            color: colors.text.primary
          }}
        >
          No Services Available for Pricing
        </h5>
        <p 
          className="mb-4"
          style={{
            fontSize: typography.body,
            color: colors.text.secondary,
            lineHeight: '1.6'
          }}
        >
          You need to add services to your professional profile before you can configure intelligent pricing. 
          Services are managed in the "Manage Services" section of your dashboard.
        </p>
        <a 
          href="/professional/manage-services"
          className="btn fw-medium"
          style={{
            backgroundColor: colors.interactive.primary,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: `${spacing.md} ${spacing.xl}`,
            fontSize: typography.body,
            textDecoration: 'none'
          }}
        >
          <i className="fas fa-plus me-2"></i>
          Add Services First
        </a>
      </div>
    </div>
  )

  const LoadingState = () => (
    <div className="text-center py-5">
      <div className="mb-4">
        <div 
          className="spinner-border"
          style={{
            width: '48px',
            height: '48px',
            color: colors.interactive.primary
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <h6 
        className="fw-semibold mb-2"
        style={{
          fontSize: typography.subheading,
          color: colors.text.primary
        }}
      >
        Loading Your Services
      </h6>
      <p 
        style={{
          fontSize: typography.body,
          color: colors.text.secondary
        }}
      >
        Preparing advanced pricing interface...
      </p>
    </div>
  )

  const ErrorState = () => (
    <div 
      className="alert d-flex align-items-center p-4"
      style={{
        backgroundColor: '#fef2f2',
        border: `1px solid #fecaca`,
        borderLeftWidth: '4px',
        borderLeftColor: colors.interactive.danger,
        borderRadius: '12px'
      }}
    >
      <div 
        className="me-4 d-flex align-items-center justify-content-center"
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: colors.interactive.danger,
          borderRadius: '50%'
        }}
      >
        <i 
          className="fas fa-exclamation-triangle text-white"
          style={{ fontSize: typography.subheading }}
        />
      </div>
      <div className="flex-grow-1">
        <h6 
          className="fw-semibold mb-2"
          style={{
            fontSize: typography.subheading,
            color: colors.interactive.danger
          }}
        >
          Unable to Load Services
        </h6>
        <p 
          className="mb-3"
          style={{
            fontSize: typography.body,
            color: '#dc2626',
            marginBottom: spacing.md
          }}
        >
          {error}
        </p>
        <button 
          className="btn"
          onClick={fetchProfessionalServices}
          style={{
            backgroundColor: 'transparent',
            color: colors.interactive.danger,
            border: `1px solid ${colors.interactive.danger}`,
            borderRadius: '8px',
            padding: `${spacing.sm} ${spacing.lg}`,
            fontSize: typography.caption,
            fontWeight: '500'
          }}
        >
          <i className="fas fa-refresh me-2"></i>
          Try Again
        </button>
      </div>
    </div>
  )

  const NoResultsState = () => (
    <div className="text-center py-5">
      <div 
        className="mx-auto mb-4 d-flex align-items-center justify-content-center"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: colors.background.muted,
          borderRadius: '50%',
          border: `1px solid ${colors.border.default}`
        }}
      >
        <i 
          className="fas fa-search"
          style={{
            fontSize: '24px',
            color: colors.text.muted
          }}
        />
      </div>
      <h6 
        className="fw-semibold mb-2"
        style={{
          fontSize: typography.subheading,
          color: colors.text.primary
        }}
      >
        No Services Found
      </h6>
      <p 
        style={{
          fontSize: typography.body,
          color: colors.text.secondary
        }}
      >
        No services match your current search and filter criteria.
      </p>
      <button
        className="btn mt-3"
        onClick={() => {
          setSearchTerm('')
          setFilterCategory('all')
        }}
        style={{
          backgroundColor: 'transparent',
          color: colors.interactive.primary,
          border: `1px solid ${colors.interactive.primary}`,
          borderRadius: '8px',
          padding: `${spacing.sm} ${spacing.lg}`,
          fontSize: typography.caption,
          fontWeight: '500'
        }}
      >
        Clear Filters
      </button>
    </div>
  )

  return (
    <div 
      className="ps-widget bgc-white mb30"
      style={{
        borderRadius: '20px',
        border: `1px solid ${colors.border.default}`,
        padding: spacing.xxl,
        backgroundColor: colors.background.primary
      }}
    >
      {/* Enhanced Header */}
      <div 
        className="d-flex justify-content-between align-items-start pb-4 mb-5"
        style={{
          borderBottom: `1px solid ${colors.border.default}`
        }}
      >
        <div>
          <h5 
            className="fw-bold mb-2"
            style={{
              fontSize: typography.heading,
              color: colors.text.primary,
              marginBottom: spacing.sm
            }}
          >
            Advanced Service Quantification
          </h5>
          <p 
            className="mb-0"
            style={{
              fontSize: typography.body,
              color: colors.text.secondary,
              lineHeight: '1.5'
            }}
          >
            Configure intelligent pricing using quantitative financial models and market analysis
          </p>
          {!loading && !error && (
            <div className="mt-3">
              <span 
                className="badge me-2"
                style={{
                  backgroundColor: `${colors.interactive.primary}15`,
                  color: colors.interactive.primary,
                  border: `1px solid ${colors.interactive.primary}30`,
                  borderRadius: '8px',
                  padding: `${spacing.xs} ${spacing.md}`,
                  fontSize: typography.small,
                  fontWeight: '500'
                }}
              >
                {filteredServices.length} Services
              </span>
              <span 
                className="badge"
                style={{
                  backgroundColor: `${colors.interactive.success}15`,
                  color: colors.interactive.success,
                  border: `1px solid ${colors.interactive.success}30`,
                  borderRadius: '8px',
                  padding: `${spacing.xs} ${spacing.md}`,
                  fontSize: typography.small,
                  fontWeight: '500'
                }}
              >
                AI-Powered Pricing
              </span>
            </div>
          )}
        </div>
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn transition-all duration-150 ease-in-out"
            onClick={fetchProfessionalServices}
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              color: colors.text.secondary,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '10px',
              padding: `${spacing.sm} ${spacing.lg}`,
              fontSize: typography.caption,
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.borderColor = colors.border.emphasis
                e.target.style.color = colors.text.primary
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.borderColor = colors.border.default
                e.target.style.color = colors.text.secondary
              }
            }}
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-refresh'} me-2`}></i>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && !error && <StatsCards />}

      {/* Search and Filters */}
      {!loading && !error && services.length > 0 && <SearchAndFilters />}

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : services.length === 0 ? (
        <EmptyState />
      ) : filteredServices.length === 0 ? (
        <NoResultsState />
      ) : (
        <>
          {/* Enhanced Services Table */}
          <div 
            className="bg-white"
            style={{
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: 'none'
            }}
          >
            <table className="table table-borderless mb-0 w-100">
              <thead>
                <tr 
                  className="border-bottom"
                  style={{
                    borderBottomWidth: '1px',
                    borderBottomColor: colors.border.subtle,
                    backgroundColor: colors.background.primary
                  }}
                >
                  <th 
                    className="fw-semibold text-start"
                    style={{ 
                      fontSize: typography.caption,
                      color: colors.text.primary,
                      padding: `${spacing.lg} ${spacing.xl}`,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Service Details
                  </th>
                  <th 
                    className="fw-semibold text-start"
                    style={{ 
                      fontSize: typography.caption,
                      color: colors.text.primary,
                      padding: `${spacing.lg} ${spacing.md}`,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Category
                  </th>
                  <th 
                    className="fw-semibold text-start"
                    style={{ 
                      fontSize: typography.caption,
                      color: colors.text.primary,
                      padding: `${spacing.lg} ${spacing.md}`,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Duration
                  </th>
                  <th 
                    className="fw-semibold text-start"
                    style={{ 
                      fontSize: typography.caption,
                      color: colors.text.primary,
                      padding: `${spacing.lg} ${spacing.md}`,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Pricing
                  </th>
                  <th 
                    className="fw-semibold text-end"
                    style={{ 
                      fontSize: typography.caption,
                      color: colors.text.primary,
                      padding: `${spacing.lg} ${spacing.xl}`,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, index) => (
                  <ServiceQuantificationInstance
                    key={`${service.professional_service_id}-${service.custom_valuation_unit_id}-${service.custom_price}`}
                    service={service}
                    onUpdate={handleServiceUpdate}
                    professionalId={effectiveProfessionalId}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Results Summary */}
          {filteredServices.length > 0 && (
            <div 
              className="mt-4 pt-4 border-top d-flex justify-content-between align-items-center"
              style={{
                borderTopColor: colors.border.default,
                fontSize: typography.caption,
                color: colors.text.secondary
              }}
            >
              <span>
                Showing {filteredServices.length} of {services.length} services
              </span>
              <span>
                {stats.withCustomPricing} services have custom pricing configured
              </span>
            </div>
          )}
          
          {/* Enhanced Information Cards */}
          <div className="mt-5 pt-5 border-top" style={{ borderTopColor: colors.border.default }}>
            <div className="row g-4">
              <div className="col-md-6">
                <div 
                  className="p-4"
                  style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: '16px',
                    border: `1px solid ${colors.border.default}`
                  }}
                >
                  <h6 
                    className="fw-semibold mb-3 d-flex align-items-center"
                    style={{
                      fontSize: typography.subheading,
                      color: colors.text.primary
                    }}
                  >
                    <div 
                      className="me-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: colors.interactive.primary + '15',
                        borderRadius: '10px',
                        border: `1px solid ${colors.interactive.primary}30`
                      }}
                    >
                      <i 
                        className="fas fa-brain"
                        style={{
                          fontSize: typography.body,
                          color: colors.interactive.primary
                        }}
                      />
                    </div>
                    Available Pricing Models
                  </h6>
                  <div className="space-y-3">
                    <div className="d-flex align-items-start mb-3">
                      <span 
                        className="badge me-3 mt-1"
                        style={{
                          backgroundColor: colors.interactive.success + '15',
                          color: colors.interactive.success,
                          border: `1px solid ${colors.interactive.success}30`,
                          borderRadius: '6px',
                          padding: `${spacing.xs} ${spacing.sm}`,
                          fontSize: typography.small,
                          fontWeight: '600',
                          minWidth: '80px'
                        }}
                      >
                        QUOTE
                      </span>
                      <div>
                        <div 
                          className="fw-medium mb-1"
                          style={{
                            fontSize: typography.caption,
                            color: colors.text.primary
                          }}
                        >
                          Standard Fixed Pricing
                        </div>
                        <div 
                          style={{
                            fontSize: typography.small,
                            color: colors.text.secondary,
                            lineHeight: '1.4'
                          }}
                        >
                          Traditional quote-based pricing for straightforward services
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-start mb-3">
                      <span 
                        className="badge me-3 mt-1"
                        style={{
                          backgroundColor: colors.interactive.primary + '15',
                          color: colors.interactive.primary,
                          border: `1px solid ${colors.interactive.primary}30`,
                          borderRadius: '6px',
                          padding: `${spacing.xs} ${spacing.sm}`,
                          fontSize: typography.small,
                          fontWeight: '600',
                          minWidth: '80px'
                        }}
                      >
                        BLACK-SCHOLES
                      </span>
                      <div>
                        <div 
                          className="fw-medium mb-1"
                          style={{
                            fontSize: typography.caption,
                            color: colors.text.primary
                          }}
                        >
                          Predictable Timeline Services
                        </div>
                        <div 
                          style={{
                            fontSize: typography.small,
                            color: colors.text.secondary,
                            lineHeight: '1.4'
                          }}
                        >
                          Advanced mathematical modeling for services with known parameters
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-start">
                      <span 
                        className="badge me-3 mt-1"
                        style={{
                          backgroundColor: colors.interactive.warning + '15',
                          color: colors.interactive.warning,
                          border: `1px solid ${colors.interactive.warning}30`,
                          borderRadius: '6px',
                          padding: `${spacing.xs} ${spacing.sm}`,
                          fontSize: typography.small,
                          fontWeight: '600',
                          minWidth: '80px'
                        }}
                      >
                        MONTE CARLO
                      </span>
                      <div>
                        <div 
                          className="fw-medium mb-1"
                          style={{
                            fontSize: typography.caption,
                            color: colors.text.primary
                          }}
                        >
                          Complex & Uncertain Projects
                        </div>
                        <div 
                          style={{
                            fontSize: typography.small,
                            color: colors.text.secondary,
                            lineHeight: '1.4'
                          }}
                        >
                          Simulation-based pricing for high-uncertainty services
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div 
                  className="p-4"
                  style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: '16px',
                    border: `1px solid ${colors.border.default}`
                  }}
                >
                  <h6 
                    className="fw-semibold mb-3 d-flex align-items-center"
                    style={{
                      fontSize: typography.subheading,
                      color: colors.text.primary
                    }}
                  >
                    <div 
                      className="me-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: colors.interactive.warning + '15',
                        borderRadius: '10px',
                        border: `1px solid ${colors.interactive.warning}30`
                      }}
                    >
                      <i 
                        className="fas fa-lightbulb"
                        style={{
                          fontSize: typography.body,
                          color: colors.interactive.warning
                        }}
                      />
                    </div>
                    Pricing Optimization Tips
                  </h6>
                  <ul 
                    className="list-unstyled mb-0"
                    style={{
                      fontSize: typography.caption,
                      color: colors.text.secondary,
                      lineHeight: '1.6'
                    }}
                  >
                    <li className="mb-2 d-flex align-items-start">
                      <i 
                        className="fas fa-check-circle me-2 mt-1"
                        style={{
                          fontSize: typography.small,
                          color: colors.interactive.success
                        }}
                      />
                      Consider market demand fluctuations and seasonal patterns
                    </li>
                    <li className="mb-2 d-flex align-items-start">
                      <i 
                        className="fas fa-check-circle me-2 mt-1"
                        style={{
                          fontSize: typography.small,
                          color: colors.interactive.success
                        }}
                      />
                      Factor in material costs, labor complexity, and urgency levels
                    </li>
                    <li className="mb-2 d-flex align-items-start">
                      <i 
                        className="fas fa-check-circle me-2 mt-1"
                        style={{
                          fontSize: typography.small,
                          color: colors.interactive.success
                        }}
                      />
                      Use trade-specific parameters for accurate estimations
                    </li>
                    <li className="mb-2 d-flex align-items-start">
                      <i 
                        className="fas fa-check-circle me-2 mt-1"
                        style={{
                          fontSize: typography.small,
                          color: colors.interactive.success
                        }}
                      />
                      Review and adjust pricing models based on market feedback
                    </li>
                    <li className="d-flex align-items-start">
                      <i 
                        className="fas fa-check-circle me-2 mt-1"
                        style={{
                          fontSize: typography.small,
                          color: colors.interactive.success
                        }}
                      />
                      Monitor competitor pricing and economic indicators regularly
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}