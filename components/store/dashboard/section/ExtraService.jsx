import ServiceDetailExtra from "@/components/store/element/ServiceDetailExtra";

export default function ExtraService() {
  return (
    <>
      <div className="ps-widget bgc-white bdrs12 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Add extra services</h5>
        </div>
        <div className="col-xl-8">
          <ServiceDetailExtra />
        </div>
      </div>
    </>
  );
}
