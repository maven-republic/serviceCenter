import Image from "next/image";
import Link from "next/link";

export default function ProjectContactWidget1() {
  return (
    <div className="freelancer-style1 service-single mb-0 rounded-[8px]">
      <h4>About Buyer</h4>

      <div className="wrapper flex items-center mt-[20px]">
        <div className="thumb relative mb-[25px]">
          <Image
            height={60}
            width={60}
            className="rounded-full mx-auto"
            src="/images/team/client-1.png"
            alt="client"
          />
        </div>

        <div className="ml-[20px]">
          <h5 className="title mb-1">Dropbox</h5>
          <p className="mb-0">Digital Marketing</p>
          <div className="review">
            <p className="flex items-center gap-2">
              <i className="fas fa-star fz10 review-color pr-[10px]" />
              <span className="dark-color">4.9</span> (595 reviews)
            </p>
          </div>
        </div>
      </div>

      <hr className="opacity-100" />

      <div className="details">
        <div className="fl-meta flex items-center justify-between">
          <a className="meta fw500 text-left">
            Location
            <br />
            <span className="fz14 fw400">London</span>
          </a>
          <a className="meta fw500 text-left">
            Employees
            <br />
            <span className="fz14 fw400">11-20</span>
          </a>
          <a className="meta fw500 text-left">
            Departments
            <br />
            <span className="fz14 fw400">Designer</span>
          </a>
        </div>
      </div>

      <div className="grid mt-[30px]">
        <Link href="/contact" className="ud-btn btn-thm-border">
          Contact Buyer
          <i className="fal fa-arrow-right-long" />
        </Link>
      </div>
    </div>
  );
}
