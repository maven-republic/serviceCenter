import Image from "next/image";
import Link from "next/link";

export default function FreelancerCard2({ data }) {
  return (
    <div className="freelancer-style1 text-center bdr1 hover-box-shadow">
      <div className="w-[90px] h-[90px] mb-[25px] mx-auto relative rounded-full">
        <Image
          height={90}
          width={90}
          className="rounded-full mx-auto"
          src={data.img}
          alt="thumb"
        />
        <span className="online" />
      </div>

      <div className="details">
        <h5 className="title mb-1">{data.name}</h5>
        <p className="mb-0">{data.profession}</p>

        <div className="review">
          <p className="flex items-center justify-center gap-2">
            <i className="fas fa-star fz10 review-color pr-[10px]" />
            <span className="dark-color font-medium">{data.rating}</span>
            ({data.reviews} reviews)
          </p>
        </div>

        <div className="skill-tags flex items-center justify-center mb-[5px]">
          <span className="tag">Figma</span>
          <span className="tag mx-[10px]">Sketch</span>
          <span className="tag">HTML5</span>
        </div>

        <hr className="opacity-100 mt-[20px] mb-[15px]" />

        <div className="fl-meta flex items-center justify-between">
          <div className="meta font-medium text-left">
            Location
            <br />
            <span className="text-sm font-normal">London</span>
          </div>
          <div className="meta font-medium text-left">
            Rate
            <br />
            <span className="text-sm font-normal">$90 / hr</span>
          </div>
          <div className="meta font-medium text-left">
            Job Success
            <br />
            <span className="text-sm font-normal">%98</span>
          </div>
        </div>

        <div className="grid mt-[15px]">
          <Link href={`/freelancer-single/${data.id}`} className="ud-btn btn-light-thm">
            View Profile
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </div>
  );
}
