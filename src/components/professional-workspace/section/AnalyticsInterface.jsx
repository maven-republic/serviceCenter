// ============ 1. Main AnalyticsInterface.jsx ============
import DashboardNavigation from "../header/DashboardNavigation";
import Statistics from "./income/Statistics";
import IncomeInsights from "./income/IncomeInsights";

export default function AnalyticsInterface() {
  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <div className="dashboard_title_area">
              <h2>Analytics</h2>
              <p className="text">Lorem ipsum dolor sit amet, consectetur.</p>
            </div>
          </div>
        </div>
        
        <Statistics />
        <IncomeInsights />
      </div>
    </>
  );
}
