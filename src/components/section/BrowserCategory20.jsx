"use client";
import HeighestRetedCard1 from "../card/HighestRatedCard1";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper";
import { freelancer1, hightedRated1 } from "@/data/product";
import Link from "next/link";
import { browserCategory } from "@/data/project";
import { useEffect, useState } from "react";

export default function BrowserCategory20() {
  const [showSwiper, setShowSwiper] = useState(false);
  useEffect(() => {
    setShowSwiper(true);
  }, []);

  return (
    <>
      <section
        className="mx-auto maxw1700 bgc-thm4 bdrs24 bg-[#5bbb7b17] py-[65px]"
      >
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex flex-wrap items-center wow fadeInUp">
            <div className="w-full lg:w-9/12">
              <div className="main-title">
                <h2 className="title">Browse talent by category</h2>
                <p className="paragraph">
                  Get some Inspirations from 1800+ skills
                </p>
              </div>
            </div>
            <div className="w-full lg:w-3/12">
              <div className="lg:text-right mb-3">
                <Link href="/freelancer-1" className="ud-btn2">
                  All Categories <i className="fal fa-arrow-right-long"></i>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="w-full">
              <div className="ui-hightest-rated">
                {showSwiper && (
                  <Swiper
                    spaceBetween={30}
                    navigation={{
                      prevEl: ".unique-13-pre",
                      nextEl: ".unique-13-next",
                    }}
                    modules={[Navigation, Pagination]}
                    className="mySwiper"
                    loop={true}
                    breakpoints={{
                      0: { slidesPerView: 1 },
                      768: { slidesPerView: 2 },
                      992: { slidesPerView: 3 },
                      1200: { slidesPerView: 4 },
                    }}
                  >
                    {browserCategory.map((elm, index) => (
                      <SwiperSlide key={index}>
                        <div className="item">
                          <div className="iconbox-style1 bdrs12 default-box-shadow1">
                            <div className="icon">
                              <span className={elm.icon}></span>
                            </div>
                            <div className="details mt-5">
                              <p className="text mb-[5px]">{elm.skill} skills</p>
                              <h4 className="title">
                                <Link href="/service-1">{elm.title}</Link>
                              </h4>
                              <p className="mb-0">{elm.brif}</p>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>

            <button
              type="button"
              className="prev-btn pre-slide3 unique-13-pre absolute left-[5px] top-full scale-90"
            >
              <i className="far fa-chevron-left" />
            </button>
            <button
              type="button"
              className="next-btn next-slide3 unique-13-next absolute left-[70px] top-full scale-90"
            >
              <i className="far fa-chevron-right" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
