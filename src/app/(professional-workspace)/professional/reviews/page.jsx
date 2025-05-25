import DashboardLayout from "@/components/professional-workspace/DashboardLayout";
import ReviewsInfo from "@/components/professional-workspace/section/ReviewsInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Review",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <ReviewsInfo />
      </DashboardLayout>
    </>
  );
}
