// src/components/search/DiscoveriesFilters.jsx
'use client';

import { useState } from 'react';
import { Filter, X, DollarSign, MapPin, Building, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSearch } from '@/components/discoveries/context/SearchContext';

export default function DiscoveriesFilters() {
  const { filters, updateFilters, clearFilters } = useSearch();
  
  // Local state for price range slider
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0,
    filters.maxPrice || 100000
  ]);

  const handlePriceChange = (value) => {
    setPriceRange(value);
    updateFilters({
      minPrice: value[0],
      maxPrice: value[1]
    });
  };

  const handleIndustryChange = (industry, checked) => {
    updateFilters({
      industry: checked ? industry : undefined
    });
  };

  const handleVerticalChange = (vertical, checked) => {
    updateFilters({
      vertical: checked ? vertical : undefined
    });
  };

  const handleParishChange = (parish, checked) => {
    updateFilters({
      parish: checked ? parish : undefined
    });
  };

  const handleFeaturedChange = (checked) => {
    updateFilters({
      featured: checked
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Static filter options - you could fetch these from your database
  const industries = [
    'Construction & Home Improvement',
    'Professional Services',
    'Health & Wellness',
    'Technology',
    'Education'
  ];

  const verticals = [
    'Plumbing',
    'Electrical',
    'Welding',
    'Carpentry',
    'Painting',
    'HVAC',
    'Landscaping'
  ];

  const parishes = [
    'Kingston',
    'St. Andrew',
    'St. Catherine',
    'Clarendon',
    'Manchester',
    'St. Elizabeth',
    'Westmoreland',
    'Hanover',
    'St. James',
    'Trelawny',
    'St. Ann',
    'St. Mary',
    'Portland'
  ];

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Price Range</span>
          </div>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={100000}
              min={0}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>J${priceRange[0].toLocaleString()}</span>
              <span>J${priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Featured Services */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="font-medium">Service Type</span>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured || false}
              onCheckedChange={handleFeaturedChange}
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Featured services only
            </label>
          </div>
        </div>

        <Separator />

        {/* Industry */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="font-medium">Industry</span>
          </div>
          <div className="space-y-2">
            {industries.map((industry) => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox
                  id={`industry-${industry}`}
                  checked={filters.industry === industry}
                  onCheckedChange={(checked) => handleIndustryChange(industry, checked)}
                />
                <label
                  htmlFor={`industry-${industry}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {industry}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Service Category (Vertical) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="font-medium">Service Category</span>
          </div>
          <div className="space-y-2">
            {verticals.map((vertical) => (
              <div key={vertical} className="flex items-center space-x-2">
                <Checkbox
                  id={`vertical-${vertical}`}
                  checked={filters.vertical === vertical}
                  onCheckedChange={(checked) => handleVerticalChange(vertical, checked)}
                />
                <label
                  htmlFor={`vertical-${vertical}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {vertical}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Parish */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Parish</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {parishes.map((parish) => (
              <div key={parish} className="flex items-center space-x-2">
                <Checkbox
                  id={`parish-${parish}`}
                  checked={filters.parish === parish}
                  onCheckedChange={(checked) => handleParishChange(parish, checked)}
                />
                <label
                  htmlFor={`parish-${parish}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {parish}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium">Active Filters:</span>
              <div className="flex flex-wrap gap-1">
                {filters.minPrice && filters.maxPrice && (
                  <Badge variant="secondary" className="text-xs">
                    J${filters.minPrice.toLocaleString()} - J${filters.maxPrice.toLocaleString()}
                  </Badge>
                )}
                {filters.featured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
                {filters.industry && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.industry}
                  </Badge>
                )}
                {filters.vertical && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.vertical}
                  </Badge>
                )}
                {filters.parish && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.parish}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}