import DashboardNavigation from "../header/DashboardNavigation"
import ServiceInformation from "./ServiceInformation"
// import ExtraService from "./ExtraService"
// import ServiceGallery from "./ServiceGallery"
// import ServicePackage from "./ServicePackage"

export default function AddServiceInformation() {
  return (
    <div className="dashboard__content hover-bgc-color">
      <div className="container-fluid">
        <div className="row pb40 align-items-center">
          <div className="col-lg-9">
            <DashboardNavigation />
            <div className="dashboard_title_area mt-3">
              <h2>Add Services</h2>
              {/* <p className="text">Add new services you offer.</p> */}
            </div>
          </div>
          <div className="col-lg-3 text-lg-end mt-4 mt-lg-0">
            <a className="ud-btn btn-dark">
              Save &amp; Publish
              <i className="fal fa-arrow-right-long ms-2" />
            </a>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
            <ServiceInformation />
            {/* <ServicePackage /> */}
            {/* <ExtraService /> */}
            {/* <ServiceGallery /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

