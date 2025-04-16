import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MyProfileInfo from "@/components/dashboard/section/ProfessionalAccountInformation";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "paid for exceptional work",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <MyProfileInfo />
      </DashboardLayout>
    </>
  );
}
