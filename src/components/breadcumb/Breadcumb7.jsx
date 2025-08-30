"use client";
import { useEffect, useState } from "react";
import HeroSearch1 from "../element/HeroSearch1";
import { useRouter } from "next/navigation";
import { useSearchServiceStore } from "@/store/useSearchServiceStore";

const role = [
  "Choose Category",
  "Graphics & Design",
  "Digital Marketing",
  "Writing & Translation",
  "Video & Animation",
  "Music & Audio",
  "Programming & Tech",
];

export default function Breadcumb7() {
  const [getSelectedRole, setSelectedRole] = useState(null);
  const [openRole, setOpenRole] = useState(false);

  const { searchParams, setSearchParams, fetchResults } = useSearchServiceStore();

  useEffect(() => {
    setSearchParams({
      parish_filter: "St. Andrew Parish",
      limit_val: 1,
      offset_val: 0,
    });
    fetchResults();
    console.log("searchParams", searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleHandler = (select) => {
    setSelectedRole(select);
    setOpenRole(false);
  };

  const router = useRouter();
  const searchHandler = () => {
    // router.push("/service-6");
  };

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="relative bg-green-400 mx-auto max-w-[1700px] rounded-[16px] flex items-center pt-[40px] pb-[40px]">
          <div className="mx-auto max-w-[1200px] px-4 w-full">
            <div className="wow fadeInUp">
              <div className="w-full xl:w-8/12">
                <div className="relative">
                  <h3 className="text-white text-6xl font-bold">Service Search </h3>
                  <p className="text text-white text-3xl mb-4">
                    Give your visitor a smooth online experience with a solid UX
                    design
                  </p>

                  {/* Search pill */}
                  <div className="mx-auto w-full max-w-[980px]">
                    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                      <div className="flex flex-col md:flex-row items-stretch">
                        {/* Input */}
                        <div className="flex-1 px-5 content-center py-4">
                          <HeroSearch1
                            variant="bare"
                            placeholder="What are you looking for?"
                          />
                        </div>

                        {/* Divider (desktop) */}
                        <div className="hidden md:block w-px bg-slate-200 self-stretch" />

                        {/* Category dropdown */}
                        <div className="px-5 py-4 md:w-64 content-center relative">
                          <button
                            type="button"
                            onClick={() => setOpenRole((v) => !v)}
                            className="w-full inline-flex items-center justify-between text-slate-700"
                          >
                            <span className="truncate">
                              {getSelectedRole ?? "Categories"}
                            </span>
                            <svg
                              className={`h-4 w-4 shrink-0 transition-transform ${
                                openRole ? "rotate-180" : ""
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

                          {openRole && (
                            <div className="absolute left-5 right-5 md:left-auto md:right-5 mt-2 z-20 rounded-xl bg-white shadow-lg ring-1 ring-black/5">
                              <ul className="max-h-60 overflow-auto py-2">
                                {role.map((item, index) => {
                                  const selected = getSelectedRole === item;
                                  return (
                                    <li key={index}>
                                      <button
                                        type="button"
                                        onClick={() => roleHandler(item)}
                                        className={`w-full text-left px-4 py-2 hover:bg-slate-100 ${
                                          selected ? "font-medium" : ""
                                        }`}
                                      >
                                        {item}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Search button */}
                        <div className="p-2 md:p-3">
                          <button
                            onClick={searchHandler}
                            className="h-14 md:h-[64px] px-8 md:px-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm transition w-full md:w-auto"
                            type="button"
                          >
                            Search
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Search pill */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
