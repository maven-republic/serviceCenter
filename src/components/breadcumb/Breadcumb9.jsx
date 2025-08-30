import Image from "next/image";

export default function Breadcumb9() {
  return (
    <section className="breadcumb-section pt-0">
      <div
        className="
          cta-service-v1 cta-banner
          relative mx-auto max-w-[1700px] overflow-hidden rounded-[16px]
          flex items-center
          pt-[120px] pb-[120px] 
        "
      >
        {/* Decorative images */}
        <Image
          height={226}
          width={198}
          className="left-top-img wow zoomIn"
          src="/images/vector-img/left-top.png"
          alt="left-top"
        />
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
                <h2>Projects List</h2>
                <p className="text mb-[30px]">
                  All the Lorem Ipsum generators on the Internet tend to repeat.
                </p>
              </div>

              {/* Search panel */}
              <div className="relative z-[1] bg-white p-[10px] rounded-[4px]">
                <div className="flex flex-wrap">
                  <div className="w-full md:w-8/12 xl:w-9/12">
                    <div className="advance-search-field">
                      <form className="relative">
                        <div className="border-b border-slate-200 sm:border-b flex items-center">
                          <span className="icon far fa-magnifying-glass mr-2 text-slate-500" />
                          <input
                            className="w-full bg-transparent outline-none py-3 placeholder:text-slate-400"
                            type="text"
                            name="search"
                            placeholder="What are you looking for?"
                          />
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="w-full md:w-4/12 xl:w-3/12 mt-3 md:mt-0">
                    <div className="text-center xl:text-left">
                      <button className="ud-btn btn-thm w-full" type="button">
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Search panel */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
