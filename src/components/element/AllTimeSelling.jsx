export default function AllTimeSelling() {
  return (
    <>
      <div className="flex flex-wrap wow fadeInUp" data-wow-delay="300ms">
        <div className="w-full sm:w-1/2 lg:w-1/3">
          <div className="iconbox-style1 border-0 p-0">
            <div className="icon before-none">
              <span className="flaticon-cv" />
            </div>
            <div className="details">
              <h4 className="title mt-[10px] mb-3">Post a job</h4>
              <p className="text">
                It’s free and easy to post a job. Simply fill{" "}
                <br className="hidden 2xl:block" /> in a title, description.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/2 lg:w-1/3">
          <div className="iconbox-style1 border-0 p-0">
            <div className="icon before-none">
              <span className="flaticon-web-design" />
            </div>
            <div className="details">
              <h4 className="title mt-[10px] mb-3">Choose freelancers</h4>
              <p className="text">
                It’s free and easy to post a job. Simply fill{" "}
                <br className="hidden 2xl:block" /> in a title, description.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/2 lg:w-1/3">
          <div className="iconbox-style1 border-0 p-0">
            <div className="icon before-none">
              <span className="flaticon-customer-service" />
            </div>
            <div className="details">
              <h4 className="title mt-[10px] mb-3">We’re here to help</h4>
              <p className="text">
                It’s free and easy to post a job. Simply fill{" "}
                <br className="hidden 2xl:block" /> in a title, description.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
