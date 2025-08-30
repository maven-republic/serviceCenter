import AllTimeSelling from "../element/AllTimeSelling";

export default function NeedSomething2() {
  return (
    <>
      <section className="our-features pb-[90px] md:pb-[30px] pt-[60px]">
        <div className="container wow fadeInUp mx-auto max-w-[1200px] px-4">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-full">
              <div className="main-title">
                <h2>Need something done?</h2>
                <p className="text">
                  Most viewed and all-time top-selling services
                </p>
              </div>
            </div>
          </div>
          <AllTimeSelling />
        </div>
      </section>
    </>
  );
}
