"use client";
import { useState, useEffect } from "react";

const serviceCategories = [
  { id: 1, title: "Basement Services", services: ["Basement Remodeling", "Basement Waterproofing", "Egress Window"] },
  { id: 2, title: "Kitchen Services", services: ["Cabinet Makers", "Cabinet Refacing", "Countertop Installation", "Kitchen Remodeling"] },
];

const searchResult = [...new Set(
  serviceCategories.flatMap(category => [
    category.title.toLowerCase(),
    ...category.services.map(s => s.toLowerCase()),
  ])
)].sort();

export default function HeroSearch1({ variant = "default", placeholder = "Search for your service" }) {
  const [isSearchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [getSelectedResult, setSelectedResult] = useState("");
  const [filteredResults, setFilteredResults] = useState(searchResult);

  const focusDropdown = () => setSearchDropdownOpen(true);
  const blurDropdown = () => setTimeout(() => setSearchDropdownOpen(false), 100);
  const selectSearch = (select) => {
    setSelectedResult(select);
    setSearchDropdownOpen(false);
  };

  useEffect(() => {
    if (getSelectedResult.trim() === "") setFilteredResults(searchResult);
    else setFilteredResults(searchResult.filter(item => item.includes(getSelectedResult.toLowerCase())));
  }, [getSelectedResult]);

  // styles for default vs bare input
  const inputBase =
    "w-full bg-transparent outline-none placeholder:text-gray-400";
  const inputClass =
    variant === "bare"
      ? `${inputBase} pl-9 pr-2 py-3`                // no border/pill
      : `${inputBase} border rounded-full pl-10 pr-4 py-2 border-gray-300`;

  return (
    <form className="relative w-full">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <i className="far fa-magnifying-glass" />
        </span>

        <input
          className={inputClass}
          type="text"
          name="search"
          placeholder={placeholder}
          onFocus={focusDropdown}
          onBlur={blurDropdown}
          value={getSelectedResult}
          onChange={(e) => setSelectedResult(e.target.value.toLowerCase())}
        />

        {/* suggestions dropdown */}
        <div
          className={`absolute left-0 right-0 bg-white rounded-xl shadow-lg transition-all duration-200 z-50 ${
            isSearchDropdownOpen ? "visible opacity-100 top-[110%]" : "invisible opacity-0 top-[120%]"
          }`}
        >
          <h6 className="text-sm font-medium pl-6 pt-6 pb-2">
            {getSelectedResult ? "Search Results" : "Popular Search"}
          </h6>
          <div className="max-h-64 overflow-y-auto px-2 pb-4">
            <ul className="m-0 p-0 list-none space-y-1">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <li key={index}>
                    <div
                      onMouseDown={() => selectSearch(item)}
                      className={`cursor-pointer rounded-md px-4 py-2 hover:bg-gray-100 ${
                        getSelectedResult === item ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="capitalize">{item}</div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center text-sm text-gray-500 py-2">No results found</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
