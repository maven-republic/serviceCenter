"use client";
import { useState, useEffect } from "react";

// Define the service categories directly in this file
const serviceCategories = [
  {
    id: 1,
    title: "Basement Services",
    services: ["Basement Remodeling", "Basement Waterproofing", "Egress Window"]
  },
  {
    id: 2,
    title: "Kitchen Services",
    services: ["Cabinet Makers", "Cabinet Refacing", "Countertop Installation", "Kitchen Remodeling"]
  },
  // Add more categories as needed
];

// Transform serviceCategories into searchResult array
const searchResult = [...new Set(
  serviceCategories.flatMap(category => [
    category.title.toLowerCase(),
    ...category.services.map(service => service.toLowerCase())
  ])
)].sort();

export default function HeroSearch1() {
  const [isSearchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [getSelectedResult, setSelectedResult] = useState("");
  const [filteredResults, setFilteredResults] = useState(searchResult);

  // search dropdown
  const focusDropdown = () => {
    setSearchDropdownOpen(true);
  };
  
  const blurDropdown = () => {
    setSearchDropdownOpen(false);
  };

  const selectSearch = (select) => {
    setSelectedResult(select);
  };

  // Filter results when input changes
  useEffect(() => {
    if (getSelectedResult.trim() === '') {
      setFilteredResults(searchResult);
    } else {
      const filtered = searchResult.filter(item => 
        item.includes(getSelectedResult.toLowerCase())
      );
      setFilteredResults(filtered);
    }
  }, [getSelectedResult]);

  return (
    <>
      <form className="form-search position-relative">
        <div className="box-search">
          <span className="icon far fa-magnifying-glass" />
          <input
            className="form-control"
            type="text"
            name="search"
            placeholder="Search for your service"
            onFocus={focusDropdown}
            onBlur={blurDropdown}
            value={getSelectedResult}
            onChange={(e) => setSelectedResult(e.target.value.toLowerCase())}
          />
          <div
            className="search-suggestions"
            style={
              isSearchDropdownOpen
                ? {
                    visibility: "visible",
                    opacity: "1",
                    top: "70px",
                  }
                : {
                    visibility: "hidden",
                    opacity: "0",
                    top: "100px",
                  }
            }
          >
            <h6 className="fz14 ml30 mt25 mb-3">
              {getSelectedResult ? "Search Results" : "Popular Search"}
            </h6>
            <div className="box-suggestions">
              <ul className="px-0 m-0 pb-4">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => (
                    <li
                      key={index}
                      className={
                        getSelectedResult === item ? "ui-list-active" : ""
                      }
                    >
                      <div
                        onClick={() => selectSearch(item)}
                        className="info-product"
                      >
                        <div className="item_title">{item}</div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-2">No results found</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}