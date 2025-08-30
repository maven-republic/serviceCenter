"use client";

import { useState } from "react";
import { bestSeller } from "@/data/listing";
import listingStore from "@/store/listingStore";

export default function SortOption1() {
  const getBestSeller = listingStore((state) => state.getBestSeller);
  const setBestSeller = listingStore((state) => state.setBestSeller);
  const [open, setOpen] = useState(false);

  const selected =
    bestSeller.find((item) => item.value === getBestSeller) || bestSeller[0];

  const handleSelect = (val) => {
    setBestSeller(val);
    setOpen(false);
  };

  return (
    <div className="relative text-slate-900 pr-2 md:pr-0 text-center md:text-left">
      <span className="mr-2">Sort by</span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
      >
        <span className="truncate max-w-[10rem]">{selected.title}</span>
        <svg
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <ul className="max-h-60 overflow-auto py-1" role="listbox">
            {bestSeller.map((item) => {
              const active = item.value === getBestSeller;
              return (
                <li key={item.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.value)}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 ${
                      active ? "font-medium text-slate-900" : "text-slate-700"
                    }`}
                    role="option"
                    aria-selected={active}
                  >
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
