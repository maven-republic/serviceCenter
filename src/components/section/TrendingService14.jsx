"use client";
import { service as product1 } from "@/data/product";
import PopularServiceCard1 from "../card/PopularServiceCard1";
import PopularServiceSlideCard1 from "../card/PopularServiceSlideCard1";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const categories = [
  "All",
  "Development & IT",
  "Design & Creative",
  "Digital Marketing",
  "Music & Audio",
  "Video & Animation",
];

export default function TrendingService14() {
  const [getCurrentCategory, setCurrentCategory] = useState("All");
  const path = usePathname();

  const tabHandler = (select) => setCurrentCategory(select);

  const filtered = product1
    .filter((item) =>
      getCurrentCategory === "All" ? item : item.tag === getCurrentCategory
    )
    .slice(0, 4);

  return (
    <section className={`pt-0 ${path === "/home-9" ? "pb-0" : "pb-24"}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left: Title */}
          <div className="w-full xl:w-4/12">
            <div className="main-title">
              <h2 className="title whitespace-nowrap">Trending Services</h2>
              <p className="paragraph">
                Most viewed and all-time top-selling services
              </p>
            </div>
          </div>

          {/* Right: Tabs */}
          <div className="w-full xl:w-8/12">
            <div className="navpill-style2 at-home9">
              <ul className="flex flex-wrap gap-2 justify-center xl:justify-end mb-8">
                {categories.map((item) => {
                  const active = getCurrentCategory === item;
                  return (
                    <li key={item}>
                      <button
                        onClick={() => tabHandler(item)}
                        className={[
                          "px-4 py-2 rounded-full text-sm font-medium transition",
                          active
                            ? "bg-primary text-white"
                            : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {filtered.map((item, i) => (
            <div key={i} className="w-full">
              {item.gallery ? (
                <PopularServiceSlideCard1 data={item} />
              ) : (
                <PopularServiceCard1 data={item} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
