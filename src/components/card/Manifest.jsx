"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";

export default function Manifest({ data }) {
  const [isFavActive, setFavActive] = useState(false);
  const [showImage, setShowImage] = useState(true); // default to true, we'll disable only if needed
  const path = usePathname();

  // Function to generate a random pastel color
  const getRandomPastelColor = (seed) => {
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const hue = hashCode(seed || 'default') % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  const backgroundColor = useMemo(() =>
    getRandomPastelColor(data.id || data.title),
    [data.id, data.title]
  );

  // Determine if the background color is valid
  const isValidColor = backgroundColor && backgroundColor !== 'transparent';

  const serviceTitle = data.title || "Service";
  const truncatedTitle = serviceTitle.length > 40 ? serviceTitle.slice(0, 40) + "..." : serviceTitle;

  return (
    <>
      <div className="listing-style1 border-0 shadow-none">
        <div 
          className="list-thumb"
          style={{
            backgroundColor: isValidColor ? backgroundColor : undefined,
            height: '320px',
            width: '100%',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {/* Only show image if color is not valid */}
          {!isValidColor && data.img && showImage && (
            <Image
              fill
              style={{ objectFit: "cover", zIndex: 0 }}
              src={data.img}
              alt={serviceTitle}
              onError={() => setShowImage(false)}
            />
          )}

          {/* Favorite button */}
          <a
            onClick={() => setFavActive(!isFavActive)}
            className={`listing-fav fz12 ${isFavActive ? "ui-fav-active" : ""}`}
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}
          >
            <span className="far fa-heart" />
          </a>
        </div>

       

      </div>

      <div className="list-content border-0 p-0 mt-2" style={{ position: 'relative', zIndex: 2 }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="list-title m-0 service-title text-uppercase">
          <Link href={`services/${data.id}`}>           
             {truncatedTitle}
            </Link>
          </h5>
          <div className="category-tag border rounded-pill px-2 py-1">
            <small className="text-muted text-lowercase">
              {data.category || "Service"}
            </small>
          </div>
        </div>
</div>
    </>
  );
}
