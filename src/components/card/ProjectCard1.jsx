import Image from "next/image";
import Link from "next/link";

export default function ProjectCard1({ data }) {
  const shownTags = data.tags?.slice(0, 3) ?? [];
  const extraCount = Math.max(0, (data.tags?.length || 0) - shownTags.length);

  return (
    <div className="relative flex flex-col md:flex-row items-start rounded-xl border bg-white p-6 md:p-7 hover:shadow-sm">
      {/* fav */}
      <button
        type="button"
        aria-label="favorite"
        className="absolute right-3 top-3 grid h-8 w-8 place-content-center rounded-full border border-slate-200 text-slate-500 hover:text-emerald-600"
      >
        <i className="far fa-heart" />
      </button>

      {/* left */}
      <div className="flex min-w-0 flex-1 gap-4 md:gap-5">
        <Image
          height={60}
          width={60}
          src={data.img}
          alt={data.title}
          className="h-[60px] w-[60px] rounded-lg object-cover"
        />

        <div className="min-w-0">
          <h5 className="mb-1.5 text-[18px] md:text-[20px] font-semibold text-slate-900">
            {data.title}
          </h5>

          {/* meta */}
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <i className="flaticon-place text-emerald-600" />
              {data.location}
            </span>
            <span className="hidden h-4 w-px bg-slate-200 md:inline-block" />
            <span className="inline-flex items-center gap-2">
              <i className="flaticon-30-days text-emerald-600" />
              Posted 3 years ago
            </span>
            <span className="hidden h-4 w-px bg-slate-200 md:inline-block" />
            <span className="inline-flex items-center gap-2">
              <i className="flaticon-contract text-emerald-600" />
              2 Proposals
            </span>
          </div>

          {/* brief */}
          <p className="mb-4 max-w-[60ch] text-slate-600/90 line-clamp-2">
            {data.brief}
          </p>

          {/* tags */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {shownTags.map((t, i) => (
              <span
                key={i}
                className="rounded-full bg-[#F7E7E3] px-3 py-1 text-sm text-slate-700"
              >
                {t}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="text-slate-600">+{extraCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* divider */}
      <span className="my-5 hidden self-stretch md:mx-6 md:block md:w-px md:bg-slate-200" />

      {/* right */}
      <div className="w-full md:w-[300px] md:pl-0 flex items-center md:block md:text-right gap-4 md:gap-3">
        <div className="md:ml-auto">
          <h4 className="text-[18px] md:text-[20px] font-semibold text-slate-900">
            ${data.price.min} – ${data.price.max}
          </h4>
          <p className="text-sm text-slate-500">Hourly rate</p>
        </div>

        <Link
          href={`/project-single/${data.id}`}
          className="ml-auto md:ml-0 inline-flex h-12 md:h-14 w-[220px] md:w-[260px] items-center justify-center gap-2 rounded-xl border border-[#DCEFE6] bg-[#E6F3EB] text-emerald-700 font-semibold hover:bg-[#DCF0E4] transition"
        >
          Send Proposal <span aria-hidden>↗</span>
        </Link>
      </div>
    </div>
  );
}
