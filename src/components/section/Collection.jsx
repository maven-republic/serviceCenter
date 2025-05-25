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
  const itemsPerPage = 4; // Show 4 items per page
  
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
        const response = await fetch('/api/services', {method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }}
        
        );

        


        console.log("Response received:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    // Check the content type
    const contentType = response.headers.get('content-type');
    console.log("Content type:", contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error(`Expected JSON, got ${contentType}`);
    }

        if (!response.ok) {
          // throw new Error('Failed to fetch services');
          const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Detailed error fetching services:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // Fallback to using static data if API fails
        import("@/data/product").then(module => {
          setServices(module.service);
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
    resetAllFilters();
  }, []);

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
         item.description?.toLowerCase().includes(getSearch.toLowerCase()))
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

  // Map items for current page only
  let content = currentItems.length > 0 ? currentItems.map((item, i) => (
    <div key={i} className="col-sm-6">
      {item?.gallery ? (
        <PopularServiceSlideCard1 data={item} />
      ) : (
        <Manifest data={item} />
      )}
    </div>
  )) : (
    <div className="col-12 text-center py-5">
      <h4>No services found matching your criteria.</h4>
      <button 
        className="btn btn-thm mt-3" 
        onClick={resetAllFilters}
      >
        Clear All Filters
      </button>
    </div>
  );
  
  return (
    <>
      <section className="p-0">
        <div className="container-fluid">
          <div className="row wow fadeInUp" data-wow-delay="300ms">
            <div className="col-xl-7">
              <div className="half_map_area_content mt30">
                <div className="text-center text-sm-start">
                  <h4 className="fw700 mb20">Services</h4>
                </div>
                <Sift />
                <div className="row">{content}</div>
                {filteredServices.length > 0 && (
                  <Pagination1 
                    totalItems={filteredServices.length} 
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
            <div className="col-xl-5 overflow-hidden position-relative">
              <ListingMap1 services={filteredServices} />
            </div>
          </div>
        </div>
      </section>
      <ListingSidebarModal1 />
    </>
  );
}

