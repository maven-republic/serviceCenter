import Link from "next/link";
import FooterHeader from "./ui/FooterHeader";
import FooterSelect2 from "./ui/FooterSelect2";
import { about, category, support } from "@/data/footer";

export default function Footer() {
  return (
    <>
      <section className="bg-[#0b0f1a] pt-[25px] pb-0">
        <div className="mx-auto max-w-[1200px] px-4">
          <FooterHeader />

          <div className="flex flex-wrap gap-y-8">
            {/* About */}
            <div className="w-full sm:w-1/2 lg:w-1/4">
              <div className="mb-4 sm:mb-5">
                <h5 className="text-white mb-[15px] text-base font-semibold">About</h5>
                <div className="flex flex-col gap-2 text-white/80">
                  {about.map((item, i) => (
                    <Link key={i} href={item.path} className="hover:text-white transition">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="w-full sm:w-1/2 lg:w-1/4">
              <div className="mb-4 sm:mb-5">
                <h5 className="text-white mb-[15px] text-base font-semibold">Categories</h5>
                <ul className="list-none p-0 m-0 flex flex-col gap-2 text-white/80">
                  {category.map((item, i) => (
                    <li key={i}>
                      <Link href={item.path} className="hover:text-white transition">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Support */}
            <div className="w-full sm:w-1/2 lg:w-1/4">
              <div className="mb-4 sm:mb-5">
                <h5 className="text-white mb-[15px] text-base font-semibold">Support</h5>
                <ul className="list-none p-0 m-0 flex flex-col gap-2 text-white/80">
                  {support.map((item, i) => (
                    <li key={i}>
                      <Link href={item.path} className="hover:text-white transition">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Subscribe */}
            <div className="w-full sm:w-1/2 lg:w-1/4">
              <div className="mb-4 sm:mb-5">
                <h5 className="text-white mb-[20px] text-base font-semibold">Subscribe</h5>
                <div className="flex gap-2">
                  <input
                    type="email"
                    className="w-full rounded-full px-4 py-3 bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Your email address"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full px-4 py-3 border border-white/30 text-white hover:bg-white/10 transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto max-w-[1200px] px-4 border-t border-white/20 py-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2">
              <div className="text-center lg:text-left">
                <p className="mb-2 md:mb-0 text-white/70 text-sm">
                  © maven republic. 2025{" "}
                  <Link
                    href="https://themeforest.net/user/ib-themes/portfolio"
                    target="_blank"
                    className="text-inherit"
                  />
                  . All rights reserved.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="text-center lg:text-right">
                <FooterSelect2 />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
