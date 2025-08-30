"use client";
import Link from "next/link";
import FooterSocial from "./FooterSocial";

const links = [
  { id: 1, name: "Terms of Service", path: "/" },
  { id: 2, name: "Privacy Policy", path: "/" },
  { id: 3, name: "Site Map", path: "/" },
];

export default function FooterHeader() {
  return (
    <>
      <div className="flex flex-wrap border-b border-white/20 pb-[10px] mb-[60px]">
        {/* Left Links */}
        <div className="w-full mt-4 md:w-7/12">
          <div className="flex flex-col md:flex-row md:items-center text-center md:text-left justify-center md:justify-start gap-x-[30px] gap-y-3">
            {links.map((item, i) => (
              <Link
                key={i}
                href={item.path}
                className="text-white text-lg font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Social */}
        <div className="w-full mt-3 md:w-5/12">
          <FooterSocial />
        </div>
      </div>
    </>
  );
}
