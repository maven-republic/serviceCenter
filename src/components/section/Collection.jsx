"use client";
import { useState, useEffect } from 'react';
import listingStore from "@/store/listingStore";
import ListingOption3 from "../element/ListingOption3";
import ListingSidebarModal1 from "../modal/ListingSidebarModal1";
import Pagination1 from "./Pagination1";
import priceStore from "@/store/priceStore";
import PopularServiceSlideCard1 from "../card/PopularServiceSlideCard1";
import TrendingServiceCard1 from "../card/TrendingServiceCard1";
import { service } from "@/data/product";
import ListingMap1 from "../element/ListingMap1";

export default function Collection() {
  const [currentPage, setCurrentPage] = useState(1);
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

  useEffect(() => {
    resetAllFilters();
  }, []);

  // filter functions (no changes to these)
  const deliveryFilter = (item) =>
    getDeliveryTime === "" || getDeliveryTime === "anytime"
      ? item
      : item.deliveryTime === getDeliveryTime;

  const priceFilter = (item) =>
    getPriceRange.min <= item.price && getPriceRange.max >= item.price;

  const levelFilter = (item) =>
    getLevel?.length !== 0 ? getLevel.includes(item.level) : item;

  const locationFilter = (item) =>
    getLocation?.length !== 0 ? getLocation.includes(item.location) : item;

  const searchFilter = (item) =>
    getSearch !== ""
      ? item.location.split("-").join(" ").includes(getSearch.toLowerCase())
      : item;

  const sortByFilter = (item) =>
    getBestSeller === "" ? item : (getBestSeller === "best-seller" ? item : item.sort === getBestSeller);

  const designToolFilter = (item) =>
    getDesginTool?.length !== 0 ? getDesginTool.includes(item.tool) : item;

  const speakFilter = (item) =>
    getSpeak?.length !== 0 ? getSpeak.includes(item.language) : item;

  // Apply all filters
  const filteredServices = service
    .filter(getDeliveryTime ? deliveryFilter : () => true)
    .filter(getPriceRange.min !== 0 || getPriceRange.max !== 100000 ? priceFilter : () => true)
    .filter(getLevel?.length !== 0 ? levelFilter : () => true)
    .filter(getLocation?.length !== 0 ? locationFilter : () => true)
    .filter(getSearch !== "" ? searchFilter : () => true)
    .filter(getBestSeller !== "" ? sortByFilter : () => true)
    .filter(getDesginTool?.length !== 0 ? designToolFilter : () => true)
    .filter(getSpeak?.length !== 0 ? speakFilter : () => true);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Map items for current page only
  let content = currentItems.map((item, i) => (
    <div key={i} className="col-sm-6">
      {item?.gallery ? (
        <PopularServiceSlideCard1 data={item} />
      ) : (
        <TrendingServiceCard1 data={item} />
      )}
    </div>
  ));
  
  return (
    <>
      <section className="p-0">
        <div className="container-fluid">
          <div className="row wow fadeInUp" data-wow-delay="300ms">
            <div className="col-xl-7">
              <div className="half_map_area_content mt30">
                <div className="text-center text-sm-start">
                  <h4 className="fw700 mb20">Design &amp; Creative</h4>
                </div>
                <ListingOption3 />
                <div className="row">{content}</div>
                <Pagination1 
                  totalItems={filteredServices.length} 
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
            <div className="col-xl-5 overflow-hidden position-relative">
              <ListingMap1 />
            </div>
          </div>
        </div>
      </section>
      <ListingSidebarModal1 />
    </>
  );
}