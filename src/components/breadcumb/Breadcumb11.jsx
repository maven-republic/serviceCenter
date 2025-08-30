"use client";
import { project1 } from "@/data/product";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function Breadcumb11() {
  const { id } = useParams();
  const data = project1.find((item) => item.id == id);

  return (
    <section className="breadcumb-section pt-0">
      <div
        className="
          cta-service-v1 freelancer-single-style
          relative mx-auto max-w-[1700px] overflow-hidden rounded-[16px]
          flex items-center
          pt-[60px] md:pt-[120px] pb-[60px] md:pb-[120px]
          lg:px-[30px]
        "
      >
        {/* Decorative images */}
        <Image
          height={181}
          width={255}
          className="right-bottom-img wow zoomIn"
          src="/images/vector-img/right-bottom.png"
          alt="right-bottom"
        />
        <Image
          height={300}
          width={532}
          className="service-v1-vector bounce-y hidden xl:block"
          src="/images/vector-img/vector-service-v1.png"
          alt="vector-service"
        />

        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="wow fadeInUp">
            <div className="w-full xl:w-7/12">
              <div className="relative">
                <h2>{data ? data.title : "Website Designer Required For Directory Theme"}</h2>

                {/* Meta */}
                <div className="mt-[15px] flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="m-0 text-[15px] font-medium text-slate-900">
                    <i className="flaticon-place align-middle text-[20px] text-thm2 mr-2" />
                    London, UK
                  </p>
                  <p className="m-0 text-[15px] font-medium text-slate-900">
                    <i className="flaticon-calendar align-middle text-[20px] text-thm2 mr-2" />
                    January 15, 2022
                  </p>
                  <p className="m-0 text-[15px] font-medium text-slate-900">
                    <i className="flaticon-website align-middle text-[20px] text-thm2 mr-2" />
                    902 Views
                  </p>
                </div>
                {/* /Meta */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
