"use client";
import { project1 } from "@/data/product";
import ProjectCard1 from "../card/ProjectCard1";
import ListingOption2 from "../element/ListingOption2";
import ListingSidebar2 from "../sidebar/ListingSidebar2";
import Pagination1 from "./Pagination1";
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import ListingSidebarModal2 from "../modal/ListingSidebarModal2";

export default function Listing8() {
  const getCategory = listingStore((state) => state.getCategory);
  const getProjectType = listingStore((state) => state.getProjectType);
  const getPrice = priceStore((state) => state.priceRange);
  const getDesginTool = listingStore((state) => state.getDesginTool);
  const getLocation = listingStore((state) => state.getLocation);
  const getSearch = listingStore((state) => state.getSearch);
  const getSpeak = listingStore((state) => state.getSpeak);
  const getBestSeller = listingStore((state) => state.getBestSeller);
  const getEnglishLevel = listingStore((state) => state.getEnglishLevel);

  const categoryFilter = (item) =>
    getCategory?.length !== 0 ? getCategory.includes(item.category) : item;
  const projectTypeFilter = (item) =>
    getProjectType?.length !== 0 ? getProjectType.includes(item.projectType) : item;
  const priceFilter = (item) => getPrice.min <= item.price.min && getPrice.max >= item.price.max;
  const skillFilter = (item) =>
    getDesginTool?.length !== 0
      ? getDesginTool.includes(item.skills.split(" ").join("-").toLowerCase())
      : item;
  const locationFilter = (item) =>
    getLocation?.length !== 0
      ? getLocation.includes(item.location.split(" ").join("-").toLowerCase())
      : item;
  const searchFilter = (item) =>
    getSearch !== ""
      ? item.location.split("-").join(" ").toLowerCase().includes(getSearch.toLowerCase())
      : item;
  const speakFilter = (item) =>
    getSpeak?.length !== 0
      ? getSpeak.includes(item.language.split(" ").join("-").toLowerCase())
      : item;
  const englishLevelFilter = (item) =>
    getEnglishLevel?.length !== 0 ? getEnglishLevel.includes(item.englishLevel) : item;
  const sortByFilter = (item) => (getBestSeller === "best-seller" ? item : item.sort === getBestSeller);

  // content
  let content = project1.map((item, i) => (
    <div key={i} className="w-full md:w-1/2 lg:w-full">
      {console.log("data-item: ", item)}
      <ProjectCard1 data={item} />
    </div>
  ));

  return (
    <>
      <section className="pt-[30px] pb-[90px]">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex flex-wrap">
            {/* Sidebar */}
            <div className="w-full lg:w-3/12">
              <ListingSidebar2 />
            </div>

            {/* Main */}
            <div className="w-full lg:w-9/12 pl-8">
              <ListingOption2 itemLength={content?.length} />
              <div className="flex flex-wrap gap-y-6 gap-x-6">{content}</div>
              <div className="mt-[30px]">
                <Pagination1 />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ListingSidebarModal2 />
    </>
  );
}
