"use client";
import { useState, useEffect } from 'react';
import listingStore from "@/store/listingStore";
import Sift from "../element/Sift";
import ListingSidebarModal1 from "../modal/ListingSidebarModal1";
import Pagination1 from "./Pagination1";
import priceStore from "@/store/priceStore";
import PopularServiceSlideCard1 from "../card/PopularServiceSlideCard1";
import Manifest from "../card/Manifest";
import ListingMap1 from "../element/ListingMap1";

export default function Collection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const itemsPerPage = 12; // Increased from 4 to 12 for full-width layout
  
  const getDeliveryTime = listingStore((state) => state.getDeliveryTime);
  const getPriceRange = priceStore((state) => state.priceRange);
  const getLevel = listingStore((state) => state.getLevel);
  const getLocation = listingStore((state) => state.getLocation);
  const getBestSeller = listingStore((state) => state.getBestSeller);
  const getDesginTool = listingStore((state) => state.getDesginTool);
  const getSpeak = listingStore((state) => state.getSpeak);
  const getSearch = listingStore((state) => state.getSearch);
  const resetAllFilters = listingStore((state) => state.resetAllFilters);
  const getCategory = listingStore((state) => state.getCategory);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log("Fetching services...");
        setLoading(true);
        setError(null);

        // Fetch from the main services API endpoint
        const response = await fetch('/api/services', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        });

        console.log("Response received:", response.status);

        // Check the content type
        const contentType = response.headers.get('content-type');
        console.log("Content type:", contentType);

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          throw new Error(`Expected JSON, got ${contentType}: ${text}`);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          
          // If it's a 400 error about professional ID, try a different approach
          if (response.status === 400 && errorText.includes('Professional ID')) {
            throw new Error('API_REQUIRES_PROFESSIONAL_ID');
          }
          
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setServices(data);
        } else if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        } else if (data.data && Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          console.warn("Unexpected data format:", data);
          setServices([]);
        }

      } catch (error) {
        console.error('Detailed error fetching services:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        setError(error.message);
        
        // Fallback to using static data if API fails
        try {
          const module = await import("@/data/product");
          if (module.service && Array.isArray(module.service)) {
            setServices(module.service);
            setError(null); // Clear error if fallback works
          } else {
            setServices([]);
          }
        } catch (fallbackError) {
          console.error('Fallback data also failed:', fallbackError);
          setServices([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
    resetAllFilters();
  }, [resetAllFilters]);

  // Filter functions remain the same
  const deliveryFilter = (item) =>
    getDeliveryTime === "" || getDeliveryTime === "anytime"
      ? item
      : item.deliveryTime === getDeliveryTime;

  const categoryFilter = (item) =>
    getCategory?.length !== 0 
      ? getCategory.includes(item.category) 
      : item;

  const priceFilter = (item) =>
    getPriceRange.min <= item.price && getPriceRange.max >= item.price;

  const levelFilter = (item) =>
    getLevel?.length !== 0 ? getLevel.includes(item.level) : item;

  const locationFilter = (item) =>
    getLocation?.length !== 0 ? getLocation.includes(item.location) : item;

  const searchFilter = (item) =>
    getSearch !== ""
      ? (item.title?.toLowerCase().includes(getSearch.toLowerCase()) || 
         item.category?.toLowerCase().includes(getSearch.toLowerCase()) ||
         item.description?.toLowerCase().includes(getSearch.toLowerCase()) ||
         item.name?.toLowerCase().includes(getSearch.toLowerCase())) // Added name field
      : item;

  const sortByFilter = (item) =>
    getBestSeller === "" ? item : (getBestSeller === "best-seller" ? item : item.sort === getBestSeller);

  const designToolFilter = (item) =>
    getDesginTool?.length !== 0 ? getDesginTool.includes(item.tool) : item;

  const speakFilter = (item) =>
    getSpeak?.length !== 0 ? getSpeak.includes(item.language) : item;

  // Apply all filters
  const filteredServices = services
    .filter(getDeliveryTime ? deliveryFilter : () => true)
    .filter(getPriceRange.min !== 0 || getPriceRange.max !== 100000 ? priceFilter : () => true)
    .filter(getLevel?.length !== 0 ? levelFilter : () => true)
    .filter(getLocation?.length !== 0 ? locationFilter : () => true)
    .filter(getSearch !== "" ? searchFilter : () => true)
    .filter(getBestSeller !== "" ? sortByFilter : () => true)
    .filter(getDesginTool?.length !== 0 ? designToolFilter : () => true)
    .filter(getSpeak?.length !== 0 ? speakFilter : () => true)
    .filter(getCategory?.length !== 0 ? categoryFilter : () => true); 

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && services.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ height: '400px' }}>
        <div className="alert alert-warning text-center">
          <h5>Unable to load services</h5>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-2" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="p-0">
        <div className="container-fluid px-4"> {/* Added horizontal padding */}
          <div className="row wow fadeInUp" data-wow-delay="300ms">
            
            {/* FULL WIDTH - Changed from col-xl-7 to col-12 */}
            <div className="col-12">
              <div className="services_listing_area ">
                
                {/* Enhanced Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw700 mb-1">
                      {/* Services  */}
                      {error && <small className="text-warning ms-2">(Using cached data)</small>}
                    </h4>
                    <p className="text-muted mb-0">
                      {/* {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found */}
                    </p>
                  </div>
                  
                  {/* Results summary */}
                  {/* {currentItems.length > 0 && (
                    <div className="results-summary text-muted">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredServices.length)} of {filteredServices.length}
                    </div>
                  )} */}
                </div>
                
                {/* Filters Section */}
                {/* <Sift /> */}
                
                {/* Services Grid - Pinterest Style Responsive Grid */}
                <div className="row g-3 mb-4"> {/* g-3 adds consistent 16px gaps */}
                  {currentItems.length > 0 ? currentItems.map((item, i) => (
                    <div 
                      key={item.id || i} 
                      className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3 col-xxl-2" 
                      // Pinterest-style responsive breakdown:
                      // Mobile (xs): 1 column (col-12)
                      // Small tablet (sm): 2 columns (col-sm-6) 
                      // Medium tablet (md): 3 columns (col-md-4)
                      // Desktop (lg): 4 columns (col-lg-3)
                      // Large desktop (xl): 4 columns (col-xl-3)
                      // Extra large (xxl): 6 columns (col-xxl-2)
                    >
                      {/* Always use Manifest for Pinterest-style cards */}
                      <Manifest data={item} />
                    </div>
                  )) : (
                    <div className="col-12">
                      <div className="text-center py-5">
                        <div className="empty-state">
                          <div className="mb-4">
                            <i className="fas fa-search fa-4x text-muted opacity-50"></i>
                          </div>
                          <h4 className="fw600 mb-3">No services found</h4>
                          <p className="text-muted mb-4">
                            We couldn't find any services matching your criteria.<br />
                            Try adjusting your filters or search terms.
                          </p>
                          <button 
                            className="btn btn-thm px-4 py-2" 
                            onClick={resetAllFilters}
                          >
                            <i className="fas fa-refresh me-2"></i>
                            Clear All Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Pagination Section */}
                {filteredServices.length > 0 && (
                  <div className="pagination-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                      
                      {/* Results info */}
                      <div className="pagination-info text-muted">
                        Page {currentPage} of {Math.ceil(filteredServices.length / itemsPerPage)}
                      </div>
                      
                      {/* Pagination component */}
                      <Pagination1 
                        totalItems={filteredServices.length} 
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        currentPage={currentPage}
                      />
                      
                      {/* Items per page selector (optional) */}
                      <div className="items-per-page">
                        <select 
                          className="form-select form-select-sm"
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(parseInt(e.target.value));
                            setCurrentPage(1); // Reset to first page
                          }}
                          style={{ width: 'auto', minWidth: '80px' }}
                        >
                          <option value={8}>8 per page</option>
                          <option value={12}>12 per page</option>
                          <option value={16}>16 per page</option>
                          <option value={24}>24 per page</option>
                        </select>
                      </div>
                      
                    </div>
                  </div>
                )}
                
              </div>
            </div>
            
            {/* Map section is completely removed */}
            
          </div>
        </div>
      </section>
      
         </>
  );
}