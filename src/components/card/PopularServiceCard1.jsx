"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PopularServiceCard1({
  data,
  style = "",
  isContentExpanded = false,
}) {
  const [isFavActive, setFavActive] = useState(false);
  const path = usePathname();

  return (
    <>
      <div
        className={`listing-style1 ${
          path === "/home-2" ||
          path === "/home-9" ||
          path === "/home-16" ||
          path === "/home-14"
            ? "bdrs16"
            : ""
        } ${path === "/home-7" ? "style5" : ""} ${style}`}
        style={path === "/home-20" ? { border: "none", boxShadow: "none" } : {}}
      >
        <div className="list-thumb relative">
          <Image
            height={247}
            width={331}
            className="w-full"
            src={data.img}
            alt="thumbnail"
          />
          <a
            onClick={() => setFavActive(!isFavActive)}
            className={`listing-fav text-xs ${isFavActive ? "ui-fav-active" : ""}`}
          >
            <span className="far fa-heart" />
          </a>
        </div>
        <div className={`list-content ${isContentExpanded ? "px-0" : ""}`}>
          <p className="list-text body-color text-sm mb-1">{data.category}</p>
          <h5 className="list-title">
            <Link href={`/service-single/${data.id}`}>
              {data.title.slice(0, 40) + "..."}
            </Link>
          </h5>
          <div className="review-meta flex items-center">
            <i className="fas fa-star text-[10px] review-color mr-2" />
            <p className="mb-0 body-color text-sm">
              <span className="dark-color mr-2">{data.rating}</span>
              {data.review} reviews
            </p>
          </div>
          <hr className="my-2" />
          <div className="list-meta flex justify-between items-center mt-[15px]">
            <Link className="flex" href="/">
              <span className="relative mr-[10px]">
                <Image
                  height={30}
                  width={30}
                  className="rounded-full object-contain"
                  src={data.author.img}
                  alt="Freelancer Photo"
                />
                <span className="online-badges" />
              </span>
              <span className="text-sm">{data.author.name}</span>
            </Link>
            <div className="budget">
              <p className="mb-0 body-color">
                Starting at
                <span className="text-lg font-medium dark-color ml-1">
                  ${data.price}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
