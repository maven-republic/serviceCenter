"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

export default function Pagination1({
  totalItems,
  itemsPerPage = 20,
  onPageChange,
  currentPage: externalCurrentPage,
}) {
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (externalCurrentPage && externalCurrentPage !== currentPage) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage]);

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    if (totalPages <= 1) return [1];

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) range.push(i);

    rangeWithDots.push(1);
    if (start > 2) rangeWithDots.push("ellipsis-start");
    range.forEach((p) => {
      if (p !== 1 && p !== totalPages) rangeWithDots.push(p);
    });
    if (end < totalPages - 1) rangeWithDots.push("ellipsis-end");
    if (totalPages > 1) rangeWithDots.push(totalPages);

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      onPageChange?.(page);
    }
  };

  if (totalItems <= 0 || totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const baseBtn =
    "inline-flex items-center justify-center rounded-md border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const iconSize = "h-8 w-8 p-0";
  const outline = "bg-white border-slate-300 text-slate-700 hover:bg-slate-50";
  const solid = "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Results Summary */}
      <div className="text-sm text-slate-500">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* First */}
        <button
          type="button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`${baseBtn} ${outline} ${iconSize}`}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </button>

        {/* Prev */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${baseBtn} ${outline} ${iconSize}`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </button>

        {/* Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, idx) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <div key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-slate-500" />
                </div>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`${baseBtn} ${isCurrent ? solid : outline} ${iconSize} ${
                  isCurrent ? "pointer-events-none" : ""
                }`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {page}
                {isCurrent && <span className="sr-only">(current)</span>}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${baseBtn} ${outline} ${iconSize}`}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </button>

        {/* Last */}
        <button
          type="button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${baseBtn} ${outline} ${iconSize}`}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </button>
      </div>

      {/* Page Info (Mobile) */}
      <div className="sm:hidden text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
