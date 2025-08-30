"use client";
import Image from "next/image";
import HeroSearch1 from "../element/HeroSearch1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const roleOptions = ["City, state, or zip", "Miami", "New York"];
const popular = ["Designer", "Developer", "Web", "IOS", "PHP", "Senior"];

export default function Hero20() {
  const [getSelectedRole, setSelectedRole] = useState(null);
  const [openRole, setOpenRole] = useState(false);
  const roleRef = useRef(null);
  const router = useRouter();

  const roleHandler = (select) => {
    setSelectedRole(select);
    setOpenRole(false);
  };
  const searchHandler = () => router.push("/project-1");

  useEffect(() => {
    function onClickOutside(e) {
      if (roleRef.current && !roleRef.current.contains(e.target)) setOpenRole(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <section className="hero-home13 at-home20 overflow-hidden">
      {/* Floating decorations kept as-is */}
      <div className="home20-hero-imgs-left hidden lg:block">
        <Image width={94} height={94} src="/images/about/home20-hero-1.png" alt=" image " className="img-1 bounce-y" />
        <Image width={68} height={67} src="/images/about/home20-hero-3.png" alt=" image " className="img-3 bounce-y" />
        <Image width={93} height={94} src="/images/about/home20-hero-4.png" alt=" image " className="img-4 bounce-y" />
      </div>
      <div className="home20-hero-imgs-right hidden lg:block">
        <Image width={65} height={66} src="/images/about/home20-hero-5.png" alt=" image " className="img-1 bounce-y" />
        <Image width={94} height={94} src="/images/about/home20-hero-7.png" alt=" image " className="img-3 bounce-y" />
        <Image width={94} height={94} src="/images/about/home20-hero-8.png" alt=" image " className="img-4 bounce-y" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center">
          <div className="w-full">
            <div className="home20-hero-content text-center">
              <h1 className="animate-up-1 mb-6 title">
                Join us & Explore <br className="hidden xl:block" />
                Thousands of Freelancer
              </h1>

              <p className="text mb-6 animate-up-2">
                Work with talented people at the most affordable price to get
                the most <br className="hidden lg:block" />
                out of your time and cost
              </p>

              {/* === SEARCH BAR: single rounded pill === */} 
              <div className="relative z-[9] animate-up-3">
                <div className="
                    flex flex-nowrap items-center gap-4
                    border border-gray-300 rounded-full bg-white shadow-sm
                    px-4 py-3
                  ">
                  {/* Left: Search input (bare) */}
                  <div className="flex-1 min-w-0">
                    <HeroSearch1 variant="bare" placeholder="What are you looking for?" />
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block h-6 w-px bg-gray-300 shrink-0" />

                  {/* Location selector */}
                  <div ref={roleRef} className="relative shrink-0 hidden sm:block">
                    <button
                      type="button"
                      onClick={() => setOpenRole((s) => !s)}
                      className="flex items-center gap-2 text-gray-900 whitespace-nowrap"
                      aria-haspopup="listbox"
                      aria-expanded={openRole}
                    >
                      {getSelectedRole ?? "City, state, or zip"}
                      <span className="text-xs translate-y-[1px]">▾</span>
                    </button>

                    {/* Dropdown */}
                    <ul
                      className={`absolute right-0 mt-2 w-56 max-h-60 overflow-auto rounded-xl border bg-white shadow-lg transition-all duration-200
                        ${openRole ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"}`}
                      role="listbox"
                    >
                      {roleOptions.map((item) => (
                        <li
                          key={item}
                          role="option"
                          aria-selected={getSelectedRole === item}
                          onMouseDown={() => roleHandler(item)}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            getSelectedRole === item ? "bg-gray-100 font-medium" : ""
                          }`}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Search button (green pill) */}
                  <button
                    type="button"
                    onClick={searchHandler}
                    className="shrink-0 rounded-full bg-[#52B87A] text-white font-semibold
                              px-7 py-3 hover:bg-[#45a46c] transition"
                  >
                    Search
                  </button>
                </div>
              </div>


              {/* === /SEARCH BAR === */}

              {/* Popular Searches */}
              <div className="block md:flex justify-center mt-8 text-center animate-up-4">
                <p className="hero-text text-sm mr-2 mb-0">Popular Searches :</p>
                {popular.map((elm, i) => (
                  <span key={i} className="text text-gray-700">
                    {elm}
                    {i !== popular.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
