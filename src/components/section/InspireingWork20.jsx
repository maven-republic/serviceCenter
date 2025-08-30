import Image from "next/image";
import Link from "next/link";

export default function InspireingWork20() {
  return (
    <section className="py-0 pb-20 md:pb-24">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Card 1 */}
          <div className="rounded-[28px] bg-amber-50/80 p-6 sm:p-8 md:py-16 md:px-10 lg:py-20 lg:px-14 text-center">
            <div className="mx-auto mb-8 md:mb-10 lg:mb-12 w-[220px] sm:w-[260px]">
              <Image
                src="/images/about/home20-vector-1.png"
                alt="Find great work"
                width={540}
                height={360}
                className="h-auto w-full"
                priority
              />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 sm:mb-6">
              Find great work
            </h2>

            <p className="mx-auto max-w-[60ch] text-slate-600 leading-relaxed mb-8 sm:mb-10">
              Work with the largest network of independent professionals and get
              things done—from quick turnaround.
            </p>

            <Link
              href="/job-1"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-slate-900 font-medium hover:bg-white/60 transition"
            >
              Get Started
              <span aria-hidden className="ml-2">↗</span>
            </Link>
          </div>

          {/* Card 2 */}
          <div className="rounded-[28px] bg-rose-50/80 p-6 sm:p-8 md:py-16 md:px-10 lg:py-20 lg:px-14 text-center">
            <div className="mx-auto mb-8 md:mb-10 lg:mb-12 w-[220px] sm:w-[260px]">
              <Image
                src="/images/about/home20-vector-2.png"
                alt="Find talent your way"
                width={540}
                height={360}
                className="h-auto w-full"
                priority
              />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 sm:mb-6">
              Find talent your way
            </h2>

            <p className="mx-auto max-w-[60ch] text-slate-600 leading-relaxed mb-8 sm:mb-10">
              Work with the largest network of independent professionals and get
              things done—from quick turnaround.
            </p>

            <Link
              href="/freelancer-1"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-slate-900 font-medium hover:bg-white/60 transition"
            >
              Get Started
              <span aria-hidden className="ml-2">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
