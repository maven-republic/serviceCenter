import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import ReviewsInfo from "@/components/store/dashboard/section/ReviewsInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Review",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation />
      <DashboardLayout>
        <ReviewsInfo />
      </DashboardLayout>
    </>
  );
}
