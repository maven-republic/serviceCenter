import Image from "next/image";

export default function ProjectProposalCard1({ data }) {
  return (
    <div className="freelancer-style1 bdr1 hover-box-shadow flex flex-wrap items-start -mx-0">
      {/* Left block */}
      <div className="w-full xl:w-10/12 px-0">
        <div className="lg:flex">
          {/* Avatar */}
          <div className="relative w-[90px] h-[90px] rounded-full md:mb-[15px]">
            <Image
              height={90}
              width={90}
              className="rounded-full mx-auto"
              src={data.img}
              alt="rounded-circle"
            />
            <span className="online" />
          </div>

          {/* Details */}
          <div className="md:mb-[15px] md:ml-0 ml-[20px]">
            <h5 className="title mb-1">{data.name}</h5>

            {/* Review row */}
            <div className="mb-[20px] flex flex-wrap items-center gap-3">
              <p className="m-0 text-sm">
                <i className="fas fa-star fz10 review-color pr-[10px]" />{" "}
                <span className="dark-color">{data.rating}</span> ({data.reviews} reviews)
              </p>

              <p className="m-0 text-sm pl-4 border-l border-slate-200 md:pl-0 md:border-none">
                <i className="flaticon-30-days fz16 vam text-thm2 mr-1" /> 2 hours ago
              </p>

              <p className="m-0 text-sm pl-4 border-l border-slate-200 md:pl-0 md:border-none">
                <i className="flaticon-contract fz16 vam text-thm2 mr-1" /> 1 Received
              </p>
            </div>

            <p className="text m-0">{data.brief}</p>
          </div>
        </div>
      </div>

      {/* Right block */}
      <div className="w-full xl:w-2/12 px-0">
        <div className="text-center lg:text-center xl:text-right mt-0 lg:mt-2 xl:mt-0">
          <h4>${data.price.min} - ${data.price.max}</h4>
          <p className="text m-0">in {data.hours} hours</p>
        </div>
      </div>
    </div>
  );
}
