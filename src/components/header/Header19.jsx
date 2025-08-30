"use client";
import Image from "next/image";
import Link from "next/link";
import Navigation from "./Navigation";
import MobileNavigation2 from "./MobileNavigation2";

export default function Header19() {
  return (
    <header className="header-nav nav-innerpage-style at-home20 main-menu border-0">
      {/* Desktop header (≥950px) */}
      <nav className="relative hidden lg:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link className="header-logo logo1 block" href="/">
              <Image
                width={133}
                height={40}
                src="/images/header-logo-dark2.svg"
                alt="Header Logo"
              />
            </Link>

            {/* Desktop Navigation */}
            <Navigation />

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link className="login-info" href="/become-seller">
                <span className="hidden xl:inline">Become a</span> Seller
              </Link>

              <Link
                className="login-info home18-sign-btn bdrs12 bdr1-dark px-6 py-1"
                href="/login"
              >
                Sign in
              </Link>

              <Link
                className="ud-btn add-joining home20-join-btn bdrs12 text-white px-6 py-1"
                href="/register"
              >
                Join
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header (<950px) */}
      <div className="lg:hidden">
        <MobileNavigation2 />
      </div>
    </header>
  );
}
