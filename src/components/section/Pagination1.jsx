"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Pagination1({ totalItems, itemsPerPage = 20, onPageChange }) {
  const path = usePathname();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    // Show first page
    pages.push(1);
    
    // Current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // Last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    // Add ellipsis
    const result = [];
    let prev = 0;
    
    for (const page of pages) {
      if (page - prev > 1) {
        result.push("...");
      }
      result.push(page);
      prev = page;
    }
    
    return result;
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // You could call a function passed as prop here to update the parent component
      if (onPageChange) {
        onPageChange(page);
      }
    }
  };

  return (
    <>
      <div
        className={`mbp_pagination text-center ${
          path === "/blog-2" || path === "/blog-3" ? "mb40-md" : ""
        } ${path === "/shop-list" ? "mt30" : ""}`}
      >
        <ul className="page_navigation">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <a 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ cursor: 'pointer' }}
            >
              <span className="fas fa-angle-left" />
            </a>
          </li>
          
          {getPageNumbers().map((page, index) => (
            <li 
              key={index} 
              className={`page-item ${page === currentPage ? "active" : ""} ${page === "..." ? "disabled" : ""}`} 
              aria-current={page === currentPage ? "page" : undefined}
            >
              <a 
                className="page-link"
                onClick={() => page !== "..." && handlePageChange(page)}
                style={{ cursor: page !== "..." ? 'pointer' : 'default' }}
              >
                {page}
                {page === currentPage && <span className="sr-only">(current)</span>}
              </a>
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <a 
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ cursor: 'pointer' }}
            >
              <span className="fas fa-angle-right" />
            </a>
          </li>
        </ul>
        <p className="mt10 mb-0 pagination_page_count text-center">
          {totalItems > 0 ? `${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}+ property available` : 'No items available'}
        </p>
      </div>
    </>
  );
}

