"use client";
import { location } from "@/data/listing";
import Search1 from "../element/Search1";
import listingStore from "@/store/listingStore";

export default function LocationOption1() {
  const getLocation = listingStore((state) => state.getLocation);
  const setLocation = listingStore((state) => state.setLocation);

  const locationHandler = (val) => setLocation(val);

  return (
    <>
      <div className="px-0 pt-0">
        <Search1 />

        <div className="mt-3 space-y-3">
          {location.map((item, i) => {
            const id = `location-${i}`;
            const checked = getLocation.includes(item.value);

            return (
              <label
                key={id}
                htmlFor={id}
                className="group flex cursor-pointer select-none items-center gap-3"
              >
                {/* Hidden native checkbox + custom square box */}
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => locationHandler(item.value)}
                  className="peer sr-only"
                />
                <span
                  className={`
                    grid h-4 w-4 place-content-center rounded-[4px] border border-slate-300
                    transition-colors
                    peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-200
                    peer-checked:border-emerald-500 peer-checked:bg-emerald-500
                    after:block after:h-2 after:w-1.5 after:rotate-45
                    after:border-b-2 after:border-r-2 after:border-white
                    after:opacity-0 peer-checked:after:opacity-100
                  `}
                />
                <span
                  className={`flex-1 text-sm transition-colors ${
                    checked
                      ? "font-medium text-emerald-600"
                      : "text-slate-800 group-hover:text-emerald-600"
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-xs transition-colors ${
                    checked ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  ({item.total})
                </span>
              </label>
            );
          })}
        </div>

        <button
          type="button"
          className="mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          +20 more
        </button>
      </div>
    </>
  );
}
