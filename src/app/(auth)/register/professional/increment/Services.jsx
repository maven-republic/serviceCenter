'use client'

import { useEffect, useRef, useMemo, useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import ServiceTag from './ServiceTag'
import { cn } from "@/lib/utils"

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Services({
  verticals,
  portfolios,
  services,
  loading,
  dropdownOpen,
  searchTerm,
  setSearchTerm,
  setDropdownOpen,
  toggleService,
  selectedServices,
  formData,
  updateFormData,
  errors
}) {
  const dropdownRef = useRef(null);

  // Memoize randomized data to prevent re-shuffling on every render
  const randomizedData = useMemo(() => {
    return {
      verticals: shuffleArray(verticals),
      portfolios: shuffleArray(portfolios),
      services: shuffleArray(services)
    };
  }, [verticals, portfolios, services]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setDropdownOpen]);

  // Filter services for search
  const filteredServices = randomizedData.services.filter(service =>
    !searchTerm || service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Service Selection Progress</span>
          <span>66%</span>
        </div>
        <Progress value={66} className="h-2" />
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (!dropdownOpen) setDropdownOpen(true)
              }}
              onClick={() => setDropdownOpen(true)}
              className="pl-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              {dropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Service Dropdown */}
          {dropdownOpen && (
            <Card className="border shadow-lg" ref={dropdownRef}>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading services...</span>
                    </div>
                  ) : (
                    <div className="p-4 space-y-6">
                      {searchTerm && filteredServices.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No services match your search.</p>
                        </div>
                      )}

                      {randomizedData.verticals.map((vertical) => {
                        // Get portfolios for this vertical (also randomized)
                        const verticalPortfolios = randomizedData.portfolios.filter(
                          (p) => p.vertical_id === vertical.vertical_id
                        )

                        if (!verticalPortfolios.length) return null

                        return (
                          <div key={vertical.vertical_id} className="space-y-4">
                            <div className="border-b pb-2">
                              <h3 className="font-semibold text-primary flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {vertical.name}
                                </Badge>
                              </h3>
                            </div>

                            {verticalPortfolios.map((portfolio) => {
                              // Get services for this portfolio (also randomized)
                              const portfolioServices = randomizedData.services.filter(
                                (s) =>
                                  s.portfolio_id === portfolio.portfolio_id &&
                                  (!searchTerm ||
                                    s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                              )

                              if (!portfolioServices.length) return null

                              return (
                                <div key={portfolio.portfolio_id} className="space-y-3">
                                  <div className="bg-muted/30 rounded-lg p-3">
                                    <h4 className="font-medium text-sm text-foreground mb-3">
                                      {portfolio.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {portfolioServices.map((service) => {
                                        const isSelected = selectedServices.includes(service.service_id)
                                        return (
                                          <ServiceTag
                                            key={service.service_id}
                                            service={service}
                                            selected={isSelected}
                                            onToggle={toggleService}
                                          />
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                    </div>
                    <Button 
                      onClick={() => setDropdownOpen(false)}
                      size="sm"
                    >
                      Confirm Services
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </CardContent>
      </Card>
    </div>
  )
}