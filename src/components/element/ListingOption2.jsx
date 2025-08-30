"use client";
import toggleStore from "@/store/toggleStore";
import SortOption1 from "../option/SortOption1";
import Image from "next/image";

export default function ListingOption2({ itemLength }) {
  const listingToggle = toggleStore((state) => state.listingToggleHandler);

  return (
    <div className="flex flex-wrap items-center mb-5">
      {/* Left: count */}
      <div className="w-full md:w-1/2">
        <p className="text-slate-700 text-center md:text-left mb-2 md:mb-0">
          <span className="font-medium">{itemLength}</span> services available
        </p>
      </div>

      {/* Right: controls */}
      <div className="w-full md:w-1/2">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-2">
          {/* Mobile filter button */}
          <button
            type="button"
            onClick={listingToggle}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 transition lg:hidden"
          >
            <Image
              height={18}
              width={18}
              className="mr-2"
              src="/images/icon/all-filter-icon.svg"
              alt="filters"
            />
            All Filters
          </button>

          {/* Sort dropdown */}
          <SortOption1 />
        </div>
      </div>
    </div>
  );
}
