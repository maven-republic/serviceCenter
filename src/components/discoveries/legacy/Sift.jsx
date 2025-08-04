"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  SlidersHorizontal, 
  Filter, 
  ChevronDown, 
  X,
  RotateCcw
} from "lucide-react";
import toggleStore from "@/store/toggleStore";
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import Classification from "../filters/CategoryFilter";
import { cn } from "@/lib/utils";

export default function Sift() {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [deliveryFilter, setDeliveryFilter] = useState("");

  // Store state
  const priceStoreRange = priceStore((state) => state.priceRange);
  const setPriceStoreRange = priceStore((state) => state.priceRangeHandler);
  const listingToggle = toggleStore((state) => state.listingToggleHandler);
  const setDeliveryTime = listingStore((state) => state.setDeliveryTime);
  const getDeliveryTime = listingStore((state) => state.getDeliveryTime);
  const getCategory = listingStore((state) => state.getCategory);
  const resetAllFilters = listingStore((state) => state.resetAllFilters);

  // Sync with store
  useEffect(() => {
    setPriceRange([priceStoreRange.min, priceStoreRange.max]);
  }, [priceStoreRange]);

  useEffect(() => {
    setDeliveryFilter(getDeliveryTime);
  }, [getDeliveryTime]);

  // Handle price change
  const handlePriceChange = (values) => {
    setPriceRange(values);
    setPriceStoreRange({
      min: values[0],
      max: values[1]
    });
  };

  // Handle delivery time change
  const handleDeliveryChange = (value) => {
    setDeliveryFilter(value);
    setDeliveryTime(value);
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return (
      getCategory?.length > 0 ||
      priceRange[0] > 0 ||
      priceRange[1] < 100000 ||
      deliveryFilter !== "" ||
      getDeliveryTime !== ""
    );
  };

  // Sort options
  const sortOptions = [
    { value: "recommended", label: "Recommended" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" }
  ];

  // Delivery time options
  const deliveryOptions = [
    { value: "", label: "Any time" },
    { value: "24h", label: "Within 24 hours" },
    { value: "3days", label: "Within 3 days" },
    { value: "1week", label: "Within 1 week" },
    { value: "1month", label: "Within 1 month" }
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
      {/* Left Side - Filters */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* All Filters Sheet (Mobile + Desktop) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              All Filters
              {hasActiveFilters() && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 sm:w-96">
            <SheetHeader>
              <SheetTitle>Filter Services</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect service
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Categories */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Categories</h3>
                <Classification />
              </div>

              <Separator />

              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Price Range</h3>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={100000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm font-medium">
                      ${priceRange[0].toLocaleString()}
                    </div>
                    <div className="text-sm font-medium">
                      ${priceRange[1].toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Time */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Delivery Time</h3>
                <Select value={deliveryFilter} onValueChange={handleDeliveryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters() && (
                <>
                  <Separator />
                  <Button 
                    variant="outline" 
                    onClick={resetAllFilters}
                    className="w-full gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Category Dropdown (Desktop Only) */}
        <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Categories
                <ChevronDown className="h-4 w-4" />
                {getCategory?.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getCategory.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              <DropdownMenuLabel>Select Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Classification />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Clear Filters Button (when filters active) */}
        {hasActiveFilters() && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={resetAllFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}

        {/* Active Filter Indicators */}
        <div className="flex flex-wrap gap-2">
          {getCategory?.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => {
                  // Remove this category from the filter
                  // This would need to be implemented in your store
                }}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          
          {(priceRange[0] > 0 || priceRange[1] < 100000) && (
            <Badge variant="secondary">
              ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
            </Badge>
          )}
          
          {deliveryFilter && (
            <Badge variant="secondary">
              {deliveryOptions.find(opt => opt.value === deliveryFilter)?.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Right Side - Sort */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">Sort by:</span>
        <Select defaultValue="recommended">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}