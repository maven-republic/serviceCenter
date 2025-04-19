"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Manifest({ data }) {
  const [isFavActive, setFavActive] = useState(false);
  const path = usePathname();

  // Handle missing images or data
  const imageUrl = data.img || "/images/listings/default.jpg";
  const authorImg = data.author?.img || "/images/team/default-avatar.png";
  const authorName = data.author?.name || "Service Provider";
  const serviceTitle = data.title || "Service";
  const truncatedTitle = serviceTitle.length > 40 ? serviceTitle.slice(0, 40) + "..." : serviceTitle;

  return (
    <>
      <div className="listing-style1 border-0 shadow-none">
        <div className="list-thumb">
          <Image
            height={320}
            width={255}
            
            className="w-100 h-40 object-fit-cover rounded"
            src={imageUrl}
            alt={serviceTitle}
            onError={(e) => {
              e.target.src = "/images/listings/default.jpg";
            }}
          />
          <a
            onClick={() => setFavActive(!isFavActive)}
            className={`listing-fav fz12 ${isFavActive ? "ui-fav-active" : ""}`}
          >
            <span className="far fa-heart" />
          </a>
        </div>
         {/* Author/Provider Information */}
         <div className="d-flex align-items-center mt-2">
            {/* <span className="position-relative mr10">
              <Image
                height={24}
                width={24}
                className="rounded-circle wa"
                src={authorImg}
                alt={`${authorName} Photo`}
                onError={(e) => {
                  e.target.src = "/images/team/default-avatar.png";
                }}
              />
              <span className="online-badges" />
            </span> */}
            {/* <span className="fz14 ms-2">{authorName}</span> */}

             {/* Price Display */}
              {/* <div className="budget">
              <p className="mb-0 body-color">
                 Starting at  */}
                {/* <span className="fz17 fw500 dark-color ms-1"> */}
                {/* <h4 className="price-display mb-1 fw-bold">${data.price.toLocaleString()}</h4> */}
                {/* </span> */}
              {/* </p>
            </div>  */}
          
          </div>
        
        
      </div>

      <div className="list-content border-0 p-0 mt-2">
          <p className="list-text body-color fz14 mb-1">{data.category || "Service"}</p>
          <h5 className="list-title">
            <Link href={`/service-single/${data.id}`}>
              {truncatedTitle}
            </Link>
          </h5>
          <div className="review-meta d-flex align-items-center">
            {/* <i className="fas fa-star fz10 review-color me-2" /> */}
            {/* <p className="mb-0 body-color fz14">
              <span className="dark-color me-2">{data.rating || "4.5"}</span>
              {data.review || "0"} reviews
            </p> */}
          </div>
          
         
         
        </div>
    </>
  );
}