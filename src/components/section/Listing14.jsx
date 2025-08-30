"use client";
import listingStore from "@/store/listingStore";
import ListingOption2 from "../element/ListingOption2";
import ListingSidebar5 from "../sidebar/ListingSidebar5";
import Pagination1 from "./Pagination1";
import priceStore from "@/store/priceStore";
import { freelancer1 } from "@/data/product";
import FreelancerCard2 from "../card/FreelancerCard2";
import ListingSidebarModal5 from "../modal/ListingSidebarModal5";

export default function Listing14() {
  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getLocation = listingStore((state) => state.getLocation);
  const getSearch = listingStore((state) => state.getSearch);
  const getLevel = listingStore((state) => state.getLevel);
  const getSpeak = listingStore((state) => state.getSpeak);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  // category filter
  const categoryFilter = (item) =>
    getCategory?.length !== 0 ? getCategory.includes(item.skill) : item;

  // salary filter
  const priceFilter = (item) =>
    priceRange.min <= item.price && priceRange.max >= item.price;

  // location filter
  const locationFilter = (item) =>
    getLocation?.length !== 0
      ? getLocation.includes(item.location.split(" ").join("-").toLowerCase())
      : item;

  const searchFilter = (item) =>
    getSearch !== ""
      ? item.location.split("-").join(" ").includes(getSearch.toLowerCase())
      : item;

  // level filter
  const levelFilter = (item) =>
    getLevel?.length !== 0 ? getLevel.includes(item.level) : item;

  // speak filter
  const languageFilter = (item) =>
    getSpeak?.length !== 0
      ? getSpeak.includes(item.language.toLowerCase())
      : item;

  // sort by filter
  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? item : item.sort === getBestSeller;

  // .slice(0, 9)
  // .filter(categoryFilter)
  // .filter(priceFilter)
  // .filter(locationFilter)
  // .filter(searchFilter)
  // .filter(levelFilter)
  // .filter(languageFilter)
  // .filter(sortByFilter)

  const content = freelancer1.map((item, i) => (
    <div key={i}>
      <FreelancerCard2 data={item} />
    </div>
  ));

  return (
    <>
      <section className="pt-[30px] pb-[90px]">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex flex-wrap">
            {/* Sidebar */}
            <div className="w-full lg:w-3/12">
              <ListingSidebar5 />
            </div>

            {/* Main */}
            <div className="w-full lg:w-9/12 lg:pl-8">
              <ListingOption2 itemLength={content?.length} />

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
                {content?.length !== 0 ? content : (
                  <div className="col-span-full text-center text-slate-500">
                    Data not found!
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="mt-[30px]">
                <Pagination1 />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ListingSidebarModal5 />
    </>
  );
}
