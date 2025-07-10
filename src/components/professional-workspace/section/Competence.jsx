'use client'

import React, { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import ServiceInformation from '../section/ServiceInformation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Wrench, 
  DollarSign, 
  Clock, 
  Layers, 
  FolderOpen,
  AlertTriangle,
  Loader2
} from 'lucide-react'

export default function ProfessionalServices() {
  const { user } = useUserStore()
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.account?.account_id) return setIsLoading(false)

      try {
        // Get professional ID
        const { data: profData, error: profError } = await supabase
          .from('individual_professional')
          .select('professional_id')
          .eq('account_id', user.account.account_id)
          .single()

        if (profError || !profData) {
          throw new Error('Professional profile not found')
        }

        console.log('Professional ID:', profData.professional_id)

        // ✅ Method 1: Simple query without nested relationships
        const { data: professionalServices, error: servicesError } = await supabase
          .from('professional_service')
          .select('service_id, custom_price, custom_duration_minutes')
          .eq('professional_id', profData.professional_id)
          .eq('is_active', true)

        if (servicesError) {
          console.error('Professional services query error:', servicesError)
          throw new Error('Failed to fetch professional services')
        }

        if (!professionalServices || professionalServices.length === 0) {
          setServices([])
          return
        }

        console.log('Professional services:', professionalServices)

        // ✅ Get service IDs
        const serviceIds = professionalServices.map(ps => ps.service_id)

        // ✅ Fetch service details separately
        const { data: serviceDetails, error: serviceDetailsError } = await supabase
          .from('service')
          .select(`
            service_id,
            name,
            description,
            portfolio_id
          `)
          .in('service_id', serviceIds)

        if (serviceDetailsError) {
          console.error('Service details query error:', serviceDetailsError)
          throw new Error('Failed to fetch service details')
        }

        console.log('Service details:', serviceDetails)

        // ✅ Get unique portfolio IDs
        const portfolioIds = [...new Set(serviceDetails.map(s => s.portfolio_id).filter(Boolean))]

        // ✅ Fetch portfolio details separately
        const { data: portfolioDetails, error: portfolioDetailsError } = await supabase
          .from('portfolio')
          .select(`
            portfolio_id,
            name,
            vertical_id
          `)
          .in('portfolio_id', portfolioIds)

        if (portfolioDetailsError) {
          console.error('Portfolio details query error:', portfolioDetailsError)
        }

        console.log('Portfolio details:', portfolioDetails)

        // ✅ Get unique vertical IDs
        const verticalIds = [...new Set((portfolioDetails || []).map(p => p.vertical_id).filter(Boolean))]

        // ✅ Fetch vertical details separately
        const { data: verticalDetails, error: verticalDetailsError } = await supabase
          .from('vertical')
          .select(`
            vertical_id,
            name
          `)
          .in('vertical_id', verticalIds)

        if (verticalDetailsError) {
          console.error('Vertical details query error:', verticalDetailsError)
        }

        console.log('Vertical details:', verticalDetails)

        // ✅ Combine all data
        const formatted = professionalServices.map(ps => {
          const serviceDetail = serviceDetails.find(sd => sd.service_id === ps.service_id)
          const portfolioDetail = portfolioDetails?.find(pd => pd.portfolio_id === serviceDetail?.portfolio_id)
          const verticalDetail = verticalDetails?.find(vd => vd.vertical_id === portfolioDetail?.vertical_id)

          return {
            service_id: ps.service_id,
            name: serviceDetail?.name || 'Unknown Service',
            description: serviceDetail?.description || '',
            vertical: verticalDetail?.name || 'Unknown Vertical',
            portfolio: portfolioDetail?.name || 'Unknown Portfolio',
            customPrice: ps.custom_price,
            customDuration: ps.custom_duration_minutes
          }
        })

        setServices(formatted)
        console.log('✅ Services loaded:', formatted)

      } catch (err) {
        setError(err.message)
        console.error('❌ Error fetching services:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [user?.account?.account_id, supabase])

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Professional Services</CardTitle>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-full"
              onClick={() => setShowModal(true)}
              aria-label="Add or Manage Services"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 border border-destructive/20 bg-destructive/5 rounded-lg text-destructive">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Error loading services: {error}</span>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Services Added Yet</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-sm">
                Add services to showcase your professional expertise and attract more clients
              </p>
              <Button onClick={() => setShowModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {services.map((service, i) => (
                <Card key={service.service_id} className="h-full hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4 flex flex-col h-full">
                    
                    {/* 🎯 PRIMARY: Service Name (Most Important) */}
                    <h3 className="font-semibold text-foreground mb-3 line-clamp-2 text-sm leading-tight">
                      {service.name}
                    </h3>
                    
                    {/* 🎯 SECONDARY: Vertical (Business Context) */}
                    <div className="mb-3">
                      <Badge variant="default" className="gap-1 text-xs">
                        <Layers className="h-3 w-3" />
                        {service.vertical}
                      </Badge>
                    </div>
                    
                    {/* 🎯 TERTIARY: Portfolio (Specific Category) */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FolderOpen className="h-3 w-3" />
                        <span className="truncate">{service.portfolio}</span>
                      </div>
                    </div>
                    
                    {/* 🎯 SUPPORTING: Service Details */}
                    <div className="flex flex-col gap-2 mt-auto">
                      {service.customPrice && (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <DollarSign className="h-3 w-3" />
                          J$ {service.customPrice.toFixed(2)}
                        </div>
                      )}
                      {service.customDuration && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Clock className="h-3 w-3" />
                          {service.customDuration} min
                        </div>
                      )}
                    </div>
                    
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service modal using ServiceInformation */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-6xl translate-x-[-50%] translate-y-[-50%] bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Manage Services</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
                className="h-6 w-6"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </div>
            <div>
              <ServiceInformation />
            </div>
          </div>
        </div>
      )}
    </>
  )
}