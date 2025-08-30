"use client";
import Image from "next/image";
import Link from "next/link";
import navigation from "@/data/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MobileNavigation2() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <div className="mobilie_header_nav stylehome1 border-b">
      {/* Top bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link className="mobile_logo" href="/">
          <Image
            height={40}
            width={133}
            src="/images/header-logo3.svg"
            alt="Header Logo"
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium">
            Join
          </Link>
          <button
            className="menubar"
            aria-label="Open mobile menu"
            onClick={() => setOpen(true)}
          >
            <Image
              height={20}
              width={20}
              src="/images/mobile-dark-nav-icon.svg"
              alt="Menu icon"
            />
          </button>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <button
            className="text-2xl"
            aria-label="Close mobile menu"
            onClick={() => setOpen(false)}
          >
            &times;
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-3">
            {navigation.map((item, i) => (
              <li key={i}>
                {item.children ? (
                  <span className="block text-sm font-semibold text-gray-800">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className={`block text-sm font-medium ${
                      item.path === path ? "text-primary" : "text-gray-700 hover:text-primary"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-center border rounded-full px-4 py-2 text-sm"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="text-center rounded-full px-4 py-2 text-sm text-white bg-primary"
            >
              Join
            </Link>
          </div>
        </nav>
      </aside>
    </div>
  );
}
