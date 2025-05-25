"use client";

import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import { useState, useEffect } from "react";

export default function Undo() {
  // State to track animation
  const [isClearing, setIsClearing] = useState(false);
  
  // set handlers
  const setDeliveryTime = listingStore((state) => state.setDeliveryTime);
  const setLevel = listingStore((state) => state.setLevel);
  const setLocation = listingStore((state) => state.setLocation);
  const setBestSeller = listingStore((state) => state.setBestSeller);
  const setDesginTool = listingStore((state) => state.setDesginTool);
  const setSpeak = listingStore((state) => state.setSpeak);
  const setPriceRange = priceStore((state) => state.priceRangeHandler);
  const setSearch = listingStore((state) => state.setSearch);
  const setCategory = listingStore((state) => state.setCategory);
  const setProjectType = listingStore((state) => state.setProjectType);
  const setEnglishLevel = listingStore((state) => state.setEnglishLevel);
  const setJobType = listingStore((state) => state.setJobType);
  const setNoOfEmployee = listingStore((state) => state.setNoOfEmployee);
  
  // Get central reset function if it exists
  const resetAllFilters = listingStore((state) => state.resetAllFilters);

  // get state
  const getDeliveryTime = listingStore((state) => state.getDeliveryTime);
  const getLevel = listingStore((state) => state.getLevel);
  const getLocation = listingStore((state) => state.getLocation);
  const getBestSeller = listingStore((state) => state.getBestSeller);
  const getDesginTool = listingStore((state) => state.getDesginTool);
  const getSpeak = listingStore((state) => state.getSpeak);
  const getPriceRange = priceStore((state) => state.priceRange);
  const getSearch = listingStore((state) => state.getSearch);
  const getCategory = listingStore((state) => state.getCategory);
  const getProjectType = listingStore((state) => state.getProjectType);
  const getEnglishLevel = listingStore((state) => state.getEnglishLevel);
  const getJobType = listingStore((state) => state.getJobType);
  const getNoOfEmployee = listingStore((state) => state.getNoOfEmployee);

  // Count active filters
  const activeFilterCount = [
    getDeliveryTime !== "",
    ...getLevel,
    ...getLocation,
    getBestSeller !== "",
    ...getDesginTool,
    ...getSpeak,
    getPriceRange.min !== 0 || getPriceRange.max !== 100000,
    getSearch !== "",
    ...getCategory,
    ...getProjectType,
    ...getEnglishLevel,
    ...getJobType,
    ...getNoOfEmployee
  ].filter(Boolean).length;

  // clear handler with animation
  const clearHandler = () => {
    setIsClearing(true);
    
    // Use the centralized reset function if available
    if (typeof resetAllFilters === 'function') {
      resetAllFilters();
    } else {
      // Otherwise use individual resets
      setDeliveryTime("");
      setLevel([]);
      setLocation([]);
      setBestSeller("");
      setDesginTool([]);
      setSpeak([]);
      setPriceRange(0, 100000);
      setSearch("");
      setCategory([]);
      setProjectType([]);
      setEnglishLevel([]);
      setJobType([]);
      setNoOfEmployee([]);
    }
    
    // Reset the animation state after a delay
    setTimeout(() => {
      setIsClearing(false);
    }, 500);
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    getDeliveryTime !== "" ||
    getLevel?.length !== 0 ||
    getLocation?.length !== 0 ||
    getSearch !== "" ||
    getBestSeller !== "" ||
    getDesginTool?.length !== 0 ||
    getSpeak?.length !== 0 ||
    getPriceRange.min !== 0 ||
    getPriceRange.max !== 100000 ||
    getCategory?.length !== 0 ||
    getProjectType?.length !== 0 ||
    getEnglishLevel?.length !== 0 ||
    getJobType?.length !== 0 ||
    getNoOfEmployee?.length !== 0;

  return (
    <>
      {hasActiveFilters && (
        <button
          onClick={clearHandler}
          className={`ud-btn btn-thm ui-clear-btn w-100 ${isClearing ? 'clearing' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          <span 
            style={{ 
              display: 'flex',
              alignItems: 'center' 
            }}
          >
            Clear
            {activeFilterCount > 0 && (
              <span 
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </span>
          <i className="fal fa-times" style={{ fontSize: '14px' }}></i>
          
          {/* Animation overlay */}
          {isClearing && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255,255,255,0.3)',
                animation: 'sweep 0.5s ease-in-out'
              }}
            />
          )}
        </button>
      )}
      
      <style jsx>{`
        @keyframes sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .clearing {
          transform: scale(0.98);
          opacity: 0.9;
        }
      `}</style>
    </>
  );
}

